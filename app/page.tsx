'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [blanketWobble, setBlanketWobble] = useState({ x: 0, y: 0 });
  const [charHovered, setCharHovered] = useState(false);
  const [bulbHovered, setBulbHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const smoothRef = useRef({ x: 0, y: 0 });
  const wobbleRef = useRef({ x: 0, y: 0 });
  const targetWobbleRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  const bg = isDark ? 'black' : 'white';
  const fg = isDark ? 'white' : 'black';

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Check on load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x, y });
      targetWobbleRef.current = { x: x * 18, y: y * 10 };
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    const isIOS = typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function';
    if (!isIOS) {
      startGyro();
    }
  }, []);

  useEffect(() => {
    const handleTouchStart = () => setIsTouching(true);
    const handleTouchEnd = () => setIsTouching(false);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('mousedown', handleTouchStart);
    window.addEventListener('mouseup', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleTouchStart);
      window.removeEventListener('mouseup', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      wobbleRef.current.x += (targetWobbleRef.current.x - wobbleRef.current.x) * 0.06;
      wobbleRef.current.y += (targetWobbleRef.current.y - wobbleRef.current.y) * 0.06;
      setBlanketWobble({ x: wobbleRef.current.x, y: wobbleRef.current.y });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const startGyro = () => {
    const handler = (e: DeviceOrientationEvent) => {
      if (isTouching) return;
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

  const layer = (depth: number) => ({
    transform: `translate(${tilt.x * depth * 12}px, ${tilt.y * depth * 12}px)`,
    transition: 'transform 0.12s ease-out',
  });

  const bx = blanketWobble.x;
  const by = blanketWobble.y;

  const blanketD = [
    `M 60 2`,
    `L 340 2`,
    `L ${400 + bx * 0.2} ${108 + by * 0.2}`,
    `C ${340 + bx} ${118 + by} ${60 + bx} ${118 + by} ${0 + bx * 0.2} ${108 + by * 0.2}`,
    `Z`,
  ].join(' ');

  const fringeCount = 10;
  const fringePoints = Array.from({ length: fringeCount }, (_, i) => {
    const t = i / (fringeCount - 1);
    const baseX = t * 400;
    const curveX = baseX + bx * (0.2 + t * 0.6);
    const curveY = 112 + by * (0.2 + Math.sin(t * Math.PI) * 0.8);
    return { x: curveX, y: curveY };
  });

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
        {/* Background noise */}
        <div style={{
          opacity: isDark ? 0.1 : 0.03,
          position: 'absolute', inset: 0,
          backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
          pointerEvents: 'none', zIndex: 0,
        }}/>

        {/* Blanket/Floor SVG */}
        <div 
          style={{ 
            position: 'absolute', 
            // This moves it up 120px on mobile, but keeps it at 0 on PC
            bottom: isMobile ? '120px' : '0', 
            left: 0, 
            right: 0, 
            height: '300px', 
            zIndex: 1, 
            pointerEvents: 'none',
            transition: 'bottom 0.3s ease' // Smooth transition if resizing
          }}
        >
          <svg 
            width="100%" 
            height="140" 
            viewBox="0 0 400 140" 
            preserveAspectRatio="none" 
            style={{ display: 'block' }}
          >
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

        <div className="relative w-full h-full max-w-2xl flex items-center justify-center">
          
          {/* Header Title */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 30 }}>
            <h1 style={{ color: fg, opacity: 0.4 }} className="text-base font-bold tracking-[0.25em] uppercase">My Portfolio</h1>
          </div>

          {/* Door — Middle Left on Mobile */}
          <div style={{ 
            position: 'absolute', 
            top: isMobile ? '25%' : '10%', // Moved down to 30% on mobile
            left: isMobile ? '5%' : '15%', 
            zIndex: 2,
            transition: 'all 0.4s ease'
          }}>
            <SceneItem label="Door" isDark={isDark}>
              <div style={{ 
                position: 'relative', 
                width: isMobile ? '160px' : '200px', 
                height: isMobile ? '178px' : '233px' 
              }}>
                <Image 
                  src={isDark ? '/assets/door_dark.png' : '/assets/door_light.jpg'} 
                  alt="Door" 
                  fill 
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }} 
                />
              </div>
            </SceneItem>
          </div>

          {/* Light Bulb — Middle Right on Mobile */}
          <div
            style={{
              transform: `translate(${tilt.x * 12}px, ${tilt.y * 12}px) translateY(${bulbHovered ? '-6px' : '0'})`,
              position: 'absolute', 
              top: isMobile ? '28%' : '10%', // Moved down to 28% on mobile
              right: isMobile ? '20%' : '25%', 
              zIndex: 15,
              cursor: `url('/assets/cursor.png') 4 4, pointer`,
              transition: 'all 0.4s ease',
            }}
            onClick={() => setIsDark(!isDark)}
          >
            {bulbHovered && <Tooltip text={isDark ? 'Light' : 'Dark'} bg={bg} fg={fg} />}
            
            <div 
              style={{ 
                position: 'relative', 
                width: isMobile ? '50px' : '60px', 
                height: isMobile ? '70px' : '80px' 
              }} 
              onMouseEnter={() => setBulbHovered(true)} 
              onMouseLeave={() => setBulbHovered(false)}
              onTouchStart={() => setBulbHovered(true)}
            >
              <Image 
                src={isDark ? '/assets/darkbulb.png' : '/assets/lightbulb.png'} 
                alt="Bulb" 
                fill 
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }} 
              />
              
              {/* THE LONG WIRE */}
              <svg 
                style={{ 
                  position: 'absolute', 
                  // On mobile, the wire needs to go up 400px to ensure it hits the top
                  top: isMobile ? '-400px' : '-120px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  overflow: 'visible' 
                }} 
                width="2" 
                height={isMobile ? "400" : "120"}
              >
                <line 
                  x1="1" y1="0" 
                  x2="1" 
                  // Extension to make sure it tucks into the bulb image
                  y2={isMobile ? "410" : "130"} 
                  stroke={fg} 
                  strokeWidth="2" 
                />
              </svg>
            </div>
          </div>

          {/* Laptop */}
          <div style={{ 
            transform: `translate(${tilt.x * 5}px, ${tilt.y * 8}px)`, 
            position: 'absolute', 
            top: isMobile ? '48%' : '47%', // Moved up from 55%
            left: isMobile ? '12%' : '15%', 
            zIndex: 20, 
            transition: 'transform 0.12s ease-out, top 0.3s ease' 
          }}>
            <SceneItem label="Contacts" isDark={isDark} href="#projects" hoverSrc="/assets/laptop_hover.png">
              <div style={{ position: 'relative', width: isMobile ? '65px' : '90px', height: '70px' }}>
                <Image src="/assets/laptop.png" alt="Laptop" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          {/* Sketchbook */}
          <div style={{ 
            transform: `translate(${tilt.x * 5}px, ${tilt.y * 8}px)`, 
            position: 'absolute', 
            top: isMobile ? '48%' : '49%', // Moved up from 57%
            right: isMobile ? '7%' : '14%', 
            zIndex: 20, 
            transition: 'transform 0.12s ease-out, top 0.3s ease' 
          }}>
            <SceneItem label="Projects" isDark={isDark} href="#about">
              <div style={{ position: 'relative', width: isMobile ? '45px' : '60px', height: '75px' }}>
                <Image src="/assets/sketch_book.png" alt="Sketch" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          {/* Mewo */}
          <div style={{ 
            transform: `translate(${tilt.x * 12}px, ${tilt.y * 8}px)`, 
            position: 'absolute', 
            top: isMobile ? '59%' : '58%', // Moved up from 64%
            left: isMobile ? '5%' : '6%', 
            zIndex: 20, 
            transition: 'transform 0.12s ease-out, top 0.3s ease' 
          }}>
            <SceneItem label="Mewo" isDark={isDark} hoverSrc="/assets/mewo_hover.png">
              <div style={{ position: 'relative', width: isMobile ? '75px' : '100px', height: '90px' }}>
                <Image src="/assets/mewo.png" alt="Mewo" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          {/* Tissue Box */}
          <div style={{ 
            transform: `translate(${tilt.x * 12}px, ${tilt.y * 8}px)`, 
            position: 'absolute', 
            top: isMobile ? '55%' : '60%', // Moved up from 66%
            right: isMobile ? '10%' : '7%', 
            zIndex: 20, 
            transition: 'transform 0.12s ease-out, top 0.3s ease' 
          }}>
            <SceneItem label="Skills" isDark={isDark} href="#contact">
              <div style={{ position: 'relative', width: isMobile ? '50px' : '65px', height: '60px' }}>
                <Image src="/assets/tissue_box.png" alt="Tissue Box" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          {/* OMORI Character — Hitbox fixed with scaling */}
          <div
            style={{
              // Parallax: Less intense on mobile (15px) than PC (30px)
              transform: `translate(${tilt.x * (isMobile ? 15 : 30)}px, ${tilt.y * (isMobile ? 15 : 30)}px) translateX(-50%)`,
              
              position: 'absolute', 
              
              // Bottom: Move him slightly higher on mobile (-5% or -10%) so he's more visible
              bottom: isMobile ? '20%' : '-15%', 
              
              left: '50%',
              zIndex: 5, 
              pointerEvents: 'none', 
              transition: 'transform 0.12s ease-out, bottom 0.3s ease',
            }}
          >
            <div 
              style={{ 
                position: 'relative', 
                width: isMobile ? '200px' : '300px', // Scaling the hitbox
                height: isMobile ? '350px' : '610px', 
                pointerEvents: 'auto', // Only character is clickable
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

        </div>
      </main>
    </div>
  );
}

// ─── Reusable Tooltip Component ──────────────────────────────────────────
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

// ─── SceneItem ────────────────────────────────────────────────────────────────
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
        zIndex: 10, // Ensure items are higher than the character's base layer
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

      {/* Swap to hoverSrc image on hover if provided */}
      {hoverSrc ? (
        <div style={{ position: 'relative' }}>
          {/* Clone children but hidden, swap with hover img */}
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