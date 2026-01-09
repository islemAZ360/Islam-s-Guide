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

  const baseReductionRate = 0.10; 
  
  while (currentDose > MIN_SPLIT) {
      let duration = 14; 
      let targetNext = currentDose * (1 - baseReductionRate);
      let nextDose = roundToSplit(targetNext);
      
      if (nextDose >= currentDose) nextDose = roundToSplit(currentDose - MIN_SPLIT);
      if (nextDose < MIN_SPLIT) nextDose = MIN_SPLIT;

      if (currentDose > MIN_SPLIT) {
          descentPlan.push({ dose: currentDose, days: duration });
          pillsUsedInDescent += currentDose * duration;
      }
      
      currentDose = nextDose;
  }

  let remainingPills = totalPills - pillsUsedInDescent;

  if (remainingPills < 5) { 
      descentPlan = [];
      pillsUsedInDescent = 0;
      currentDose = safeStartDose;
      while (currentDose > MIN_SPLIT) {
          let nextDose = roundToSplit(currentDose - MIN_SPLIT); 
          if (nextDose < MIN_SPLIT) nextDose = MIN_SPLIT;
          
          let duration = 7; 
          if (currentDose > MIN_SPLIT) {
             descentPlan.push({ dose: currentDose, days: duration });
             pillsUsedInDescent += currentDose * duration;
          }
          currentDose = nextDose;
      }
      remainingPills = totalPills - pillsUsedInDescent;
  }

  let tailPlan: { dose: number, days: number }[] = [];
  
  if (remainingPills > 0) {
      let daysDaily = 7;
      let cyclesSkip1 = 3;
      let cyclesSkip2 = 3;

      let pillsForMinTail = (daysDaily * 0.5) + (cyclesSkip1 * 0.5) + (cyclesSkip2 * 0.5);
      remainingPills -= pillsForMinTail;

      if (remainingPills < 0) {
          daysDaily = Math.floor((totalPills - pillsUsedInDescent) / 0.5);
          remainingPills = 0;
          cyclesSkip1 = 0;
          cyclesSkip2 = 0;
      } else {
          let wDaily, wSkip1, wSkip2;

          if (speedModifier <= 0.8) {
              wDaily = 0.1; 
              wSkip1 = 2;
              wSkip2 = 5; 
          } else if (speedModifier <= 1.0) {
              wDaily = 1;
              wSkip1 = 2;
              wSkip2 = 3;
          } else {
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
 * RE-CALCULATE PLAN
 */
export const adjustPlan = (
  originalPlan: PlanDay[],
  logs: DailyLog[],
  initialTotalPills: number,
  speedModifier: number = 1.0 
): PlanDay[] => {
  // If no original plan, return empty
  if (!originalPlan.length) return [];

  // Manual plans (Doctor's plans) should likely NOT be auto-adjusted by algorithm logic 
  // based on pills remaining in the same way, OR we need a flag. 
  // For now, if we assume manual plans are fixed commitments, we might return the original plan 
  // with updated 'isPast' status.
  // HOWEVER, the request implies the settings change pace. Pace is an algorithm concept.
  // We will assume "adjustPlan" is mainly for the Algorithm route. 
  
  let consumed = 0;
  let lastDoseTaken = 0;

  logs.forEach(log => {
    consumed += log.doseTaken;
    lastDoseTaken = log.doseTaken;
  });

  const remainingPills = initialTotalPills - consumed;
  // If pills run out, simple stop or manual intervention needed. 
  // For robustness, we continue calculation but it might yield empty steps.
  
  const today = new Date().toISOString().split('T')[0];
  const reCalcStartDate = new Date(today);
  reCalcStartDate.setDate(reCalcStartDate.getDate() + 1);

  let newStartDose = roundToSplit(lastDoseTaken);
  if (newStartDose === 0) {
      newStartDose = MIN_SPLIT; 
  }

  // Use the provided speedModifier
  const futurePlan = generatePlan(remainingPills, newStartDose, reCalcStartDate.toISOString(), speedModifier);

  const history = originalPlan.filter(day => day.date <= today).map(day => {
    const log = logs.find(l => l.date === day.date);
    return { ...day, isPast: true, log: log };
  });

  return [...history, ...futurePlan];
};