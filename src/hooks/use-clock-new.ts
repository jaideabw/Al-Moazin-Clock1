import { useState, useEffect } from 'react';

// Hook returns a Date that advances in the provided IANA timezone
export function useClock(timeZone: string = 'UTC') {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const getCurrentTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const timeStr = formatter.format(now);
      console.log(`[Clock Debug] ${timeZone}: ${timeStr}`);
      
      // Parse the formatted time string to get the correct hour
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      
      // Create a new date with the correct hour but keep the current date
      const adjusted = new Date();
      adjusted.setHours(hours);
      adjusted.setMinutes(minutes);
      adjusted.setSeconds(seconds);
      
      return adjusted;
    };

    // Update time immediately and start interval
    setTime(getCurrentTime());
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeZone]);

  return time;
}