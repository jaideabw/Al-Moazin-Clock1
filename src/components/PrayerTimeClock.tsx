import { useEffect, useState, useRef } from 'react';
import { getNextPrayer, PRAYER_ORDER } from '../utils/prayerTimes';

interface PrayerTimeClockProps {
  settings: any;
  onPrayerTime: (prayerName: string) => void;
}

export function PrayerTimeClock({ settings, onPrayerTime }: PrayerTimeClockProps) {
  const [now, setNow] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{name: string; arabicName: string; time: string} | null>(null);
  
  useEffect(() => {
    // تحديث الوقت كل ثانية للتحديث المستمر
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(prevTime => {
        // تحديث حالة now فقط إذا تغيرت الثواني
        return prevTime.getSeconds() !== currentTime.getSeconds() ? currentTime : prevTime;
      });
      
      // تحديث الصلاة القادمة
      const next = getNextPrayer(currentTime, settings.prayerTimes);
      setNextPrayer(prevNext => {
        // تحديث حالة nextPrayer فقط إذا تغيرت القيمة
        return JSON.stringify(prevNext) !== JSON.stringify(next) ? next : prevNext;
      });
      
      // التحقق من وقت الصلاة بدقة أعلى
      if (next) {
        const [nextHours, nextMinutes] = next.time.split(':').map(Number);
        if (currentTime.getHours() === nextHours && 
            currentTime.getMinutes() === nextMinutes && 
            currentTime.getSeconds() === 0) {
          onPrayerTime(next.name);
        }
      }
    }, 1000);

    // تنظيف المؤقت عند إلغاء تحميل المكون
    return () => clearInterval(timer);
  }, [settings.prayerTimes, onPrayerTime]);

  if (!nextPrayer) return null;

  return (
    <div className="prayer-times-display" dir="rtl">
      <div className="next-prayer">
        <h2>الصلاة القادمة: {nextPrayer.arabicName}</h2>
        <div className="prayer-time">{nextPrayer.time}</div>
      </div>
      
      <div className="all-prayers">
        {PRAYER_ORDER.map(prayer => (
          <div key={prayer} className={`prayer-box ${nextPrayer.name === prayer ? 'active' : ''}`}>
            <div className="prayer-name">{getArabicName(prayer)}</div>
            <div className="prayer-time">{settings.prayerTimes[prayer]}</div>
          </div>
        ))}
      </div>
    </div>
  );
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
