export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
}

export function getNextPrayer(currentTime: Date, prayerTimes: Record<string, string>): PrayerTime | null {
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // تحويل أوقات الصلاة إلى مصفوفة منظمة
  const prayerTimesArray = PRAYER_ORDER.map(prayer => {
    const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
    return {
      name: prayer,
      time: prayerTimes[prayer],
      totalMinutes: hours * 60 + minutes,
      arabicName: getArabicName(prayer)
    };
  });

  // ابحث عن الصلاة القادمة
  for (const prayer of prayerTimesArray) {
    if (prayer.totalMinutes > currentTotalMinutes) {
      return {
        name: prayer.name,
        time: prayer.time,
        arabicName: prayer.arabicName
      };
    }
  }

  // إذا لم نجد صلاة اليوم، فالصلاة القادمة هي الفجر غداً
  return {
    name: 'fajr',
    time: prayerTimes.fajr,
    arabicName: 'الفجر'
  };
}

export function getArabicName(prayer: string): string {
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
