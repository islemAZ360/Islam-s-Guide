import { UserProfile, DailyLog, PlanDay } from '../types';

// --- واجهة تقرير التحليل الذكي ---
export interface AnalyticsReport {
    bioScore: number; // 0-100: المرونة البيولوجية بناءً على العمر/الوزن/الطول
    recoveryScore: number; // 0-100: مؤشر العافية اليومي الحالي
    trend: 'improving' | 'declining' | 'stable';
    sleepAnalysis: {
        average: number;
        quality: string; 
        impactFactor: number; // معامل الارتباط بين الجرعة والنوم
    };
    symptomBurden: number; // كثافة الأعراض (0-100)
    predictedStability: number; // احتمالية الاستقرار العصبي مستقبلاً
    insights: string[]; // نصوص ذكية يتم توليدها بناءً على التحليل
    chartData: {
        dates: string[];
        wellness: number[];
        dose: number[];
        sleep: number[];
    };
}

// --- أدوات مساعدة (Helpers) ---

const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 22; // قيمة افتراضية صحية
    // BMI = kg / m^2
    return weight / ((height / 100) * (height / 100));
};

const getMoodScore = (mood: string | null) => {
    if (mood === 'good') return 100;
    if (mood === 'normal') return 65;
    return 30; // bad
};

const calculateVariance = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
};

// --- المحرك الرئيسي (Main Engine Function) ---

export const generateSmartAnalytics = (
    user: UserProfile | null, 
    logs: DailyLog[], 
    plan: PlanDay[]
): AnalyticsReport => {
    
    // 1. القيم الافتراضية
    const report: AnalyticsReport = {
        bioScore: 50,
        recoveryScore: 0,
        trend: 'stable',
        sleepAnalysis: { average: 0, quality: 'N/A', impactFactor: 0 },
        symptomBurden: 0,
        predictedStability: 50,
        insights: [],
        chartData: { dates: [], wellness: [], dose: [], sleep: [] }
    };

    // شرط البدء: يومين على الأقل
    if (!user || logs.length < 2) {
        report.insights.push("بيانات غير كافية. يرجى تسجيل بيانات يومين على الأقل لتفعيل المحرك العصبي.");
        return report;
    }

    // 2. ترتيب السجلات (من الأقدم للأحدث)
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 3. التحليل البيومتري (Metabolic Resilience)
    // الأصغر سناً + الوزن المثالي = مرونة أعلى
    const age = user.age || 30;
    const weight = user.weight || 70;
    const height = user.height || 170;
    const bmi = calculateBMI(weight, height);
    
    let bioResilience = 100;
    
    // عامل العمر: يقلل المرونة قليلاً مع التقدم في السن
    if (age > 50) bioResilience -= (age - 50) * 0.5;
    
    // عامل مؤشر كتلة الجسم (BMI): القيم المتطرفة تقلل المرونة
    if (bmi < 18.5 || bmi > 30) bioResilience -= 15;
    else if (bmi > 25) bioResilience -= 5;

    report.bioScore = Math.max(10, Math.min(100, Math.round(bioResilience)));

    // 4. التحليل الطولي (الاتجاهات)
    // نأخذ آخر 14 يوم لتحليل دقيق، أو كل الأيام إذا كانت أقل
    const recentLogs = sortedLogs.slice(-14); 
    
    const sleepScores = recentLogs.map(l => l.sleepHours || 0);
    const moodScores = recentLogs.map(l => getMoodScore(l.mood));
    // كل عرض يزيد العبء بـ 15 نقطة
    const symptomCounts = recentLogs.map(l => (l.symptoms?.length || 0) * 15); 

    // حساب "مؤشر العافية" اليومي (Wellness Score)
    // المعادلة: (المزاج * 40%) + (النوم% * 40%) - (عبء الأعراض * 20%)
    const dailyWellness = recentLogs.map((l, i) => {
        // النوم: 8 ساعات = 100%
        const sScore = Math.min(100, ((l.sleepHours || 0) / 8) * 100);
        const mScore = moodScores[i];
        const symPenalty = symptomCounts[i];
        
        let score = (mScore * 0.4) + (sScore * 0.4) - (symPenalty * 0.2);
        return Math.max(0, Math.min(100, score));
    });

    const currentWellness = dailyWellness[dailyWellness.length - 1];
    const prevWellness = dailyWellness.length > 1 ? dailyWellness[dailyWellness.length - 2] : currentWellness;

    report.recoveryScore = Math.round(currentWellness);
    
    // تحديد الاتجاه
    if (currentWellness > prevWellness + 5) report.trend = 'improving';
    else if (currentWellness < prevWellness - 5) report.trend = 'declining';
    else report.trend = 'stable';

    // 5. تحليل النوم العميق
    const avgSleep = sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length;
    report.sleepAnalysis.average = parseFloat(avgSleep.toFixed(1));
    
    if (avgSleep >= 7) report.sleepAnalysis.quality = 'Optimal'; // مثالي
    else if (avgSleep >= 5) report.sleepAnalysis.quality = 'Fair'; // مقبول
    else report.sleepAnalysis.quality = 'Critical'; // حرج

    // 6. توقع الاستقرار (Variance Analysis)
    // تذبذب عالي في النوم أو المزاج = استقرار منخفض
    const sleepVar = calculateVariance(sleepScores);
    const moodVar = calculateVariance(moodScores);
    
    // الاستقرار يبدأ من 100، وينقص كلما زاد التذبذب
    // النوم الحساس له وزن أكبر في المعادلة
    let stability = 100 - (sleepVar * 3) - (moodVar * 0.5);
    
    // عقوبة إضافية إذا كانت الأعراض تتزايد
    const lastSym = symptomCounts[symptomCounts.length - 1];
    const prevSym = symptomCounts.length > 1 ? symptomCounts[symptomCounts.length - 2] : lastSym;
    if (lastSym > prevSym) stability -= 10;

    report.predictedStability = Math.round(Math.max(0, Math.min(100, stability)));
    report.symptomBurden = Math.min(100, lastSym);

    // 7. توليد الرؤى الذكية (Insights Generation)
    
    // أ. تحليل التكيف العصبي
    if (report.trend === 'improving' && report.predictedStability > 70) {
        report.insights.push("رصدنا تكيفاً عصبياً ممتازاً. جهازك العصبي يتعافى بسرعة، يمكنك الاستمرار بنفس الوتيرة.");
    } else if (report.trend === 'declining') {
        report.insights.push("هناك تراجع في المؤشرات الحيوية. يوصى بتثبيت الجرعة الحالية لبضعة أيام حتى استقرار الحالة.");
    }

    // ب. تحليل النوم
    if (report.sleepAnalysis.quality === 'Critical') {
        report.insights.push("الحرمان من النوم هو الخطر الأكبر حالياً. لا تقم بخفض الجرعة حتى يتحسن معدل نومك فوق 5 ساعات.");
    }

    // ج. تحليل الأعراض
    if (report.symptomBurden > 40) {
        report.insights.push("عبء الأعراض الانسحابية مرتفع جداً. هذا مؤشر على أن وتيرة التخفيض قد تكون أسرع من قدرة جسمك على التحمل.");
    }

    // د. تحليل بيولوجي
    if (report.bioScore < 60) {
        report.insights.push("بناءً على بياناتك الجسدية، معدل الأيض لديك قد يكون حساساً. الاهتمام بالتغذية وشرب الماء ضروري جداً لدعم الكبد في التخلص من السموم.");
    }

    // 8. تجهيز بيانات الرسم البياني
    report.chartData = {
        dates: recentLogs.map(l => l.date),
        wellness: dailyWellness.map(w => Math.round(w)),
        dose: recentLogs.map(l => l.doseTaken),
        sleep: sleepScores
    };

    return report;
};