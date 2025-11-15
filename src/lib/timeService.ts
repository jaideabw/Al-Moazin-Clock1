import axios from 'axios';

interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      [key: string]: string;
    };
  };
}

export const timeService = {
  async getPrayerTimes(city: string = 'Amman', country: string = 'Jordan') {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      // استخدام API الرسمي للأوقات مع method=3 للأردن
      const response = await axios.get<PrayerTimesResponse>(
        `http://api.aladhan.com/v1/timingsByCity/${year}-${month}-${day}`,
        {
          params: {
            city,
            country,
            method: 3, // طريقة حساب مواقيت الصلاة للأردن
            school: 1, // المذهب الحنفي المعتمد في الأردن
            timeZone: 'Asia/Amman',
            adjustment: 0
          }
        }
      );

      if (response.data.code === 200) {
        return response.data.data.timings;
      }
      throw new Error('Failed to fetch prayer times');
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      return null;
    }
  },

  getCurrentTime(timeZone: string = 'Asia/Amman'): {
    hours: string;
    minutes: string;
    seconds: string;
    timeString: string;
  } {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const hours = parts.find(p => p.type === 'hour')?.value || '00';
    const minutes = parts.find(p => p.type === 'minute')?.value || '00';
    const seconds = parts.find(p => p.type === 'second')?.value || '00';

    return {
      hours,
      minutes,
      seconds,
      timeString: `${hours}:${minutes}:${seconds}`
    };
  }
};