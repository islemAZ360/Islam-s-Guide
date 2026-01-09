import { Inventory, PlanDay, DailyLog, ManualPhase } from '../types';

/**
 * Calculates total pills available.
 */
export const calculateTotalInventory = (inv: Inventory): number => {
  return (inv.boxes * inv.pillsPerBox) + inv.loosePills;
};

const MIN_SPLIT = 0.5; 

const roundToSplit = (num: number): number => {
  if (num <= 0) return 0;
  return Math.round(num / MIN_SPLIT) * MIN_SPLIT;
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
      
      plan.push({
        date: currentDayDate.toISOString().split('T')[0],
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
  startDateStr: string = new Date().toISOString(),
  speedModifier: number = 1.0 
): PlanDay[] => {
  
  if (totalPills <= 0 || startDose <= 0) return [];

  let safeStartDose = roundToSplit(startDose);
  if (safeStartDose === 0 && startDose > 0) safeStartDose = MIN_SPLIT;

  let descentPlan: { dose: number, days: number }[] = [];
  let pillsUsedInDescent = 0;
  let currentDose = safeStartDose;

  // Modifying reduction rate based on speedModifier directly affecting curve
  // Speed > 1.0 means Faster drop (higher rate)
  // Speed < 1.0 means Slower drop (lower rate)
  const baseReductionRate = 0.10 * speedModifier; 
  
  while (currentDose > MIN_SPLIT) {
      // Duration also affected by speed? 
      // Typically tapering is "Dose & Duration".
      // Let's keep duration fixed at 14 days for stability, but change the step down.
      let duration = 14; 
      
      let targetNext = currentDose * (1 - baseReductionRate);
      let nextDose = roundToSplit(targetNext);
      
      // Ensure we don't stall
      if (nextDose >= currentDose) nextDose = roundToSplit(currentDose - MIN_SPLIT);
      if (nextDose < MIN_SPLIT) nextDose = MIN_SPLIT;

      if (currentDose > MIN_SPLIT) {
          descentPlan.push({ dose: currentDose, days: duration });
          pillsUsedInDescent += currentDose * duration;
      }
      
      currentDose = nextDose;
  }

  let remainingPills = totalPills - pillsUsedInDescent;

  // Emergency short path if pills are very low
  if (remainingPills < 0) { 
      // Recalculate with shorter durations if we ran out
      descentPlan = [];
      pillsUsedInDescent = 0;
      currentDose = safeStartDose;
      while (currentDose > MIN_SPLIT) {
          let nextDose = roundToSplit(currentDose - MIN_SPLIT); 
          if (nextDose < MIN_SPLIT) nextDose = MIN_SPLIT;
          
          let duration = 7; // Shorten to 7 days
          if (currentDose > MIN_SPLIT) {
             descentPlan.push({ dose: currentDose, days: duration });
             pillsUsedInDescent += currentDose * duration;
          }
          currentDose = nextDose;
      }
      remainingPills = totalPills - pillsUsedInDescent;
  }

  let tailPlan: { dose: number, days: number }[] = [];
  
  // Distribute remaining pills into the "Tail" (End of treatment)
  if (remainingPills > 0) {
      let daysDaily = 7;
      let cyclesSkip1 = 3;
      let cyclesSkip2 = 3;

      let pillsForMinTail = (daysDaily * 0.5) + (cyclesSkip1 * 0.5) + (cyclesSkip2 * 0.5);
      remainingPills -= pillsForMinTail;

      if (remainingPills < 0) {
          // Not enough for full tail, just do daily 0.5 as much as possible
          daysDaily = Math.floor((totalPills - pillsUsedInDescent) / 0.5);
          remainingPills = 0;
          cyclesSkip1 = 0;
          cyclesSkip2 = 0;
      } else {
          // We have extra pills, extend the tail based on Speed
          let wDaily, wSkip1, wSkip2;

          if (speedModifier <= 0.8) {
              // Slow: Extend the "Skip 2 days" part (gentlest end)
              wDaily = 0.1; 
              wSkip1 = 2;
              wSkip2 = 5; 
          } else if (speedModifier <= 1.0) {
              wDaily = 1;
              wSkip1 = 2;
              wSkip2 = 3;
          } else {
              // Fast: Burn them in daily usage to finish faster
              wDaily = 4;
              wSkip1 = 1;
              wSkip2 = 0.5;
          }

          const totalWeight = wDaily + wSkip1 + wSkip2;
          
          const pillsDaily = remainingPills * (wDaily / totalWeight);
          const pillsSkip1 = remainingPills * (wSkip1 / totalWeight);
          const pillsSkip2 = remainingPills * (wSkip2 / totalWeight);

          daysDaily += Math.floor(pillsDaily / 0.5);
          cyclesSkip1 += Math.floor(pillsSkip1 / 0.5);
          cyclesSkip2 += Math.floor(pillsSkip2 / 0.5);
      }
      
      if (daysDaily > 0) {
          tailPlan.push({ dose: MIN_SPLIT, days: daysDaily });
      }

      for (let i = 0; i < cyclesSkip1; i++) {
          tailPlan.push({ dose: MIN_SPLIT, days: 1 });
          tailPlan.push({ dose: 0, days: 1 });
      }

      for (let i = 0; i < cyclesSkip2; i++) {
          tailPlan.push({ dose: MIN_SPLIT, days: 1 });
          tailPlan.push({ dose: 0, days: 2 });
      }
  }

  const finalSteps = [...descentPlan, ...tailPlan];

  const plan: PlanDay[] = [];
  const startDate = new Date(startDateStr);
  startDate.setHours(0,0,0,0);
  let dayOffset = 0;

  finalSteps.forEach(step => {
    for (let i = 0; i < step.days; i++) {
      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(startDate.getDate() + dayOffset);
      
      plan.push({
        date: currentDayDate.toISOString().split('T')[0],
        plannedDose: step.dose,
        isPast: false
      });
      dayOffset++;
    }
  });

  return plan;
};

/**
 * RE-CALCULATE PLAN DYNAMICALLY
 * 
 * @param originalPlan The previous plan (for history)
 * @param logs All user logs including the most recent one
 * @param inventorySnapshot The total pills available *BEFORE* the most recent log was deducted (if it was just logged) 
 *                          OR current inventory. 
 *                          NOTE: In App.tsx we pass the inventory state *before* deduction logic completes in some cases,
 *                          so we calculate remaining = snapshot - lastLog.dose.
 * @param speedModifier User preference for speed
 */
export const adjustPlan = (
  originalPlan: PlanDay[],
  logs: DailyLog[],
  inventorySnapshot: number,
  speedModifier: number = 1.0 
): PlanDay[] => {
  if (!originalPlan.length) return [];

  // 1. Sort logs to get the latest activity
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastLog = sortedLogs[sortedLogs.length - 1];

  if (!lastLog) return originalPlan; // Should not happen if logs exist

  // 2. Calculate actual remaining pills for the FUTURE
  // We assume inventorySnapshot includes the pill taken in lastLog (since we passed it from App.tsx before updating state fully in some flows, 
  // or consistent with 'remaining = current - taken').
  // For safety, we ensure we don't go below 0.
  const remainingPillsForFuture = Math.max(0, inventorySnapshot - lastLog.doseTaken);

  // 3. Determine Start Date for the new plan (Tomorrow relative to last log)
  const lastLogDate = new Date(lastLog.date);
  const nextDayDate = new Date(lastLogDate);
  nextDayDate.setDate(nextDayDate.getDate() + 1);

  // 4. Determine Starting Dose
  // If the user took X mg today, the algorithm starts calculating from X mg downwards.
  let newStartDose = roundToSplit(lastLog.doseTaken);
  if (newStartDose === 0) newStartDose = MIN_SPLIT;

  // 5. Generate Future Plan
  const futurePlan = generatePlan(
      remainingPillsForFuture, 
      newStartDose, 
      nextDayDate.toISOString(), 
      speedModifier
  );

  // 6. Merge History (Past) with Future
  const cutoffDate = lastLog.date;
  
  const history = originalPlan
    .filter(day => day.date <= cutoffDate)
    .map(day => {
      const log = logs.find(l => l.date === day.date);
      return { 
          ...day, 
          isPast: true, 
          log: log,
          // Update planned dose in history to match what was actually taken? 
          // No, keep original plan for "Planned vs Actual" comparison in stats.
      };
    });

  return [...history, ...futurePlan];
};