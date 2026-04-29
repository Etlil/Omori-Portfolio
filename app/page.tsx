'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DesktopModal from './components/DesktopModal';
import ProjectsModal from './components/ProjectsModal';
import AboutModal from './components/AboutModal';
import SkillsModal from './components/SkillsModal';

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [charHovered, setCharHovered] = useState(false);
  const [bulbHovered, setBulbHovered] = useState(false);
  const smoothRef = useRef({ x: 0, y: 0 });
  const targetWobbleRef = useRef({ x: 0, y: 0 });
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const router = useRouter();
  const [skillsOpen, setSkillsOpen] = useState(false);
  

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    text: string;
    choices: { label: string; action: () => void }[];
    onClose?: () => void;
  }>({
    isOpen: false,
    text: "",
    choices: []
  });

  const charRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  const bg = isDark ? 'black' : 'white';
  const fg = isDark ? 'white' : 'black';

  const [isMobile, setIsMobile] = useState(false);

  const handleMewoClick = () => {
    setModalData({
      isOpen: true,
      text: "Waiting for something to happen? How about visiting the GitHub repo instead?",
      choices: [
        {
          label: "VISIT GITHUB REPO",
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

  const [desktopOpen, setDesktopOpen] = useState(false);

  const handleLaptopClick = () => {
    setDesktopOpen(true);
  };

  const handleDoorClick = () => {
    setModalData({
      isOpen: true,
      text: "You stared at the door.....",
      choices: [],  // no choices = just a dismiss dialog
      onClose: () =>
        setModalData({
          isOpen: true,
          text: "You want to get out from here?",
          choices: [],
          onClose: () =>
            setModalData({
              isOpen: true,
              text: "Just close the web app bro",
              choices: [],
            }),
        }),
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
      if (window.innerWidth < 768 || modalData.isOpen || desktopOpen) return; 

      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x, y });
      targetWobbleRef.current = { x: x * 18, y: y * 10 };

      // Pupil tracking
      if (charRef.current) {
        setPupilOffset({
          x: x * 4.25, // 50% of 12.5
          y: y * 4.25, // 50% of 12.5
        });
      }
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

      setPupilOffset({
        x: smoothRef.current.x * 1.5, // 50% of 5
        y: smoothRef.current.y * 1.5, // 50% of 5
      });
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
      {modalData.isOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 45, // Above everything except character and modal boxes
          }} 
          onClick={modalData.choices.length === 0 ? () => setModalData(prev => ({ ...prev, isOpen: false })) : undefined}
        />
      )}
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
          <h1 style={{ color: fg, opacity: 0.4 }} className="text-base font-bold tracking-[0.25em] uppercase">Etlil's Portfolio</h1>
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
            <SceneItem label="Door" isDark={isDark} onClick={handleDoorClick}>
              <div style={{ position: 'relative', width: isMobile ? '130px' : '180px', height: isMobile ? '150px' : '210px' }}>
                <Image src={isDark ? '/assets/door_dark.png' : '/assets/door_light.jpg'} alt="Door" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '20%', left: '10%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 5}px, ${tilt.y * 5}px)` }}>
            <SceneItem label="Contacts/Socials" isDark={isDark} hoverSrc="/assets/laptop_hover.png" onClick={handleLaptopClick}>
              <div style={{ position: 'relative', width: isMobile ? '60px' : '80px', height: '60px' }}>
                <Image src="/assets/laptop.png" alt="Laptop" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '20%', right: '10%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 5}px, ${tilt.y * 5}px)` }}>
            <SceneItem label="Projects" isDark={isDark} onClick={() => setProjectsOpen(true)}>
              <div style={{ position: 'relative', width: isMobile ? '45px' : '55px', height: '60px' }}>
                <Image src="/assets/sketch_book.png" alt="Sketch" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '-5%', left: '0%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 10}px, ${tilt.y * 8}px)` }}>
            <SceneItem label="GitHub" isDark={isDark} hoverSrc="/assets/mewo_hover.png" onClick={handleMewoClick}>
              <div style={{ position: 'relative', width: isMobile ? '70px' : '90px', height: '70px' }}>
                <Image src="/assets/mewo.png" alt="Mewo" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            </SceneItem>
          </div>

          <div style={{ position: 'absolute', bottom: '5%', right: '5%', pointerEvents: 'auto', zIndex: 20, transform: `translate(${tilt.x * 10}px, ${tilt.y * 8}px)` }}>
            <SceneItem label="Skills" isDark={isDark} onClick={() => setSkillsOpen(true)}>
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
            zIndex: 50,
            pointerEvents: 'none',
            transition: 'none',
          }}
        >
          <div
            ref={charRef}
            style={{
              position: 'relative',
              width: isMobile ? '200px' : '300px',
              height: isMobile ? '350px' : '610px',
              pointerEvents: 'auto',
              cursor: `url('/assets/cursor.png') 4 4, pointer`,
            }}
            onMouseEnter={() => setCharHovered(true)}
            onMouseLeave={() => setCharHovered(false)}
            onClick={() => setAboutOpen(true)}
          >
            {charHovered && <Tooltip text="About Me?!" bg={bg} fg={fg} />}

            {/* Base character */}
            <Image
              src={charHovered ? "/assets/me_hover.png" : "/assets/me.png"} // This line swaps the image
              alt="Character"
              fill
              style={{
                imageRendering: 'pixelated', objectFit: 'contain',
                transform: charHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.15s ease',
              }}
            />

            {/* Pupils — single png centered on face */}
            <div style={{
              position: 'absolute',
              top: isMobile ? '9.5%' : '9%',
              left: isMobile ? '42.5%' : '41%',
              width: isMobile ? '14%' : '17%',
              height: isMobile ? '3.8%' : '4.5%',
              // Logic: If charHovered is true, we use 0 for the offsets, otherwise we use the parallax values
              transform: `translate(${charHovered ? 0 : pupilOffset.x}px, ${(charHovered ? 0 : pupilOffset.y) + (charHovered ? -4 : 0)}px)`,
              transition: 'none', // Slightly increased duration for a smoother "snap" back to center
              pointerEvents: 'none',
            }}>
              <Image
                src="/assets/pupil.png"
                alt=""
                fill
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
              />
            </div>

            {/* --- Shocked Mark (PNG) --- */}
            <div 
              className={charHovered ? "shock-effect" : ""}
              style={{
                position: 'absolute',
                // Moved slightly higher and further right
                top: isMobile ? '0%' : '0%', 
                left: isMobile ? '68%' : '68%', 
                // Reduced size: from 28% to 18%
                width: isMobile ? '18%' : '18%',
                height: 'auto',
                // If not hovered, hide instantly (no fade)
                opacity: charHovered ? 1 : 0,
                // Parallax remains snappy and high-intensity
                transform: `translate(${tilt.x * 35}px, ${tilt.y * 30}px)`,
                transition: 'none',
                pointerEvents: 'none',
                filter: isDark ? 'invert(1)' : 'none',
                zIndex: 60,
              }}
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                <Image
                  src="/assets/shocked.png"
                  alt="shocked"
                  fill
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                />
              </div>
            </div>

          </div>
        </div>

      </main>

      <OmoriModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        choices={modalData.choices}
        onClose={() => {
          const nextClose = modalData.onClose;
          if (nextClose) {
            setModalData(prev => ({ ...prev, isOpen: false, onClose: undefined }));
            nextClose();
            return;
          }
          setModalData(prev => ({ ...prev, isOpen: false }));
        }}
        bg={bg} 
        fg={fg} 
      />
      <DesktopModal isOpen={desktopOpen} onClose={() => setDesktopOpen(false)} />
      <ProjectsModal isOpen={projectsOpen} onClose={() => setProjectsOpen(false)} />
      <AboutModal 
        isOpen={aboutOpen} 
        onClose={() => setAboutOpen(false)} 
        onOpenProjects={() => {
          setAboutOpen(false); // Close About
          setProjectsOpen(true); // Open Projects
        }}
      />
      <SkillsModal isOpen={skillsOpen} onClose={() => setSkillsOpen(false)} isDark={isDark} />

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
  isOpen, text, choices, onClose,
}: {
  isOpen: boolean;
  text: string;
  choices: { label: string; action: () => void }[];
  onClose: () => void;
  bg: string;
  fg: string;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  const modalBg = 'black';
  const modalFg = 'white';
  const DIALOGUE_HEIGHT = 160;
  const DOUBLE_BORDER = {
    border: `3px solid ${modalFg}`,
    boxShadow: `inset 0 0 0 3px ${modalBg}, inset 0 0 0 6px ${modalFg}`,
  };

  // Reset and start typing when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        setDone(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 35); 

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen, text]);

  // Main interaction logic
  const handleAction = () => {
    if (!done) {
      // 1. If still typing, skip to the end
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(text);
      setDone(true);
    } else {
      // 2. If typing is done AND there are no choices, close the modal
      if (choices.length === 0) {
        onClose();
      }
      // 3. If typing is done AND there ARE choices, clicking backdrop/dialogue does nothing
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* BACKDROP - Handles clicks outside the boxes */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'transparent',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
        onClick={handleAction}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleAction();
        }}
      />

      {/* CHOICES BOX — Only shown when typing is done */}
      {choices.length > 0 && done && (
        <div style={{
          position: 'fixed',
          bottom: `${DIALOGUE_HEIGHT}px`,
          right: 0,
          zIndex: 101,
          backgroundColor: modalBg,
          ...DOUBLE_BORDER,
          borderRight: 'none',
          color: modalFg,
          minWidth: '260px',
          padding: '4px 0',
          touchAction: 'manipulation',
        }}>
          {choices.map((choice, index) => (
            <ChoiceItem
              key={index}
              label={choice.label}
              modalBg={modalBg}
              modalFg={modalFg}
              onClick={(e) => { 
                e.stopPropagation(); 
                choice.action(); 
              }}
            />
          ))}
        </div>
      )}

      {/* DIALOGUE BOX */}
      <div
        style={{
          bottom: 0,
          left: 0,
          width: '100%',
          height: `${DIALOGUE_HEIGHT}px`,
          zIndex: 101,
          backgroundColor: modalBg,
          ...DOUBLE_BORDER,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          color: modalFg,
          padding: '20px 28px',
          boxSizing: 'border-box' as const,
          display: 'flex',
          alignItems: 'flex-start',
          position: 'fixed' as const,
          cursor: 'pointer',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevents double-triggering with backdrop
          handleAction();
        }}
        onTouchEnd={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          handleAction(); 
        }}
      >
        <p style={{
          fontFamily: 'var(--font-omori), sans-serif',
          fontSize: '18px',
          lineHeight: '1.7',
          letterSpacing: '0.04em',
          margin: 0,
          whiteSpace: 'pre-line',
          flex: 1,
        }}>
          {displayed}
          {!done && (
            <span style={{
              display: 'inline-block',
              width: '2px',
              height: '1em',
              backgroundColor: modalFg,
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: 'blink 0.7s step-end infinite',
            }}/>
          )}
        </p>

        {/* Hand indicator — only show if NO choices and text is done */}
        {done && choices.length === 0 && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            width: '36px',
            height: '28px',
            pointerEvents: 'none',
            animation: 'float 2s ease-in-out infinite'
          }}>
            <Image
              src="/assets/select_hover.png"
              alt="next"
              fill
              style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

function ChoiceItem({
  label, modalBg, modalFg, onClick
}: {
  label: string;
  modalBg: string;
  modalFg: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setHovered(false);
        onClick(e as unknown as React.MouseEvent);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '36px',
        height: '28px',
        position: 'relative',
        flexShrink: 0,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.05s',
      }}>
        <Image
          src="/assets/select_hover.png"
          alt="select"
          fill
          style={{
            imageRendering: 'pixelated',
            objectFit: 'contain',
            filter: modalBg === 'black' ? 'none' : 'invert(1)',
          }}
        />
      </div>
      <span style={{
        fontFamily: 'var(--font-omori), sans-serif',
        fontSize: '18px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: modalFg,
      }}>
        {label}
      </span>
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
        transition: 'none',
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
      onTouchEnd={(e) => {
        e.preventDefault();  // ← add this
        e.stopPropagation(); // ← add this
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

      {hoverSrc ? (
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: hovered ? 0 : 1, transition: 'none' }}>
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
