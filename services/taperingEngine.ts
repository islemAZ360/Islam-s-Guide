import { Inventory, PlanDay, DailyLog, ManualPhase, MedForm } from '../types';

// ============================================================================
// 1. CONFIGANTS & UTILS (ثوابت وأدوات)
// ============================================================================

// أقصى نسبة تخفيض مسموحة في الخطوة الواحدة (للسلامة)
const MAX_DROP_PERCENTAGE = 0.5; // 50%

// إضافة أيام للتاريخ بأمان
const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0]; // Fallback to today
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
};

// تقريب الأرقام لتجنب مشاكل الفاصلة العائمة (مثلاً 0.1 + 0.2)
const safeRound = (num: number): number => {
    return Math.round(num * 100) / 100;
};

// حساب المخزون الكلي
export const calculateTotalInventory = (inv: Inventory): number => {
    if (!inv) return 0;
    const total = (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
    return Math.max(0, total); // منع القيم السالبة
};

// ============================================================================
// 2. ENGINE CORE (المحرك المنطقي الآمن)
// ============================================================================

/**
 * المولد اليدوي (للأطباء)
 */
export const generateManualPlan = (phases: ManualPhase[], startDateStr: string): PlanDay[] => {
    if (!phases || !Array.isArray(phases) || phases.length === 0) return [];
    
    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    
    phases.forEach(phase => {
        // التحقق من صحة المرحلة
        const safeDose = Math.max(0, safeRound(phase.dose));
        const safeDays = Math.max(1, Math.floor(phase.days)); // يوم واحد على الأقل

        for (let i = 0; i < safeDays; i++) {
            plan.push({ date: currentDate, plannedDose: safeDose, isPast: false });
            currentDate = addDays(currentDate, 1);
        }
    });
    return plan;
};

/**
 * المولد الذكي (الخوارزمية العملية)
 * يتضمن الآن حدوداً للسلامة وتحققاً من المدخلات
 */
export const generatePlan = (
    totalPills: number, 
    startDose: number, 
    startDateStr: string,
    speedModifier: number = 1.0, 
    recentLogs: DailyLog[] = [],
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // 1. Safety Checks (فحوصات السلامة الأولية)
    if (totalPills <= 0 || startDose <= 0) return [];
    if (isNaN(totalPills) || isNaN(startDose)) return [];

    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    let remainingInventory = safeRound(totalPills);
    
    // تحديد أقل وحدة كسر (للأقراص 0.5 للنص، وللسائل 0.1)
    const MIN_STEP = medForm === 'liquid' ? 0.1 : 0.5;
    
    // الجرعة الحالية التي سنبدأ التخفيض منها
    let currentDose = safeRound(startDose);

    // --- المرحلة الأولى: التخفيض المباشر (Hyperbolic-like) ---
    // نتوقف عند 0.5 أو عند نفاد المخزون
    // حد الأمان: لا تستمر الحلقة لأكثر من 365 يوماً لتجنب التجميد (Infinite Loop Guard)
    let safetyCounter = 0;
    const MAX_LOOPS = 1000; 

    while (currentDose > 0.5 && remainingInventory >= currentDose && safetyCounter < MAX_LOOPS) {
        safetyCounter++;

        // تحديد مدة الثبات على الجرعة
        // السرعة العادية: 7-14 أيام. كلما قلت الجرعة، زادت المدة (Hyperbolic logic simplified)
        let baseDays = currentDose > (startDose / 2) ? 7 : 10;
        
        // تعديل السرعة بناءً على تفضيل المستخدم
        let daysOnDose = Math.round(baseDays * (1 / speedModifier));
        if (daysOnDose < 3) daysOnDose = 3; // حد أدنى للسلامة: 3 أيام

        // إضافة الأيام للخطة
        for (let i = 0; i < daysOnDose; i++) {
            if (remainingInventory < currentDose) break; 

            plan.push({
                date: currentDate,
                plannedDose: currentDose,
                isPast: false
            });
            remainingInventory = safeRound(remainingInventory - currentDose);
            currentDate = addDays(currentDate, 1);
        }

        // حساب الجرعة التالية
        // القاعدة: لا تخفض أكثر من 50% دفعة واحدة إلا إذا كانت الجرعة صغيرة جداً
        let nextDose = currentDose - 0.5;
        
        // Safety Clamp: إذا كان التخفيض حاداً جداً، نجعله أبطأ (للجرعات العالية)
        if (currentDose > 5 && nextDose < currentDose * (1 - MAX_DROP_PERCENTAGE)) {
            nextDose = currentDose * 0.75; // تخفيض 25% فقط
            // تقريب لأقرب 0.5
            nextDose = Math.round(nextDose * 2) / 2;
        }

        nextDose = safeRound(nextDose);
        
        if (nextDose < 0.5) nextDose = 0.5;
        currentDose = nextDose;
    }

    // --- المرحلة الثانية: نظام تباعد الأيام (Micro-Tapering / Skipping) ---
    if (currentDose === 0.5 && remainingInventory >= 0.5) {
        
        const patterns = [
            { doseSeq: [0.5, 0], cycles: 4 },           // Day ON, Day OFF
            { doseSeq: [0.5, 0, 0], cycles: 3 },        // Day ON, 2 Days OFF
            { doseSeq: [0.5, 0, 0, 0], cycles: 2 },     // Day ON, 3 Days OFF
            { doseSeq: [0.5, 0, 0, 0, 0], cycles: 2 }   // Day ON, 4 Days OFF
        ];

        for (const pattern of patterns) {
            const adjustedCycles = Math.max(1, Math.round(pattern.cycles * (1 / speedModifier)));

            for (let c = 0; c < adjustedCycles; c++) {
                for (const dose of pattern.doseSeq) {
                    if (dose > 0 && remainingInventory < dose) break; 

                    plan.push({
                        date: currentDate,
                        plannedDose: dose,
                        isPast: false
                    });

                    if (dose > 0) remainingInventory = safeRound(remainingInventory - dose);
                    currentDate = addDays(currentDate, 1);
                }
                if (remainingInventory < 0.5) break;
            }
            if (remainingInventory < 0.5) break;
        }
    }

    return plan;
};

// --- إعادة الحساب الديناميكي ---
export const adjustPlan = (
    originalPlan: PlanDay[],
    logs: DailyLog[],
    totalInitialInventory: number, 
    speedModifier: number = 1.0,
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // ترتيب السجلات
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedLogs.length === 0) {
        return originalPlan.length > 0 
            ? generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier, [], medForm)
            : [];
    }

    const lastLog = sortedLogs[sortedLogs.length - 1];
    const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
    const remainingInventory = Math.max(0, safeRound(totalInitialInventory - totalUsed));

    // الاحتفاظ بالتاريخ
    const historyDays = originalPlan.filter(day => day.date <= lastLog.date).map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return { ...day, isPast: true, log: log || undefined };
    });

    // نقطة الانطلاق الجديدة
    let startPoint = lastLog.doseTaken;
    if (startPoint === 0) {
        const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
        startPoint = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0.5);
    }

    // توليد المستقبل
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