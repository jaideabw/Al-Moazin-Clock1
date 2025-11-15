class PrayerTimesService {
  static readonly API_BASE_URL = 'https://api.aladhan.com/v1';

  static async fetchPrayerTimes(city?: string, country?: string, date?: string): Promise<any> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const targetCity = city || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('clockSettings') || '{}').city : '');
      const targetCountry = country || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('clockSettings') || '{}').country : '');
      if (!targetCity || !targetCountry) {
        console.warn('لا توجد معلومات عن المدينة أو الدولة');
        return null;
      }
      const url = `${this.API_BASE_URL}/timingsByCity/${targetDate}?city=${encodeURIComponent(targetCity)}&country=${encodeURIComponent(targetCountry)}&method=4`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.code !== 200 || !data.data || !data.data.timings) throw new Error('Invalid API response format');
      const timings = data.data.timings;
      const formatTime = (time: string) => time.split(' ')[0];
      return {
        Fajr: formatTime(timings.Fajr),
        Sunrise: formatTime(timings.Sunrise),
        Dhuhr: formatTime(timings.Dhuhr),
        Asr: formatTime(timings.Asr),
        Maghrib: formatTime(timings.Maghrib),
        Isha: formatTime(timings.Isha),
        date: data.data.date.readable,
        hijriDate: data.data.date.hijri.date
      };
    } catch (error) {
      console.error('خطأ في جلب مواقيت الصلاة:', error);
      return null;
    }
  }

  static async fetchPrayerTimesForMonth(city: string, country: string, month: number, year: number): Promise<any> {
    try {
      const url = `${this.API_BASE_URL}/calendar/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.code !== 200 || !data.data) throw new Error('Invalid API response format');
      return data.data;
    } catch (error) {
      console.error('خطأ في جلب مواقيت الشهر:', error);
      return null;
    }
  }

  static validatePrayerTimes(times: any): boolean {
    const requiredFields = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return requiredFields.every(field => {
      const time = times[field];
      return time && typeof time === 'string' && /^\d{2}:\d{2}$/.test(time);
    });
  }

  static savePrayerTimesToStorage(times: any, date: string): void {
    if (typeof window !== 'undefined') {
      const storageKey = `prayerTimes_${date}`;
      localStorage.setItem(storageKey, JSON.stringify({ ...times, savedAt: new Date().toISOString() }));
    }
  }

  static getPrayerTimesFromStorage(date: string): any {
    if (typeof window !== 'undefined') {
      const storageKey = `prayerTimes_${date}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('خطأ في قراءة المواقيت المحفوظة:', error);
        }
      }
    }
    return null;
  }

  static cleanOldPrayerTimes(): void {
    if (typeof window !== 'undefined') {
      const currentDate = new Date();
      const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('prayerTimes_')) {
          const dateStr = key.replace('prayerTimes_', '');
          const date = new Date(dateStr);
          if (date < thirtyDaysAgo) {
            localStorage.removeItem(key);
          }
        }
      });
    }
  }
}

export default PrayerTimesService;
export interface PrayerTime {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  // اختياري: قد تحتاجه شاشات أخرى
  Imsak?: string;
  Sunset?: string;
  Midnight?: string;
  Firstthird?: string;
  Lastthird?: string;
}

// واجهات البيانات التاريخية
interface GregorianDate {
  date: string; // DD-MM-YYYY
  format: string;
  day: string;
  weekday?: { en: string };
  month?: { number: number; en: string };
  year?: string;
}

interface HijriDate {
  date: string; // DD-MM-YYYY
  day: string;
  month: { number: number; en: string; ar?: string };
  year: string;
class PrayerTimesService {
  static readonly API_BASE_URL = 'https://api.aladhan.com/v1';

  static async fetchPrayerTimes(city?: string, country?: string, date?: string): Promise<any> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const targetCity = city || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('clockSettings') || '{}').city : '');
      const targetCountry = country || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('clockSettings') || '{}').country : '');
      if (!targetCity || !targetCountry) {
        console.warn('لا توجد معلومات عن المدينة أو الدولة');
        return null;
      }
      const url = `${this.API_BASE_URL}/timingsByCity/${targetDate}?city=${encodeURIComponent(targetCity)}&country=${encodeURIComponent(targetCountry)}&method=4`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.code !== 200 || !data.data || !data.data.timings) throw new Error('Invalid API response format');
      const timings = data.data.timings;
      const formatTime = (time: string) => time.split(' ')[0];
      return {
        Fajr: formatTime(timings.Fajr),
        Sunrise: formatTime(timings.Sunrise),
        Dhuhr: formatTime(timings.Dhuhr),
        Asr: formatTime(timings.Asr),
        Maghrib: formatTime(timings.Maghrib),
        Isha: formatTime(timings.Isha),
        date: data.data.date.readable,
        hijriDate: data.data.date.hijri.date
      };
    } catch (error) {
      console.error('خطأ في جلب مواقيت الصلاة:', error);
      return null;
    }
  }

  static async fetchPrayerTimesForMonth(city: string, country: string, month: number, year: number): Promise<any> {
    try {
      const url = `${this.API_BASE_URL}/calendar/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.code !== 200 || !data.data) throw new Error('Invalid API response format');
      return data.data;
    } catch (error) {
      console.error('خطأ في جلب مواقيت الشهر:', error);
      return null;
    }
  }

  static validatePrayerTimes(times: any): boolean {
    const requiredFields = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    return requiredFields.every(field => {
      const time = times[field];
      return time && typeof time === 'string' && /^\d{2}:\d{2}$/.test(time);
    });
  }

  static savePrayerTimesToStorage(times: any, date: string): void {
    if (typeof window !== 'undefined') {
      const storageKey = `prayerTimes_${date}`;
      localStorage.setItem(storageKey, JSON.stringify({ ...times, savedAt: new Date().toISOString() }));
    }
  }

  static getPrayerTimesFromStorage(date: string): any {
    if (typeof window !== 'undefined') {
      const storageKey = `prayerTimes_${date}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('خطأ في قراءة المواقيت المحفوظة:', error);
        }
      }
    }
    return null;
  }

  static cleanOldPrayerTimes(): void {
    if (typeof window !== 'undefined') {
      const currentDate = new Date();
      const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('prayerTimes_')) {
          const dateStr = key.replace('prayerTimes_', '');
          const date = new Date(dateStr);
          if (date < thirtyDaysAgo) {
            localStorage.removeItem(key);
          }
      });
    }
  }
}

export default PrayerTimesService;
        city: loc.city,
        country: loc.country,
        state: loc.state,
      };

      const merged = { ...this.defaultOptions, ...options } as FetchPrayerTimesOptions;

      if (merged.method != null) query.method = merged.method;
      if (merged.school != null) query.school = merged.school;
      if (merged.shafaq) query.shafaq = merged.shafaq;
      if (merged.midnightMode != null) query.midnightMode = merged.midnightMode;
      if (merged.latitudeAdjustmentMethod != null)
        query.latitudeAdjustmentMethod = merged.latitudeAdjustmentMethod;
      if (merged.calendarMethod) query.calendarMethod = merged.calendarMethod;
      if (merged.iso8601 != null) query.iso8601 = merged.iso8601;
      if (merged.tune) query.tune = merged.tune;
      if (merged.adjustment != null) query.adjustment = merged.adjustment;
      // أفضلية timezone من الموقع إن وُجد
      const tz = loc.timezonestring ?? merged.timezonestring;
      if (tz) query.timezonestring = tz;
      if (merged.x7xapikey) query.x7xapikey = merged.x7xapikey;

      const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}`;
      const response = await axios.get<ApiResponseTimingsByCity>(url, { params: query });

      if (response.data?.code !== 200 || !response.data?.data?.timings) {
        console.warn('Unexpected response from Aladhan timingsByCity:', response.data);
        return null;
      }

      const raw = response.data.data.timings;
      // طبّق التطبيع على جميع المفاتيح المعروفة
      const clean: PrayerTime = {
        Fajr: normalizeTime(raw.Fajr) ?? raw.Fajr,
        Sunrise: normalizeTime(raw.Sunrise) ?? raw.Sunrise,
        Dhuhr: normalizeTime(raw.Dhuhr) ?? raw.Dhuhr,
        Asr: normalizeTime(raw.Asr) ?? raw.Asr,
        Maghrib: normalizeTime(raw.Maghrib) ?? raw.Maghrib,
        Isha: normalizeTime(raw.Isha) ?? raw.Isha,
        Imsak: normalizeTime(raw.Imsak),
        Sunset: normalizeTime(raw.Sunset),
        Midnight: normalizeTime(raw.Midnight),
        Firstthird: normalizeTime((raw as any).Firstthird),
        Lastthird: normalizeTime((raw as any).Lastthird)
      };

      return clean;
    } catch (error) {
      console.error('Failed to fetch prayer times:', error);
      return null;
    }
  },

  // حساب الوقت المتبقي للصلاة التالية
  getNextPrayerTime(
    currentTime: Date,
    prayerTimes: PrayerTime
  ): { name: string; time: Date; remaining: number } | null {
    if (!prayerTimes) return null;

    const base = [
      { name: 'Fajr', time: prayerTimes.Fajr },
          export default PrayerTimesService;
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha }
    ];

    // حوّل النص إلى وقت بتاريخ اليوم
    const prayerDates = base
      .filter(p => !!p.time)
      .map(prayer => {
        const [hStr, mStr] = String(prayer.time).split(':');
        const hours = parseInt(hStr, 10);
        const minutes = parseInt(mStr, 10);
        const dt = new Date(currentTime);
        dt.setHours(hours, minutes, 0, 0);
        return { name: prayer.name, time: dt };
      });

    // أضف 24 ساعة لأي وقت مضى
    prayerDates.forEach(p => {
      if (p.time <= currentTime) {
        p.time.setDate(p.time.getDate() + 1);
      }
    });

    // اختر الأقرب
    let next = prayerDates[0];
    for (let i = 1; i < prayerDates.length; i++) {
      if (prayerDates[i].time < next.time) next = prayerDates[i];
    }

    const remainingMs = next.time.getTime() - currentTime.getTime();
    const remainingMinutes = Math.floor(remainingMs / 60000);

    return { name: next.name, time: next.time, remaining: remainingMinutes };
  }
};

export default PrayerTimesService;