'use client';

import { useState, useEffect, useRef } from 'react';

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

  const bg = isDark ? 'black' : 'white';
  const fg = isDark ? 'white' : 'black';

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

  // Mouse wheel handler
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
        style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onClose}
      />

      {/* Box */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        width: '460px',
        fontFamily: 'var(--font-omori), sans-serif',
      }}>

        {/* Tissue emerging from top */}
        <div style={{ display: 'flex', justifyContent: 'center', height: '160px', overflow: 'visible', position: 'relative' }}>
          <div
            className={animating ? 'tissue-out' : 'tissue-in'}
            style={{
              width: '300px',
              backgroundColor: bg,
              border: `3px solid ${fg}`,
              boxShadow: `inset 0 0 0 2px ${bg}, inset 0 0 0 6px ${fg}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 24px',
              position: 'absolute',
              bottom: '-10px',
              borderRadius: '6px 6px 0 0',
              minHeight: '130px',
            }}
          >
            <p style={{
              color: fg,
              fontSize: '20px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.6,
            }}>
              {skill.text}
            </p>
          </div>
        </div>

        {/* Box body */}
        <div style={{
          backgroundColor: bg,
          border: `3px solid ${fg}`,
          boxShadow: `inset 0 0 0 2px ${bg}, inset 0 0 0 6px ${fg}`,
          padding: '28px 24px 24px',
        }}>

          {/* Box opening slot */}
          <div style={{
            width: '220px',
            height: '36px',
            margin: '0 auto 24px',
            border: `3px solid ${fg}`,
            boxShadow: `inset 0 0 0 2px ${bg}, inset 0 0 0 6px ${fg}`,
            borderRadius: '50px',
            backgroundColor: isDark ? '#111' : '#eee',
          }} />

          {/* Label */}
          <p style={{
            color: fg, textAlign: 'center',
            fontSize: '12px', letterSpacing: '0.3em',
            textTransform: 'uppercase', opacity: 0.5,
            margin: '0 0 12px',
          }}>
            SKILLS
          </p>

          {/* Scroll hint */}
          <p style={{
            color: fg, textAlign: 'center',
            fontSize: '10px', letterSpacing: '0.2em',
            textTransform: 'uppercase', opacity: 0.3,
            margin: '0 0 20px',
          }}>
            ↕ scroll to browse
          </p>

          {/* Counter */}
          <p style={{
            color: fg, textAlign: 'center',
            fontSize: '14px', letterSpacing: '0.15em',
            margin: '0 0 20px', opacity: 0.7,
          }}>
            {current + 1} / {skills.length}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            {(['prev', 'next'] as const).map(dir => (
              <button
                key={dir}
                onClick={() => go(dir)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: bg,
                  color: fg,
                  border: `3px solid ${fg}`,
                  boxShadow: `inset 0 0 0 2px ${bg}, inset 0 0 0 6px ${fg}`,
                  fontFamily: 'var(--font-omori), sans-serif',
                  fontSize: '13px',
                  letterSpacing: '0.15em',
                  cursor: `url('/assets/cursor.png') 4 4, pointer`,
                  textTransform: 'uppercase',
                }}
              >
                {dir === 'prev' ? '← PREV' : 'NEXT →'}
              </button>
            ))}
          </div>
        </div>

        {/* Close */}
        <div style={{ textAlign: 'center', marginTop: '14px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: fg,
              fontFamily: 'var(--font-omori), sans-serif',
              fontSize: '12px', letterSpacing: '0.2em',
              opacity: 0.5,
              cursor: `url('/assets/cursor.png') 4 4, pointer`,
              textTransform: 'uppercase',
            }}
          >
            [ CLOSE ]
          </button>
        </div>
      </div>
    </>
  );
}