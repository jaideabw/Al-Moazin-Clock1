
// A list of Arab and Islamic countries for the dropdown.
export const countries = [
  'الأردن',
  'السعودية',
  'مصر',
  'الإمارات العربية المتحدة',
  'قطر',
  'البحرين',
  'الكويت',
  'عمان',
  'العراق',
  'سوريا',
  'لبنان',
  'فلسطين',
  'اليمن',
  'ليبيا',
  'تونس',
  'الجزائر',
  'المغرب',
  'السودان',
  'تركيا',
  'باكستان',
  'إندونيسيا',
  'ماليزيا'
];

// A mapping of countries to their major cities.
export const citiesByCountry: { [key: string]: string[] } = {
  'الأردن': ['عمان', 'الزرقاء', 'إربد', 'العقبة', 'السلط', 'مأدبا'],
  'السعودية': ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر'],
  'مصر': ['القاهرة', 'الإسكندرية', 'الجيزة', 'شبرا الخيمة', 'بور سعيد', 'السويس'],
  'الإمارات العربية المتحدة': ['دبي', 'أبو ظبي', 'الشارقة', 'العين', 'عجمان'],
  'قطر': ['الدوحة', 'الوكرة', 'الريان'],
  'البحرين': ['المنامة', 'الرفاع', 'المحرق'],
  'الكويت': ['مدينة الكويت', 'حولي', 'السالمية'],
  'عمان': ['مسقط', 'صلالة', 'صحار'],
  'العراق': ['بغداد', 'الموصل', 'البصرة', 'أربيل'],
  'سوريا': ['دمشق', 'حلب', 'حمص'],
  'لبنان': ['بيروت', 'طرابلس', 'صيدا'],
  'فلسطين': ['القدس', 'غزة', 'رام الله', 'الخليل', 'نابلس'],
  'اليمن': ['صنعاء', 'عدن', 'تعز'],
  'ليبيا': ['طرابلس', 'بنغازي', 'مصراتة'],
  'تونس': ['تونس', 'صفاقس', 'سوسة'],
  'الجزائر': ['الجزائر العاصمة', 'وهران', 'قسنطينة'],
  'المغرب': ['الرباط', 'الدار البيضاء', 'فاس', 'مراكش'],
  'السودان': ['الخرطوم', 'أم درمان'],
  'تركيا': ['اسطنبول', 'أنقرة', 'إزمير', 'بورصة', 'قونية'],
  'باكستان': ['كراتشي', 'لاهور', 'إسلام آباد', 'فيصل آباد'],
  'إندونيسيا': ['جاكرتا', 'سورابايا', 'باندونغ'],
  'ماليزيا': ['كوالالمبور', 'جورج تاون', 'جوهور باهرو']
};

export const prayerCalculationMethods = [
  { id: 1, name: 'جامعة العلوم الإسلامية، كراتشي' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
  { id: 3, name: 'رابطة العالم الإسلامي (MWL)' },
  { id: 4, name: 'جامعة أم القرى، مكة المكرمة' },
  { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
  { id: 7, name: 'المعهد الجيوفيزيائي، جامعة طهران' },
  { id: 8, name: 'الكويت' },
  { id: 9, name: 'قطر' },
  { id: 10, name: 'سنغافورة' },
  { id: 11, name: 'الإمارات العربية المتحدة' },
  { id: 12, name: 'تركيا، رئاسة الشؤون الدينية' },
  { id: 23, name: 'وزارة الأوقاف والشؤون والمقدسات الإسلامية - الأردن' },
];

// Helper: map Arabic country/city to API-friendly English/codes and defaults
export function resolveLocationMapping(countryAr: string, cityAr: string): {
  apiCountry?: string; // Could be full English name or ISO-2
  apiCity?: string; // English transliteration expected by API
  method?: number;
  timeZone: string; // دائماً تحديد المنطقة الزمنية
} {
  // Minimal mappings for correctness. Extend as needed.
  const normalize = (s: string) => (s || '').trim();
  const c = normalize(countryAr);
  const city = normalize(cityAr);

  // Jordan
  if (c === 'الأردن') {
    const cityMap: Record<string, { apiCity: string; timeZone: string }> = {
      'عمان': { apiCity: 'Amman', timeZone: 'Asia/Amman' },
      'الزرقاء': { apiCity: 'Zarqa', timeZone: 'Asia/Amman' },
      'إربد': { apiCity: 'Irbid', timeZone: 'Asia/Amman' },
      'العقبة': { apiCity: 'Aqaba', timeZone: 'Asia/Amman' },
      'السلط': { apiCity: 'As Salt', timeZone: 'Asia/Amman' },
      'مأدبا': { apiCity: 'Madaba', timeZone: 'Asia/Amman' },
    };
    const m = cityMap[city];
    return {
      apiCountry: 'Jordan',
      apiCity: m?.apiCity ?? 'Amman',
      method: 23,
      timeZone: m?.timeZone ?? 'Asia/Amman',
    };
  }

  // Saudi Arabia
  if (c === 'السعودية') {
    const cityMap: Record<string, { apiCity: string; timeZone: string }> = {
      'الرياض': { apiCity: 'Riyadh', timeZone: 'Asia/Riyadh' },
      'جدة': { apiCity: 'Jeddah', timeZone: 'Asia/Riyadh' },
      'مكة المكرمة': { apiCity: 'Makkah', timeZone: 'Asia/Riyadh' },
      'المدينة المنورة': { apiCity: 'Madinah', timeZone: 'Asia/Riyadh' },
      'الدمام': { apiCity: 'Dammam', timeZone: 'Asia/Riyadh' },
      'الخبر': { apiCity: 'Khobar', timeZone: 'Asia/Riyadh' },
    };
    const m = cityMap[city];
    return {
      apiCountry: 'Saudi Arabia',
      apiCity: m?.apiCity ?? 'Riyadh',
      method: 4, // Umm al-Qura
      timeZone: m?.timeZone ?? 'Asia/Riyadh',
    };
  }

  // Egypt
  if (c === 'مصر') {
    const cityMap: Record<string, { apiCity: string; timeZone: string }> = {
      'القاهرة': { apiCity: 'Cairo', timeZone: 'Africa/Cairo' },
      'الإسكندرية': { apiCity: 'Alexandria', timeZone: 'Africa/Cairo' },
      'الجيزة': { apiCity: 'Giza', timeZone: 'Africa/Cairo' },
    };
    const m = cityMap[city];
    return {
      apiCountry: 'Egypt',
      apiCity: m?.apiCity ?? 'Cairo',
      method: 5,
      timeZone: m?.timeZone ?? 'Africa/Cairo',
    };
  }

  // Fallback: Try using inputs as-is
  return { apiCountry: countryAr, apiCity: cityAr };
}
