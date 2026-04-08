'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });

  const bg = isDark ? 'black' : 'white';
  const fg = isDark ? 'white' : 'black';

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x, y });
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

  const layer = (depth: number) => ({
    transform: `translate(${tilt.x * depth * 12}px, ${tilt.y * depth * 12}px)`,
    transition: 'transform 0.12s ease-out',
  });

  return (
    <main
      style={{ backgroundColor: bg, color: fg }}
      className="min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-700 relative overflow-hidden"
    >
      {/* 🔧 REMOVED pointer-events-none — replaced with CSS so it never intercepts touch */}
      <div
        style={{
          opacity: isDark ? 0.1 : 0.03,
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
          pointerEvents: 'none',  // 🔧 explicitly set AND no z-index so it stays behind
          zIndex: 0,
        }}
      />



      {/* 🔧 z-index: 1 ensures this whole content block is above the noise div */}
      <div
        className="flex flex-col items-center gap-6 text-center w-full max-w-2xl"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div style={layer(0.5)}>
          <p style={{ color: fg, opacity: 0.4 }} className="text-xs tracking-[0.25em] uppercase">
            My Portfolio
          </p>
        </div>

        <div className="relative w-full flex flex-col items-center gap-4">

          {/* TOP ROW */}
          <div style={layer(1)} className="flex justify-between w-full px-4">
            <SceneItem label="Door" isDark={isDark}>
              <svg width="52" height="80" viewBox="0 0 52 80" overflow="visible">
                <rect x="2" y="4" width="48" height="74" rx="1" fill={bg} stroke={fg} strokeWidth="2.5"/>
                <rect x="6" y="8" width="40" height="66" rx="1" fill={isDark ? '#111' : '#f5f5f5'} stroke={fg} strokeWidth="1.5"/>
                <rect x="9" y="11" width="15" height="28" rx="1" fill={bg} stroke={fg} strokeWidth="1"/>
                <rect x="28" y="11" width="15" height="28" rx="1" fill={bg} stroke={fg} strokeWidth="1"/>
                <rect x="9" y="43" width="34" height="28" rx="1" fill={bg} stroke={fg} strokeWidth="1"/>
                <circle cx="34" cy="58" r="2.5" fill={fg}/>
                <rect x="0" y="0" width="52" height="5" rx="1" fill={fg}/>
              </svg>
            </SceneItem>

            {/* Light Bulb — direct touch handler */}
            <div
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                userSelect: 'none',
                cursor: 'pointer',
                minWidth: '60px',
                minHeight: '80px',
                justifyContent: 'center',
              }}
              onClick={() => setIsDark(prev => !prev)}
              onTouchEnd={(e) => {
                e.preventDefault(); // 🔧 prevents ghost click delay
                setIsDark(prev => !prev);
              }}
            >
              <svg width="36" height="60" viewBox="0 0 36 60" overflow="visible">
                <line x1="18" y1="0" x2="18" y2="10" stroke={fg} strokeWidth="2"/>
                <path d="M6,22 Q6,10 18,10 Q30,10 30,22 Q30,32 24,38 L12,38 Q6,32 6,22Z"
                  fill={isDark ? '#fffde0' : bg} stroke={fg} strokeWidth="2"
                  style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(255,230,50,0.9))' : 'none' }}
                />
                <polyline points="13,30 13,24 15,28 17,24 19,28 21,24 23,28 23,30" fill="none" stroke={isDark ? '#aaa' : fg} strokeWidth="1.2"/>
                <rect x="11" y="37" width="14" height="4" rx="1" fill={isDark ? '#444' : '#ddd'} stroke={fg} strokeWidth="1.5"/>
                <rect x="12" y="41" width="12" height="4" rx="1" fill={isDark ? '#333' : '#ccc'} stroke={fg} strokeWidth="1.5"/>
                <rect x="13" y="45" width="10" height="3" rx="1" fill={isDark ? '#222' : '#bbb'} stroke={fg} strokeWidth="1.5"/>
              </svg>
              <p style={{ color: fg, opacity: 0.4 }} className="text-[9px] mt-1 tracking-widest uppercase">
                {isDark ? 'Repression Active' : 'Click to Turn Off'}
              </p>
            </div>
          </div>

          {/* MID ROW */}
          <div style={layer(1.8)} className="flex justify-center gap-16 w-full">
            <SceneItem label="Blanket" isDark={isDark}>
              <svg width="70" height="55" viewBox="0 0 70 55" overflow="visible">
                <path d="M5,10 Q10,6 35,8 Q60,6 65,10 L68,45 Q60,52 35,50 Q10,52 2,45 Z" fill={bg} stroke={fg} strokeWidth="2"/>
                <line x1="17" y1="9" x2="14" y2="49" stroke={fg} strokeWidth="1" opacity="0.15"/>
                <line x1="30" y1="8" x2="28" y2="50" stroke={fg} strokeWidth="1" opacity="0.15"/>
                <line x1="43" y1="8" x2="42" y2="50" stroke={fg} strokeWidth="1" opacity="0.15"/>
                <line x1="56" y1="9" x2="56" y2="49" stroke={fg} strokeWidth="1" opacity="0.15"/>
                <path d="M5,10 Q10,18 35,16 Q60,18 65,10" fill={isDark ? '#222' : '#f0f0f0'} stroke={fg} strokeWidth="1.5"/>
                <line x1="8" y1="49" x2="6" y2="54" stroke={fg} strokeWidth="1.5"/>
                <line x1="18" y1="51" x2="17" y2="55" stroke={fg} strokeWidth="1.5"/>
                <line x1="28" y1="51" x2="28" y2="55" stroke={fg} strokeWidth="1.5"/>
                <line x1="38" y1="51" x2="38" y2="55" stroke={fg} strokeWidth="1.5"/>
                <line x1="48" y1="51" x2="48" y2="55" stroke={fg} strokeWidth="1.5"/>
                <line x1="58" y1="51" x2="59" y2="55" stroke={fg} strokeWidth="1.5"/>
                <line x1="65" y1="49" x2="67" y2="54" stroke={fg} strokeWidth="1.5"/>
              </svg>
            </SceneItem>

            <SceneItem label="Laptop" isDark={isDark} href="#projects">
              <svg width="70" height="55" viewBox="0 0 70 55" overflow="visible">
                <rect x="5" y="2" width="60" height="38" rx="2" fill={isDark ? '#111' : '#f8f8f8'} stroke={fg} strokeWidth="2.5"/>
                <rect x="9" y="6" width="52" height="30" rx="1" fill={bg} stroke={fg} strokeWidth="1.2"/>
                <line x1="14" y1="13" x2="40" y2="13" stroke={fg} strokeWidth="1" opacity="0.3"/>
                <line x1="14" y1="18" x2="55" y2="18" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <line x1="14" y1="23" x2="48" y2="23" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <line x1="14" y1="28" x2="50" y2="28" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <circle cx="35" cy="5" r="1.2" fill={fg} opacity="0.4"/>
                <rect x="5" y="38" width="60" height="3" rx="0" fill={isDark ? '#333' : '#ddd'} stroke={fg} strokeWidth="1.5"/>
                <path d="M2,41 L5,41 L65,41 L68,41 L70,50 L0,50 Z" fill={isDark ? '#222' : '#f0f0f0'} stroke={fg} strokeWidth="2"/>
                <rect x="25" y="43" width="20" height="5" rx="1" fill={bg} stroke={fg} strokeWidth="1"/>
              </svg>
            </SceneItem>
          </div>

          {/* OMORI */}
          <div style={layer(2.5)}>
            <svg width="48" height="80" viewBox="0 0 48 80">
              <rect x="14" y="36" width="20" height="24" rx="1" fill={bg} stroke={fg} strokeWidth="2"/>
              <rect x="14" y="40" width="20" height="3" fill={isDark ? '#333' : '#eee'}/>
              <rect x="5" y="38" width="9" height="5" rx="2" fill={bg} stroke={fg} strokeWidth="1.8"/>
              <rect x="34" y="38" width="9" height="5" rx="2" fill={bg} stroke={fg} strokeWidth="1.8"/>
              <rect x="15" y="59" width="7" height="16" rx="1" fill={bg} stroke={fg} strokeWidth="1.8"/>
              <rect x="26" y="59" width="7" height="16" rx="1" fill={bg} stroke={fg} strokeWidth="1.8"/>
              <rect x="13" y="73" width="10" height="5" rx="2" fill={fg}/>
              <rect x="24" y="73" width="10" height="5" rx="2" fill={fg}/>
              <rect x="20" y="30" width="8" height="8" fill={bg} stroke={fg} strokeWidth="1.5"/>
              <rect x="10" y="8" width="28" height="26" rx="3" fill={bg} stroke={fg} strokeWidth="2.2"/>
              <rect x="10" y="8" width="28" height="8" rx="3" fill={fg}/>
              <rect x="10" y="12" width="5" height="8" fill={fg}/>
              <rect x="33" y="12" width="5" height="8" fill={fg}/>
              <line x1="16" y1="20" x2="21" y2="25" stroke={fg} strokeWidth="1.8"/>
              <line x1="21" y1="20" x2="16" y2="25" stroke={fg} strokeWidth="1.8"/>
              <line x1="27" y1="20" x2="32" y2="25" stroke={fg} strokeWidth="1.8"/>
              <line x1="32" y1="20" x2="27" y2="25" stroke={fg} strokeWidth="1.8"/>
              <line x1="19" y1="29" x2="29" y2="29" stroke={fg} strokeWidth="1.5"/>
              {isDark && (
                <>
                  <rect x="1" y="42" width="3" height="14" rx="1" fill="#aaa" stroke={fg} strokeWidth="1"/>
                  <rect x="0" y="40" width="5" height="4" rx="1" fill="#666" stroke={fg} strokeWidth="1"/>
                </>
              )}
            </svg>
          </div>

          {/* BOTTOM ROW */}
          <div style={layer(2)} className="flex justify-center gap-12 w-full">
            <SceneItem label="Mewo" isDark={isDark}>
              <svg width="50" height="44" viewBox="0 0 50 44" overflow="visible">
                <ellipse cx="25" cy="32" rx="16" ry="11" fill={fg}/>
                <path d="M40,34 Q52,28 48,20 Q46,15 42,18" fill="none" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
                <circle cx="22" cy="17" r="13" fill={fg}/>
                <polygon points="10,10 6,0 16,8" fill={fg}/>
                <polygon points="34,10 38,0 28,8" fill={fg}/>
                <polygon points="11,9 8,3 15,8" fill={isDark ? '#555' : '#888'}/>
                <polygon points="33,9 36,3 29,8" fill={isDark ? '#555' : '#888'}/>
                <ellipse cx="17" cy="16" rx="3" ry="3.5" fill={bg}/>
                <ellipse cx="27" cy="16" rx="3" ry="3.5" fill={bg}/>
                <circle cx="17" cy="17" r="1.8" fill={fg}/>
                <circle cx="27" cy="17" r="1.8" fill={fg}/>
                <circle cx="17.8" cy="15.5" r="0.7" fill={bg}/>
                <circle cx="27.8" cy="15.5" r="0.7" fill={bg}/>
                <polygon points="22,21 20,23 24,23" fill={bg} opacity="0.8"/>
                <line x1="10" y1="21" x2="18" y2="22" stroke={bg} strokeWidth="0.8" opacity="0.6"/>
                <line x1="9" y1="23" x2="17" y2="23" stroke={bg} strokeWidth="0.8" opacity="0.6"/>
                <line x1="27" y1="22" x2="35" y2="21" stroke={bg} strokeWidth="0.8" opacity="0.6"/>
                <line x1="27" y1="23" x2="35" y2="23" stroke={bg} strokeWidth="0.8" opacity="0.6"/>
              </svg>
            </SceneItem>

            <SceneItem label="Tissue Box" isDark={isDark} href="#contact">
              <svg width="52" height="48" viewBox="0 0 52 48" overflow="visible">
                <rect x="2" y="14" width="48" height="32" rx="2" fill={bg} stroke={fg} strokeWidth="2.5"/>
                <rect x="2" y="10" width="48" height="8" rx="2" fill={isDark ? '#222' : '#f0f0f0'} stroke={fg} strokeWidth="2"/>
                <ellipse cx="26" cy="14" rx="13" ry="5" fill={bg} stroke={fg} strokeWidth="2"/>
                <path d="M19,14 Q22,6 26,4 Q30,6 33,14" fill={bg} stroke={fg} strokeWidth="1.5"/>
                <line x1="10" y1="20" x2="10" y2="42" stroke={fg} strokeWidth="1" opacity="0.1"/>
                <line x1="20" y1="18" x2="20" y2="44" stroke={fg} strokeWidth="1" opacity="0.1"/>
                <line x1="32" y1="18" x2="32" y2="44" stroke={fg} strokeWidth="1" opacity="0.1"/>
                <line x1="42" y1="20" x2="42" y2="42" stroke={fg} strokeWidth="1" opacity="0.1"/>
              </svg>
            </SceneItem>

            <SceneItem label="Sketchbook" isDark={isDark} href="#about">
              <svg width="48" height="60" viewBox="0 0 48 60" overflow="visible">
                <rect x="4" y="2" width="40" height="54" rx="2" fill={isDark ? '#1a1a1a' : '#f5f0e8'} stroke={fg} strokeWidth="2.5"/>
                <rect x="4" y="2" width="8" height="54" rx="2" fill={isDark ? '#333' : '#e8d5b0'} stroke={fg} strokeWidth="2"/>
                <line x1="4" y1="12" x2="12" y2="12" stroke={fg} strokeWidth="1" opacity="0.3"/>
                <line x1="4" y1="22" x2="12" y2="22" stroke={fg} strokeWidth="1" opacity="0.3"/>
                <line x1="4" y1="32" x2="12" y2="32" stroke={fg} strokeWidth="1" opacity="0.3"/>
                <line x1="4" y1="42" x2="12" y2="42" stroke={fg} strokeWidth="1" opacity="0.3"/>
                <line x1="16" y1="14" x2="40" y2="14" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <line x1="16" y1="20" x2="40" y2="20" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <line x1="16" y1="26" x2="40" y2="26" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <line x1="16" y1="32" x2="38" y2="32" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <line x1="16" y1="38" x2="40" y2="38" stroke={fg} strokeWidth="1" opacity="0.2"/>
                <polygon points="28,44 29.5,48 33,48 30.5,50.5 31.5,54 28,52 24.5,54 25.5,50.5 23,48 26.5,48"
                  fill="none" stroke={fg} strokeWidth="1" opacity="0.3"/>
              </svg>
            </SceneItem>
          </div>
        </div>

        <div style={layer(0.8)}>
          <p style={{ color: fg }} className="text-xs italic opacity-30 mt-2">
            {isDark ? 'There is no way out.' : 'You have been living here for as long as you can remember.'}
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── SceneItem ────────────────────────────────────────────────────────────────
function SceneItem({
  label, isDark, children, href, onClick,
}: {
  label: string;
  isDark: boolean;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
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
        // 🔧 These three lines are the core mobile fix
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => {
        setTimeout(() => setHovered(false), 600);
        onClick?.();
      }}
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
      {children}
      <div style={{
        width: '55%', height: '4px', background: fg,
        borderRadius: '50%', opacity: 0.07, marginTop: '3px',
      }}/>
    </div>
  );

  if (href) return (
    <a href={href} style={{ textDecoration: 'none', WebkitTapHighlightColor: 'transparent' }}>
      {inner}
    </a>
  );
  return inner;
}