'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import LoadingScreen from './LoadingScreen';

export default function PreloadWrapper({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const assets = [
      // core assets
      '/assets/darkbulb.png',
      '/assets/lightbulb.png',
      '/assets/mewo.png',
      '/assets/mewo_hover.png',
      '/assets/door_dark.png',
      '/assets/laptop.png',
      '/assets/laptop_hover.png',
      '/assets/sketch_book.png',
      '/assets/tissue_box.png',
      '/assets/cursor.png',
      '/assets/char.png',
      '/assets/select_hover.png',
      '/assets/pupil.png',
      '/assets/me.png',
      '/assets/me_hover.png',
      '/assets/book2.png',
      '/assets/books1.png',
      '/assets/act0.png',
      '/assets/act1.png',
      '/assets/act2.png',
      '/assets/act3.png',
      '/assets/act4.png',
      '/assets/act5.png',
      '/assets/act6.png',
      '/assets/act7.png',
      '/assets/act8.png',
      '/assets/act9.png',
      '/assets/act10.png',
      '/assets/act11.png',
      '/assets/act12.png',
      '/assets/act13.png',
      '/assets/act14.png',
      '/assets/act15.png',
      // faces (moved)
      '/assets/faces/act0.png',
      '/assets/faces/act1.png',
      '/assets/faces/act2.png',
      '/assets/faces/act3.png',
      '/assets/faces/act4.png',
      '/assets/faces/act5.png',
      '/assets/faces/act6.png',
      '/assets/faces/act7.png',
      '/assets/faces/act8.png',
      '/assets/faces/act9.png',
      '/assets/faces/act10.png',
      '/assets/faces/act11.png',
      '/assets/faces/act12.png',
      '/assets/faces/act13.png',
      '/assets/faces/act14.png',
      '/assets/faces/act15.png',
      // contact icons
      '/assets/contacts/google.png',
      '/assets/contacts/linkedin.png',
      '/assets/contacts/upwork.png',
      '/assets/contacts/jobstreet.png',
      '/assets/contacts/facebook.png',
      '/assets/contacts/ig.png',
      '/assets/contacts/tiktok.png',
      '/assets/contacts/discord.png',
    ];
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === assets.length) setIsLoading(false);
    };
    assets.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = onLoad;
      img.onerror = onLoad; // treat error as loaded to avoid stalling
    });
  }, []);

  return isLoading ? <LoadingScreen /> : <>{children}</>;
}
