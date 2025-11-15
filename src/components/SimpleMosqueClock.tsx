"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useClock } from '@/hooks/use-clock-new';
import { resolveLocationMapping } from '@/lib/locations';
import { Cog, Sun, Sunrise, Moon, Star } from 'lucide-react';

interface SimpleMosqueClockProps {
  setBackgroundImage: (image: string) => void;
}

import type { ClockSettings } from './AlMoazinClock';

export function SimpleMosqueClock({ setBackgroundImage }: SimpleMosqueClockProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [settings, setSettings] = useState<ClockSettings>({
    mosqueName: 'مسجد السلام - Assalam Mosque',
    timeFormat: '24h',
    prayerTimes: {
      fajr: '05:30',
      dhuhr: '12:15',
      asr: '15:45',
      maghrib: '18:20',
      isha: '19:50'
    },
    iqamaCountdown: {
      fajr: 15,
      dhuhr: 10,
      asr: 10,
      maghrib: 5,
      isha: 10
    },
    dimDuration: 60,
    shuruqTime: '06:45',
    jumuahTime: '13:15',
    country: 'الأردن',
    city: 'عمان',
    showWeather: true,
    temperature: 25,
    adhanSound: 'short_azan.mp3',
    volume: 50,
    isMuted: false,
    backgroundImage: '',
    colors: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#4caf50'
    }
  });

  // Ensure we use the same timezone mapping as the main clock
  const locationMapping = useMemo(() => resolveLocationMapping(settings.country, settings.city), [settings.country, settings.city]);
  const now = useClock(locationMapping.timeZone);

  // تنسيق الوقت الحالي
  const currentTime = useMemo(() => ({
    hour: String(now.getHours()).padStart(2, '0'),
    minute: String(now.getMinutes()).padStart(2, '0'),
    second: String(now.getSeconds()).padStart(2, '0')
  }), [now]);

  // تنسيق التاريخ (باستخدام Intl مع timezone من الخريطة)
  const currentDate = useMemo(() => {
    const tz = locationMapping.timeZone || 'UTC';
    const fmtGreg = new Intl.DateTimeFormat('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz });
    const fmtHijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz });
    const sample = new Date();
    return {
      gregorian: fmtGreg.format(sample),
      hijri: fmtHijri.format(sample)
    };
  }, [locationMapping.timeZone]);

  return (
    <div className="min-h-screen text-white flex flex-col relative">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {settings.mosqueName}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {settings.showWeather && (
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Sun className="text-yellow-400" size={20} />
              <span className="text-white font-medium">{settings.temperature}°</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsPanelOpen(true)}
            className="bg-white/10 hover:bg-white/20 rounded-lg"
          >
            <Cog className="h-6 w-6 text-white" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-6">
        {/* Current Time Display */}
        <div className="text-center mb-20">
          {/* Main Clock */}
          <div className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold font-mono leading-none mb-8 text-white">
            {currentTime.hour}:{currentTime.minute}
          </div>
          
          {/* Date */}
          <div className="space-y-2 mb-8">
            <div className="text-2xl text-white/90 font-medium">
              {currentDate.hijri}
            </div>
            <div className="text-xl text-white/70">
              {currentDate.gregorian}
            </div>
          </div>
        </div>

        {/* Prayer Times */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-5 gap-8">
            {/* Fajr */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Sunrise className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-medium mb-2 text-white">
                الفجر
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {settings.prayerTimes.fajr}
              </div>
              <div className="text-sm text-green-400 font-bold">
                +{settings.iqamaCountdown.fajr}
              </div>
            </div>

            {/* Dhuhr */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-medium mb-2 text-white">
                الظهر
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {settings.prayerTimes.dhuhr}
              </div>
              <div className="text-sm text-green-400 font-bold">
                +{settings.iqamaCountdown.dhuhr}
              </div>
            </div>

            {/* Asr */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-medium mb-2 text-white">
                العصر
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {settings.prayerTimes.asr}
              </div>
              <div className="text-sm text-green-400 font-bold">
                +{settings.iqamaCountdown.asr}
              </div>
            </div>

            {/* Maghrib */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-medium mb-2 text-white">
                المغرب
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {settings.prayerTimes.maghrib}
              </div>
              <div className="text-sm text-green-400 font-bold">
                +{settings.iqamaCountdown.maghrib}
              </div>
            </div>

            {/* Isha */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-lg font-medium mb-2 text-white">
                العشاء
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {settings.prayerTimes.isha}
              </div>
              <div className="text-sm text-green-400 font-bold">
                +{settings.iqamaCountdown.isha}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug overlay to help diagnose timezone/clock issues */}
      <div className="fixed right-4 top-4 bg-black/60 text-white text-sm p-3 rounded-md z-50">
        <div className="font-bold mb-1">Debug Time</div>
        <div>System: {new Date().toString()}</div>
        <div>Hook now: {now.toString()}</div>
        <div>Hook getHours(): {now.getHours()}:{String(now.getMinutes()).padStart(2,'0')}:{String(now.getSeconds()).padStart(2,'0')}</div>
        <div>Timezone mapping: {locationMapping.timeZone}</div>
        <div>Intl({locationMapping.timeZone}): {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12:false, timeZone: locationMapping.timeZone }).format(new Date())}</div>
      </div>
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isPanelOpen}
        setIsOpen={setIsPanelOpen}
        settings={settings}
        setSettings={setSettings}
        setBackgroundImage={setBackgroundImage}
        isFetchingTimes={false}
        triggerFetch={() => {}}
      />
    </div>
  );
}
