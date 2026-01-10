import { Inventory, PlanDay, DailyLog, ManualPhase } from '../types';

/**
 * Helper to add days safely using UTC to avoid timezone duplication/skipping
 */
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Calculates total inventory
 */
export const calculateTotalInventory = (inv: Inventory): number => {
  const total = (inv.boxes * inv.pillsPerBox) + inv.loosePills;
  return Math.max(0, total);
};

const MIN_SPLIT = 0.1; 

const roundToSplit = (num: number): number => {
  if (num <= MIN_SPLIT / 2) return 0;
  return Math.round(num * 10) / 10;
};

/**
 * GENERATE MANUAL PLAN
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
      currentDate = addDays(currentDate, 1);
    }
  });

  return plan;
};

/**
 * SMART INTELLIGENT ALGORITHM
 * Logic:
 * 1. Reserve inventory for the "Tail" (Stopping Phase) first as priority.
 * 2. If surplus inventory exists, extend the tail (add skip-days cycles).
 * 3. Use remaining inventory for the "Descent" (Active Tapering).
 */
export const generatePlan = (
  totalPills: number, 
  startDose: number, 
  startDateStr: string,
  speedModifier: number = 1.0 
): PlanDay[] => {
  
  if (totalPills <= 0 || startDose <= 0) return [];

  // 1. Setup
  let currentDose = roundToSplit(startDose);
  if (currentDose === 0 && startDose > 0) currentDose = MIN_SPLIT;
  
  // Determine the smallest unit used for the tail (e.g. 0.5 or 0.1)
  const tailUnit = currentDose <= 0.5 ? currentDose : 0.5;

  // 2. Define Essential Tail Requirements
  // We want at least: [Dose, 0] x 3 cycles, [Dose, 0, 0] x 3 cycles
  // This is the safety net.
  const baseTailCycles = Math.max(2, Math.round(3 / speedModifier));
  const costPerSkip1 = tailUnit; // Cost of 1 cycle of (Dose, 0) is just Dose
  const costPerSkip2 = tailUnit; // Cost of 1 cycle of (Dose, 0, 0) is just Dose
  
  const essentialTailCost = (costPerSkip1 * baseTailCycles) + (costPerSkip2 * baseTailCycles);
  
  // 3. Allocate Inventory
  let remainingInventory = totalPills;
  let descentPlan: { dose: number, days: number }[] = [];
  let tailPlan: { dose: number, days: number }[] = [];

  // Priority allocation: Secure the tail first? 
  // No, actually we calculate descent normally, but if we run short, we cut descent to save the tail.
  // Better approach: Calculate cost of descent step-by-step.
  
  let inventoryForDescent = remainingInventory - essentialTailCost;
  
  // If we are critical (can't even afford tail), we have to shrink tail later.
  if (inventoryForDescent < 0) inventoryForDescent = 0;

  // --- PHASE A: DESCENT (High Doses) ---
  const reductionRate = 0.10 * speedModifier; 
  
  while (currentDose > tailUnit) {
      const idealDuration = 14; 
      
      // Can we afford this step with the allocated descent inventory?
      const maxAffordableDays = Math.floor(inventoryForDescent / currentDose);
      let actualDuration = Math.min(idealDuration, maxAffordableDays);
      
      if (actualDuration > 0) {
          descentPlan.push({ dose: currentDose, days: actualDuration });
          inventoryForDescent -= (currentDose * actualDuration);
      } else {
          // Can't afford descent at this high dose, skip to lower dose immediately to save pills
      }

      // Next Dose
      let nextDose = roundToSplit(currentDose * (1 - reductionRate));
      if (nextDose >= currentDose) nextDose = roundToSplit(currentDose - MIN_SPLIT);
      if (nextDose < tailUnit) nextDose = tailUnit;
      
      currentDose = nextDose;
  }

  // Recalculate true remaining for the tail
  remainingInventory = totalPills - descentPlan.reduce((acc, p) => acc + (p.dose * p.days), 0);

  // --- PHASE B: SMART TAIL (Elastic) ---
  if (remainingInventory > 0) {
      
      // 1. Daily Stabilization Phase at lowest dose
      // Only if we have surplus above the essential tail needs
      const essentialCostRemaining = essentialTailCost; 
      const surplusForDaily = remainingInventory - essentialCostRemaining;
      
      if (surplusForDaily > 0) {
          const maxDailyDays = 14; 
          const affordableDaily = Math.floor(surplusForDaily / tailUnit);
          const actualDaily = Math.min(maxDailyDays, affordableDaily);
          
          if (actualDaily > 0) {
              tailPlan.push({ dose: tailUnit, days: actualDaily });
              remainingInventory -= (tailUnit * actualDaily);
          }
      }

      // 2. Skip 1 Day Phase (Day ON, Day OFF)
      // Iterate cycles until base reached OR inventory runs out
      let cycles1 = 0;
      while (remainingInventory >= tailUnit && cycles1 < baseTailCycles) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 1 });
          remainingInventory -= tailUnit;
          cycles1++;
      }

      // 3. Skip 2 Days Phase (Day ON, 2 Days OFF)
      let cycles2 = 0;
      while (remainingInventory >= tailUnit && cycles2 < baseTailCycles) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 2 });
          remainingInventory -= tailUnit;
          cycles2++;
      }

      // --- PHASE C: EXTENDED SURPLUS TAIL ---
      // If we STILL have pills (User has big stash), we extend smoothly instead of stopping.
      
      // Level 3: Skip 3 Days (Day ON, 3 Days OFF)
      while (remainingInventory >= tailUnit) {
          tailPlan.push({ dose: tailUnit, days: 1 });
          tailPlan.push({ dose: 0, days: 3 });
          remainingInventory -= tailUnit;
          
          // Check if we can do Level 4: Skip 4 Days
          if (remainingInventory >= tailUnit) {
             tailPlan.push({ dose: tailUnit, days: 1 });
             tailPlan.push({ dose: 0, days: 4 });
             remainingInventory -= tailUnit;
          }
      }
  }

  // --- FINAL ASSEMBLY ---
  const finalSteps = [...descentPlan, ...tailPlan];
  const plan: PlanDay[] = [];
  let currentDate = startDateStr.split('T')[0];

  finalSteps.forEach(step => {
    for (let i = 0; i < step.days; i++) {
      plan.push({
        date: currentDate,
        plannedDose: step.dose,
        isPast: false
      });
      currentDate = addDays(currentDate, 1);
    }
  });

  return plan;
};

/**
 * RE-CALCULATE PLAN DYNAMICALLY
 */
export const adjustPlan = (
  originalPlan: PlanDay[],
  logs: DailyLog[],
  totalInitialInventory: number, 
  speedModifier: number = 1.0 
): PlanDay[] => {
  
  // A. Sort logs
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedLogs.length === 0) {
      if (originalPlan.length === 0) return [];
      return generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier);
  }

  const lastLog = sortedLogs[sortedLogs.length - 1];
  const lastLogDate = lastLog.date;

  // B. Calculate Remaining Inventory accurately
  const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
  const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

  // C. Keep History
  // We use the original plan up to the last log date to maintain the 'view'
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
  
  // D. Generate Future
  const nextDayStr = addDays(lastLogDate, 1);
  const newStartDose = lastLog.doseTaken;

  const futureDays = generatePlan(
      remainingInventory,
      newStartDose,
      nextDayStr,
      speedModifier
  );

  return [...historyDays, ...futureDays];
};