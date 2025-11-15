import React from 'react';
import { hadiths } from '../data/hadiths';
import { postPrayerAdhkar } from '../data/adhkar';

interface DimmingOverlayProps {
  isVisible: boolean;
  currentPrayer?: string;
  currentHadith?: string;
  showAdhkar: boolean;
}

export function DimmingOverlay({ isVisible, currentPrayer, currentHadith, showAdhkar }: DimmingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {!showAdhkar && currentHadith && (
        <div className="text-center p-8 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">حديث شريف</h2>
          <p className="text-2xl text-white">{currentHadith}</p>
        </div>
      )}
      
      {showAdhkar && currentPrayer && (
        <div className="bg-white/10 rounded-lg p-8 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">أذكار ما بعد الصلاة</h2>
          <ul className="space-y-4">
            {(postPrayerAdhkar[currentPrayer as keyof typeof postPrayerAdhkar] || postPrayerAdhkar.default).map((dhikr, index) => (
              <li key={index} className="text-xl text-white">{dhikr}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
