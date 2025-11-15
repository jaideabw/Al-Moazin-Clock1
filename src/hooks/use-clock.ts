
import { useState, useEffect } from 'react';

// Hook returns a Date that advances in the provided IANA timezone (fallback to local)
export function useClock(timeZone?: string) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    // Function to get the current time in the target timezone
    const getCurrentTime = () => {
      const now = new Date();
      
      if (!timeZone) return now;

      try {
        // Get the current time in the target timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
          timeZoneName: 'short'
        });

        // Log for debugging
        console.log(`[Debug] Current time in ${timeZone}:`, formatter.format(now));
        
        return now;
      } catch (error) {
        console.error(`[Error] Failed to format time for timezone ${timeZone}:`, error);
        return now;
      }
    };

    // Update time immediately and start interval
    setTime(getCurrentTime());
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000);
          const [month, day, year] = datePart.split('/');
          const [hour, minute, second] = timePart.split(':');
          
          // إنشاء كائن تاريخ جديد بالوقت في المنطقة المطلوبة
          const adjusted = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
          
          // تحقق من أن التاريخ المعدل صحيح
          if (isNaN(adjusted.getTime())) {
            setTime(now);
            return;
          }
          
          setTime(adjusted);
        } catch (error) {
          console.error('[useClock-error] Failed to compute time for timezone:', timeZone, error);
          setTime(new Date());
        }
        // Debug logs to trace offset calculations
        try {
          console.debug('[useClock-debug] now=', now.toISOString(), 'timeZone=', timeZone,
            'targetOffsetMs=', targetOffsetMs, 'systemOffsetMs=', systemOffsetMs, 'shiftMs=', shiftMs,
            'adjusted=', adjusted.toString());
        } catch (e) {
          console.debug('[useClock-debug] logging failed', e);
        }
        setTime(adjusted);
      } else {
        setTime(new Date());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeZone]);

  return time;
}
