import { Inventory, PlanDay, DailyLog, ManualPhase } from '../types';

/**
 * Helper to add days safely to a date string
 */
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Calculates total inventory based on form type (Pills or Liquid)
 */
export const calculateTotalInventory = (inv: Inventory): number => {
  // If pillsPerBox is 0, we assume raw count in loosePills or boxes
  const total = (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
  return Math.max(0, total);
};

// Minimum cut unit. For tablets usually 0.5 or 0.25. For liquid 0.1.
const MIN_SPLIT = 0.1; 

const roundToSplit = (num: number): number => {
  if (num <= 0.05) return 0;
  return Math.round(num * 10) / 10;
};

/**
 * --- 1. MANUAL PLAN GENERATOR (For Doctors) ---
 * Converts doctor's phases (e.g., "5mg for 7 days", "2.5mg for 7 days")
 * into a full calendar array.
 */
export const generateManualPlan = (
  phases: ManualPhase[], 
  startDateStr: string = new Date().toISOString()
): PlanDay[] => {
  const plan: PlanDay[] = [];
  let currentDate = startDateStr.split('T')[0];

  phases.forEach(phase => {
    for (let i = 0; i < phase.days; i++) {
      plan.push({
        date: currentDate,
        plannedDose: phase.dose,
        isPast: false
      });
      // Move to next day
      currentDate = addDays(currentDate, 1);
    }
  });

  return plan;
};

/**
 * --- 2. SMART INTELLIGENT ALGORITHM (For Normal Users) ---
 * Philosophy:
 * 1. "Safety First": Always reserve pills for the 'Tail' (Stopping Phase).
 * 2. If Inventory is LOW: Shorten the high-dose duration, but keep the tail long.
 * 3. If Inventory is HIGH: Extend the tail (add skip-3-days, skip-4-days cycles).
 */
export const generatePlan = (
  totalPills: number, 
  startDose: number, 
  startDateStr: string,
  speedModifier: number = 1.0 // 0.8 (Slow), 1.0 (Normal), 1.2 (Fast)
): PlanDay[] => {
  
  if (totalPills <= 0 || startDose <= 0) return [];

  // --- A. SETUP & DEFINITIONS ---
  let currentDose = roundToSplit(startDose);
  
  // Define the "Tail Unit" (The smallest dose before stopping)
  // Usually 0.5mg for tablets, or equal to current dose if already small.
  const tailUnit = currentDose <= 0.5 ? currentDose : 0.5;

  // Base duration for a phase (e.g., 2 weeks), scaled by user preference.
  // Slower speed (0.8) means LONGER duration.
  // Faster speed (1.2) means SHORTER duration.
  const basePhaseDuration = Math.max(7, Math.round(14 / speedModifier));

  // --- B. RESERVE INVENTORY FOR THE "ESSENTIAL TAIL" ---
  // We MUST guarantee these phases exist to prevent shock.
  // Phase T1: Every Other Day (1 On, 1 Off) -> Needs (basePhaseDuration / 2) pills
  // Phase T2: Every 3rd Day (1 On, 2 Off)   -> Needs (basePhaseDuration / 3) pills
  
  const cyclesT1 = Math.ceil(basePhaseDuration / 2); // Count of doses needed
  const cyclesT2 = Math.ceil(basePhaseDuration / 3); // Count of doses needed
  
  const pillsForEssentialTail = (cyclesT1 * tailUnit) + (cyclesT2 * tailUnit);
  
  // Calculate what's left for the "Descent" (coming down from high dose)
  let inventoryForDescent = totalPills - pillsForEssentialTail;
  
  // If we are critically low, we still prioritize tail, but maybe shorten it slightly
  // rather than cutting the descent entirely.
  let isCriticalLow = false;
  if (inventoryForDescent < 0) {
      isCriticalLow = true;
      inventoryForDescent = 0; // We will just use whatever we have for the tail
  }

  // --- C. BUILD THE DESCENTS (From StartDose down to TailUnit) ---
  let descentPlan: { dose: number, days: number }[] = [];
  
  // Only calculate descent if we are above the tail unit
  if (currentDose > tailUnit && !isCriticalLow) {
      // Reduction rate per step (e.g. 10%)
      const reductionRate = 0.10 * speedModifier; 
      
      while (currentDose > tailUnit) {
          // Calculate cost for one full phase at this dose
          const costForFullPhase = currentDose * basePhaseDuration;
          
          // Determine actual days we can afford at this dose
          let actualDays = basePhaseDuration;
          
          // Smart Logic: If pills are tight, shrink high-dose days to save them for later
          if (inventoryForDescent < costForFullPhase) {
              actualDays = Math.floor(inventoryForDescent / currentDose);
          }
          
          if (actualDays > 0) {
              descentPlan.push({ dose: currentDose, days: actualDays });
              inventoryForDescent -= (currentDose * actualDays);
          } 
          
          // Calculate Next Dose
          let nextDose = roundToSplit(currentDose * (1 - reductionRate));
          // Ensure we don't get stuck or go up
          if (nextDose >= currentDose) nextDose = roundToSplit(currentDose - MIN_SPLIT);
          // Don't go below tail unit in the descent phase
          if (nextDose < tailUnit) nextDose = tailUnit;
          
          // Break loop if we hit the tail unit
          if (currentDose === tailUnit) break;
          currentDose = nextDose;
      }
  } else if (currentDose > tailUnit && isCriticalLow) {
      // Critical Scenario: User has high dose but NO pills. 
      // Strategy: Immediate drop to Tail Unit to stretch supplies (Emergency Mode)
      currentDose = tailUnit; 
  }

  // --- D. BUILD THE TAIL (Smart Extension) ---
  // Now we use ALL remaining pills to build the best possible tail.
  
  // Re-calculate true remaining (Total - Used in Descent)
  const usedInDescent = descentPlan.reduce((acc, p) => acc + (p.dose * p.days), 0);
  let remainingForTail = totalPills - usedInDescent;
  
  const tailPlan: { dose: number, days: number }[] = [];
  
  if (remainingForTail > 0) {
      // A. Stabilization at lowest dose (Daily)
      // Only if we have surplus. If critical, skip straight to spacing.
      const costForDaily = tailUnit * basePhaseDuration;
      if (remainingForTail > (pillsForEssentialTail + costForDaily)) {
          // We have plenty! Do a full daily phase
          tailPlan.push({ dose: tailUnit, days: basePhaseDuration });
          remainingForTail -= costForDaily;
      } else if (remainingForTail > pillsForEssentialTail) {
          // We have some extra, do a partial daily phase
          const affordableDays = Math.floor((remainingForTail - pillsForEssentialTail) / tailUnit);
          if (affordableDays > 0) {
               tailPlan.push({ dose: tailUnit, days: affordableDays });
               remainingForTail -= (tailUnit * affordableDays);
          }
      }

      // B. Level 1: Skip 1 Day (1 On, 1 Off)
      // Loop until we reach base duration OR run out
      let daysCount1 = 0;
      while (remainingForTail >= tailUnit && daysCount1 < basePhaseDuration) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 1 });
          remainingForTail -= tailUnit;
          daysCount1 += 2; 
      }

      // C. Level 2: Skip 2 Days (1 On, 2 Off)
      let daysCount2 = 0;
      while (remainingForTail >= tailUnit && daysCount2 < basePhaseDuration) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 2 });
          remainingForTail -= tailUnit;
          daysCount2 += 3;
      }

      // D. Level 3 (Extended): Skip 3 Days (1 On, 3 Off) - ONLY IF SURPLUS
      while (remainingForTail >= tailUnit) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 3 });
          remainingForTail -= tailUnit;
          
          // E. Level 4 (Super Extended): Skip 4 Days - If HUGE surplus
          if (remainingForTail >= tailUnit) {
             tailPlan.push({ dose: tailUnit, days: 1 });
             tailPlan.push({ dose: 0, days: 4 });
             remainingForTail -= tailUnit;
          }
      }
  }

  // --- E. ASSEMBLE FINAL PLAN ---
  const finalSteps = [...descentPlan, ...tailPlan];
  const plan: PlanDay[] = [];
  let currDate = startDateStr.split('T')[0];

  finalSteps.forEach(step => {
    for (let i = 0; i < step.days; i++) {
      plan.push({
        date: currDate,
        plannedDose: step.dose,
        isPast: false
      });
      currDate = addDays(currDate, 1);
    }
  });

  return plan;
};

/**
 * --- 3. RE-CALCULATE DYNAMICALLY ---
 * Used by the algorithm to adjust the future based on real usage.
 */
export const adjustPlan = (
  originalPlan: PlanDay[],
  logs: DailyLog[],
  totalInitialInventory: number, 
  speedModifier: number = 1.0 
): PlanDay[] => {
  
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Base Case: No logs yet
  if (sortedLogs.length === 0) {
      if (originalPlan.length === 0) return [];
      return generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier);
  }

  const lastLog = sortedLogs[sortedLogs.length - 1];
  const lastLogDate = lastLog.date;

  // Calculate REAL remaining inventory based on what was actually taken
  const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
  const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

  // Preserve History (Past days remain as they were logged/planned)
  const historyDays = originalPlan
    .filter(day => day.date <= lastLogDate)
    .map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return {
            ...day,
            isPast: true,
            log: log || undefined,
        };
    });
  
  // Generate Future from TOMORROW
  let newStartDose = lastLog.doseTaken;
  
  // If last dose was 0 (skip day), find the last active dose to know our level
  if (newStartDose === 0) {
      const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
      newStartDose = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0);
  }

  const nextDayStr = addDays(lastLogDate, 1);

  const futureDays = generatePlan(
      remainingInventory,
      newStartDose,
      nextDayStr,
      speedModifier
  );

  return [...historyDays, ...futureDays];
};