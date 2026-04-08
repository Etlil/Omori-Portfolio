'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [charHovered, setCharHovered] = useState(false);
  const [bulbHovered, setBulbHovered] = useState(false);
  const smoothRef = useRef({ x: 0, y: 0 });
  const targetWobbleRef = useRef({ x: 0, y: 0 });

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    text: string;
    choices: { label: string; action: () => void }[];
  }>({
    isOpen: false,
    text: "",
    choices: []
  });

  const bg = isDark ? 'black' : 'white';
  const fg = isDark ? 'white' : 'black';

  const [isMobile, setIsMobile] = useState(false);

  const handleMewoClick = () => {
    setModalData({
      isOpen: true,
      text: "Mewo has been very, very bad. What would you like to do?",
      choices: [
        {
          label: "VISIT GITHUB",
          action: () => {
            window.open("https://github.com/Etlil/Omori-Portfolio", "_blank");
            setModalData(prev => ({ ...prev, isOpen: false }));
          }
        },
        {
          label: "DO NOTHING",
          action: () => setModalData(prev => ({ ...prev, isOpen: false }))
        }
      ]
    });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x, y });
      targetWobbleRef.current = { x: x * 18, y: y * 10 };
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const startGyro = () => {
    const handler = (e: DeviceOrientationEvent) => {
      const targetX = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30));
      const targetY = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 20) / 30));

      smoothRef.current.x += (targetX - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (targetY - smoothRef.current.y) * 0.1;

      setTilt({ x: smoothRef.current.x, y: smoothRef.current.y });
      targetWobbleRef.current = { x: smoothRef.current.x * 18, y: smoothRef.current.y * 10 };
    };
    if (
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then(res => {
          if (res === 'granted') {
            window.addEventListener('deviceorientation', handler, true);
          }
        }).catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handler, true);
    }
  };

  useEffect(() => {
    const isIOS = typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function';
    if (!isIOS) {
      startGyro();
    }
  }, []);

  const bx = targetWobbleRef.current.x;
  const by = targetWobbleRef.current.y;

  const blanketD = [
    `M 60 2`,
    `L 340 2`,
    `L ${400 + bx * 0.2} ${108 + by * 0.2}`,
    `C ${340 + bx} ${118 + by} ${60 + bx} ${118 + by} ${0 + bx * 0.2} ${108 + by * 0.2}`,
    `Z`,
  ].join(' ');

  return (
    <div
      style={{ backgroundColor: bg, transition: 'background-color 0.7s ease' }}
      className="fixed inset-0 overflow-hidden"
    >
      <main
        style={{
          backgroundColor: bg,
          color: fg,
          cursor: `url('/assets/cursor.png') 4 4, pointer`,
          height: '100vh',
          width: '100vw',
        }}
        className="flex flex-col items-center justify-center transition-colors duration-700 relative"
      >
        <div style={{
          opacity: isDark ? 0.1 : 0.03,
          position: 'absolute', inset: 0,
          backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
          pointerEvents: 'none', zIndex: 0,
        }}/>

        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 30 }}>
          <h1 style={{ color: fg, opacity: 0.4 }} className="text-base font-bold tracking-[0.25em] uppercase">My Portfolio</h1>
        </div>

        <div
          style={{
            transform: `translate(${tilt.x * 12}px, ${tilt.y * 12}px) translateY(${bulbHovered ? '-6px' : '0'})`,
            position: 'absolute',
            top: isMobile ? '15%' : '10%',
            right: isMobile ? '15%' : '25%',
            zIndex: 40,
            cursor: `url('/assets/cursor.png') 4 4, pointer`,
            transition: 'all 0.4s ease',
          }}
          onClick={() => setIsDark(!isDark)}
        >
          {bulbHovered && <Tooltip text={isDark ? 'Light' : 'Dark'} bg={bg} fg={fg} />}
          <div
            style={{ position: 'relative', width: isMobile ? '50px' : '60px', height: '70px' }}
            onMouseEnter={() => setBulbHovered(true)}
            onMouseLeave={() => setBulbHovered(false)}
            onTouchStart={() => setBulbHovered(true)}
          >
            <Image src={isDark ? '/assets/darkbulb.png' : '/assets/lightbulb.png'} alt="Bulb" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
            <svg style={{ position: 'absolute', top: isMobile ? '-400px' : '-120px', left: '50%', transform: 'translateX(-50%)', overflow: 'visible' }} width="2" height={isMobile ? "400" : "120"}>
              <line x1="1" y1="0" x2="1" y2={isMobile ? "410" : "130"} stroke={fg} strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '25%' : '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '95%' : '100%',
            maxWidth: '800px',
            height: '400px',
            zIndex: 10,
            pointerEvents: 'none',
            transition: 'bottom 0.4s ease'
          }}
        >
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '140px' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="none">
              <defs>
                <pattern id="stripes" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
                  <line x1="0" y1="0" x2="0" y2="18" stroke={fg} strokeWidth="1" opacity="0.07"/>
                </pattern>
                <clipPath id="blanketClip"><path d={blanketD}/></clipPath>
              </defs>
              <path d={blanketD} fill={isDark ? '#111' : '#f5f5f5'} stroke={fg} strokeWidth="1.5" />
              <rect x="0" y="0" width="400" height="140" fill="url(#stripes)" clipPath="url(#blanketClip)"/>
            </svg>
          </div>

          <div style={{ position: 'absolute', top: '0%', left: '10%', pointerEvents: 'auto', zIndex: 2 }}>
            <SceneItem label="Door" isDark={isDark}>
              <div style={{ position: 'relative', width: isMobile ? '130px' : '180px', height: isMobile ? '150px' : '210px' }}>
                <Image src={isDark ? '/assets/door_dark.png' : '/assets/door_light.jpg'} alt="Door" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '20%', left: '10%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 5}px, ${tilt.y * 5}px)` }}>
            <SceneItem label="Contacts" isDark={isDark} href="#projects" hoverSrc="/assets/laptop_hover.png">
              <div style={{ position: 'relative', width: isMobile ? '60px' : '80px', height: '60px' }}>
                <Image src="/assets/laptop.png" alt="Laptop" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '20%', right: '10%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 5}px, ${tilt.y * 5}px)` }}>
            <SceneItem label="Projects" isDark={isDark} href="#about">
              <div style={{ position: 'relative', width: isMobile ? '45px' : '55px', height: '60px' }}>
                <Image src="/assets/sketch_book.png" alt="Sketch" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '-5%', left: '0%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 10}px, ${tilt.y * 8}px)` }}>
            <SceneItem label="Mewo" isDark={isDark} hoverSrc="/assets/mewo_hover.png" onClick={handleMewoClick}>
              <div style={{ position: 'relative', width: isMobile ? '70px' : '90px', height: '70px' }}>
                <Image src="/assets/mewo.png" alt="Mewo" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '5%', right: '5%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 10}px, ${tilt.y * 8}px)` }}>
            <SceneItem label="Skills" isDark={isDark} href="#contact">
              <div style={{ position: 'relative', width: isMobile ? '50px' : '60px', height: '50px' }}>
                <Image src="/assets/tissue_box.png" alt="Tissue" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>
        </div>

        <div
          style={{
            transform: `translate(${tilt.x * (isMobile ? 15 : 30)}px, ${tilt.y * (isMobile ? 15 : 30)}px) translateX(-50%)`,
            position: 'absolute',
            bottom: isMobile ? '5%' : '-15%',
            left: '50%',
            zIndex: 25,
            pointerEvents: 'none',
            transition: 'transform 0.12s ease-out, bottom 0.3s ease',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: isMobile ? '200px' : '300px',
              height: isMobile ? '350px' : '610px',
              pointerEvents: 'auto',
              cursor: `url('/assets/cursor.png') 4 4, pointer`,
            }}
            onMouseEnter={() => setCharHovered(true)}
            onMouseLeave={() => setCharHovered(false)}
          >
            {charHovered && <Tooltip text="About Me" bg={bg} fg={fg} />}
            <Image
              src="/assets/char.png"
              alt="Character"
              fill
              style={{
                imageRendering: 'pixelated', objectFit: 'contain',
                transform: charHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.15s ease',
              }}
            />
          </div>
        </div>

      </main>

      <OmoriModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        choices={modalData.choices}
        onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
        bg={bg} 
        fg={fg} 
      />

    </div>
  );
}

function Tooltip({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: bg, border: `2px solid ${fg}`, padding: '3px 10px',
      fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
      whiteSpace: 'nowrap', color: fg, zIndex: 100, pointerEvents: 'none',
      marginBottom: '8px'
    }}>
      {text}
      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${fg}` }} />
    </div>
  );
}

function OmoriModal({
  isOpen,
  text,
  choices,
  onClose,
  bg, 
  fg  
}: {
  isOpen: boolean;
  text: string;
  choices: { label: string; action: () => void }[];
  onClose: () => void;
  bg: string;
  fg: string;
}) {
  if (!isOpen) return null;

  // We REVERSE the colors here:
  // If the page background is white, the modal background is black.
  const modalBg = fg; 
  const modalFg = bg;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop - subtle tint using the page's background color */}
      <div 
        className="absolute inset-0 opacity-40" 
        style={{ backgroundColor: bg }} 
        onClick={onClose} 
      />

      {/* 1. CHOICES BOX - Fixed at Bottom 50%, Left 0% */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '50%', 
          right: '0%', 
          zIndex: 101,
          backgroundColor: modalBg,
          borderColor: modalFg,
          color: modalFg,
          borderWidth: '3px',
          // The Omori double-border effect
          boxShadow: `0 0 0 3px ${modalBg}` 
        }}
        className="p-4 min-w-[240px]"
      >
        {choices.map((choice, index) => (
          <div
            key={index}
            onClick={(e) => { e.stopPropagation(); choice.action(); }}
            className="group flex items-center gap-4 cursor-pointer py-2"
          >
            {/* THE HAND (Left side of text) */}
            <div className="w-8 h-6 relative hidden group-hover:block shrink-0">
              <Image
                src="/assets/select_hover.png"
                alt="select"
                fill
                style={{ 
                  imageRendering: 'pixelated', 
                  objectFit: 'contain',
                  // Inverts the hand color so it's always visible against the modalBg
                  filter: modalBg === 'black' ? 'invert(1)' : 'none' 
                }}
              />
            </div>
            
            {/* Spacer for alignment when hand is hidden */}
            <div className="w-8 h-6 group-hover:hidden shrink-0" />

            <span className="text-xl uppercase tracking-widest font-omori whitespace-nowrap">
              {choice.label}
            </span>
          </div>
        ))}
      </div>

      {/* 2. DIALOGUE BOX - Fixed at Bottom 0% */}
      <div
        style={{ 
          position: 'fixed', 
          bottom: '0%', 
          left: '0%', 
          width: '100%', 
          zIndex: 101,
          backgroundColor: modalBg,
          borderTop: `3px solid ${modalFg}`,
          color: modalFg,
          boxShadow: `0 -3px 0 3px ${modalBg}` 
        }}
        className="p-8 min-h-[160px]"
      >
        <p className="text-2xl font-omori leading-relaxed tracking-wider max-w-4xl mx-auto">
          {text}
        </p>
      </div>
    </div>
  );
}

function SceneItem({
  label, isDark, children, href, onClick, hoverSrc,
}: {
  label: string;
  isDark: boolean;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  hoverSrc?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const fg = isDark ? 'white' : 'black';
  const bg = isDark ? 'black' : 'white';

  const inner = (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.15s ease',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        cursor: `url('/assets/cursor.png') 4 4, pointer`,
        minWidth: '60px',
        minHeight: '60px',
        padding: '10px',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => { setTimeout(() => setHovered(false), 600); onClick?.(); }}
      onClick={onClick}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: bg, border: `2px solid ${fg}`,
          boxShadow: 'none',
          padding: '3px 10px', fontSize: '10px',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          whiteSpace: 'nowrap', color: fg,
          fontFamily: 'inherit', zIndex: 20, pointerEvents: 'none',
        }}>
          {label}
          <div style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)', width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: `6px solid ${fg}`,
          }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% - 2px)', left: '50%',
            transform: 'translateX(-50%)', width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: `5px solid ${bg}`, zIndex: 1,
          }}/>
        </div>
      )}

      {hoverSrc ? (
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: hovered ? 0 : 1, transition: 'opacity 0.1s' }}>
            {children}
          </div>
          {hovered && (
            <div style={{ position: 'absolute', inset: 0 }}>
              <Image
                src={hoverSrc}
                alt="hover"
                fill
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>
      ) : children}
    </div>
  );

  if (href) return (
    <a href={href} style={{ textDecoration: 'none', WebkitTapHighlightColor: 'transparent' }}>
      {inner}
    </a>
  );
  return inner;
}