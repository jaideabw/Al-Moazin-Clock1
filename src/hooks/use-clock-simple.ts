import { useState, useEffect, useRef } from 'react';

// تحسين الساعة لضمان دقة الوقت ومواقيت الصلاة في الأردن
// يدعم تحديث يدوي عند تغيير الدوال
export function useClock(timeZone?: string) {
  const [time, setTime] = useState(() => {
    // إذا تم تحديد المنطقة الزمنية، نستخدمها للتحديث
    if (timeZone) {
      return new Date(new Date().toLocaleString("en-US", { timeZone }));
    }
    return new Date();
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // دالة لتحديث الوقت بشكل دقيق
  const updateTime = () => {
    if (timeZone) {
      // للمنطقة الزمنية الأردنية (UTC+3) بشكل دقيق
      if (timeZone === 'Asia/Amman') {
        const now = new Date();
        const localOffset = now.getTimezoneOffset(); // دقائق غرب UTC
        const jordanOffset = -180; // UTC+3 = -180 دقيقة غرب UTC
        const totalOffset = jordanOffset - localOffset;
        setTime(new Date(now.getTime() + totalOffset * 60000));
      } else {
        setTime(new Date(new Date().toLocaleString("en-US", { timeZone })));
      }
    } else {
      setTime(new Date());
    }
  };

  // دالة لبدء الساعة
  const startClock = () => {
    // مسح أي interval قديم
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // تحديث الوقت فورًا
    updateTime();
    
    // بدء تحديث الوقت كل ثانية
    intervalRef.current = setInterval(updateTime, 1000);
  };

  useEffect(() => {
    // بدء الساعة عند التحميل
    startClock();
    
    // تنظيف عند إلغاء المكون
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeZone]);

  // دالة لتحديث يدوي للساعة (عند الحاجة لتغيير الدوال)
  const refreshClock = () => {
    startClock();
  };

  // إضافة دالة التحديث إلى كائن الوقت الذي يتم إرجاعه
  return {
    ...time,
    refreshClock,
    getTime: () => time,
    getTimeString: () => time.toLocaleTimeString(),
    getDateString: () => time.toLocaleDateString()
  };
}
