import { useEffect, useState, useRef } from "react";
import { DateTime } from "luxon";

const useClockLuxon = (timeZone: string) => {
  const [now, setNow] = useState(() => DateTime.now().setZone(timeZone));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // دالة لتحديث الوقت بشكل دقيق
  const updateClock = () => {
    const newTime = DateTime.now().setZone(timeZone);
    setNow(newTime);
  };

  // دالة لبدء الساعة
  const startClock = () => {
    // مسح أي interval قديم
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // تحديث الوقت فورًا
    updateClock();
    
    // بدء تحديث الوقت كل ثانية
    intervalRef.current = setInterval(updateClock, 1000);
  };

  useEffect(() => {
    // بدء الساعة عند التحميل
    startClock();
    
    // تسجيل الوقت الأولي للتصحيح
    console.log(`[Clock Debug] Initial time for ${timeZone}:`, now.toFormat('HH:mm:ss'));
    
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
  const enhancedNow = {
    ...now,
    refreshClock
  };

  return enhancedNow;
};

export default useClockLuxon;
