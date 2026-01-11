import { Inventory, PlanDay, DailyLog, ManualPhase, MedForm } from '../types';

// ============================================================================
// 1. UTILS (أدوات مساعدة)
// ============================================================================

// إضافة أيام للتاريخ
const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
};

// حساب المخزون الكلي
export const calculateTotalInventory = (inv: Inventory): number => {
    return (inv.boxes * (inv.pillsPerBox || 1)) + inv.loosePills;
};

// ============================================================================
// 2. ENGINE CORE (المحرك المنطقي الجديد)
// ============================================================================

/**
 * المولد اليدوي (للأطباء) - يبقى كما هو
 */
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

/**
 * المولد الذكي (الخوارزمية العملية)
 * تم تعديلها لتدعم نظام "الأنصاف" و "تباعد الأيام"
 */
export const generatePlan = (
    totalPills: number, 
    startDose: number, 
    startDateStr: string,
    speedModifier: number = 1.0, // 1.0 = عادي، 0.5 = بطيء، 1.5 = سريع
    recentLogs: DailyLog[] = [],
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // إذا كان رصيد الحبوب 0 أو الجرعة 0، لا نولد خطة
    if (totalPills <= 0 || startDose <= 0) return [];

    const plan: PlanDay[] = [];
    let currentDate = startDateStr.split('T')[0];
    let remainingInventory = totalPills;
    
    // تحديد أقل وحدة كسر (للأقراص 0.5 للنص، وللسائل 0.1)
    // بناءً على طلبك: التركيز على نظام الأنصاف (0.5)
    const MIN_STEP = medForm === 'liquid' ? 0.1 : 0.5;
    
    // الجرعة الحالية التي سنبدأ التخفيض منها
    let currentDose = startDose;

    // --- المرحلة الأولى: التخفيض المباشر حتى الوصول لـ 0.5 ---
    // طالما الجرعة أكبر من 0.5، نقوم بالإنقاص تدريجياً
    while (currentDose > 0.5 && remainingInventory >= currentDose) {
        
        // تحديد مدة الثبات على الجرعة (تتأثر بالسرعة المختارة)
        // السرعة العادية: 7-10 أيام لكل تخفيض
        let daysOnDose = Math.round(7 * (1 / speedModifier));
        if (daysOnDose < 3) daysOnDose = 3; // لا تقل عن 3 أيام

        // إضافة الأيام للخطة
        for (let i = 0; i < daysOnDose; i++) {
            if (remainingInventory < currentDose) break; // نفاد المخزون

            plan.push({
                date: currentDate,
                plannedDose: currentDose,
                isPast: false
            });
            remainingInventory -= currentDose;
            currentDate = addDays(currentDate, 1);
        }

        // حساب الجرعة التالية (إنقاص نصف حبة)
        // مثال: 2 -> 1.5 -> 1 -> 0.5
        let nextDose = currentDose - 0.5;
        
        // تصحيح الأرقام العشرية
        nextDose = Math.round(nextDose * 10) / 10;
        
        if (nextDose < 0.5) nextDose = 0.5; // لا ننزل تحت النص في هذه المرحلة
        currentDose = nextDose;
    }

    // --- المرحلة الثانية: نظام تباعد الأيام (Skip-Day Logic) ---
    // عندما نصل لجرعة 0.5 (نص حبة)، نبدأ بزيادة أيام الراحة تدريجياً
    // هذا هو النظام الذي طلبته بالضبط
    
    if (currentDose === 0.5 && remainingInventory >= 0.5) {
        
        // تعريف أنماط تباعد الأيام
        const patterns = [
            { label: "Day ON, Day OFF", doseSeq: [0.5, 0], cycles: 4 },           // أسبوع تقريباً
            { label: "Day ON, 2 Days OFF", doseSeq: [0.5, 0, 0], cycles: 3 },     // 9 أيام
            { label: "Day ON, 3 Days OFF", doseSeq: [0.5, 0, 0, 0], cycles: 2 },  // 8 أيام
            { label: "Day ON, 4 Days OFF", doseSeq: [0.5, 0, 0, 0, 0], cycles: 2 } // 10 أيام
        ];

        // تطبيق الأنماط بالترتيب
        for (const pattern of patterns) {
            // نعدل عدد التكرارات (Cycles) بناءً على سرعة المستخدم
            // إذا اختار "سريع" نقلل التكرار، إذا "بطيء" نزيد التكرار
            const adjustedCycles = Math.max(1, Math.round(pattern.cycles * (1 / speedModifier)));

            for (let c = 0; c < adjustedCycles; c++) {
                for (const dose of pattern.doseSeq) {
                    // التحقق من المخزون فقط في أيام الجرعة
                    if (dose > 0 && remainingInventory < dose) break; 

                    plan.push({
                        date: currentDate,
                        plannedDose: dose,
                        isPast: false
                    });

                    if (dose > 0) remainingInventory -= dose;
                    currentDate = addDays(currentDate, 1);
                }
                if (remainingInventory < 0.5) break;
            }
            if (remainingInventory < 0.5) break;
        }
    }

    return plan;
};

// --- إعادة الحساب الديناميكي (عند تسجيل جرعة يومية) ---
export const adjustPlan = (
    originalPlan: PlanDay[],
    logs: DailyLog[],
    totalInitialInventory: number, 
    speedModifier: number = 1.0,
    medForm: MedForm = 'tablet'
): PlanDay[] => {
    
    // ترتيب السجلات زمنياً
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedLogs.length === 0) {
        // إذا لم توجد سجلات، نولد خطة جديدة من البداية
        return originalPlan.length > 0 
            ? generatePlan(totalInitialInventory, originalPlan[0].plannedDose, originalPlan[0].date, speedModifier, [], medForm)
            : [];
    }

    // آخر يوم تم تسجيله
    const lastLog = sortedLogs[sortedLogs.length - 1];
    
    // حساب ما تم استهلاكه
    const totalUsed = sortedLogs.reduce((acc, log) => acc + log.doseTaken, 0);
    
    // المتبقي الفعلي
    const remainingInventory = Math.max(0, totalInitialInventory - totalUsed);

    // الأيام الماضية (نحتفظ بها كما هي في التاريخ)
    const historyDays = originalPlan.filter(day => day.date <= lastLog.date).map(day => {
        const log = sortedLogs.find(l => l.date === day.date);
        return { ...day, isPast: true, log: log || undefined };
    });

    // تحديد نقطة الانطلاق الجديدة
    // إذا كان آخر يوم 0 (يوم راحة)، نبحث عن آخر جرعة حقيقية أخذها لنعرف مستواه
    let startPoint = lastLog.doseTaken;
    if (startPoint === 0) {
        const lastActive = [...sortedLogs].reverse().find(l => l.doseTaken > 0);
        // إذا وجدنا آخر جرعة فعالة، نعتمدها، وإلا نعود لبداية الخطة
        startPoint = lastActive ? lastActive.doseTaken : (originalPlan[0]?.plannedDose || 0.5);
    }

    // توليد المستقبل بناءً على المعطيات الجديدة
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