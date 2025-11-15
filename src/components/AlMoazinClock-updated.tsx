import { getNextPrayer } from '../utils/prayerTimes-new';
import { useEffect, useState, useMemo } from 'react';
import PrayerTimesService from '../lib/prayerTimes';

interface PrayerTime {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function AlMoazinClock() {
  // ... (الحالة والمراجع)
  import { useEffect } from 'react';
  import PrayerTimesService from '../lib/prayerTimes';

  // حالة مواقيت الصلاة
  const [prayerTimes, setPrayerTimes] = useState(settings.prayerTimes);
  // حالة المواقيت اليدوية
  const [manualTimes, setManualTimes] = useState<Partial<PrayerTime>>({});
  
  // استرجاع القيم اليدوية من localStorage عند أول تحميل الصفحة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTimes = localStorage.getItem('manualPrayerTimes');
      if (savedTimes) {
        setManualTimes(JSON.parse(savedTimes));
      }
    }
  }, []);

  // حفظ القيم في localStorage عند كل تغيير
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(manualTimes).length > 0) {
      localStorage.setItem('manualPrayerTimes', JSON.stringify(manualTimes));
    }
  }, [manualTimes]);

  // تحديث مواقيت الصلاة عند تغيير اليوم
  const [rawSunrise, setRawSunrise] = useState<string | undefined>(undefined);
  useEffect(() => {
    const fetchTimes = async () => {
      const times = await PrayerTimesService.fetchPrayerTimes();
      if (times) {
        // تصحيح وقت الشروق القادم من API (مثلاً -4 دقائق)
        let [h, m] = times.Sunrise.split(':').map(Number);
        m -= 4;
        if (m < 0) { h -= 1; m += 60; }
        const corrected = `${h}:${m.toString().padStart(2, '0')}`;
        times.Sunrise = corrected;
        // لا تحدث وقت الشروق إذا كانت هناك قيمة يدوية
        if (!manualSunrise) {
          setPrayerTimes(times);
          setRawSunrise(times.Sunrise);
        }
      }
    };
    fetchTimes();
    const interval = setInterval(fetchTimes, 1000 * 60 * 60); // كل ساعة
    return () => clearInterval(interval);
  }, []);

  // تحديث وقت الصلاة القادمة
  const nextPrayerInfo = useMemo(() => {
    const nextPrayer = getNextPrayer(now, prayerTimes);
    if (!nextPrayer) return null;

    return {
      name: nextPrayer.name as keyof PrayerTime,
      arabicName: nextPrayer.arabicName,
      time: nextPrayer.time
    };
  }, [now, prayerTimes]);

  // ...existing code...
  // صندوق عرض وقت الشروق
  const handleTimeChange = (prayer: keyof PrayerTime, value: string) => {
    if (value && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      setManualTimes(prev => ({
        ...prev,
        [prayer]: value
      }));
    } else if (!value) {
      const newTimes = { ...manualTimes };
      delete newTimes[prayer];
      setManualTimes(newTimes);
    }
  };

  return (
    <div className="prayer-times-box">
      {Object.entries(prayerTimes).map(([prayer, time]) => (
        <div key={prayer} className="prayer-time-input">
          <span>{prayer}:</span>
          <span>{manualTimes[prayer as keyof PrayerTime] || time}</span>
          <input
            type="text"
            placeholder={`أدخل وقت ${prayer} يدويًا (مثال: 6:22)`}
            value={manualTimes[prayer as keyof PrayerTime] || ''}
            onChange={e => handleTimeChange(prayer as keyof PrayerTime, e.target.value)}
            style={{marginTop: '8px'}}
          />
        </div>
      ))}
    </div>
    </div>
  );
}
