'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Skill { id: number; text: string; }

export default function SkillsModal({
  isOpen, onClose, isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const wheelCooldown = useRef(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/assets/skills.json').then(r => r.json()).then(setSkills);
      setCurrent(0);
    }
  }, [isOpen]);

  const go = (dir: 'prev' | 'next') => {
    if (animating || skills.length === 0) return;
    setDirection(dir === 'next' ? 'right' : 'left');
    setAnimating(true);
    setTimeout(() => {
      setCurrent(prev =>
        dir === 'next'
          ? (prev + 1) % skills.length
          : (prev - 1 + skills.length) % skills.length
      );
      setAnimating(false);
    }, 350);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown.current) return;
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 500);
      go(e.deltaY > 0 ? 'next' : 'prev');
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOpen, animating, skills.length]);

  if (!isOpen || skills.length === 0) return null;

  const skill = skills[current];

  return (
    <>
      <style>{`
        @keyframes tissueOut {
          from { transform: translateY(0) rotate(0deg); opacity: 1; }
          to   { transform: translateY(${direction === 'right' ? '-120px' : '120px'}) rotate(${direction === 'right' ? '-10' : '10'}deg); opacity: 0; }
        }
        @keyframes tissueIn {
          from { transform: translateY(${direction === 'right' ? '80px' : '-80px'}) rotate(${direction === 'right' ? '7' : '-7'}deg); opacity: 0; }
          to   { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        .tissue-out { animation: tissueOut 0.35s ease forwards; }
        .tissue-in  { animation: tissueIn  0.35s ease forwards; }
      `}</style>

      
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Centered modal container */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 301,
        width: '460px',
        fontFamily: 'var(--font-omori), sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Tissue + box image layers */}
        <div style={{ position: 'relative', width: '460px', height: '380px', marginTop: '160px' }}>

          {/* UNDERLAY — behind tissue */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Image src="/assets/box_under.png" alt="" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
          </div>

          {/* TISSUE — middle layer */}
          <div
            className={animating ? 'tissue-out' : 'tissue-in'}
            style={{
              position: 'absolute',
              bottom: '60%',
              left: '20%',
              transform: 'translateX(-50%)',
              width: '240px',
              height: '240px',
              backgroundColor: 'white',
              border: '3px solid black',
              boxShadow: 'inset 0 0 0 2px white, inset 0 0 0 6px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 24px',
              borderRadius: '6px 6px 0 0',
              minHeight: '130px',
              zIndex: 1,
            }}
          >
            <p style={{
              color: 'black', fontSize: '18px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              textAlign: 'center', marginBottom: '100px', lineHeight: 1.6,
            }}>
              {skill.text}
            </p>
          </div>

          {/* OVERLAY — above tissue */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            <Image src="/assets/box_overlay.png" alt="" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
          </div>

          {/* Controls INSIDE the box, at the bottom */}
          <div style={{
            position: 'absolute',
            bottom: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            width: '340px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <p style={{ color: 'white', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, margin: 0 }}>
              ↕ scroll to browse
            </p>

            <p style={{ color: 'white', fontSize: '14px', letterSpacing: '0.15em', opacity: 0.8, margin: 0 }}>
              {current + 1} / {skills.length}
            </p>

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {(['prev', 'next'] as const).map(dir => (
                <button
                  key={dir}
                  onClick={() => go(dir)}
                  style={{
                    flex: 1, padding: '10px',
                    backgroundColor: 'black', color: 'white',
                    border: '3px solid white',
                    boxShadow: 'inset 0 0 0 2px black, inset 0 0 0 6px white',
                    fontFamily: 'var(--font-omori), sans-serif',
                    fontSize: '12px', letterSpacing: '0.15em',
                    cursor: `url('/assets/cursor.png') 4 4, pointer`,
                    textTransform: 'uppercase',
                  }}
                >
                  {dir === 'prev' ? '← PREV' : 'NEXT →'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'white',
                fontFamily: 'var(--font-omori), sans-serif',
                fontSize: '12px', letterSpacing: '0.2em',
                opacity: 0.5, cursor: `url('/assets/cursor.png') 4 4, pointer`,
                textTransform: 'uppercase',
              }}
            >
              [ CLOSE ]
            </button>
          </div>
        </div>
      </div>
    </>
  );
}