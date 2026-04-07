'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [blanketWobble, setBlanketWobble] = useState({ x: 0, y: 0 });
  const [charHovered, setCharHovered] = useState(false);
  const [bulbHovered, setBulbHovered] = useState(false);
  const smoothRef = useRef({ x: 0, y: 0 });
  const wobbleRef = useRef({ x: 0, y: 0 });
  const targetWobbleRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  const bg = isDark ? 'black' : 'white';
  const fg = isDark ? 'white' : 'black';

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
    <main
      style={{
        backgroundColor: bg,
        color: fg,
        cursor: `url('/assets/cursor.png') 4 4, pointer`,
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
      }}
      className="min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-700 relative overflow-hidden"
    >
      {/* Background noise */}
      <div style={{
        opacity: isDark ? 0.1 : 0.03,
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
        pointerEvents: 'none', zIndex: 0,
      }}/>

      {/* Blanket trapezoid */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '300px',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <svg
          width="100%" height="140" viewBox="0 0 400 140"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <defs>
            <pattern id="stripes" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
              <line x1="0" y1="0" x2="0" y2="18" stroke={fg} strokeWidth="1" opacity="0.07"/>
            </pattern>
            <clipPath id="blanketClip">
              <path d={blanketD}/>
            </clipPath>
          </defs>
          <path d={blanketD} fill={isDark ? '#111' : '#f5f5f5'} stroke={fg} strokeWidth="1.5" strokeLinejoin="round"/>
          <rect x="0" y="0" width="400" height="140" fill="url(#stripes)" clipPath="url(#blanketClip)"/>
          <path d={`M 70 18 C 200 24 200 24 330 18`} fill="none" stroke={fg} strokeWidth="1" opacity="0.2"/>
          {fringePoints.map((pt, i) => (
            <line key={i}
              x1={pt.x} y1={pt.y}
              x2={pt.x + (bx * 0.1)} y2={pt.y + 10 + by * 0.1}
              stroke={fg} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
            />
          ))}
        </svg>
      </div>



      <div
        className="flex flex-col items-center gap-6 text-center w-full max-w-2xl"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div style={{ position: 'absolute', top: '5px', left: '20px' }}>
          <h1 style={{ color: fg, opacity: 0.4, fontWeight: 'bold' }} className="text-base tracking-[0.25em] uppercase">
            My Portfolio
          </h1>
        </div>

        <div className="relative w-full" style={{ height: '100vh', position: 'relative' }}>

          {/* Door — left side */}
          <div style={{ position: 'absolute', top: '10%', left: '20%' }}>
            <SceneItem label="Door" isDark={isDark}>
              <div style={{ position: 'relative', width: '200px', height: '233px' }}>
                <Image
                  key={isDark ? 'door-dark' : 'door-light'}
                  src={isDark ? '/assets/door_dark.png' : '/assets/door_light.jpg'}
                  alt="Door"
                  fill
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                />
              </div>
            </SceneItem>
          </div>

          {/* Light Bulb — top right */}
          <div
            style={{
              transform: `translate(${tilt.x * 1 * 12}px, ${tilt.y * 1 * 12}px) translateY(${bulbHovered ? '-6px' : '0'})`,
              position: 'absolute',
              top: '10%',
              right: '30%',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none',
              cursor: `url('/assets/cursor.png') 4 4, pointer`,
              transition: 'transform 0.12s ease-out',
              minWidth: '80px',
              minHeight: '80px',
              padding: '10px',
            }}
            onClick={() => setIsDark(prev => !prev)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsDark(prev => !prev);
              setBulbHovered(false);
            }}
            onMouseEnter={() => setBulbHovered(true)}
            onMouseLeave={() => setBulbHovered(false)}
            onTouchStart={() => setBulbHovered(true)}
          >
            {bulbHovered && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: bg,
                border: `2px solid ${fg}`,
                boxShadow: 'none',
                padding: '3px 10px',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: fg,
                fontFamily: 'inherit',
                zIndex: 20,
                pointerEvents: 'none',
              }}>
                {isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
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
            <div style={{ position: 'relative', width: '60px', height: '80px' }}>
              <Image
                src={isDark ? '/assets/darkbulb.png' : '/assets/lightbulb.png'}
                alt="Light Bulb"
                fill
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
              />
              <svg
                style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', overflow: 'visible' }}
                width="4"
                height="120"
                viewBox="0 0 4 120"
              >
                <line x1="2" y1="0" x2="2" y2="130" stroke={fg} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Laptop — middle left */}
          <div style={{ transform: `translate(${tilt.x * 0.3 * 12}px, ${tilt.y * 0.6 * 12}px)`, position: 'absolute', top: '47%', left: '15%', transition: 'transform 0.12s ease-out' }}>
            <SceneItem label="Contacts" isDark={isDark} href="#projects" hoverSrc="/assets/laptop_hover.png">
              <div style={{ position: 'relative', width: '90px', height: '70px' }}>
                <Image
                  src="/assets/laptop.png"
                  alt="Laptop"
                  fill
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                />
              </div>
            </SceneItem>
          </div>

          {/* Sketchbook — middle right */}
          <div style={{ transform: `translate(${tilt.x * 0.3 * 12}px, ${tilt.y * 0.6 * 12}px)`, position: 'absolute', top: '49%', right: '14%', transition: 'transform 0.12s ease-out' }}>
            <SceneItem label="Projects" isDark={isDark} href="#about">
              <div style={{ position: 'relative', width: '60px', height: '75px' }}>
                <Image
                  src="/assets/sketch_book.png"
                  alt="Sketchbook"
                  fill
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                />
              </div>
            </SceneItem>
          </div>

          {/* Tissue Box — below sketchbook */}
          <div style={{ transform: `translate(${tilt.x * 1 * 12}px, ${tilt.y * 0.6 * 12}px)`, position: 'absolute', top: '60%', right: '7%', transition: 'transform 0.12s ease-out' }}>
            <SceneItem label="Skills" isDark={isDark} href="#contact">
              <div style={{ position: 'relative', width: '65px', height: '60px' }}>
                <Image
                  src="/assets/tissue_box.png"
                  alt="Tissue Box"
                  fill
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                />
              </div>
            </SceneItem>
          </div>

          {/* Mewo — lower left */}
          <div style={{ transform: `translate(${tilt.x * 1 * 12}px, ${tilt.y * 0.6 * 12}px)`, position: 'absolute', bottom: '20%', left: '6%', transition: 'transform 0.12s ease-out' }}>
            <SceneItem label="Github Repo" isDark={isDark} hoverSrc="/assets/mewo_hover.png">
              <div style={{ position: 'relative', width: '110px', height: '98px' }}>
                <Image
                  src="/assets/mewo.png"
                  alt="Mewo"
                  fill
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                />
              </div>
            </SceneItem>
          </div>

          {/* OMORI character — center bottom */}
          <div
            style={{
              transform: `translate(${tilt.x * 2.5 * 12}px, ${tilt.y * 2.5 * 12}px) translateX(-50%)`,
              position: 'absolute',
              bottom: '-20%',
              left: '50%',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: `url('/assets/cursor.png') 4 4, pointer`,
              transition: 'transform 0.12s ease-out',
              minWidth: '100px',
              minHeight: '100px',
              padding: '10px',
            }}
            onMouseEnter={() => setCharHovered(true)}
            onMouseLeave={() => setCharHovered(false)}
            onTouchStart={() => setCharHovered(true)}
            onTouchEnd={() => setTimeout(() => setCharHovered(false), 800)}
          >
            {charHovered && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: bg,
                border: `2px solid ${fg}`,
                boxShadow: 'none',
                padding: '3px 10px',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: fg,
                fontFamily: 'inherit',
                zIndex: 20,
                pointerEvents: 'none',
              }}>
                About Me
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
            <div style={{ position: 'relative', width: '300px', height: '610px' }}>
              <Image
                src="/assets/char.png"
                alt="Character"
                fill
                style={{
                  imageRendering: 'pixelated',
                  objectFit: 'contain',
                  transform: charHovered ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
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