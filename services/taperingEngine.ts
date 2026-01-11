import { Inventory, PlanDay, DailyLog, ManualPhase, MedForm } from '../types';

// ============================================================================
// 1. PRECISION KERNEL (النواة الدقيقة)
// ============================================================================
const PRECISION = 1000; 
const MIN_SPLIT_MICRO = 250; // 0.25mg (ربع حبة) - أقل وحدة قياسية للأقراص

const toMicro = (val: number) => Math.round(val * PRECISION);
const fromMicro = (val: number) => val / PRECISION;

/**
 * دالة "التقريب الذكي": 
 * للأقراص: تقرب لأقرب 0.25 (ربع حبة).
 * للسوائل: تقرب لأقرب 0.1 (عشر المليلتر).
 */
const smartRound = (microVal: number, form: MedForm = 'tablet'): number => {
    // 1. تحديد حجم الخطوة بناءً على الشكل الدوائي
    // للأقراص: 250 ميكرو = 0.25
    // للسوائل: 100 ميكرو = 0.1
    const step = form === 'liquid' ? 100 : 250; 
    
    // 2. حساب الباقي
    const remainder = microVal % step;
    
    // 3. التقريب (لأقرب خطوة)
    let result = remainder < step / 2 
        ? microVal - remainder 
        : microVal + (step - remainder);

    // 4. حماية الجرعات الصغيرة جداً
    // إذا كانت النتيجة صغيرة جداً ولكن ليست صفراً، نجعلها تساوي أقل خطوة ممكنة
    // هذا يمنع ظهور جرعات غريبة مثل 0.1mg للأقراص
    if (result > 0 && result < step) {
        return step;
    }
    
    return result;
};

// ============================================================================
// 2. NEURO-SCIENCE LOGIC (المنطق العلمي)
// ============================================================================

/**
 * معادلة التخفيض الزائدي (Hyperbolic)
 */
const getHyperbolicReductionRate = (currentMicro: number, startMicro: number): number => {
    if (startMicro === 0) return 0.1;
    
    const ratio = currentMicro / startMicro;

    // تخفيف النسب قليلاً لتكون ألطف على المستخدم
    if (ratio > 0.75) return 0.10; // 10%
    if (ratio > 0.40) return 0.07; // 7%
    if (ratio > 0.15) return 0.05; // 5%
    return 0.05;                   // تثبيت الحد الأدنى عند 5% لتجنب التخفيض البطيء جداً في النهاية
};

/**
 * تحليل جاهزية الجهاز العصبي (Neuro-Readiness)
 */
const calculateNeuroReadiness = (logs: DailyLog[]): number => {
    if (logs.length < 3) return 1.0; 

    const recent = logs.slice(-5);
    
    // تحليل النوم (المعيار 7 ساعات)
    const sleepAvg = recent.reduce((a, b) => a + (b.sleepHours || 0), 0) / recent.length;
    const sleepFactor = Math.min(1, Math.max(0.5, sleepAvg / 7)); 

    // تحليل الأعراض
    const symptomSeverity = recent.reduce((a, b) => a + (b.symptoms?.length || 0), 0);
    const symptomFactor = Math.max(0.4, 1 - (symptomSeverity * 0.1));

    const score = (sleepFactor * 0.5) + (symptomFactor * 0.5);
    return Math.max(0.5, score); 
};

// ============================================================================
// 3. ENGINE CORE (محرك التوليد)
// ============================================================================

const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
};

export const calculateTotalInventory = (inv: Inventory): number => {
    return (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
};

// --- المولد اليدوي (للأطباء) ---
export const generateManualPlan = (phases: ManualPhase[], startDateStr: string): PlanDay[] => {
    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    phases.forEach(phase => {
        for (let i = 0; i < phase.days; i++) {
            plan.push({ date: currentDate, plannedDose: phase.dose, isPast: false });
            currentDate = addDays(currentDate, 1);
        }
    });
    return plan;
};

// --- المولد الذكي (الخوارزمية) ---
export const generatePlan = (
    totalPills: number, 
    startDose: number, 
    startDateStr: string,
    speedModifier: number = 1.0,
    recentLogs: DailyLog[] = [],
    medForm: MedForm = 'tablet' // افتراضياً أقراص لتكون أكثر أماناً
): PlanDay[] => {
    
    const totalInvMicro = toMicro(totalPills);
    const startMicro = toMicro(startDose);
    
    if (totalInvMicro <= 0 || startMicro <= 0) return [];

    const readiness = calculateNeuroReadiness(recentLogs);
    const effectiveSpeed = speedModifier * readiness;

    let bestSteps: number[] = [];
    let quality = 1.0;
    let foundSolution = false;
    
    // Safety Circuit Breaker (قاطع الطوارئ لمنع التعليق)
    let loopGuard = 0;
    const MAX_ITERATIONS = 50; 

    while (quality > 0.1 && !foundSolution) {
        loopGuard++;
        if (loopGuard > MAX_ITERATIONS) {
            console.warn("Tapering Engine: Max iterations reached. Breaking to safe mode.");
            break;
        }

        const steps: number[] = [];
        let currentMicro = startMicro;
        let simulatedInventory = totalInvMicro;
        let isFeasible = true;
        let internalLoopGuard = 0;

        while (currentMicro > 0) {
            internalLoopGuard++;
            if (internalLoopGuard > 5000) { isFeasible = false; break; }

            // 1. حساب نسبة الخصم
            let reductionRate = getHyperbolicReductionRate(currentMicro, startMicro);
            reductionRate = reductionRate / (quality * effectiveSpeed);
            
            // 2. حساب الهدف القادم مع التقريب الذكي (هنا يتم إصلاح مشكلة الكسور)
            let targetMicro = Math.round(currentMicro * (1 - reductionRate));
            targetMicro = smartRound(targetMicro, medForm); 

            // منع التوقف (إذا كان التقريب يعيدنا لنفس الرقم، ننزل خطوة واحدة قسراً)
            if (targetMicro >= currentMicro) {
                const stepSize = medForm === 'liquid' ? 100 : 250; // 0.1ml or 0.25mg
                targetMicro = Math.max(0, currentMicro - stepSize);
            }

            // 3. تحديد المدة (أيام الثبات)
            let daysOnDose = Math.round(14 * quality); 
            if (daysOnDose < 4) daysOnDose = 4; // لا تقل عن 4 أيام

            // 4. المحاكاة
            for (let i = 0; i < daysOnDose; i++) {
                steps.push(currentMicro);
                simulatedInventory -= currentMicro;
            }

            // 5. النهاية (الذيل)
            if (targetMicro === 0) {
                // نمط يوم إيه / يوم لا في النهاية لتخفيف الصدمة
                const tailCycles = Math.max(2, Math.round(4 * quality));
                for(let i=0; i < tailCycles; i++) {
                    steps.push(currentMicro); simulatedInventory -= currentMicro;
                    steps.push(0);
                }
                break; 
            }

            // فحص المخزون
            if (simulatedInventory < 0) {
                isFeasible = false;
                break;
            }

            currentMicro = targetMicro;
        }

        if (isFeasible && simulatedInventory >= 0) {
            bestSteps = steps;
            foundSolution = true;
        } else {
            // تقليل الجودة (زيادة السرعة) والمحاولة مرة أخرى
            quality -= 0.05;
        }
    }

    // fallback: الحل الخطي الطارئ إذا فشل كل شيء
    if (!foundSolution) {
        let budget = totalInvMicro;
        let emergencyDose = startMicro;
        const stepSize = medForm === 'liquid' ? 100 : 250;
        
        while (budget >= emergencyDose && emergencyDose > 0) {
            bestSteps.push(emergencyDose);
            budget -= emergencyDose;
            emergencyDose = Math.max(0, emergencyDose - stepSize);
        }
    }

    // تحويل النتائج لخطة نهائية
    const finalPlan: PlanDay[] = [];
    let currDate = startDateStr.split('T')[0];

    bestSteps.forEach(microDose => {
        finalPlan.push({
            date: currDate,
            plannedDose: fromMicro(microDose),
            isPast: false
        });
        currDate = addDays(currDate, 1);
    });

    return finalPlan;
};

// --- إعادة الحساب الديناميكي ---
export const adjustPlan = (
    originalPlan: PlanDay[],
    logs: DailyLog[],
    totalInitialInventory: number, 
    speedModifier: number = 1.0,
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedLogs.length === 0) {
        return originalPlan.length > 0 
            ? generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier, [], medForm)
            : [];
    }

    const lastLog = sortedLogs[sortedLogs.length - 1];
    const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
    const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

    const historyDays = originalPlan.filter(day => day.date <= lastLog.date).map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return { ...day, isPast: true, log: log || undefined };
    });

    let startPoint = lastLog.doseTaken;
    if (startPoint === 0) {
        const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
        startPoint = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0);
    }

    const futureDays = generatePlan(
        remainingInventory,
        startPoint,
        addDays(lastLog.date, 1),
        speedModifier,
        sortedLogs,
        medForm
    );

    return [...historyDays, ...futureDays];
};