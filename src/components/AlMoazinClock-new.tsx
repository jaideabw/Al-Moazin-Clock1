import { useState, useEffect, useRef, useCallback } from 'react';
import { hadiths } from '../data/hadiths';
import { DimmingOverlay } from './DimmingOverlay';

export function AlMoazinClock() {
  const [isDimmed, setIsDimmed] = useState(false);
  const [showAdhkar, setShowAdhkar] = useState(false);
  const [currentHadith, setCurrentHadith] = useState('');
  const [currentPrayer, setCurrentPrayer] = useState<string | undefined>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const dimTimeoutRef = useRef<NodeJS.Timeout>();

  // Effect to handle prayer time triggers
  useEffect(() => {
    if (!settings.adhanSound || settings.isMuted || !isClient) return;
    
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const prayerName = Object.keys(settings.prayerTimes).find(p => settings.prayerTimes[p as keyof PrayerTimes] === currentTime) as keyof PrayerTimes | undefined;
    
    if (prayerName && !activeCountdown) {
      // 1. Play Adhan
      if (audioRef.current) {
        audioRef.current.src = prayerName === 'fajr' ? '/audio/audio_fajr.mp3' : '/audio/audio_dhar.mp3';
        audioRef.current.play().catch(error => console.error("Audio play failed:", error));
      }

      // 2. Start Iqama Countdown
      const countdownMinutes = settings.iqamaCountdown[prayerName];
      if (countdownMinutes > 0) {
        const endTime = new Date(now.getTime() + countdownMinutes * 60 * 1000);
        setActiveCountdown({ prayer: prayerName, endTime });
      }

      // 3. Start Dimming and Show Hadith
      setCurrentPrayer(prayerName);
      setIsDimmed(true);
      setCurrentHadith(hadiths[Math.floor(Math.random() * hadiths.length)].text);
      
      if(dimTimeoutRef.current) clearTimeout(dimTimeoutRef.current);
      
      // After dimming period, show adhkar
      dimTimeoutRef.current = setTimeout(() => {
        setShowAdhkar(true);
        setTimeout(() => {
          setIsDimmed(false);
          setShowAdhkar(false);
          setActiveCountdown(null);
        }, 5 * 60 * 1000); // Show adhkar for 5 minutes
      }, settings.dimDuration * 60 * 1000);
    }
  }, [now, settings.prayerTimes, settings.adhanSound, settings.isMuted, settings.iqamaCountdown, settings.dimDuration, isClient, activeCountdown]);

  return (
    <div className="relative min-h-screen">
      {/* Rest of your existing clock UI */}
      
      <DimmingOverlay 
        isVisible={isDimmed}
        currentPrayer={currentPrayer}
        currentHadith={currentHadith}
        showAdhkar={showAdhkar}
      />
      
      <audio ref={audioRef} />
      
      {/* Rest of your existing components */}
    </div>
  );
}
