"use client";

import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { ClockSettings, ColorSettings } from './AlMoazinClock';
import { Slider } from './ui/slider';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries, citiesByCountry } from '@/lib/locations';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  settings: ClockSettings;
  setSettings: Dispatch<SetStateAction<ClockSettings>>;
  setBackgroundImage: (image: string) => void;
  isFetchingTimes: boolean;
  triggerFetch: (force: boolean) => void;
}

const prayerNames = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

type PrayerKey = keyof typeof prayerNames;

// دالة لحساب الفرق بالدقائق بين وقتين بصيغة HH:MM
const calculateTimeDifference = (time1: string, time2: string): number => {
  if (!time1 || !time2 || !time1.includes(':') || !time2.includes(':')) return 0;
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  
  let diff = (h1 * 60 + m1) - (h2 * 60 + m2);
  // handle day wrap-around
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
};

export function SettingsPanel({ isOpen, setIsOpen, settings, setSettings, setBackgroundImage, isFetchingTimes, triggerFetch }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<ClockSettings>(settings);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [originalPrayerTimes, setOriginalPrayerTimes] = useState<typeof settings.prayerTimes | null>(null);
  const [originalShuruqTime, setOriginalShuruqTime] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      // تخزين الأوقات الأصلية من API لحساب الـ offsets
      const storedTimesData = localStorage.getItem('alMoazinPrayerTimes');
      if (storedTimesData) {
        try {
          const { times, shuruq } = JSON.parse(storedTimesData);
          if (times) {
            setOriginalPrayerTimes(times);
          }
          if (shuruq) {
            setOriginalShuruqTime(shuruq);
          }
        } catch (e) {
          setOriginalPrayerTimes(null);
          setOriginalShuruqTime(null);
        }
      }
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (localSettings.country) {
      const cities = citiesByCountry[localSettings.country] || [];
      setAvailableCities(cities);
      if (!cities.includes(localSettings.city)) {
          handleSettingChange('city', cities[0] || '');
      }
    } else {
      setAvailableCities([]);
    }
  }, [localSettings.country, isOpen]);


  const handleSettingChange = <K extends keyof ClockSettings>(key: K, value: ClockSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleColorChange = <K extends keyof ColorSettings>(key: K, value: ColorSettings[K]) => {
    setLocalSettings(prev => ({
        ...prev,
        colors: { ...prev.colors, [key]: value }
    }));
  };

  const handlePrayerTimeChange = (prayer: PrayerKey, value: string) => {
    setLocalSettings(prev => {
      // حساب الـ offset بناءً على الفرق بين الوقت الجديد والوقت الأصلي من API
      const newOffsets = { ...(prev.prayerTimeOffsets || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }) };
      
      if (originalPrayerTimes && originalPrayerTimes[prayer]) {
        const diff = calculateTimeDifference(value, originalPrayerTimes[prayer]);
        newOffsets[prayer] = diff;
      }
      
      return {
        ...prev,
        prayerTimes: { ...prev.prayerTimes, [prayer]: value },
        prayerTimeOffsets: newOffsets,
      };
    });
  };

  const handleIqamaCountdownChange = (prayer: PrayerKey, value: string) => {
    const minutes = parseInt(value, 10);
    if (isNaN(minutes)) return;
    setLocalSettings(prev => ({
        ...prev,
        iqamaCountdown: { ...prev.iqamaCountdown, [prayer]: minutes },
    }));
  };
  
  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
            handleSettingChange('backgroundImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdhanImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
            handleSettingChange('adhanImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIqamaBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
            handleSettingChange('iqamaBackgroundImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdhanSoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
            handleSettingChange('adhanSound', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAndClose = () => {
    const hasLocationChanged = localSettings.country !== settings.country || localSettings.city !== settings.city;
    console.log('💾 حفظ الإعدادات الجديدة...');
    setSettings(localSettings);
    if (hasLocationChanged) {
      triggerFetch(true);
    }
    setIsOpen(false);
    console.log('✅ تم حفظ الإعدادات وإغلاق اللوحة');
  };
  
  const handleCountryChange = (value: string) => {
    handleSettingChange('country', value);
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>إعدادات الساعة</SheetTitle>
          <SheetDescription>
            قم بتخصيص مظهر ومعلومات شاشة الساعة.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="flex-grow pr-4">
          <Accordion type="multiple" defaultValue={['general']} className="w-full">
            <AccordionItem value="general">
              <AccordionTrigger>معلومات عامة</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mosque-name">اسم المسجد</Label>
                  <Input id="mosque-name" value={localSettings.mosqueName} onChange={e => handleSettingChange('mosqueName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">الدولة</Label>
                  <Select
                    value={localSettings.country}
                    onValueChange={handleCountryChange}
                    dir="rtl"
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="اختر دولة" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                   <div className="flex gap-2">
                    <Select
                      value={localSettings.city}
                      onValueChange={value => handleSettingChange('city', value)}
                      disabled={!localSettings.country}
                      dir="rtl"
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder={!localSettings.country ? "اختر دولة أولاً" : "اختر مدينة"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => triggerFetch(true)} disabled={isFetchingTimes} aria-label="تحديث المواقيت">
                       <RefreshCw className={cn("h-4 w-4", isFetchingTimes && "animate-spin")} />
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="iqama-countdown">
                <AccordionTrigger>أوقات الإقامة</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">أدخل مدة الانتظار بين الأذان والإقامة (بالدقائق).</p>
                        <div className="space-y-2">
                          <Label htmlFor="iqama-background-image">صورة خلفية شاشة الإقامة</Label>
                          <Input id="iqama-background-image" type="file" accept="image/*" onChange={handleIqamaBackgroundImageChange} />
                        </div>
                        {Object.keys(prayerNames).map(prayer => (
                            <div key={prayer} className="space-y-2">
                                <Label htmlFor={`${prayer}-iqama-countdown`}>{prayerNames[prayer as PrayerKey]}</Label>
                                <Input
                                    id={`${prayer}-iqama-countdown`}
                                    type="number"
                                    value={localSettings.iqamaCountdown[prayer as PrayerKey]}
                                    onChange={e => handleIqamaCountdownChange(prayer as PrayerKey, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="prayer-times">
              <AccordionTrigger>أوقات الصلاة (يدوي)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">أدخل الأوقات بصيغة HH:MM. سيتم تجاوز هذه الإعدادات عند اختيار دولة ومدينة.</p>
                  <div className="space-y-2">
                      <h4 className="font-semibold text-card-foreground">الشروق</h4>
                       <Input id='shuruq-time' type="time" value={localSettings.shuruqTime} onChange={e => {
                         const newValue = e.target.value;
                         setLocalSettings(prev => {
                           let newOffset = prev.shuruqOffset || 0;
                           if (originalShuruqTime) {
                             newOffset = calculateTimeDifference(newValue, originalShuruqTime);
                           }
                           return { ...prev, shuruqTime: newValue, shuruqOffset: newOffset };
                         });
                       }} />
                  </div>
                   <div className="space-y-2">
                      <h4 className="font-semibold text-card-foreground">الجمعة</h4>
                       <Input id='jumuah-time' type="time" value={localSettings.jumuahTime} onChange={e => handleSettingChange('jumuahTime', e.target.value)} />
                  </div>
                  {Object.keys(prayerNames).map(prayer => (
                    <div key={prayer} className="space-y-2">
                        <Label htmlFor={`${prayer}-time`}>{prayerNames[prayer as PrayerKey]}</Label>
                        <Input 
                          id={`${prayer}-time`} 
                          type="time" 
                          value={localSettings.prayerTimes[prayer as PrayerKey] || ''} 
                          onChange={e => handlePrayerTimeChange(prayer as PrayerKey, e.target.value)} 
                        />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="display">
              <AccordionTrigger>العرض والمظهر</AccordionTrigger>
              <AccordionContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="time-adjustment">تعديل الساعة (بالدقائق)</Label>
                  <Input id="time-adjustment" type="number" value={0} onChange={e => {}} disabled={true} />
                  <p className="text-sm text-muted-foreground">الميزة معطلة حاليًا - الإعدادات اليدوية دائمة</p>
                </div>
                 <div className="flex items-center justify-between">
                  <Label htmlFor="time-format">استخدام تنسيق 24 ساعة</Label>
                  <Switch id="time-format" checked={localSettings.timeFormat === '24h'} onCheckedChange={checked => handleSettingChange('timeFormat', checked ? '24h' : '12h')} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-weather">إظهار الطقس</Label>
                   <Switch id="show-weather" checked={localSettings.showWeather} onCheckedChange={checked => handleSettingChange('showWeather', checked)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="temperature">درجة الحرارة (مئوية)</Label>
                  <Input id="temperature" type="number" value={localSettings.temperature} onChange={e => handleSettingChange('temperature', parseInt(e.target.value, 10) || 0)} disabled={true} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dim-duration">مدة التعتيم بعد الأذان (بالدقائق)</Label>
                  <Input id="dim-duration" type="number" value={localSettings.dimDuration} onChange={e => handleSettingChange('dimDuration', parseInt(e.target.value, 10) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background-image">صورة الخلفية</Label>
                  <Input id="background-image" type="file" accept="image/*" onChange={handleBackgroundImageChange} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="colors">
                <AccordionTrigger>تخصيص الألوان</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="text-color">لون الخط العام</Label>
                        <Input id="text-color" type="color" value={localSettings.colors.textColor} onChange={e => handleColorChange('textColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="next-prayer-text-color">لون نص الصلاة القادمة</Label>
                        <Input id="next-prayer-text-color" type="color" value={localSettings.colors.nextPrayerTextColor} onChange={e => handleColorChange('nextPrayerTextColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="iqama-countdown-text-color">لون نص العد التنازلي للإقامة</Label>
                        <Input id="iqama-countdown-text-color" type="color" value={localSettings.colors.iqamaCountdownTextColor} onChange={e => handleColorChange('iqamaCountdownTextColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="azkar-text-color">لون نص الأذكار</Label>
                        <Input id="azkar-text-color" type="color" value={localSettings.colors.azkarTextColor} onChange={e => handleColorChange('azkarTextColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shuruq-box-color">لون خلفية مربع الشروق</Label>
                        <Input id="shuruq-box-color" type="color" value={localSettings.colors.shuruqBoxColor} onChange={e => handleColorChange('shuruqBoxColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clock-box-color">لون خلفية مربع الساعة</Label>
                        <Input id="clock-box-color" type="color" value={localSettings.colors.clockBoxColor} onChange={e => handleColorChange('clockBoxColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jumuah-box-color">لون خلفية مربع الجمعة</Label>
                        <Input id="jumuah-box-color" type="color" value={localSettings.colors.jumuahBoxColor} onChange={e => handleColorChange('jumuahBoxColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prayer-boxes-color">لون خلفية مربعات الصلاة</Label>
                        <Input id="prayer-boxes-color" type="color" value={localSettings.colors.prayerBoxesColor} onChange={e => handleColorChange('prayerBoxesColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                </AccordionContent>
            </AccordionItem>

             <AccordionItem value="audio">
                <AccordionTrigger>إعدادات الصوت</AccordionTrigger>
                <AccordionContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="adhan-sound">ملف صوت أذان الصلوات (الظهر، العصر، المغرب، العشاء)</Label>
                      <Input id="adhan-sound" type="file" accept="audio/*" onChange={handleAdhanSoundChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fajr-adhan-sound">ملف صوت أذان الفجر (منفصل)</Label>
                      <Input id="fajr-adhan-sound" type="file" accept="audio/*" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if(event.target?.result) {
                                handleSettingChange('fajrAdhanSound', event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </div>
                    <div className="space-y-2">
                        <Label>مستوى الصوت</Label>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleSettingChange('isMuted', !localSettings.isMuted)}>
                                {localSettings.isMuted ? <VolumeX /> : <Volume2 />}
                            </Button>
                            <Slider
                                value={[localSettings.isMuted ? 0 : localSettings.volume]}
                                onValueChange={([value]) => {
                                  handleSettingChange('volume', value);
                                  if (value > 0 && localSettings.isMuted) {
                                    handleSettingChange('isMuted', false);
                                  }
                                }}
                                max={1}
                                step={0.05}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="prayer-phases">
                <AccordionTrigger>مراحل الصلاة (الأذان، الإقامة، الصورة، الأذكار)</AccordionTrigger>
                <AccordionContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="adhan-duration-minutes">مدة الأذان - الدقائق</Label>
                          <Input id="adhan-duration-minutes" type="number" value={localSettings.adhanDurationMinutes} onChange={e => handleSettingChange('adhanDurationMinutes', parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adhan-duration-seconds">مدة الأذان - الثواني</Label>
                          <Input id="adhan-duration-seconds" type="number" value={localSettings.adhanDurationSeconds} onChange={e => handleSettingChange('adhanDurationSeconds', parseInt(e.target.value, 10) || 0)} />
                          <p className="text-sm text-muted-foreground">يتم اكتشاف انتهاء الأذان تلقائياً. هذه المدة تُستخدم فقط إذا لم يكن هناك ملف صوتي.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adhan-image">صورة شاشة الأذان</Label>
                          <Input id="adhan-image" type="file" accept="image/*" onChange={handleAdhanImageChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adhan-text-position">موضع نص الأذان</Label>
                          <Select
                            value={localSettings.adhanTextPosition}
                            onValueChange={value => handleSettingChange('adhanTextPosition', value as ClockSettings['adhanTextPosition'])}
                            dir="rtl"
                          >
                            <SelectTrigger id="adhan-text-position">
                              <SelectValue placeholder="اختر موضع النص" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">أعلى الشاشة</SelectItem>
                              <SelectItem value="center">وسط الشاشة</SelectItem>
                              <SelectItem value="bottom">أسفل الشاشة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone-image">صورة إغلاق الهاتف</Label>
                          <Input id="phone-image" type="file" accept="image/*" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if(event.target?.result) {
                                    handleSettingChange('phoneImage', event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="azkar-background-image">صورة خلفية شاشة الأذكار</Label>
                          <Input id="azkar-background-image" type="file" accept="image/*" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if(event.target?.result) {
                                    handleSettingChange('azkarBackgroundImage', event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone-image-duration-minutes">مدة عرض صورة الهاتف - الدقائق</Label>
                          <Input id="phone-image-duration-minutes" type="number" value={localSettings.phoneImageDurationMinutes} onChange={e => handleSettingChange('phoneImageDurationMinutes', parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone-image-duration-seconds">مدة عرض صورة الهاتف - الثواني</Label>
                          <Input id="phone-image-duration-seconds" type="number" value={localSettings.phoneImageDurationSeconds} onChange={e => handleSettingChange('phoneImageDurationSeconds', parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="azkar-duration-minutes">مدة عرض الأذكار - الدقائق</Label>
                          <Input id="azkar-duration-minutes" type="number" value={localSettings.azkarDurationMinutes} onChange={e => handleSettingChange('azkarDurationMinutes', parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="azkar-duration-seconds">مدة عرض الأذكار - الثواني</Label>
                          <Input id="azkar-duration-seconds" type="number" value={localSettings.azkarDurationSeconds} onChange={e => handleSettingChange('azkarDurationSeconds', parseInt(e.target.value, 10) || 0)} />
                          <p className="text-sm text-muted-foreground">11 ذكر × 30 ثانية = تقريباً 5.5 دقيقة</p>
                        </div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="about">
                <AccordionTrigger>حول</AccordionTrigger>
                <AccordionContent>
                    <div className="text-sm text-muted-foreground space-y-2" dir="rtl">
                        <p className="font-semibold text-card-foreground">برمجة ناصر عوض للاجهزة الصوتية والاكترونيا</p>
                        <p>الإصدار 1.3.0</p>
                        <p>شاشة ساعة رقمية حديثة وقابلة للتخصيص للمساجد. مصممة لتكون واضحة وجميلة وغنية بالمعلومات.</p>
                        <p>تم تطويرها بعناية. بواسطة ناصر عوض للاجهزة الصوتية والاكترونيات تليفون 0795644423</p>
                    </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
        <SheetFooter className="mt-auto pt-4">
            <Button onClick={saveAndClose} className="w-full">حفظ وإغلاق</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
