'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Skill { id: number; text: string; icon?: string; }

// Spritesheet: ~12 frames in a single row on a black background
// Each frame is roughly 1/12th of the total width
const SPRITE_FRAMES = 13;
const SPRITE_FPS = 14; // frames per second for the falling animation

type PaperState = 'rest' | 'flying-up' | 'falling' | 'flying-down' | 'rising';

export default function SkillsModal({
  isOpen, onClose, isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [paperState, setPaperState] = useState<PaperState>('rest');
  const [spriteFrame, setSpriteFrame] = useState(0);
  const [swingAngle, setSwingAngle] = useState(0);
  const [paperY, setPaperY] = useState(0);
  const [paperOpacity, setPaperOpacity] = useState(1);
  const wheelCooldown = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const spriteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flyXRef = useRef(0);
  const flyRotRef = useRef(0);
  const animating = paperState !== 'rest';

  useEffect(() => {
    if (isOpen) {
      fetch('/assets/skills.json').then(r => r.json()).then(setSkills);
      setCurrent(0);
      setPaperState('rest');
      setSpriteFrame(0);
      setPaperY(0);
      setPaperOpacity(1);
      setSwingAngle(0);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (spriteIntervalRef.current) clearInterval(spriteIntervalRef.current);
    };
  }, []);

  const startSpriteAnimation = (reverse: boolean) => {
    if (spriteIntervalRef.current) clearInterval(spriteIntervalRef.current);
    let frame = reverse ? SPRITE_FRAMES - 1 : 0;
    setSpriteFrame(frame);

    spriteIntervalRef.current = setInterval(() => {
      frame = reverse ? frame - 1 : frame + 1;
      if (reverse ? frame < 0 : frame >= SPRITE_FRAMES) {
        if (spriteIntervalRef.current) clearInterval(spriteIntervalRef.current);
        return;
      }
      setSpriteFrame(frame);
    }, 1000 / SPRITE_FPS);
  };

  const go = (dir: 'prev' | 'next') => {
    if (animating || skills.length === 0) return;
    setDirection(dir);

    const isNext = dir === 'next';

    flyRotRef.current = (Math.random() - 0.5) * 40;
    flyXRef.current = (Math.random() - 0.5) * 80;

    if (isNext) {
      // NEXT: tween up first, then fall down
      setPaperState('flying-up');
      setPaperY(0);
      setPaperOpacity(1);
      setSwingAngle(flyRotRef.current);

      setTimeout(() => {
        setCurrent(prev => (prev + 1) % skills.length);

        setPaperState('falling');
        setPaperY(-400);
        setPaperOpacity(1);
        setSpriteFrame(0);
        startSpriteAnimation(false);

        const startTime = performance.now();
        const duration = 900;

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const y = -400 + 400 * (progress * progress);
          const swingPhase = progress * Math.PI * 2.5;
          const swing = Math.sin(swingPhase) * 18 * (1 - progress * 0.6);
          const opacity = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;
          setPaperY(y);
          setSwingAngle(swing);
          setPaperOpacity(opacity);
          if (progress < 1) {
            animFrameRef.current = requestAnimationFrame(animate);
          } else {
            // After fall, slide paper_rest up into the box
            setPaperState('rising');
            setPaperY(0);
            setPaperOpacity(1);
            setSwingAngle(0);
            setTimeout(() => {
              setPaperState('rest');
              setPaperY(0);
              setPaperOpacity(1);
              setSwingAngle(0);
              setSpriteFrame(0);
            }, 320);
          }
        };
        animFrameRef.current = requestAnimationFrame(animate);
      }, 320);

    } else {
      // PREV: rise up from below first (reversed spritesheet), then tween down
      setCurrent(prev => (prev - 1 + skills.length) % skills.length);

      setPaperState('falling');
      setPaperY(-400);
      setPaperOpacity(0);
      setSpriteFrame(SPRITE_FRAMES - 1);
      startSpriteAnimation(true);

      const startTime = performance.now();
      const duration = 900;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = progress * progress;
        const y = -400 + 400 * easedProgress;
        const swingPhase = progress * Math.PI * 2.5;
        const swing = Math.sin(swingPhase) * 18 * (1 - progress * 0.6) * -1;
        const opacity = progress < 0.4 ? progress / 0.4 : 1;
        setPaperY(y);
        setSwingAngle(swing);
        setPaperOpacity(opacity);
        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setPaperState('rest');
          setPaperY(0);
          setPaperOpacity(1);
          setSwingAngle(0);
          setSpriteFrame(0);
        }
      };
      animFrameRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown.current) return;
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 1100);
      go(e.deltaY > 0 ? 'next' : 'prev');
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOpen, animating, skills.length]);

  if (!isOpen || skills.length === 0) return null;

  const skill = skills[current];
  const isNext = direction === 'next';

  // Spritesheet: all frames in one row. Each frame width = totalWidth / SPRITE_FRAMES
  // We use background-position to show the correct frame
  // The spritesheet image is paper_falling_animation.png
  // We'll use a div with background-image for the sprite

  const getPaperElement = () => {
    if (paperState === 'rest') {
      return (
        <div style={{ position: 'relative', width: '80px', height: '100px' }}>
          <Image
            src="/assets/paper_rest.png"
            alt="paper"
            fill
            style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          />
        </div>
      );
    }

    if (paperState === 'flying-up' || paperState === 'flying-down') {
      return (
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '100px',
            animation: paperState === 'flying-up'
              ? 'paperFlyUp 0.22s ease-in forwards'
              : 'paperFlyDown 0.22s ease-in forwards',
          }}
        >
          <Image
            src="/assets/paper_up.png"
            alt="paper flying"
            fill
            style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          />
        </div>
      );
    }

    if (paperState === 'falling') {
      // Sprite sheet frame
      // Each frame: width = 100% / SPRITE_FRAMES of the sheet
      // We show via background-position on a fixed-size div
      return (
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundImage: 'url(/assets/paper_falling_animation.png)',
            backgroundRepeat: 'no-repeat',
            // Each frame is 1/SPRITE_FRAMES of the total sheet width
            // backgroundSize: make the full sheet SPRITE_FRAMES * 80px wide, 100px tall
            backgroundSize: `${SPRITE_FRAMES * 80}px ${80}px`,
            backgroundPosition: `-${spriteFrame * 80}px 0px`,
            imageRendering: 'pixelated',
          }}
        />
      );
    }

    return null;
  };

  return (
    <>
      <style>{`
        @keyframes paperFlyUp {
          from { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          to   { transform: translateY(-220px) translateX(var(--fly-x, 0px)) rotate(var(--fly-rot, 0deg)); opacity: 1; }
        }
        @keyframes paperSlideIn {
          from { transform: translateY(60px) translateX(0) rotate(0deg); opacity: 0; }
          to   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
        }
        @keyframes paperFlyDown {
          from { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          to   { transform: translateY(220px) translateX(var(--fly-x, 0px)) rotate(var(--fly-rot, 0deg)); opacity: 1; }
        }
        @keyframes floatUp {
          0%, 100% { transform: rotate(-90deg) translateX(0); }
          50%       { transform: rotate(-90deg) translateX(-5px); }
        }
        @keyframes floatDown {
          0%, 100% { transform: rotate(90deg) translateX(0); }
          50%       { transform: rotate(90deg) translateX(-5px); }
        }
        @keyframes tissueSlideIn {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
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
        width: 'min(460px, 100vw)',
        fontFamily: 'var(--font-omori), sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Tissue + box image layers */}
        <div style={{ position: 'relative', width: 'min(460px, 100vw)', height: '380px', marginTop: 'min(160px, 20vw)' }}>

          {/* UNDERLAY — behind tissue */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Image src="/assets/box_under.png" alt="" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
          </div>

          {/* PAPER ANIMATION — floats above tissue slot, below overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '60%',
              left: 'clamp(10%, 23%, 30%)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'min(240px, 52vw)',
              height: 'min(240px, 52vw)',
              pointerEvents: 'none',
            }}
          >
            {/* Tissue box (text display) */}
            <div
              key={`skill-${current}`}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'tissueSlideIn 0.3s ease forwards',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 'min(250px, 54vw)',
                  height: 'min(250px, 54vw)',
                  transform: paperState !== 'rest'
                    ? `translate(-50%, -50%) translateY(${paperY}px) rotate(${swingAngle}deg)`
                    : 'translate(-50%, -50%)',
                  opacity: paperState === 'falling' ? paperOpacity : 1,
                  zIndex: 10,
                  pointerEvents: 'none',
                  transformOrigin: 'top center',
                }}
              >
                {paperState === 'rising' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    animation: 'paperSlideIn 0.32s ease-out forwards',
                  }}>
                    <Image src="/assets/paper_rest.png" alt="paper" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '12px', padding: '20px',
                      marginTop: '-30px', marginBottom: '20px',
                    }}>
                      {skill.icon && <img src={skill.icon} alt="" style={{ width: 'min(72px, 14vw)', height: 'min(72px, 14vw)', objectFit: 'contain' }} />}
                      <p style={{
                        color: 'white', fontSize: 'clamp(12px, 3.5vw, 22px)',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        textAlign: 'center', lineHeight: 1.6, margin: 0,
                      }}>
                        {skill.text}
                      </p>
                    </div>
                  </div>
                )}
                {paperState === 'flying-up' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    animation: 'paperFlyUp 0.32s ease-out forwards',
                    ['--fly-x' as string]: `${flyXRef.current}px`,
                    ['--fly-rot' as string]: `${flyRotRef.current}deg`,
                  }}>
                    <Image src="/assets/paper_rest.png" alt="paper" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '12px', padding: '20px',
                      marginTop: '-30px', marginBottom: '20px',
                    }}>
                      {skill.icon && <img src={skill.icon} alt="" style={{ width: 'min(72px, 14vw)', height: 'min(72px, 14vw)', objectFit: 'contain' }} />}
                      <p style={{
                        color: 'black', fontSize: 'clamp(12px, 3.5vw, 20px)',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        textAlign: 'center', lineHeight: 1.6, margin: 0,
                      }}>
                        {skill.text}
                      </p>
                    </div>
                  </div>
                )}
                {paperState === 'flying-down' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    animation: 'paperFlyDown 0.32s ease-out forwards',
                    ['--fly-x' as string]: `${flyXRef.current}px`,
                    ['--fly-rot' as string]: `${flyRotRef.current}deg`,
                  }}>
                    <Image src="/assets/paper_rest.png" alt="paper" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
                    <p style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'black', fontSize: '14px',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      textAlign: 'center', lineHeight: 1.6,
                      margin: 0,
                      padding: '20px',
                    }}>
                      {skill.text}
                    </p>
                  </div>
                )}
                {paperState === 'falling' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'url(/assets/paper_falling_animation.png)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${SPRITE_FRAMES * 250}px 250px`,
                    backgroundPosition: `-${spriteFrame * 250}px 0px`,
                    imageRendering: 'pixelated',
                  }} />
                )}
                {paperState === 'rest' && (
                  <Image src="/assets/paper_rest.png" alt="paper" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
                )}
                {paperState === 'rest' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '12px', padding: '20px',
                    marginTop: '-30px',
                    marginBottom: '20px',
                  }}>
                    {skill.icon && <img src={skill.icon} alt="" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />}
                    <p style={{
                      color: 'black', fontSize: '20px',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      textAlign: 'center', lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {skill.text}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* UP/DOWN arrows — right side of tissue box */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: 'clamp(calc(10% + 160px), calc(23% + 260px), calc(23% + 260px))',
            height: 'min(240px, 52vw)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '30px',
          }}>
            <div
              onClick={!animating ? () => go('prev') : undefined}
              style={{
                position: 'relative', width: 'min(56px, 10vw)', height: 'min(44px, 8vw)',
                cursor: animating ? 'default' : `url('/assets/cursor.png') 4 4, pointer`,
                opacity: animating ? 0.4 : 1,
                animation: 'floatUp 1.4s ease-in-out infinite',
                transform: 'rotate(-90deg)',
              }}
            >
              <Image src="/assets/select_hover.png" alt="prev" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
            </div>
            <div
              onClick={!animating ? () => go('next') : undefined}
              style={{
                position: 'relative', width: 'min(56px, 10vw)', height: 'min(44px, 8vw)',
                cursor: animating ? 'default' : `url('/assets/cursor.png') 4 4, pointer`,
                opacity: animating ? 0.4 : 1,
                animation: 'floatDown 1.4s ease-in-out infinite',
                transform: 'rotate(90deg)',
              }}
            >
              <Image src="/assets/select_hover.png" alt="next" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
            </div>
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
            width: 'min(340px, 80vw)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <p style={{ color: 'white', fontSize: 'clamp(22px, 6vw, 40px)', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 1, margin: 0 }}>
              MY SKILLS
            </p>
            <p style={{ color: 'white', fontSize: '15px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, margin: 0 }}>
              ↕ scroll to browse
            </p>

            <p style={{ color: 'white', fontSize: '20px', letterSpacing: '0.15em', opacity: 0.5, margin: 0 }}>
              {current + 1} / {skills.length}
            </p>

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
