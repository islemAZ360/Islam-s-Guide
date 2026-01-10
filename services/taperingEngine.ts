import { Inventory, PlanDay, DailyLog, ManualPhase } from '../types';

/**
 * Calculates total inventory value abstractly (mg, ml, pills, etc).
 */
export const calculateTotalInventory = (inv: Inventory): number => {
  return (inv.boxes * inv.pillsPerBox) + inv.loosePills;
};

// Adjusted for better liquid precision (0.1 instead of 0.5)
const MIN_SPLIT = 0.1; 

const roundToSplit = (num: number): number => {
  if (num <= 0) return 0;
  // Round to 1 decimal place to avoid floating point errors like 0.300000004
  return Math.round(Math.round(num / MIN_SPLIT) * MIN_SPLIT * 10) / 10;
};

/**
 * GENERATE MANUAL PLAN FROM DOCTOR INPUT
 */
export const generateManualPlan = (
  phases: ManualPhase[], 
  startDateStr: string = new Date().toISOString()
): PlanDay[] => {
  const plan: PlanDay[] = [];
  const startDate = new Date(startDateStr);
  startDate.setHours(0,0,0,0);
  let dayOffset = 0;

  phases.forEach(phase => {
    for (let i = 0; i < phase.days; i++) {
      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(startDate.getDate() + dayOffset);
      
      const dateStr = currentDayDate.toISOString().split('T')[0];
      
      plan.push({
        date: dateStr,
        plannedDose: phase.dose,
        isPast: false
      });
      dayOffset++;
    }
  });

  return plan;
};

/**
 * SMART INVENTORY ALLOCATION ENGINE
 */
export const generatePlan = (
  totalPills: number, 
  startDose: number, 
  startDateStr: string,
  speedModifier: number = 1.0 
): PlanDay[] => {
  
  if (totalPills <= 0 || startDose <= 0) return [];

  let safeStartDose = roundToSplit(startDose);
  if (safeStartDose === 0 && startDose > 0) safeStartDose = MIN_SPLIT;

  let descentPlan: { dose: number, days: number }[] = [];
  let pillsUsedInDescent = 0;
  let currentDose = safeStartDose;

  // Modifying reduction rate based on speedModifier
  // Speed > 1.0 means Faster drop (1.2 = 20% faster)
  // Speed < 1.0 means Slower drop (0.8 = 20% slower)
  // Standard reduction is usually ~10% per step.
  const baseReductionRate = 0.10 * speedModifier; 
  
  // Standard duration for a step (e.g. 14 days)
  // We adjust step duration inversely to speed? 
  // Actually, usually we keep duration fixed (e.g., 2 weeks) and adjust dose drop, 
  // OR keep dose drop fixed and adjust duration.
  // Let's adjust dose drop % here as defined above.
  
  while (currentDose > MIN_SPLIT) {
      const duration = 14; // Two weeks per stage is a safe standard
      
      let targetNext = currentDose * (1 - baseReductionRate);
      let nextDose = roundToSplit(targetNext);
      
      // Ensure we don't stall (infinite loop if rounding keeps it same)
      if (nextDose >= currentDose) nextDose = roundToSplit(currentDose - MIN_SPLIT);
      if (nextDose < MIN_SPLIT) nextDose = MIN_SPLIT;

      // Logic to break if we are using too much
      if (pillsUsedInDescent + (currentDose * duration) > totalPills) {
          break; // Let the emergency logic handle the rest
      }

      if (currentDose > MIN_SPLIT) {
          descentPlan.push({ dose: currentDose, days: duration });
          pillsUsedInDescent += currentDose * duration;
      }
      
      currentDose = nextDose;
  }

  let remainingPills = totalPills - pillsUsedInDescent;

  // Emergency short path if pills are very low relative to start
  if (remainingPills < 0 || descentPlan.length === 0) { 
      descentPlan = [];
      pillsUsedInDescent = 0;
      currentDose = safeStartDose;
      
      // Rapid taper logic
      while (currentDose > MIN_SPLIT && (totalPills - pillsUsedInDescent) > currentDose) {
          let nextDose = roundToSplit(currentDose - (MIN_SPLIT * 2)); 
          if (nextDose < MIN_SPLIT) nextDose = MIN_SPLIT;
          
          let duration = 5; // Much shorter
          descentPlan.push({ dose: currentDose, days: duration });
          pillsUsedInDescent += currentDose * duration;
          
          currentDose = nextDose;
      }
      remainingPills = totalPills - pillsUsedInDescent;
  }

  // TAIL GENERATION (The end of the taper)
  let tailPlan: { dose: number, days: number }[] = [];
  
  if (remainingPills > 0) {
      // Create a tail that uses the remaining pills effectively
      // Pattern: Daily -> Skip 1 Day -> Skip 2 Days -> Stop
      
      // Cost of 1 cycle of "Skip 1" (Dose, 0) = Dose
      const dose = MIN_SPLIT;
      
      // Simple allocation for now to ensure we use up inventory
      while (remainingPills >= dose) {
          tailPlan.push({ dose: dose, days: 1 });
          remainingPills -= dose;
          
          // Add rest days based on progress to stretch it out
          if (remainingPills > (dose * 10)) {
               // If we have plenty, just daily
          } else if (remainingPills > (dose * 5)) {
              // Start skipping 1 day
              tailPlan.push({ dose: 0, days: 1 });
          } else {
              // End game: skip 2 days
              tailPlan.push({ dose: 0, days: 2 });
          }
      }
  }

  const finalSteps = [...descentPlan, ...tailPlan];

  // Convert abstract steps to calendar days
  const plan: PlanDay[] = [];
  const startDate = new Date(startDateStr);
  startDate.setHours(0,0,0,0); // Normalize time
  
  let dayOffset = 0;

  finalSteps.forEach(step => {
    for (let i = 0; i < step.days; i++) {
      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(startDate.getDate() + dayOffset);
      
      const dateStr = currentDayDate.toISOString().split('T')[0];

      plan.push({
        date: dateStr,
        plannedDose: step.dose,
        isPast: false
      });
      dayOffset++;
    }
  });

  return plan;
};

/**
 * RE-CALCULATE PLAN DYNAMICALLY (Fixes Glitch)
 */
export const adjustPlan = (
  originalPlan: PlanDay[],
  logs: DailyLog[],
  totalInitialInventory: number, // Must pass total ORIGINAL inventory (or recalculate it outside)
  speedModifier: number = 1.0 
): PlanDay[] => {
  
  // 1. Sort logs to ensure chronological order
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 2. Identify the "Cutoff Date" (The last day we have data for)
  // If no logs, we can't adjust based on history, so we generate fresh or return empty.
  // Assuming this is called only after at least 1 log exists or we want to regen from scratch.
  if (sortedLogs.length === 0) {
      if (originalPlan.length === 0) return [];
      // If no logs but we have a plan, stick to it, maybe just regen with new speed from start
      return generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier);
  }

  const lastLog = sortedLogs[sortedLogs.length - 1];
  const lastLogDateStr = lastLog.date;

  // 3. Calculate "Used" vs "Remaining"
  // We sum up everything user ACTUALLY took
  const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
  const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

  // 4. Construct History Part (Past)
  // We rebuild the history array based on logs.
  // We use the Original Plan to remember what was *Targeted* vs what was *Taken*.
  const historyDays: PlanDay[] = sortedLogs.map(log => {
      const originalDay = originalPlan.find(p => p.date === log.date);
      return {
          date: log.date,
          // If we had a plan, keep the target. If not (maybe ad-hoc log), target = taken (neutral)
          plannedDose: originalDay ? originalDay.plannedDose : log.doseTaken, 
          isPast: true,
          log: log
      };
  });

  // 5. Generate Future Part
  // Start date = Day AFTER last log
  const nextDay = new Date(lastLogDateStr);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split('T')[0];

  // Start Dose = What they took last. 
  // (If they took 5mg, we taper from 5mg. We don't force them back to a higher plan)
  const newStartDose = lastLog.doseTaken;

  const futureDays = generatePlan(
      remainingInventory,
      newStartDose,
      nextDayStr,
      speedModifier
  );

  // 6. Merge
  // Combine history + future. 
  // This ensures no "phantom" future days exist for dates that are already logged.
  return [...historyDays, ...futureDays];
};