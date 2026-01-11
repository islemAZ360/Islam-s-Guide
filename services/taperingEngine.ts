import { Inventory, PlanDay, DailyLog, ManualPhase } from '../types';

// ============================================================================
// 1. PRECISION KERNEL (النواة الدقيقة)
// ============================================================================
// نستخدم وحدة "الميكرو" (1/1000) لتجنب مشاكل الفاصلة العائمة في الجافاسكربت
const PRECISION = 1000; 
const MIN_SPLIT_MICRO = 250; // يعادل 0.25mg (ربع حبة) كأقل وحدة فيزيائية

const toMicro = (val: number) => Math.round(val * PRECISION);
const fromMicro = (val: number) => val / PRECISION;

/**
 * دالة "التقريب الذكي": تحاول الوصول لأدق جرعة ممكنة فيزيائياً
 */
const smartRound = (microVal: number, form: 'tablet' | 'liquid' = 'tablet'): number => {
    // للسائل الدقة 0.1ml (100 micro)
    // للأقراص الدقة 0.25mg (250 micro)
    const step = form === 'liquid' ? 100 : MIN_SPLIT_MICRO; 
    const remainder = microVal % step;
    if (remainder === 0) return microVal;
    
    // التقريب لأقرب وحدة قابلة للقياس
    return remainder < step / 2 
        ? microVal - remainder 
        : microVal + (step - remainder);
};

// ============================================================================
// 2. NEURO-SCIENCE LOGIC (المنطق العصبي العلمي)
// ============================================================================

/**
 * معادلة هورويتز-تايلور (Horowitz-Taylor Hyperbolic Decay)
 * المبدأ: "كلما انخفضت الجرعة، زادت صعوبة الخصم"
 */
const getHyperbolicReductionRate = (currentMicro: number, startMicro: number): number => {
    if (startMicro === 0) return 0.1;
    
    // نسبة إشغال المستقبلات التقريبية
    const ratio = currentMicro / startMicro;

    if (ratio > 0.75) return 0.10; // الجرعات العالية: خصم 10%
    if (ratio > 0.40) return 0.07; // الجرعات المتوسطة: خصم 7%
    if (ratio > 0.15) return 0.05; // الجرعات المنخفضة: خصم 5%
    return 0.025;                  // الجرعات الأخيرة (الخطر): خصم 2.5% فقط
};

/**
 * تحليل الاستقرار العصبي (Neuro-Stability Score)
 * يحلل آخر 5 أيام ليقرر هل المريض مستعد للنزول أم يحتاج للتثبيت
 */
const calculateNeuroReadiness = (logs: DailyLog[]): number => {
    if (logs.length < 3) return 1.0; // لا يوجد سجل كافٍ، نفترض الجاهزية

    const recent = logs.slice(-5);
    
    // 1. استقرار النوم (وزن 50%)
    const sleepAvg = recent.reduce((a, b) => a + (b.sleepHours || 0), 0) / recent.length;
    // أقل من 5 ساعات نوم يعني مشكلة، 7 ساعات ممتاز
    const sleepFactor = Math.min(1, Math.max(0.5, sleepAvg / 7)); 

    // 2. حدة الأعراض (وزن 50%)
    const symptomSeverity = recent.reduce((a, b) => a + (b.symptoms?.length || 0), 0);
    // كل عرض يخصم من النتيجة
    const symptomFactor = Math.max(0.4, 1 - (symptomSeverity * 0.1));

    // النتيجة: 1.0 تعني جاهز تماماً، أقل من ذلك يعني إبطاء الخطة
    const score = (sleepFactor * 0.5) + (symptomFactor * 0.5);
    return Math.max(0.5, score); // لا ننزل تحت نصف السرعة
};

// ============================================================================
// 3. ENGINE CORE (محرك المحاكاة)
// ============================================================================

const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
};

export const calculateTotalInventory = (inv: Inventory): number => {
    return (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
};

// --- المولد اليدوي (ثابت للأطباء) ---
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

// --- المولد الذكي العلمي (Scientific Generator) ---
export const generatePlan = (
    totalPills: number, 
    startDose: number, 
    startDateStr: string,
    speedModifier: number = 1.0,
    recentLogs: DailyLog[] = []
): PlanDay[] => {
    
    // تهيئة البيانات الدقيقة
    const totalInvMicro = toMicro(totalPills);
    const startMicro = toMicro(startDose);
    
    if (totalInvMicro <= 0 || startMicro <= 0) return [];

    // تحليل حالة المريض الحالية (Neuro-Check)
    const readiness = calculateNeuroReadiness(recentLogs);
    // السرعة الفعالة = رغبة المستخدم * حالته الصحية
    const effectiveSpeed = speedModifier * readiness;

    // --- محاكي الميزانية (The Economy Simulator) ---
    
    let bestSteps: number[] = [];
    let quality = 1.0;
    let foundSolution = false;
    
    // FIX: إضافة عداد لمنع الحلقات اللانهائية (Safety Circuit Breaker)
    let loopGuard = 0;
    const MAX_ITERATIONS = 50;

    // حلقة البحث عن الحل (تتكرر حتى تجد خطة تناسب المخزون)
    while (quality > 0.1 && !foundSolution) {
        
        // Safety Break
        loopGuard++;
        if (loopGuard > MAX_ITERATIONS) {
            console.warn("Tapering Engine: Max iterations reached. Breaking loop.");
            break;
        }

        const steps: number[] = [];
        let currentMicro = startMicro;
        let simulatedInventory = totalInvMicro;
        let isFeasible = true;

        // حلقة النزول (Descent Loop)
        while (currentMicro > 0) {
            // 1. حساب نسبة الخصم العلمية (Hyperbolic)
            let reductionRate = getHyperbolicReductionRate(currentMicro, startMicro);
            
            // تعديل النسبة حسب "الجودة" و "السرعة الفعالة"
            // Quality أقل = سرعة أكبر (اضطرارياً)
            reductionRate = reductionRate / (quality * effectiveSpeed);
            
            // حساب الهدف القادم
            let targetMicro = Math.round(currentMicro * (1 - reductionRate));
            targetMicro = smartRound(targetMicro); // تقريب فيزيائي

            // منع التوقف (Stagnation Loop Breaker)
            if (targetMicro >= currentMicro) {
                targetMicro = smartRound(currentMicro - MIN_SPLIT_MICRO);
            }
            if (targetMicro < 0) targetMicro = 0;

            // 2. تحديد مدة الثبات (Plateau Duration)
            // علمياً: يحتاج الدماغ 2-4 أسابيع في التخفيضات الكبيرة، و 1-2 أسبوع في الصغيرة
            let daysOnDose = Math.round(14 * quality); 
            if (daysOnDose < 4) daysOnDose = 4; // أمان: لا يقل عن 4 أيام (Half-life clearance)

            // 3. إضافة الخطوات للمحاكاة
            for (let i = 0; i < daysOnDose; i++) {
                steps.push(currentMicro);
                simulatedInventory -= currentMicro;
            }

            // 4. استراتيجية "الذيل" (The Tail Strategy)
            if (targetMicro === 0) {
                const tailCycles = Math.max(2, Math.round(4 * quality));
                
                // النمط: يوم إيه / يوم لا
                for(let i=0; i < tailCycles; i++) {
                    steps.push(currentMicro); simulatedInventory -= currentMicro;
                    steps.push(0);
                }
                
                if (quality > 0.5) {
                    for(let i=0; i < tailCycles; i++) {
                        steps.push(currentMicro); simulatedInventory -= currentMicro;
                        steps.push(0); steps.push(0);
                    }
                }
                break; // انتهى النزول
            }

            // التحقق من الميزانية (هل نفد المخزون؟)
            if (simulatedInventory < 0) {
                isFeasible = false;
                break;
            }

            currentMicro = targetMicro;
            if (steps.length > 5000) break; // أمان ضد الحلقات اللانهائية الداخلية
        }

        if (isFeasible && simulatedInventory >= 0) {
            bestSteps = steps;
            foundSolution = true;
        } else {
            // تقليل الجودة بنسبة 5% والمحاولة مرة أخرى للعثور على حل أرخص
            quality -= 0.05;
        }
    }

    // إذا فشلت كل المحاولات (مخزون حرج جداً)، نستخدم "التخفيض الخطي الطارئ"
    if (!foundSolution) {
        let budget = totalInvMicro;
        let emergencyDose = startMicro;
        while (budget >= emergencyDose && emergencyDose > 0) {
            bestSteps.push(emergencyDose);
            budget -= emergencyDose;
            emergencyDose = smartRound(emergencyDose - MIN_SPLIT_MICRO);
        }
        // استهلاك ما تبقى
        while (budget > 0) {
             const dose = Math.min(budget, MIN_SPLIT_MICRO);
             bestSteps.push(dose);
             budget -= dose;
        }
    }

    // تحويل الخطوات إلى خطة نهائية
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

// --- إعادة الحساب الديناميكي (Dynamic Re-Calculation) ---
export const adjustPlan = (
    originalPlan: PlanDay[],
    logs: DailyLog[],
    totalInitialInventory: number, 
    speedModifier: number = 1.0 
): PlanDay[] => {
    
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedLogs.length === 0) {
        return originalPlan.length > 0 
            ? generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier, [])
            : [];
    }

    const lastLog = sortedLogs[sortedLogs.length - 1];
    
    // حساب المتبقي الحقيقي
    const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
    const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

    // الأيام الماضية تثبت كما هي
    const historyDays = originalPlan.filter(day => day.date <= lastLog.date).map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return { ...day, isPast: true, log: log || undefined };
    });

    // تحديد نقطة البداية للمستقبل
    let startPoint = lastLog.doseTaken;
    if (startPoint === 0) {
        // إذا كان في يوم راحة، نرجع لآخر جرعة فعالة
        const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
        startPoint = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0);
    }

    // توليد المستقبل باستخدام المحرك العلمي
    const futureDays = generatePlan(
        remainingInventory,
        startPoint,
        addDays(lastLog.date, 1),
        speedModifier,
        sortedLogs // نمرر السجل للتحليل العصبي
    );

    return [...historyDays, ...futureDays];
};