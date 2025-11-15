"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useClock } from '@/hooks/use-clock-simple';
import { Cog, Sun, Star, WifiOff, RefreshCw } from 'lucide-react';
import { getPrayerTimes } from '@/ai/flows/prayer-times-flow';
import { getWeather } from '@/ai/flows/weather-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { resolveLocationMapping } from '@/lib/locations';

const prayerNames = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

const PRAYER_ORDER: (keyof PrayerTimes)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const hadiths = [
    "«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»",
    "«الدِّينُ النَّصِيحَةُ»",
    "«لا يُؤْمِنُ أَحَدُكُمْ، حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»",
    "«مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ»",
    "«الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ»",
    "«تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ»",
    "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»"
];

const azkarAfterPrayer = [
    "أَسْـتَغْفِرُ الله، أَسْـتَغْفِرُ الله، أَسْـتَغْفِرُ الله.\n\nاللّهُـمَّ أَنْـتَ السَّلامُ ، وَمِـنْكَ السَّلام ، تَبارَكْتَ يا ذا الجَـلالِ وَالإِكْـرام .",
    "لا إلهَ إلاّ اللّهُ وحدَهُ لا شريكَ لهُ، لهُ المُـلْكُ ولهُ الحَمْد، وهوَ على كلّ شَيءٍ قَدير،\n\nاللّهُـمَّ لا مانِعَ لِما أَعْطَـيْت، وَلا مُعْطِـيَ لِما مَنَـعْت، وَلا يَنْفَـعُ ذا الجَـدِّ مِنْـكَ الجَـد.",
    "لا إلهَ إلاّ اللّه، وحدَهُ لا شريكَ لهُ، لهُ الملكُ ولهُ الحَمد، وهوَ على كلّ شيءٍ قدير،\n\nلا حَـوْلَ وَلا قـوَّةَ إِلاّ بِاللهِ، لا إلهَ إلاّ اللّـه، وَلا نَعْـبُـدُ إِلاّ إيّـاه، لَهُ النِّعْـمَةُ وَلَهُ الفَضْل وَلَهُ الثَّـناءُ الحَـسَن، لا إلهَ إلاّ اللّهُ مخْلِصـينَ لَـهُ الدِّينَ وَلَوْ كَـرِهَ الكـافِرون.",
    "لا إلهَ إلاّ اللّهُ وحْـدَهُ لا شريكَ لهُ، لهُ المُلكُ ولهُ الحَمْد، يُحيـي وَيُمـيتُ وهُوَ على كُلّ شيءٍ قدير.",
    "اللّهُـمَّ إِنِّـي أَسْأَلُـكَ عِلْمـاً نافِعـاً وَرِزْقـاً طَيِّـباً ، وَعَمَـلاً مُتَقَـبَّلاً.",
    "اللَّهُمَّ أَجِرْنِي مِنْ النَّار.\n\n(بعد صلاة الصبح والمغرب)",
    "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.\n\n(ثلاث مرات بعد صلاتي الفجر والمغرب)",
    "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ\n\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضِ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.\n\n[آية الكرسى - البقرة 255]",
    "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\n\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ.\n\n[سورة الإخلاص]",
    "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\n\nقُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.\n\n[سورة الفلق]",
    "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\n\nقُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ.\n\n[سورة الناس]\n\n(ثلاث مرات بعد صلاتي الفجر والمغرب)"
];

type PrayerTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export interface ColorSettings {
  textColor: string;
  nextPrayerTextColor: string;
  iqamaCountdownTextColor: string;
  azkarTextColor: string;
  shuruqBoxColor: string;
  clockBoxColor: string;
  jumuahBoxColor: string;
  prayerBoxesColor: string;
}

export interface ClockSettings {
  mosqueName: string;
  timeFormat: '12h' | '24h';
  prayerTimes: PrayerTimes;
  prayerTimeOffsets?: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  iqamaCountdown: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  dimDuration: number;
  adhanDurationMinutes: number;
  adhanDurationSeconds: number;
  phoneImageDurationMinutes: number;
  phoneImageDurationSeconds: number;
  azkarDurationMinutes: number;
  azkarDurationSeconds: number;
  shuruqTime: string;
  shuruqOffset?: number;
  jumuahTime: string;
  jumuahOffset?: number;
  country: string;
  city: string;
  showWeather: boolean;
  temperature: number;
  adhanSound: string;
  fajrAdhanSound: string;
  phoneImage: string;
  adhanImage: string;
  iqamaBackgroundImage: string;
  iqamaBackgroundColor: string;
  volume: number;
  isMuted: boolean;
  azkarBackgroundImage: string;
  backgroundImage: string;
  adhanTextPosition: 'top' | 'center' | 'bottom';
  colors: ColorSettings;
}

const defaultSettings: ClockSettings = {
    mosqueName: 'مسجد التلهوني',
    timeFormat: '12h',
    prayerTimes: {
      fajr: '04:02',
      dhuhr: '12:42',
      asr: '16:23',
      maghrib: '19:51',
      isha: '21:22',
    },
    prayerTimeOffsets: {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
    iqamaCountdown: {
      fajr: 20,
      dhuhr: 15,
      asr: 15,
      maghrib: 10,
      isha: 15,
    },
    dimDuration: 1,
    adhanDurationMinutes: 3,
    adhanDurationSeconds: 14,
    phoneImageDurationMinutes: 2,
    phoneImageDurationSeconds: 0,
    azkarDurationMinutes: 5,
    azkarDurationSeconds: 0,
    shuruqTime: '05:33',
    shuruqOffset: 0,
    jumuahTime: '12:43',
    jumuahOffset: 0,
    country: 'الأردن',
    city: 'عمان',
    showWeather: true,
    temperature: 25,
    adhanSound: '',
    fajrAdhanSound: '',
    phoneImage: '',
    adhanImage: '',
    iqamaBackgroundImage: '',
    iqamaBackgroundColor: '#1e3a8a',
    volume: 0.5,
    isMuted: false,
    azkarBackgroundImage: '',
    backgroundImage: '',
    adhanTextPosition: 'center',
    colors: {
      textColor: '#FFFFFF',
      nextPrayerTextColor: '#FFD700',
      iqamaCountdownTextColor: '#FFFFFF',
      azkarTextColor: '#FFFFFF',
      shuruqBoxColor: '#1e3a8a',
      clockBoxColor: '#1d4ed8',
      jumuahBoxColor: '#1e3a8a',
      prayerBoxesColor: '#1e3a8a',
    },
};

const applyOffsetToTime = (time: string, offsetMinutes: number): string => {
  if (!time || !time.includes(':')) return time;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  
  const totalMinutes = hours * 60 + minutes + offsetMinutes;
  const adjustedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const newHours = Math.floor(adjustedMinutes / 60);
  const newMinutes = adjustedMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

<<<<<<< HEAD
export default function AlMoazinClock() {
=======
interface AlMoazinClockProps {
  setBackgroundImage?: (image: string) => void;
}

export default function AlMoazinClock({ setBackgroundImage }: AlMoazinClockProps = {}) {
>>>>>>> 266be218d1d72dcbb812985ecf03cc86e330968f
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<ClockSettings>(defaultSettings);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  type PrayerPhase = 'idle' | 'adhan' | 'iqamaCountdown' | 'phoneImage' | 'azkar';
  const [currentPhase, setCurrentPhase] = useState<PrayerPhase>('idle');
  const [activePrayer, setActivePrayer] = useState<keyof PrayerTimes | null>(null);
  const [iqamaEndTime, setIqamaEndTime] = useState<Date | null>(null);
  const [currentAzkarIndex, setCurrentAzkarIndex] = useState(0);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const azkarIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDateKeyRef = useRef<string | null>(null);
  const isAdhanPlayingRef = useRef<boolean>(false); // علم لمنع تشغيل الأذان المتعدد
  const settingsRef = useRef(settings); // ref للحصول على أحدث إعدادات

  const locationMapping = useMemo(() => resolveLocationMapping(settings.country, settings.city), [settings.country, settings.city]);
  const now = useClock(locationMapping.timeZone);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  // تحديث settingsRef عند تغيير settings
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!isClient || audioUnlocked) return;
    const unlockAudio = async () => {
      if (audioRef.current && !audioUnlocked) {
        try {
          audioRef.current.volume = 0;
          const playPromise = audioRef.current.play();
          if (playPromise) {
            await playPromise;
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = settings.volume;
            setAudioUnlocked(true);
          }
        } catch (e) {}
      }
    };
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, [isClient, audioUnlocked, settings.volume]);

  const tz = locationMapping.timeZone;
  // استخدام ساعة محدثة باستمرار
  const [currentTime, setCurrentTime] = useState(() => new Date());
  
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isClient]);
  
  const nowTz = currentTime;

  useEffect(() => {
    setIsClient(true);
    
    // تنظيف أولي لضمان حالة نظيفة
    isAdhanPlayingRef.current = false;
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (azkarIntervalRef.current) {
      clearInterval(azkarIntervalRef.current);
      azkarIntervalRef.current = null;
    }
    
    try {
      // تحميل الإعدادات الأساسية
      const savedSettings = localStorage.getItem('alMoazinClockSettings');
      // تحميل الملفات والصور المحفوظة
      const savedMedia = localStorage.getItem('alMoazinMediaFiles');
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        let parsedMedia = {};
        
        // تحميل الملفات إذا كانت موجودة
        if (savedMedia) {
          try {
            parsedMedia = JSON.parse(savedMedia);
            console.log('🖼️ تم تحميل الملفات والصور المحفوظة');
          } catch (e) {
            console.warn('⚠️ فشل في تحميل الملفات المحفوظة');
          }
        }
        
        console.log('📂 تم تحميل الإعدادات المحفوظة:', parsedSettings.lastSaved ? new Date(parsedSettings.lastSaved).toLocaleString('ar-SA') : 'بدون تاريخ');
        
        const mergedSettings = {
          ...defaultSettings,
          ...parsedSettings,
          // دمج الملفات المحفوظة
          ...parsedMedia,
          colors: {
            ...defaultSettings.colors,
            ...(parsedSettings.colors || {}),
          },
          prayerTimeOffsets: {
            ...defaultSettings.prayerTimeOffsets,
            ...(parsedSettings.prayerTimeOffsets || {}),
          },
          iqamaCountdown: {
            ...defaultSettings.iqamaCountdown,
            ...(parsedSettings.iqamaCountdown || {}),
          },
          adhanDurationMinutes: parsedSettings.adhanDurationMinutes ?? parsedSettings.adhanDuration ?? defaultSettings.adhanDurationMinutes,
          adhanDurationSeconds: parsedSettings.adhanDurationSeconds ?? 0,
          phoneImageDurationMinutes: parsedSettings.phoneImageDurationMinutes ?? parsedSettings.phoneImageDuration ?? defaultSettings.phoneImageDurationMinutes,
          phoneImageDurationSeconds: parsedSettings.phoneImageDurationSeconds ?? 0,
          azkarDurationMinutes: parsedSettings.azkarDurationMinutes ?? parsedSettings.azkarDuration ?? defaultSettings.azkarDurationMinutes,
          azkarDurationSeconds: parsedSettings.azkarDurationSeconds ?? 0,
        };
        setSettings(mergedSettings);
        console.log('✅ تم تطبيق الإعدادات والملفات المحفوظة بنجاح');
      } else {
        console.log('🆕 لا توجد إعدادات محفوظة - استخدام الإعدادات الافتراضية');
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('❌ فشل في تحميل الإعدادات المحفوظة:', error);
      setSettings(defaultSettings);
    }
  }, []);

  // حفظ الملفات والصور بشكل منفصل في localStorage
  const saveMediaFiles = useCallback(async () => {
    if (!isClient) return;
    
    try {
      const mediaFiles = {
        backgroundImage: settings.backgroundImage,
        iqamaBackgroundImage: settings.iqamaBackgroundImage,
        azkarBackgroundImage: settings.azkarBackgroundImage,
        phoneImage: settings.phoneImage,
        adhanImage: settings.adhanImage,
        adhanSound: settings.adhanSound,
        fajrAdhanSound: settings.fajrAdhanSound
      };
      
      // حفظ الملفات بشكل منفصل
      localStorage.setItem('alMoazinMediaFiles', JSON.stringify(mediaFiles));
      console.log('💾 تم حفظ الملفات والصور بنجاح');
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ مساحة التخزين ممتلئة - لن يتم حفظ الملفات هذه المرة');
      } else {
        console.error('❌ فشل في حفظ الملفات:', error);
      }
    }
  }, [settings.backgroundImage, settings.iqamaBackgroundImage, settings.azkarBackgroundImage, settings.phoneImage, settings.adhanSound, settings.fajrAdhanSound, isClient]);
  
  // حفظ الإعدادات الأساسية بدون الملفات
  useEffect(() => {
    if (!isClient) return;
    try {
      // حفظ الإعدادات الأساسية فقط (بدون الملفات)
      const { backgroundImage, iqamaBackgroundImage, azkarBackgroundImage, phoneImage, adhanImage, adhanSound, fajrAdhanSound, ...essentialSettings } = settings;
      
      const settingsToSave = {
        ...essentialSettings,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('alMoazinClockSettings', JSON.stringify(settingsToSave));
      
      // حفظ الملفات بشكل منفصل فقط عند وجودها
      if (backgroundImage || iqamaBackgroundImage || azkarBackgroundImage || phoneImage || adhanSound || fajrAdhanSound) {
        saveMediaFiles();
      }
      
      console.log('💾 تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('❌ فشل في حفظ الإعدادات:', error);
    }
  }, [settings, isClient, saveMediaFiles]);

  const startIqamaCountdown = useCallback((prayer: keyof PrayerTimes) => {
    const duration = settings.iqamaCountdown[prayer] || 0;
    if (duration <= 0) {
      setCurrentPhase('phoneImage');
      return;
    }
    setCurrentPhase('iqamaCountdown');
    setIqamaEndTime(new Date(nowTz.getTime() + duration * 60 * 1000));
  }, [settings.iqamaCountdown, nowTz]);

  const startAzkar = useCallback(() => {
    setCurrentPhase('azkar');
    setCurrentAzkarIndex(0);
    const azkarDuration = (settings.azkarDurationMinutes * 60 + settings.azkarDurationSeconds) * 1000;
    const displayInterval = azkarDuration > 0 ? azkarDuration / azkarAfterPrayer.length : 15000;
    if (azkarIntervalRef.current) {
      clearInterval(azkarIntervalRef.current);
    }
    azkarIntervalRef.current = setInterval(() => {
      setCurrentAzkarIndex((i) => {
        const nextIndex = i + 1;
        if (nextIndex >= azkarAfterPrayer.length) {
          if (azkarIntervalRef.current) clearInterval(azkarIntervalRef.current);
          setTimeout(() => resetToIdle(), 2000);
          return i;
        }
        return nextIndex;
      });
    }, displayInterval);
  }, [settings.azkarDurationMinutes, settings.azkarDurationSeconds]);

  const resetToIdle = useCallback(() => {
    setCurrentPhase('idle');
    setActivePrayer(null);
    setIqamaEndTime(null);
    setCurrentAzkarIndex(0);
    
    // إعادة تعيين علم تشغيل الأذان
    isAdhanPlayingRef.current = false;
    
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (azkarIntervalRef.current) {
      clearInterval(azkarIntervalRef.current);
      azkarIntervalRef.current = null;
    }
  }, []);

  const skipToNextPhase = useCallback(() => {
    if (currentPhase === 'adhan') {
      if (activePrayer) startIqamaCountdown(activePrayer);
    } else if (currentPhase === 'iqamaCountdown') {
      setCurrentPhase('phoneImage');
      setIqamaEndTime(null);
    } else if (currentPhase === 'phoneImage') {
      startAzkar();
    } else if (currentPhase === 'azkar') {
      resetToIdle();
    }
  }, [currentPhase, activePrayer, startIqamaCountdown, startAzkar, resetToIdle]);

  const handleSkipPhase = skipToNextPhase;

  // 1. عند دخول وقت الصلاة - آلية محسنة للتشغيل الفوري
  useEffect(() => {
    if (!isClient || currentPhase !== 'idle') return;
    
    let intervalId: NodeJS.Timeout;
    let isChecking = false;
    
    const checkPrayerTime = () => {
      if (isChecking) return; // منع التداخل
      isChecking = true;
      
      try {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentSeconds = now.getSeconds();
        
        // البحث عن صلاة تطابق الوقت الحالي - استخدام ref لأحدث إعدادات
        const prayerTimes = settingsRef.current.prayerTimes;
        const prayerName = Object.keys(prayerTimes).find(p => 
          prayerTimes[p as keyof PrayerTimes] === currentTime
        ) as keyof PrayerTimes | undefined;
        
        if (prayerName && currentSeconds <= 3) { // التشغيل في أول 3 ثواني من الدقيقة
          console.log(`⏰ وقت صلاة ${prayerNames[prayerName]} - الثانية ${currentSeconds} - بدء الأذان فوراً!`);
          clearInterval(intervalId); // إيقاف المراقبة
          setActivePrayer(prayerName);
          setCurrentPhase('adhan');
        }
      } finally {
        isChecking = false;
      }
    };
    
    // التحقق فوراً
    checkPrayerTime();
    
    // مراقبة مستمرة كل 250ms لدقة عالية
    intervalId = setInterval(checkPrayerTime, 250);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isClient, currentPhase]); // إزالة settings.prayerTimes لمنع إعادة التشغيل المستمرة

  // 2. عند الانتقال لمرحلة الأذان - منطق محسن لمنع الاعادة
  useEffect(() => {
    // خروج فوري إذا لم نكن في مرحلة الأذان أو لا يوجد اسم صلاة
    if (currentPhase !== 'adhan' || !activePrayer) {
      // إعادة تعيين العلم عند مغادرة مرحلة الأذان
      if (currentPhase !== 'adhan' && isAdhanPlayingRef.current) {
        console.log('🔄 مغادرة مرحلة الأذان - إعادة تعيين العلم');
        isAdhanPlayingRef.current = false;
      }
      return;
    }
    
    const prayerName = activePrayer;
    
    // تأكد من عدم تشغيل الأذان مرتين
    console.log(`🔍 تحقق: هل يجب تشغيل الأذان? المرحلة: ${currentPhase}, الصلاة: ${prayerName}`);
    
    // منع التشغيل المتعدد - هذه هي النقطة الرئيسية
    if (isAdhanPlayingRef.current) {
      console.log('⚠️ الأذان قيد التشغيل بالفعل - لا نبدأ مرة أخرى');
      return;
    }
    
    // تعيين العلم فوراً لمنع إعادة التشغيل
    isAdhanPlayingRef.current = true;
    let adhanFile: string;
    if (prayerName === 'fajr') {
      adhanFile = settings.fajrAdhanSound || '/audio/audio_fajr.mp3';
    } else {
      adhanFile = settings.adhanSound || '/audio/audio_dhar.mp3';
    }
    
    console.log(`🎵 ملف الأذان المختار: ${adhanFile}`);
    
    // تأكد من عدم وجود أذان يعمل بالفعل
    if (audioRef.current && !audioRef.current.paused) {
      console.log('⚠️ يوجد أذان يعمل بالفعل - إيقافه');
      audioRef.current.pause();
      audioRef.current.src = ''; // إعادة تعيين المصدر
    }
    
    // استخدام مدة الأذان الثابتة المحددة في الإعدادات
    const adhanDuration = (settings.adhanDurationMinutes * 60 + settings.adhanDurationSeconds) * 1000;
    console.log(`🔊 بدء الأذان لصلاة ${prayerNames[prayerName]} - المدة المحددة: ${settings.adhanDurationMinutes} دقيقة و ${settings.adhanDurationSeconds} ثانية`);
    console.log(`⏱️ سيتم الانتقال للإقامة بعد ${adhanDuration / 1000} ثانية من الآن`);
    
    // علم لمنع الانتقال المتعدد
    let hasTransitioned = false;
    
    const clearPhaseTimeout = () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
        phaseTimeoutRef.current = null;
      }
    };

    const startIqamaAfterAdhan = () => {
      if (hasTransitioned) {
        console.log('⚠️ تم الانتقال بالفعل - تجاهل الطلب');
        return;
      }
      hasTransitioned = true;
      
      // إعادة تعيين علم تشغيل الأذان
      isAdhanPlayingRef.current = false;
      
      console.log('✅ انتهى الأذان - بدء العد التنازلي للإقامة');
      clearPhaseTimeout();
      // استخدام callback لتجنب dependency issues
      const duration = settings.iqamaCountdown[prayerName] || 0;
      if (duration <= 0) {
        setCurrentPhase('phoneImage');
      } else {
        setCurrentPhase('iqamaCountdown');
        const endTime = new Date(Date.now() + duration * 60 * 1000);
        setIqamaEndTime(endTime);
      }
    };
    
    const scheduleTransition = (delay: number) => {
      clearPhaseTimeout();
      phaseTimeoutRef.current = setTimeout(startIqamaAfterAdhan, delay);
    };
    
    // دالة تشغيل الأذان
    const playAdhan = async () => {
      console.log('🎵 محاولة تشغيل الأذان');
      
      // إذا كان الصوت معطلاً أو غير موجود، ننتظر مدة الأذان ثم نبدأ الإقامة
      if (!audioRef.current || !adhanFile || settings.isMuted) {
        console.log('🔇 الأذان يعمل بدون صوت - الانتظار ثم بدء العد التنازلي');
        console.log(`⏳ الانتظار لمدة ${adhanDuration / 1000} ثانية`);
        scheduleTransition(adhanDuration);
        return;
      }
      
      const audio = audioRef.current;
      audio.src = adhanFile;
      audio.currentTime = 0;
      audio.volume = settings.volume;
      audio.muted = false;
      
      const handleAdhanEnd = () => {
        console.log('🎵 انتهى الأذان الصوتي - بدء العد التنازلي للإقامة');
        audio.removeEventListener('ended', handleAdhanEnd);
        audio.removeEventListener('error', handleAdhanError);
        startIqamaAfterAdhan();
      };
      
      const handleAdhanError = (e: any) => {
        console.log(`❌ خطأ في تشغيل الأذان: ${e.type}`);
        audio.removeEventListener('ended', handleAdhanEnd);
        audio.removeEventListener('error', handleAdhanError);
        // الانتظار بدون صوت
        scheduleTransition(adhanDuration);
      };
      
      audio.addEventListener('ended', handleAdhanEnd);
      audio.addEventListener('error', handleAdhanError);
      
      try {
        await audio.play();
        console.log('✅ تم تشغيل الأذان بنجاح');
        // لا نضع scheduleTransition هنا لأن الأذان سينتهي تلقائياً
      } catch (e) {
        console.log(`❌ فشل تشغيل الأذان: ${e}`);
        audio.removeEventListener('ended', handleAdhanEnd);
        audio.removeEventListener('error', handleAdhanError);
        console.log('❌ فشل تشغيل الأذان تماماً - الانتظار ثم بدء العد التنازلي');
        console.log(`⏳ الانتظار لمدة ${adhanDuration / 1000} ثانية`);
        scheduleTransition(adhanDuration);
      }
    };
    
    // ابدأ تشغيل الأذان
    playAdhan();
    
    // آلية احتياطية: إذا لم ينته الأذان خلال مدة أطول من المتوقع (مرة واحدة فقط)
    const maxAdhanDuration = adhanDuration + 10000; // إضافة 10 ثواني كحد أقصى
    const fallbackTimeout = setTimeout(() => {
      if (!hasTransitioned) {
        console.log('⚠️ انتهت المهلة الزمنية للأذان - انتقال تلقائي للإقامة');
        startIqamaAfterAdhan();
      }
    }, maxAdhanDuration);
    
    return () => {
      clearPhaseTimeout();
      clearTimeout(fallbackTimeout);
      
      // إعادة تعيين علم تشغيل الأذان
      isAdhanPlayingRef.current = false;
      
      // إيقاف الأذان عند تنظيف المكون
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
}, [currentPhase, activePrayer]); // إزالة startIqamaCountdown من dependencies لمنع إعادة التشغيل

  // 3. عند انتهاء العد التنازلي للإقامة
  useEffect(() => {
    if (currentPhase === 'iqamaCountdown' && iqamaEndTime && nowTz >= iqamaEndTime) {
      setCurrentPhase('phoneImage');
      setIqamaEndTime(null);
    }
  }, [currentPhase, iqamaEndTime, nowTz]);

  // 4. عند عرض صورة الهاتف
  useEffect(() => {
    if (currentPhase !== 'phoneImage') return;
    const phoneImageDuration = (settings.phoneImageDurationMinutes * 60 + settings.phoneImageDurationSeconds) * 1000;
    if (phoneImageDuration > 0) {
      const timeout = setTimeout(() => {
        startAzkar();
      }, phoneImageDuration);
      return () => clearTimeout(timeout);
    } else {
      startAzkar();
    }
  }, [currentPhase, settings.phoneImageDurationMinutes, settings.phoneImageDurationSeconds, startAzkar]);

  const setBackgroundImage = useCallback((image: string) => {
    setSettings(s => ({...s, backgroundImage: image}));
  }, []);
  
  // حساب مواقيت الصلاة محلياً عند عدم توفر الإنترنت
  const updatePrayerTimesLocally = useCallback(async () => {
    console.log('[LOCAL CALC] 📊 بدء الحساب المحلي لمواقيت الصلاة');
    
    try {
      // الحصول على إحداثيات الموقع من locationMapping
      const coords = locationMapping.coordinates;
      if (!coords) {
        console.log('[LOCAL CALC] ❌ لا توجد إحداثيات محفوظة - استخدام آخر مواقيت محفوظة');
        return;
      }
      
      // تطبيق تقدير يومي بسيط على آخر مواقيت محفوظة
      const storedTimesData = localStorage.getItem('alMoazinPrayerTimes');
      if (!storedTimesData) {
        console.log('[LOCAL CALC] ❌ لا توجد مواقيت محفوظة - لا يمكن الحساب المحلي');
        return;
      }
      
      const parsedData = JSON.parse(storedTimesData);
      const { date: lastDate, times: lastTimes, shuruq: lastShuruq } = parsedData;
      
      if (!lastDate || !lastTimes) {
        console.log('[LOCAL CALC] ❌ بيانات غير كاملة');
        return;
      }
      
      // حساب عدد الأيام منذ آخر تحديث
      const today = `${nowTz.getFullYear()}-${String(nowTz.getMonth() + 1).padStart(2, '0')}-${String(nowTz.getDate()).padStart(2, '0')}`;
      const lastUpdateDate = new Date(lastDate);
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        console.log('[LOCAL CALC] ✅ لا حاجة للتحديث - نفس اليوم');
        return;
      }
      
      console.log(`[LOCAL CALC] 📅 حساب مواقيت ${today} بناءً على بيانات ${lastDate} (فرق ${daysDiff} يوم)`);
      
      // تقدير بسيط للتغيير اليومي (حوالي 1-2 دقيقة يومياً)
      const estimateNewTime = (oldTime: string, prayer: string) => {
        const [hours, minutes] = oldTime.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes;
        
        // تقديرات تغيير المواقيت يومياً (بالدقائق)
        let dailyChange = 0;
        switch (prayer) {
          case 'fajr': dailyChange = 1; break;    // الفجر يتأخر حوالي دقيقة
          case 'dhuhr': dailyChange = 0; break;   // الظهر قريب من الثبات
          case 'asr': dailyChange = -1; break;    // العصر يتقدم حوالي دقيقة
          case 'maghrib': dailyChange = -1; break;// المغرب يتقدم حوالي دقيقة
          case 'isha': dailyChange = -1; break;   // العشاء يتقدم حوالي دقيقة
        }
        
        totalMinutes += (dailyChange * daysDiff);
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;
        
        return `${String(newHours).padStart(2, '0')}:${String(Math.abs(newMinutes)).padStart(2, '0')}`;
      };
      
      // حساب المواقيت الجديدة
      const newPrayerTimes = {
        fajr: estimateNewTime(lastTimes.fajr, 'fajr'),
        dhuhr: estimateNewTime(lastTimes.dhuhr, 'dhuhr'),
        asr: estimateNewTime(lastTimes.asr, 'asr'),
        maghrib: estimateNewTime(lastTimes.maghrib, 'maghrib'),
        isha: estimateNewTime(lastTimes.isha, 'isha'),
      };
      
      const newShuruq = estimateNewTime(lastShuruq, 'fajr'); // الشروق يتبع نفس نمط الفجر
      
      // تطبيق التعديلات اليدوية إن وجدت
      const savedOffsets = localStorage.getItem('alMoazinPrayerOffsets');
      let userOffsets = {};
      if (savedOffsets) {
        try {
          userOffsets = JSON.parse(savedOffsets);
        } catch (e) {}
      }
      
      let adjustedTimes = { ...newPrayerTimes };
      if (Object.keys(userOffsets).length > 0) {
        Object.keys(userOffsets).forEach(prayer => {
          const offsetMinutes = userOffsets[prayer];
          if (typeof offsetMinutes === 'number' && offsetMinutes !== 0) {
            adjustedTimes[prayer] = applyOffsetToTime(adjustedTimes[prayer], offsetMinutes);
          }
        });
        console.log('[LOCAL CALC] 🔄 تم تطبيق التعديلات اليدوية');
      }
      
      const adjustedShuruq = applyOffsetToTime(newShuruq, settings.shuruqOffset || 0);
      
      // تحديث الإعدادات
      setSettings(s => ({
        ...s,
        prayerTimes: adjustedTimes,
        shuruqTime: adjustedShuruq,
        jumuahTime: adjustedTimes.dhuhr,
      }));
      
      // حفظ البيانات الجديدة
      const localPrayerData = {
        date: today,
        times: newPrayerTimes, // الأوقات المحسوبة محلياً
        shuruq: newShuruq,
        adjustedTimes: adjustedTimes,
        adjustedShuruq: adjustedShuruq,
        city: settings.city,
        country: settings.country,
        temperature: settings.temperature,
        method: 'local_calculation',
        fetchTime: Date.now(),
        apiVersion: '1.0-local'
      };
      
      localStorage.setItem('alMoazinPrayerTimes', JSON.stringify(localPrayerData));
      console.log(`[LOCAL CALC] ✅ تم حساب وحفظ مواقيت ${today} محلياً`);
      console.log('[LOCAL CALC] 📊 المواقيت المحسوبة:', adjustedTimes);
      
    } catch (error) {
      console.error('[LOCAL CALC] ❌ فشل في الحساب المحلي:', error);
    }
  }, [settings.city, settings.country, settings.temperature, settings.shuruqOffset, nowTz, locationMapping.coordinates, applyOffsetToTime]);
  
  // تم حل مشاكل التحديث وإزالة الرسائل المكررة
  
  // حفظ التعديلات اليدوية عند تغيير أوقات الصلاة
  useEffect(() => {
    if (!isClient) return;
    
      // حفظ التعديلات كـ offset بدلاً من أوقات مطلقة
    const saveManualOffsets = () => {
      try {
        // جلب الأوقات الأصلية من API أو استخدام الافتراضية
        const storedData = localStorage.getItem('alMoazinPrayerTimes');
        let baseTimes = defaultSettings.prayerTimes;
        
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            if (parsed.times) {
              baseTimes = parsed.times; // استخدام أوقات API الأصلية
            }
          } catch (e) {}
        }
        
        // حساب الـ offset لكل صلاة
        const calculateOffset = (originalTime, modifiedTime) => {
          if (!originalTime || !modifiedTime || !originalTime.includes(':') || !modifiedTime.includes(':')) {
            return 0;
          }
          
          const parseTime = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
          }
          
          const originalMinutes = parseTime(originalTime);
          const modifiedMinutes = parseTime(modifiedTime);
          
          return modifiedMinutes - originalMinutes;
        };
        
        const offsets = {};
        let hasOffsets = false;
        
        Object.keys(settings.prayerTimes).forEach(prayer => {
          const offset = calculateOffset(baseTimes[prayer], settings.prayerTimes[prayer]);
          if (offset !== 0) {
            offsets[prayer] = offset;
            hasOffsets = true;
          }
        });
        
        if (hasOffsets) {
          localStorage.setItem('alMoazinPrayerOffsets', JSON.stringify(offsets));
          console.log('📝 تم حفظ تعديلات المواقيت (بالدقائق):', offsets);
        } else {
          // إزالة الـ offsets إذا لم تعد موجودة
          localStorage.removeItem('alMoazinPrayerOffsets');
          console.log('🗑️ تم مسح تعديلات المواقيت - الأوقات عادت للقيم الأصلية');
        }
      } catch (e) {
        console.error('❌ فشل في حفظ تعديلات المواقيت:', e);
      }
    };
    
    // حفظ عند تغيير أوقات الصلاة
    const timer = setTimeout(saveManualOffsets, 1000); // تأخير ثانية واحدة
    
    return () => clearTimeout(timer);
  }, [settings.prayerTimes, isClient]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume;
      audioRef.current.muted = settings.isMuted;
    }
  }, [settings.volume, settings.isMuted]);

  useEffect(() => {
    return () => {
      if(phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
      if(azkarIntervalRef.current) clearInterval(azkarIntervalRef.current);
    };
  }, []);

  // دالة جلب مواقيت الصلاة مع الحفاظ على التعديلات اليدوية
  const fetchPrayerTimesAndWeather = useCallback(async (force = false) => {
    if (!isClient || !settings.city || !settings.country) return;
    
    // جلب تعديلات المواقيت (بالدقائق) قبل التحديث
    const savedOffsets = localStorage.getItem('alMoazinPrayerOffsets');
    let userOffsets = {};
    if (savedOffsets) {
      try {
        userOffsets = JSON.parse(savedOffsets);
        console.log('📝 تم العثور على تعديلات محفوظة (بالدقائق):', userOffsets);
      } catch (e) {}
    }
    
    setIsFetchingTimes(true);
    setIsOffline(false);
    if (!isClient || !settings.city || !settings.country) return;
    
    setIsFetchingTimes(true);
    setIsOffline(false);
    
    const d = nowTz;
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    console.log(`[PRAYER TIMES] 🕐 تحديث مواقيت الصلاة لتاريخ: ${today}`);
    console.log(`[PRAYER TIMES] 📍 المدينة: ${settings.city}, الدولة: ${settings.country}`);
    
    // التحقق من البيانات المخزنة
    const storedTimesData = localStorage.getItem('alMoazinPrayerTimes');
    let useCachedData = false;
    
    if (storedTimesData && !force) {
      try {
        const parsed = JSON.parse(storedTimesData);
        const { date, times, shuruq, city, country, fetchTime } = parsed;
        
        // التحقق من صحة البيانات المخزنة
        const isToday = date === today;
        const isSameLocation = city === settings.city && country === settings.country;
        const fetchAge = Date.now() - (fetchTime || 0);
        const maxAge = 6 * 60 * 60 * 1000; // 6 ساعات بحد أقصى
        const isDataFresh = fetchAge < maxAge;
        
        if (isToday && isSameLocation && isDataFresh && times) {
          console.log(`[PRAYER TIMES] ✅ استخدام البيانات المخزنة (عمر البيانات: ${Math.round(fetchAge / 60000)} دقيقة)`);
          
          const offsets = settings.prayerTimeOffsets || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
          const adjustedTimes = {
            fajr: applyOffsetToTime(times.fajr, offsets.fajr),
            dhuhr: applyOffsetToTime(times.dhuhr, offsets.dhuhr),
            asr: applyOffsetToTime(times.asr, offsets.asr),
            maghrib: applyOffsetToTime(times.maghrib, offsets.maghrib),
            isha: applyOffsetToTime(times.isha, offsets.isha),
          };
          const adjustedShuruq = applyOffsetToTime(shuruq, settings.shuruqOffset || 0);
          
          setSettings(s => ({
            ...s, 
            prayerTimes: adjustedTimes, 
            shuruqTime: adjustedShuruq,
            jumuahTime: adjustedTimes.dhuhr,
            // الحفاظ على جميع الإعدادات المخصصة
            iqamaCountdown: s.iqamaCountdown,
            adhanSound: s.adhanSound,
            fajrAdhanSound: s.fajrAdhanSound,
            phoneImage: s.phoneImage,
            iqamaBackgroundImage: s.iqamaBackgroundImage,
            azkarBackgroundImage: s.azkarBackgroundImage,
            backgroundImage: s.backgroundImage,
          }));
          useCachedData = true;
        } else {
          console.log(`[PRAYER TIMES] 🔄 البيانات المخزنة قديمة أو غير صحيحة - سيتم التحديث`);
          console.log(`  - تاريخ اليوم: ${isToday}`);
          console.log(`  - نفس الموقع: ${isSameLocation}`);
          console.log(`  - البيانات حديثة: ${isDataFresh} (عمر البيانات: ${Math.round(fetchAge / 60000)} دقيقة)`);
        }
      } catch (e) {
        console.error(`[PRAYER TIMES] ❌ خطأ في قراءة البيانات المخزنة:`, e);
        localStorage.removeItem('alMoazinPrayerTimes');
      }
    }
    
    if (useCachedData && !force) {
      setIsFetchingTimes(false);
      return;
    }
    
    try {
      const method = locationMapping.method ?? 23;
      const timezonestring = locationMapping.timeZone;
      const params = new URLSearchParams({
        city: locationMapping.apiCity || settings.city,
        country: locationMapping.apiCountry || settings.country,
        method: String(method),
      });
      if (timezonestring) params.append('timezonestring', timezonestring);
      const url = `https://api.aladhan.com/v1/timingsByCity?${params.toString()}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Aladhan HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.code !== 200 || !data.data?.timings) throw new Error('Invalid Aladhan response');
      const t = data.data.timings as any;
      const normalize = (v: string) => (v ? String(v).split(' ')[0] : '');
      const basePrayerTimes = {
        fajr: normalize(t.Fajr),
        dhuhr: normalize(t.Dhuhr),
        asr: normalize(t.Asr),
        maghrib: normalize(t.Maghrib),
        isha: normalize(t.Isha),
      };
      const baseShuruq = normalize(t.Sunrise);
      const offsets = settings.prayerTimeOffsets || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
      let newPrayerTimes = {
        fajr: applyOffsetToTime(basePrayerTimes.fajr, offsets.fajr),
        dhuhr: applyOffsetToTime(basePrayerTimes.dhuhr, offsets.dhuhr),
        asr: applyOffsetToTime(basePrayerTimes.asr, offsets.asr),
        maghrib: applyOffsetToTime(basePrayerTimes.maghrib, offsets.maghrib),
        isha: applyOffsetToTime(basePrayerTimes.isha, offsets.isha),
      };
      
      // تطبيق تعديلات المستخدم (بالدقائق) على أوقات API الجديدة
      if (Object.keys(userOffsets).length > 0) {
        console.log('🔄 تطبيق تعديلات المستخدم على الأوقات الجديدة');
        
        Object.keys(userOffsets).forEach(prayer => {
          const offsetMinutes = userOffsets[prayer];
          if (typeof offsetMinutes === 'number' && offsetMinutes !== 0) {
            const originalTime = newPrayerTimes[prayer];
            const adjustedTime = applyOffsetToTime(originalTime, offsetMinutes);
            console.log(`   ${prayer}: API=${originalTime} + ${offsetMinutes}دق -> ${adjustedTime}`);
            newPrayerTimes[prayer] = adjustedTime;
          }
        });
        
        console.log('✅ تم تطبيق جميع تعديلات المستخدم');
      }
      
      const newShuruq = applyOffsetToTime(baseShuruq, settings.shuruqOffset || 0);
      const newTemperature = settings.temperature;
      
      setSettings(s => ({
        ...s,
        prayerTimes: newPrayerTimes, // هذه تتضمن التعديلات اليدوية
        shuruqTime: newShuruq,
        jumuahTime: newPrayerTimes.dhuhr,
        temperature: newTemperature,
      }));
      // حفظ البيانات مع وقت الجلب
      const prayerData = {
        date: today,
        times: basePrayerTimes, // الأوقات الأصلية من API
        shuruq: baseShuruq,
        adjustedTimes: newPrayerTimes, // الأوقات بعد تطبيق offsets
        adjustedShuruq: newShuruq,
        city: settings.city,
        country: settings.country,
        temperature: newTemperature,
        method,
        timezonestring,
        fetchTime: Date.now(), // وقت جلب البيانات
        apiVersion: '1.0' // رقم إصدار البيانات
      };
      
      localStorage.setItem('alMoazinPrayerTimes', JSON.stringify(prayerData));
      console.log(`[PRAYER TIMES] 💾 تم حفظ مواقيت يوم ${today} بنجاح`);
      console.log(`[PRAYER TIMES] 🕰️ وقت الجلب: ${new Date().toLocaleTimeString('ar')}`);
      
      // جدولة التحديث التالي عند الفجر
      scheduleNextUpdate(newPrayerTimes.fajr);
    } catch (error) {
      setIsOffline(true);
      toast({
          variant: "destructive",
          title: "خطأ في جلب البيانات",
          description: "تعذر تحديث أوقات الصلاة أو الطقس. سيتم عرض آخر بيانات تم تحميلها.",
      });
    } finally {
      setIsFetchingTimes(false);
    }
  }, [settings.country, settings.city, settings.prayerTimeOffsets, settings.shuruqOffset, isClient, toast, settings.showWeather, settings.temperature, nowTz]);

  // دالة جدولة التحديث التلقائي اليومي
  const scheduleNextUpdate = useCallback((fajrTime: string) => {
    if (!fajrTime || !isClient) return;
    
    try {
      // حساب وقت الفجر التالي
      const tomorrow = new Date(nowTz);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const [hours, minutes] = fajrTime.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      
      const msUntilNextFajr = tomorrow.getTime() - nowTz.getTime();
      
      if (msUntilNextFajr > 0) {
        console.log(`[AUTO UPDATE] 🕰️ سيتم التحديث التالي عند فجر الغد (${fajrTime}) - بعد ${Math.round(msUntilNextFajr / (1000 * 60 * 60))} ساعة`);
        
        // جدولة تحديث تلقائي عند الفجر التالي مع الحفاظ على التعديلات
        setTimeout(() => {
          console.log(`[AUTO UPDATE] 🌅 قد حان فجر يوم جديد - بدء التحديث مع الحفاظ على التعديلات`);
          fetchPrayerTimesAndWeather(true);
        }, msUntilNextFajr);
      }
    } catch (error) {
      console.error(`[AUTO UPDATE] ❌ خطأ في جدولة التحديث:`, error);
    }
  }, [fetchPrayerTimesAndWeather, nowTz, isClient]);

  // تحديث تلقائي عند بدء التطبيق وتحديث يومي منتظم
  useEffect(() => {
    if (!isClient) return;
    
    // تحديث فوري عند بدء التطبيق
    const initializeApp = async () => {
      console.log('[INIT] 🚀 بدء التطبيق - فحص الحاجة للتحديث');
      
      // التحقق من تاريخ آخر تحديث
      const storedTimesData = localStorage.getItem('alMoazinPrayerTimes');
      let needsUpdate = true;
      
      if (storedTimesData) {
        try {
          const { date, fetchTime } = JSON.parse(storedTimesData);
          const today = `${nowTz.getFullYear()}-${String(nowTz.getMonth() + 1).padStart(2, '0')}-${String(nowTz.getDate()).padStart(2, '0')}`;
          const isToday = date === today;
          const fetchAge = Date.now() - (fetchTime || 0);
          const maxAge = 12 * 60 * 60 * 1000; // 12 ساعات
          
          if (isToday && fetchAge < maxAge) {
            needsUpdate = false;
            console.log('[INIT] ✅ البيانات محدثة - لا حاجة للتحديث الآن');
          } else {
            console.log(`[INIT] ⚠️ البيانات قديمة - التحديث مطلوب (العمر: ${Math.round(fetchAge / 60000)} دقيقة)`);
          }
        } catch (e) {
          console.log('[INIT] ❌ خطأ في قراءة البيانات المحفوظة - سيتم التحديث');
        }
      } else {
        console.log('[INIT] 📭 لا توجد بيانات محفوظة - سيتم التحديث');
      }
      
      if (needsUpdate) {
        await fetchPrayerTimesAndWeather(true);
      }
    };
    
    // تشغيل التحديث الأولي
    initializeApp();
    
    // تحديث منتظم كل 6 ساعات للتأكد من البيانات الحديثة
    const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 ساعات
    
    const intervalId = setInterval(async () => {
      console.log(`[PERIODIC UPDATE] 🔄 تحديث دوري للمواقيت`);
      try {
        await fetchPrayerTimesAndWeather(true);
      } catch (error) {
        console.log('[PERIODIC UPDATE] ⚠️ فشل التحديث من الإنترنت - بدء الحساب المحلي');
        await updatePrayerTimesLocally();
      }
    }, REFRESH_INTERVAL);
    
    // فحص يومي احتياطي كل ساعة لضمان التحديث
    const DAILY_CHECK_INTERVAL = 60 * 60 * 1000; // ساعة واحدة
    
    const dailyCheckId = setInterval(async () => {
      const storedTimesData = localStorage.getItem('alMoazinPrayerTimes');
      if (storedTimesData) {
        try {
          const { date } = JSON.parse(storedTimesData);
          const today = `${nowTz.getFullYear()}-${String(nowTz.getMonth() + 1).padStart(2, '0')}-${String(nowTz.getDate()).padStart(2, '0')}`;
          
          if (date !== today) {
            console.log(`[DAILY CHECK] 📅 اكتشاف تاريخ جديد ${today} - بدء التحديث`);
            try {
              await fetchPrayerTimesAndWeather(true);
              console.log('[DAILY CHECK] ✅ تم التحديث من الإنترنت');
            } catch (error) {
              console.log('[DAILY CHECK] ⚠️ فشل التحديث من الإنترنت - بدء الحساب المحلي');
              await updatePrayerTimesLocally();
            }
          }
        } catch (e) {
          console.error('[DAILY CHECK] ❌ خطأ في فحص التاريخ:', e);
        }
      }
    }, DAILY_CHECK_INTERVAL);
    
    // تحديث يومي مضمون عند منتصف الليل مع نظام احتياطي
    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      midnight.setDate(midnight.getDate() + 1); // منتصف الليل القادم
      
      const msUntilMidnight = midnight.getTime() - now.getTime();
      
      console.log(`[MIDNIGHT UPDATE] 🌙 سيتم التحديث اليومي عند منتصف الليل بعد ${Math.round(msUntilMidnight / (1000 * 60 * 60))} ساعة`);
      
      return setTimeout(async () => {
        console.log('[MIDNIGHT UPDATE] 🌅 حان منتصف الليل - بدء التحديث اليومي');
        
        // محاولة التحديث من الإنترنت أولاً
        try {
          await fetchPrayerTimesAndWeather(true);
          console.log('[MIDNIGHT UPDATE] ✅ تم التحديث من الإنترنت بنجاح');
        } catch (error) {
          console.log('[MIDNIGHT UPDATE] ⚠️ فشل التحديث من الإنترنت - بدء الحساب المحلي');
          await updatePrayerTimesLocally();
        }
        
        // جدولة التحديث التالي
        const nextTimeoutId = scheduleMidnightUpdate();
        return nextTimeoutId;
      }, msUntilMidnight);
    };
    
    const midnightTimeoutId = scheduleMidnightUpdate();
    
    console.log('✅ تم تفعيل التحديث التلقائي واليومي والدوري والاحتياطي');
    
    return () => {
      clearInterval(intervalId);        // تنظيف التحديث كل 6 ساعات
      clearTimeout(midnightTimeoutId);  // تنظيف تحديث منتصف الليل
      clearInterval(dailyCheckId);      // تنظيف الفحص اليومي الاحتياطي
    };
  }, [isClient, fetchPrayerTimesAndWeather, updatePrayerTimesLocally, nowTz]);

  useEffect(() => {
    if (!isClient) return;
    // لا نتحقق من التاريخ أو نستدعي API لأن الإعدادات اليدوية دائمة
    lastDateKeyRef.current = 'manual-settings';
  }, [isClient]);

  // لا نحتاج إلى استدعاء API عند الاتصال بالإنترنت لأن الإعدادات يدوية

  const timeFormatter = useMemo(() => {
    if (!isClient) return null;
    // استخدام الوقت المحلي للنظام مباشرة
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: settings.timeFormat === '12h',
    });
  }, [settings.timeFormat, isClient]);

  const prayerTimeFormatter = useMemo(() => {
    if (!isClient) return null;
    return new Intl.DateTimeFormat('ar-TN-u-nu-latn', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: settings.timeFormat === '12h',
    });
  }, [settings.timeFormat, isClient]);

  const formatPrayerTime = useCallback((time24: string) => {
    if (!time24 || !time24.includes(':')) return '';
    const [hours, minutes] = time24.split(':');
    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return '';
    const date = new Date(nowTz);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    if (!prayerTimeFormatter) return '';
    return prayerTimeFormatter.format(date).replace(' AM', '').replace(' PM', '');
  }, [prayerTimeFormatter, nowTz]);

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
    // حساب الصلاة التالية 
    const toMinutes = (s: string | undefined): number | null => {
      if (!s || !s.includes(':')) return null;
      const [hStr, mStr] = s.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };

    const currentMinutes = nowTz.getHours() * 60 + nowTz.getMinutes();
    const currentSeconds = nowTz.getSeconds();
    
    const prayerOrder: (keyof PrayerTimes)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const schedule = prayerOrder
      .map(name => ({ name, min: toMinutes(settings.prayerTimes[name]) }))
      .filter(p => p.min != null) as { name: keyof PrayerTimes; min: number }[];

    let next = schedule.find(p => p.min > currentMinutes);

    if (!next) {
      // لم يتبق صلوات اليوم - الصلاة التالية هي فجر الغد
      const fajrMin = toMinutes(settings.prayerTimes.fajr);
      if (fajrMin == null) {
        return { nextPrayerName: '...', countdown: '--:--:--' };
      }
      
      // حساب الوقت المتبقي حتى فجر الغد
      const diffSec = ((fajrMin + 1440) * 60) - (currentMinutes * 60 + currentSeconds);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      
      return {
        nextPrayerName: prayerNames.fajr,
        countdown: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      };
    }

    // هناك صلاة قادمة اليوم
    const diffSec = (next.min * 60) - (currentMinutes * 60 + currentSeconds);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return {
      nextPrayerName: prayerNames[next.name],
      countdown: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  }, [nowTz, settings.prayerTimes]);
  
  const formattedTime = timeFormatter ? timeFormatter.format(nowTz) : '...';
  const [timePart, periodPart] = formattedTime.split(' ');
  const [hour, minute, second] = timePart.split(':');
  const dayPeriod = settings.timeFormat === '12h' ? periodPart : null;

  const countdownToIqama = useMemo(() => {
    if (!iqamaEndTime) {
      return null;
    }
    const diff = iqamaEndTime.getTime() - nowTz.getTime();
    if (diff <= 0) {
      return '00:00';
    }
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return formattedCountdown;
  }, [iqamaEndTime, nowTz]);

  const renderAdhan = () => {
    const hasImage = settings.adhanImage && settings.adhanImage.length > 0;
    const positionClass = settings.adhanTextPosition === 'top' ? 'justify-start' : settings.adhanTextPosition === 'bottom' ? 'justify-end' : 'justify-center';
    const activePrayerName = activePrayer ? prayerNames[activePrayer] : '';
    return (
      <div
        className="min-h-screen relative flex flex-col"
        style={{
          backgroundColor: hasImage ? 'transparent' : '#101828',
          backgroundImage: hasImage ? `url(${settings.adhanImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <button
          onClick={handleSkipPhase}
          className="absolute top-6 right-6 z-50 bg-red-600/80 hover:bg-red-700 text-white text-5xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
          aria-label="إغلاق الشاشة"
          title="اضغط للخروج"
        >
          ×
        </button>
        <div className={cn("relative z-10 flex flex-col items-center text-center gap-10 px-6 py-12 flex-1", positionClass)}>
          <div className="max-w-4xl w-full mx-auto flex flex-col items-center gap-10">
            <span className="text-6xl md:text-7xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">الله أكبر</span>
            <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
              حان الآن موعد أذان صلاة {activePrayerName || '...'}
            </h2>
          </div>
        </div>
      </div>
    );
  };

  const renderIqamaCountdown = () => {
    const hasBackgroundImage = settings.iqamaBackgroundImage && settings.iqamaBackgroundImage.length > 0;
    return (
      <div 
        className="min-h-screen text-white flex flex-col justify-center items-center font-sans relative"
        style={{
          backgroundColor: settings.iqamaBackgroundImage ? 'transparent' : settings.iqamaBackgroundColor,
          backgroundImage: settings.iqamaBackgroundImage ? `url(${settings.iqamaBackgroundImage})` : 'none',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
      <button
        onClick={handleSkipPhase}
        className="absolute top-6 right-6 z-50 bg-red-600/80 hover:bg-red-700 text-white text-5xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
        aria-label="إغلاق الشاشة"
        title="اضغط للخروج"
      >
        ×
      </button>
        <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-8" style={{ color: settings.colors.iqamaCountdownTextColor }}>
                إقامة صلاة {activePrayer && prayerNames[activePrayer]}
            </h2>
            <div className="font-mono text-[12vw] sm:text-[15vw] font-bold tracking-widest" style={{textShadow: '0 0 25px #fff', color: settings.colors.iqamaCountdownTextColor}}>
                {countdownToIqama || '00:00'}
            </div>
        </div>
      </div>
    );
  };

  const renderPhoneImage = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <button
        onClick={handleSkipPhase}
        className="absolute top-6 right-6 z-50 bg-red-600/80 hover:bg-red-700 text-white text-5xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
        aria-label="إغلاق الشاشة"
        title="اضغط للخروج"
      >
        ×
      </button>
      {settings.phoneImage ? (
        <img 
          src={settings.phoneImage} 
          alt="إغلاق الهاتف" 
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <div className="text-white text-6xl font-bold text-center p-8">
          <p>الرجاء إغلاق الهاتف</p>
          <p className="text-4xl mt-8">📵</p>
        </div>
      )}
    </div>
  );

  const renderAzkar = () => {
    const currentAzkar = azkarAfterPrayer[currentAzkarIndex % azkarAfterPrayer.length];
    const hasBackgroundImage = settings.azkarBackgroundImage && settings.azkarBackgroundImage.length > 0;
    return (
      <div 
        className="min-h-screen text-white flex items-center justify-center p-8 relative bg-cover bg-center"
        style={{
          backgroundImage: hasBackgroundImage ? `url(${settings.azkarBackgroundImage})` : 'none',
          backgroundColor: hasBackgroundImage ? 'transparent' : '#1e40af',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <button
          onClick={skipToNextPhase}
          className="absolute top-6 right-6 z-50 bg-red-600/80 hover:bg-red-700 text-white text-5xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
          aria-label="إغلاق الشاشة"
          title="اضغط للخروج"
        >
          ×
        </button>
        <div className="max-w-4xl text-center z-10">
          <h2 className="text-5xl font-bold mb-12" style={{ color: settings.colors.azkarTextColor }}>أذكار ما بعد الصلاة</h2>
          <p className="text-5xl leading-relaxed whitespace-pre-line font-semibold" style={{ color: settings.colors.azkarTextColor }}>
            {currentAzkar}
          </p>
          <div className="mt-12 text-xl opacity-70" style={{ color: settings.colors.azkarTextColor }}>
            ({currentAzkarIndex + 1} / {azkarAfterPrayer.length})
          </div>
        </div>
      </div>
    );
  };

  const renderMainScreen = () => (
    <div
      className="bg-cover bg-center min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 font-sans transition-all duration-1000 relative"
      style={{ backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none', backgroundColor: '#263138', color: settings.colors.textColor }}
    >
        <div className="absolute inset-0 bg-black/60 -z-10" />
        <header className="flex justify-between items-start">
            <div className="flex items-center gap-4 text-2xl">
                {settings.showWeather && (
                    <div className="flex items-center gap-2">
                        <span>{settings.temperature}°</span>
                        <Sun className="text-yellow-400" size={32}/>
                    </div>
                )}
                {isOffline && <WifiOff className="text-red-400" size={32} title="غير متصل" />}
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
                 <div 
                    className="flex flex-col justify-center rounded-2xl p-4 text-center shadow-lg border border-blue-600/50"
                    style={{ width: '235px', height: '135px', backgroundColor: settings.colors.shuruqBoxColor }}
                >
                    <h3 className="text-2xl font-bold">الشروق</h3>
                    <p className="text-3xl font-mono font-bold">{formatPrayerTime(settings.shuruqTime)}</p>
                 </div>

                <div 
                    className="rounded-2xl p-4 md:p-6 shadow-2xl border border-blue-500/50 w-[90%] max-w-2xl mx-4"
                    style={{ backgroundColor: settings.colors.clockBoxColor }}
                >
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
                        <p>{hijriDateFormatter?.format(nowTz)}</p>
                        <p>{gregorianDateFormatter?.format(nowTz)}</p>
                    </div>
                </div>

                <div 
                    className="flex flex-col justify-center rounded-2xl p-4 text-center shadow-lg border border-blue-600/50"
                    style={{ width: '235px', height: '135px', backgroundColor: settings.colors.jumuahBoxColor }}
                >
                    <h3 className="text-2xl font-bold">الجمعة</h3>
                    <p className="text-3xl font-mono font-bold">{formatPrayerTime(settings.jumuahTime)}</p>
                </div>
            </div>

            <div className="mt-8 text-3xl font-semibold flex flex-col items-center gap-2">
                {isFetchingTimes ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="animate-spin" />
                      <span>جاري تحديث أوقات الصلاة...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3" style={{ color: settings.colors.nextPrayerTextColor }}>
                           <Star className="text-yellow-400" />
                           <span>الصلاة القادمة</span>
                           <Star className="text-yellow-400" />
                        </div>
                        <span className="text-5xl font-bold" style={{ color: settings.colors.nextPrayerTextColor }}>{nextPrayerName}</span>
                        <span className="font-mono text-4xl" style={{ color: settings.colors.nextPrayerTextColor }}>تبقى {countdown}</span>
                    </>
                )}
            </div>
        </main>
        
        <footer className="w-full max-w-7xl mx-auto mt-auto">
            <div className="grid grid-cols-5 gap-3 md:gap-6 justify-items-center max-w-7xl mx-auto">
              {PRAYER_ORDER.map((key) => (
                <div key={key} className={cn(
                    "rounded-2xl p-3 text-center shadow-lg border border-blue-600/50 transition-all flex flex-col justify-center",
                    prayerNames[key] === nextPrayerName && !isFetchingTimes && "border-yellow-400 border-2 scale-105"
                    )}
                    style={{ width: '200px', height: '110px', backgroundColor: settings.colors.prayerBoxesColor }}
                >
                    <h3 className="text-2xl font-bold">{prayerNames[key]}</h3>
                    <p className="text-3xl font-mono font-bold">{formatPrayerTime(settings.prayerTimes[key])}</p>
                </div>
              ))}
            </div>
        </footer>
        
        <SettingsPanel
            isOpen={isPanelOpen}
            setIsOpen={setIsPanelOpen}
            settings={settings}
            setSettings={setSettings}
            setBackgroundImage={setBackgroundImage}
            isFetchingTimes={isFetchingTimes}
            triggerFetch={fetchPrayerTimesAndWeather}
        />
    </div>
  );

  if (!isClient) {
    return (
      <>
        <audio ref={audioRef} className="hidden" />
        <div className="min-h-screen bg-black" />
      </>
    );
  }

  let content;

  if (currentPhase === 'adhan') {
    content = renderAdhan();
  } else if (currentPhase === 'iqamaCountdown') {
    content = renderIqamaCountdown();
  } else if (currentPhase === 'phoneImage') {
    content = renderPhoneImage();
  } else if (currentPhase === 'azkar') {
    content = renderAzkar();
  } else {
    content = renderMainScreen();
  }
  
  return (
    <>
      <audio ref={audioRef} className="hidden" />
      {content}
    </>
  );
}
