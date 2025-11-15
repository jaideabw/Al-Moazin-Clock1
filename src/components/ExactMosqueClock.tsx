"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useClock } from '@/hooks/use-clock';
import { Cog, Sun, Star, WifiOff } from 'lucide-react';
import { getPrayerTimes } from '@/ai/flows/prayer-times-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const prayerNames = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

// Hadiths for dim mode
const hadiths = [
    "«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»",
    "«الدِّينُ النَّصِيحَةُ»",
    "«لا يُؤْمِنُ أَحَدُكُمْ، حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»",
    "«مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ»",
    "«الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ»",
    "«تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ»",
    "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»"
];

type PrayerTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export interface ClockSettings {
  mosqueName: string;
  timeFormat: '12h' | '24h';
  prayerTimes: PrayerTimes;
  iqamaCountdown: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  dimDuration: number;
  shuruqTime: string;
  jumuahTime: string;
  country: string;
  city: string;
  showWeather: boolean;
  temperature: number;
  adhanSound: string;
  volume: number;
  isMuted: boolean;
  backgroundImage: string;
}

const defaultSettings: Omit<ClockSettings, 'backgroundImage'> = {
    mosqueName: 'مسجد التلهوني',
    timeFormat: '12h',
    prayerTimes: {
      fajr: '04:02',
      dhuhr: '12:42',
      asr: '16:23',
      maghrib: '19:51',
      isha: '21:22',
    },
    iqamaCountdown: {
      fajr: 20,
      dhuhr: 15,
      asr: 15,
      maghrib: 10,
      isha: 15,
    },
    dimDuration: 1,
    shuruqTime: '05:33',
    jumuahTime: '12:43',
    country: 'Jordan',
    city: 'Amman',
    showWeather: true,
    temperature: 32,
    adhanSound: '',
    volume: 0.5,
    isMuted: false,
};


export default function AlMoazinClock() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<ClockSettings>({...defaultSettings, backgroundImage: ''});
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [activeCountdown, setActiveCountdown] = useState<{prayer: keyof PrayerTimes, endTime: Date} | null>(null);
  const [isDimmed, setIsDimmed] = useState(false);
  const [currentHadith, setCurrentHadith] = useState('');
  const dimTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const now = useClock();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load settings from localStorage on initial mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedSettings = localStorage.getItem('alMoazinClockSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({...prev, ...parsedSettings}));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem('alMoazinClockSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [settings, isClient]);

  const setBackgroundImage = useCallback((image: string) => {
      setSettings(s => ({...s, backgroundImage: image}));
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume;
      audioRef.current.muted = settings.isMuted;
    }
  }, [settings.volume, settings.isMuted]);

  // Effect to handle prayer time triggers (Adhan, countdown, dimming)
  useEffect(() => {
    if (!settings.adhanSound || settings.isMuted || !isClient) return;

    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Find if a prayer time matches the current time
    const prayerName = Object.keys(settings.prayerTimes).find(p => settings.prayerTimes[p as keyof PrayerTimes] === currentTime) as keyof PrayerTimes | undefined;

    // Trigger actions only if it's a prayer time and there isn't an active countdown already
    if (prayerName && !activeCountdown) {
      
      // 1. Play Adhan
      if (audioRef.current) {
        audioRef.current.src = settings.adhanSound;
        audioRef.current.play().catch(error => console.error("Audio play failed:", error));
      }
      
      // 2. Start Iqama Countdown
      const countdownMinutes = settings.iqamaCountdown[prayerName];
      if (countdownMinutes > 0) {
        const endTime = new Date(now.getTime() + countdownMinutes * 60 * 1000);
        setActiveCountdown({ prayer: prayerName, endTime });
      }

      // 3. Start Dimming
      if (settings.dimDuration > 0) {
        setIsDimmed(true);
        setCurrentHadith(hadiths[Math.floor(Math.random() * hadiths.length)]); // Set a random hadith

        if(dimTimeoutRef.current) clearTimeout(dimTimeoutRef.current);
        dimTimeoutRef.current = setTimeout(() => {
          setIsDimmed(false);
          setActiveCountdown(null); // Also clear countdown when dimming ends
        }, settings.dimDuration * 60 * 1000);
      }
    }
  }, [now, settings.prayerTimes, settings.adhanSound, settings.isMuted, settings.iqamaCountdown, settings.dimDuration, isClient, activeCountdown]);


  useEffect(() => {
    // End countdown if time is up
    if (activeCountdown && now >= activeCountdown.endTime) {
      setActiveCountdown(null);
      setIsDimmed(false); // Also turn off dimming
    }
  }, [now, activeCountdown]);


  // Effect for fetching prayer times
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      if (!settings.country || !settings.city || !isClient) return;

      setIsFetchingTimes(true);
      setIsOffline(false);
      try {
        const times = await getPrayerTimes({ country: settings.country, city: settings.city });
        const newPrayerTimes = {
            fajr: times.fajr,
            dhuhr: times.dhuhr,
            asr: times.asr,
            maghrib: times.maghrib,
            isha: times.isha,
        };
        const newShuruq = times.shuruq;
        
        setSettings(s => ({
          ...s,
          prayerTimes: newPrayerTimes,
          shuruqTime: newShuruq,
        }));
        
        // Save today's fetched times to localStorage for offline use
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('alMoazinPrayerTimes', JSON.stringify({
            date: today,
            times: newPrayerTimes,
            shuruq: newShuruq,
            city: settings.city,
            country: settings.country,
        }));

      } catch (error) {
        console.error("Failed to fetch prayer times:", error);
        setIsOffline(true);
        toast({
            variant: "destructive",
            title: "خطأ في جلب أوقات الصلاة",
            description: "لا يوجد اتصال بالانترنت. سيتم عرض آخر أوقات تم تحميلها.",
        });
      } finally {
        setIsFetchingTimes(false);
      }
    };

    const today = new Date().toISOString().split('T')[0];
    const storedTimesData = localStorage.getItem('alMoazinPrayerTimes');
    let needsFetching = true;

    if (storedTimesData) {
        try {
            const { date, times, shuruq, city, country } = JSON.parse(storedTimesData);
            if (date === today && city === settings.city && country === settings.country) {
                setSettings(s => ({...s, prayerTimes: times, shuruqTime: shuruq}));
                needsFetching = false;
            }
        } catch (e) {
            // stored data is invalid
            localStorage.removeItem('alMoazinPrayerTimes');
        }
    }
    
    if (needsFetching && isClient) {
        fetchPrayerTimes();
    }

    // Set up a timer to refetch tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(1, 0, 0, 0); // 1 AM
    const timeToTomorrow = tomorrow.getTime() - new Date().getTime();

    const dailyFetchTimeout = setTimeout(fetchPrayerTimes, timeToTomorrow);

    return () => clearTimeout(dailyFetchTimeout);

  }, [settings.country, settings.city, toast, isClient]);


  const timeFormatter = useMemo(() => {
    if (!isClient) return null;
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: settings.timeFormat === '12h',
    });
  }, [settings.timeFormat, isClient]);

  const prayerTimeFormatter = useMemo(() => {
    if (!isClient) return null;
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: settings.timeFormat === '12h',
    });
  }, [settings.timeFormat, isClient]);

  const formatPrayerTime = useCallback((time24: string) => {
    if (!time24 || !prayerTimeFormatter) return '';
    const [hours, minutes] = time24.split(':');
    if(isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return '';
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return prayerTimeFormatter.format(date);
  }, [prayerTimeFormatter]);


  const hijriDateFormatter = useMemo(() => isClient ? new Intl.DateTimeFormat('ar-SA-u-ca-islamic-civil', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : null, [isClient]);

  const gregorianDateFormatter = useMemo(() => isClient ? new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : null, [isClient]);


  const { nextPrayerName, countdown } = useMemo(() => {
    const prayerTimesToday = Object.entries(settings.prayerTimes).map(([name, time]) => {
      if (!time || !time.includes(':')) return { name: name as keyof PrayerTimes, date: new Date(0) };
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
       if(isNaN(hours) || isNaN(minutes)) return { name: name as keyof PrayerTimes, date: new Date(0) };
      date.setHours(hours, minutes, 0, 0);
      return { name: name as keyof PrayerTimes, date };
    }).filter(p => p.date.getTime() > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (prayerTimesToday.length === 0) {
        return { nextPrayerName: '...', countdown: '...' };
    }

    let nextPrayer = prayerTimesToday.find(p => p.date > now);

    if (!nextPrayer) {
      const firstPrayerTomorrow = prayerTimesToday[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [hours, minutes] = settings.prayerTimes[firstPrayerTomorrow.name].split(':').map(Number);
      if(!isNaN(hours) && !isNaN(minutes)) {
        tomorrow.setHours(hours, minutes, 0, 0);
        nextPrayer = { name: firstPrayerTomorrow.name, date: tomorrow };
      }
    }
    
    if (!nextPrayer) {
        return { nextPrayerName: '...', countdown: '...' };
    }

    const diff = nextPrayer.date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) + 1;

    return {
      nextPrayerName: prayerNames[nextPrayer.name],
      countdown: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    };
  }, [now, settings.prayerTimes]);
  
  const formattedTime = timeFormatter ? timeFormatter.format(now) : '...';
  const [timePart, periodPart] = formattedTime.split(' ');
  const [hour, minute, second] = timePart.split(':');
  const dayPeriod = settings.timeFormat === '12h' ? periodPart : null;


  const countdownToIqama = useMemo(() => {
    if (!activeCountdown) return null;

    const diff = activeCountdown.endTime.getTime() - now.getTime();
    if (diff <= 0) return null;

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [activeCountdown, now]);

  const renderFullScreenIqamaCountdown = () => (
    <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
        <h2 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-8">
            إقامة صلاة {activeCountdown && prayerNames[activeCountdown.prayer]}
        </h2>
        <div className="font-mono text-[20vw] sm:text-[25vw] font-bold tracking-widest" style={{textShadow: '0 0 25px #fff'}}>
            {countdownToIqama}
        </div>
        <p className="text-4xl sm:text-5xl md:text-6xl font-semibold mt-12 text-center text-yellow-300" style={{textShadow: '0 0 15px #000'}}>
            {currentHadith}
        </p>
    </div>
  );
  
  if (!isClient) {
    return <div className="min-h-screen bg-black" />;
  }

  if (isDimmed) {
    return (
        <div className="min-h-screen text-white flex flex-col font-sans bg-black">
          {countdownToIqama && activeCountdown ? renderFullScreenIqamaCountdown() : null}
        </div>
    );
  }
  
  return (
    <div
      className="bg-cover bg-center min-h-screen text-white flex flex-col p-4 sm:p-6 lg:p-8 font-sans transition-all duration-1000"
      style={{ backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none', backgroundColor: '#263138' }}
    >
        <div className="absolute inset-0 bg-black/60 -z-10" />
        <header className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-2xl">
                {settings.showWeather && (
                    <>
                        <span>{settings.temperature}°</span>
                        <Sun className="text-yellow-400" size={32}/>
                    </>
                )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center flex-grow">
                {settings.mosqueName}
            </h1>
            <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(true)} aria-label="Open settings">
                <Cog className="h-8 w-8" />
            </Button>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center text-center my-4">
            <div className="flex justify-around items-center w-full max-w-5xl">
                 <div className="bg-blue-900/70 rounded-2xl p-4 text-center shadow-lg border border-blue-600 w-48">
                    <h3 className="text-3xl font-bold">الشروق</h3>
                    <p className="text-4xl font-mono font-bold my-2">{formatPrayerTime(settings.shuruqTime)}</p>
                 </div>

                <div className="bg-blue-800/80 rounded-2xl p-4 md:p-6 shadow-2xl border border-blue-500 w-[90%] max-w-2xl mx-4">
                    <div className="flex justify-center items-baseline">
                        <span className="text-8xl md:text-9xl font-bold tracking-tighter" style={{textShadow: '0 0 15px #fff'}}>
                            {hour}:{minute}
                        </span>
                        <div className="flex flex-col items-start ml-2 md:ml-4">
                            <span className="text-3xl md:text-5xl font-bold" style={{textShadow: '0 0 10px #fff'}}>{second}</span>
                             {dayPeriod && <span className="text-2xl md:text-4xl font-bold" style={{textShadow: '0 0 8px #fff'}}>{dayPeriod}</span>}
                        </div>
                    </div>
                    <div className="mt-2 text-lg md:text-xl space-y-1">
                        <p>{hijriDateFormatter?.format(now)}</p>
                        <p>{gregorianDateFormatter?.format(now)}</p>
                    </div>
                </div>

                <div className="bg-blue-900/70 rounded-2xl p-4 text-center shadow-lg border border-blue-600 w-48">
                    <h3 className="text-3xl font-bold">الجمعة</h3>
                    <p className="text-4xl font-mono font-bold my-2">{formatPrayerTime(settings.jumuahTime)}</p>
                </div>
            </div>

            <div className="mt-6 text-2xl font-semibold flex items-center gap-2">
                {isFetchingTimes ? (
                    <span>جاري تحديث أوقات الصلاة...</span>
                ) : isOffline ? (
                    <>
                     <WifiOff className="text-red-400" />
                     <span>غير متصل. آخر تحديث متوفر.</span>
                     <WifiOff className="text-red-400" />
                    </>
                ) : (
                    <>
                        <Star className="text-yellow-400" />
                        <span>{nextPrayerName} بعد {countdown}</span>
                        <Star className="text-yellow-400" />
                    </>
                )}
            </div>
        </main>
        
        <footer className="w-full max-w-7xl mx-auto mt-auto">
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {Object.entries(settings.prayerTimes).map(([key, time]) => (
                <div key={key} className={`bg-blue-900/70 rounded-2xl p-3 text-center shadow-lg border border-blue-600`}>
                    <h3 className="text-2xl font-bold">{prayerNames[key as keyof typeof prayerNames]}</h3>
                    <p className="text-3xl font-mono font-bold my-1">{formatPrayerTime(time)}</p>
                </div>
              ))}
            </div>
        </footer>
        
        <audio ref={audioRef} />

        <SettingsPanel
            isOpen={isPanelOpen}
            setIsOpen={setIsPanelOpen}
            settings={settings}
            setSettings={setSettings}
            setBackgroundImage={setBackgroundImage}
            isFetchingTimes={isFetchingTimes}
        />
    </div>
  );
}

    