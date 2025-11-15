// استيراد المكتبة
const adhan = require('adhan');

// إعداد المدخلات (يمكنك تغيير هذه القيم لأي مدينة أخرى)
const latitude = 31.9539;  // مثال: خط العرض لمدينة عمّان
const longitude = 35.9106; // مثال: خط الطول لمدينة عمّان
const altitude = 800;      // مثال: الارتفاع عن سطح البحر
const date = new Date();   // التاريخ الحالي

// قائمة بجميع الطرق الحسابية المتاحة
const calculationMethods = {
    'Muslim World League': adhan.CalculationMethod.MuslimWorldLeague(),
    'Islamic Society of North America (ISNA)': adhan.CalculationMethod.IslamicSocietyOfNorthAmerica(),
    'Egyptian General Authority of Survey': adhan.CalculationMethod.Egyptian(),
    'Umm Al-Qura University': adhan.CalculationMethod.UmmAlQura(),
    'University of Islamic Sciences, Karachi': adhan.CalculationMethod.Karachi(),
    'Institute of Geophysics, University of Tehran': adhan.CalculationMethod.Tehran(),
    'Shia Ithna Ashari': adhan.CalculationMethod.Shiite(),
    'Kuwait Ministry of Awqaf and Islamic Affairs': adhan.CalculationMethod.Kuwait(),
    'Algerian Ministry of Religious Affairs': adhan.CalculationMethod.Algerian(),
    'Tunisian Ministry of Religious Affairs': adhan.CalculationMethod.Tunisian(),
    'Union of Islamic Organizations of France': adhan.CalculationMethod.France(),
    'Majlis Ugama Islam Singapura (Muis), Singapore': adhan.CalculationMethod.Singapore(),
    'Ministry of Religious Affairs of the Republic of Indonesia': adhan.CalculationMethod.MoonsightingCommittee()
};

// الدالة الرئيسية لحساب وعرض المواقيت
function calculateAllPrayerTimes(lat, lon, alt, d) {
    const coordinates = new adhan.Coordinates(lat, lon);
    const params = adhan.CalculationMethod.UmmAlQura(); // نستخدم أم القرى كافتراضي

    console.log(`\nمواقيت الصلاة لمدينة عمّان بتاريخ: ${d.toLocaleDateString()}`);
    console.log(`-----------------------------------\n`);

    // المرور على جميع الطرق الحسابية
    for (const method in calculationMethods) {
        if (calculationMethods.hasOwnProperty(method)) {
            // استخدام الطريقة الحسابية الحالية
            const params = calculationMethods[method];
            
            // تعديل طريقة حساب العصر (شافعي أو حنفي)
            params.madhab = adhan.Madhab.Shafi; // يمكن تغييرها إلى adhan.Madhab.Hanafi
            
            // إنشاء كائن المواقيت
            const prayerTimes = new adhan.PrayerTimes(coordinates, d, params);

            console.log(`\nطريقة الحساب: ${method}`);
            console.log(`  الفجر  : ${prayerTimes.fajr.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
            console.log(`  الشروق : ${prayerTimes.sunrise.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
            console.log(`  الظهر  : ${prayerTimes.dhuhr.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
            console.log(`  العصر  : ${prayerTimes.asr.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
            console.log(`  المغرب  : ${prayerTimes.maghrib.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
            console.log(`  العشاء : ${prayerTimes.isha.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
        }
    }
}

// استدعاء الدالة
calculateAllPrayerTimes(latitude, longitude, altitude, date);