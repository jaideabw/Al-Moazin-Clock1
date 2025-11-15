// ملف إدارة الأصول المحلية (الصور والأصوات)

export interface BackgroundImage {
  id: string;
  name: string;
  path: string;
  description: string;
}

export interface AdhanSound {
  id: string;
  name: string;
  path: string;
  reciter: string;
  description: string;
}

// قائمة صور الخلفيات المتاحة
export const backgroundImages: BackgroundImage[] = [
  {
    id: 'bg1',
    name: 'خلفية مسجد 1',
    path: '/backgrounds/background1.jpg',
    description: 'صورة مسجد جميلة'
  },
  {
    id: 'bg2',
    name: 'خلفية مسجد 2',
    path: '/backgrounds/background2.jpg',
    description: 'مسجد مع منظر جميل'
  },
  {
    id: 'bg3',
    name: 'خلفية مسجد 3',
    path: '/backgrounds/background3.jpg',
    description: 'مسجد بتصميم رائع'
  },
  {
    id: 'hr1',
    name: 'الحرم المكي 1',
    path: '/backgrounds/HR-1.jpg',
    description: 'صورة الحرم المكي الشريف'
  },
  {
    id: 'hr2',
    name: 'الحرم المكي 2',
    path: '/backgrounds/HR-2.jpg',
    description: 'منظر آخر للحرم المكي'
  },
  {
    id: 'vr1',
    name: 'المسجد النبوي 1',
    path: '/backgrounds/VR-1.jpg',
    description: 'المسجد النبوي الشريف'
  },
  {
    id: 'vr2',
    name: 'المسجد النبوي 2',
    path: '/backgrounds/VR-2.jpg',
    description: 'منظر آخر للمسجد النبوي'
  },
  {
    id: 'webp1',
    name: 'خلفية إسلامية 1',
    path: '/backgrounds/100.webp',
    description: 'تصميم إسلامي جميل'
  },
  {
    id: 'webp2',
    name: 'خلفية إسلامية 2',
    path: '/backgrounds/101.webp',
    description: 'تصميم إسلامي رائع'
  }
];

// قائمة أصوات الأذان المتاحة
export const adhanSounds: AdhanSound[] = [
  {
    id: 'short_azan',
    name: 'أذان قصير',
    path: '/audio/short_azan.mp3',
    reciter: 'قارئ مميز',
    description: 'أذان قصير وجميل'
  },
  {
    id: 'audio_fajr',
    name: 'أذان الفجر',
    path: '/audio/audio_fajr.mp3',
    reciter: 'قارئ الفجر',
    description: 'أذان مخصص لصلاة الفجر'
  },
  {
    id: 'audio_dhar',
    name: 'أذان الظهر',
    path: '/audio/audio_dhar.mp3',
    reciter: 'قارئ الظهر',
    description: 'أذان مخصص لصلاة الظهر'
  },
  {
    id: 'short_iqama',
    name: 'إقامة قصيرة',
    path: '/audio/short_iqama.mp3',
    reciter: 'قارئ الإقامة',
    description: 'إقامة قصيرة للصلاة'
  }
];

// دالة للحصول على صورة خلفية بالمعرف
export const getBackgroundById = (id: string): BackgroundImage | undefined => {
  return backgroundImages.find(bg => bg.id === id);
};

// دالة للحصول على صوت أذان بالمعرف
export const getAdhanSoundById = (id: string): AdhanSound | undefined => {
  return adhanSounds.find(sound => sound.id === id);
};

// دالة للتحقق من وجود ملف
export const checkFileExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// دالة لتحميل الخلفيات المتاحة فقط
export const getAvailableBackgrounds = async (): Promise<BackgroundImage[]> => {
  const availableBackgrounds: BackgroundImage[] = [];
  
  for (const bg of backgroundImages) {
    const exists = await checkFileExists(bg.path);
    if (exists) {
      availableBackgrounds.push(bg);
    }
  }
  
  return availableBackgrounds;
};

// دالة لتحميل الأصوات المتاحة فقط
export const getAvailableAdhanSounds = async (): Promise<AdhanSound[]> => {
  const availableSounds: AdhanSound[] = [];
  
  for (const sound of adhanSounds) {
    const exists = await checkFileExists(sound.path);
    if (exists) {
      availableSounds.push(sound);
    }
  }
  
  return availableSounds;
};
