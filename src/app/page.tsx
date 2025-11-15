
"use client";

import { useState } from 'react';
import AlMoazinClock from '@/components/AlMoazinClock';

export default function Home() {
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
    >
      <AlMoazinClock setBackgroundImage={setBackgroundImage} />
    </div>
  );
}
