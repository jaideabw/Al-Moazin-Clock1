export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
}

export function getNextPrayer(currentTime: Date, prayerTimes: Record<string, string>): PrayerTime | null {
  // تحويل الوقت الحالي إلى دقائق
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // تحويل أوقات الصلاة إلى كائنات تحتوي على الدقائق
  const prayerTimesArray = PRAYER_ORDER.map(prayer => {
    const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
    return {
      name: prayer,
      minutes: hours * 60 + minutes,
      arabicName: getArabicName(prayer)
    };
  });

  // البحث عن الصلاة القادمة
  let nextPrayer = prayerTimesArray.find(prayer => prayer.minutes > currentMinutes);

  // إذا لم نجد صلاة اليوم، نختار أول صلاة لليوم التالي (الفجر)
  if (!nextPrayer) {
    nextPrayer = prayerTimesArray[0];
  }

  return nextPrayer ? {
    name: nextPrayer.name,
    time: prayerTimes[nextPrayer.name],
    arabicName: nextPrayer.arabicName
  } : null;
}

function getArabicName(prayer: string): string {
  const names: Record<string, string> = {
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };
  return names[prayer] || prayer;
}
