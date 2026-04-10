'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [charHovered, setCharHovered] = useState(false);
  const [bulbHovered, setBulbHovered] = useState(false);
  const smoothRef = useRef({ x: 0, y: 0 });
  const targetWobbleRef = useRef({ x: 0, y: 0 });

  const router = useRouter();
  

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
            <SceneItem label="Projects" isDark={isDark} onClick={() => router.push('/projects')}>
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
            zIndex: 50,
            pointerEvents: 'none',
            transition: 'transform 0.12s ease-out, bottom 0.3s ease',
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
            onClick={() => router.push('/aboutme')} 
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
              transition: 'transform 0.15s ease-out', // Slightly increased duration for a smoother "snap" back to center
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
                transition: 'transform 0.05s ease-out', // No opacity transition
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

    </div>
  );
}

type ContactIcon = {
  id: string;
  label: string;
  icon: string;
  url: string;
  dialog: string | string[];
  choices: { label: string; action: string; value?: string }[];
};

function DesktopModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [time, setTime] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [contacts, setContacts] = useState<{
    job: ContactIcon[];
    social: ContactIcon[];
  }>({ job: [], social: [] });

  useEffect(() => {
    fetch('/assets/contacts.json')
      .then(r => r.json())
      .then(setContacts)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const tick = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${h}:${m} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  // Start typing when activeId changes
  useEffect(() => {
    if (!activeId) return;
    const allIcons = [...contacts.job, ...contacts.social];
    const active = allIcons.find(i => i.id === activeId);
    if (!active) return;

    const dialogs = Array.isArray(active.dialog) ? active.dialog : [active.dialog];
    const currentText = dialogs[dialogIndex] ?? '';

    setDisplayed('');
    setDone(false);
    setCopied(false);
    indexRef.current = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(currentText.slice(0, indexRef.current));
      if (indexRef.current >= currentText.length) {
        setDone(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 35);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeId, dialogIndex, contacts]);

  const skipTyping = () => {
    const allIcons = [...contacts.job, ...contacts.social];
    const active = allIcons.find(i => i.id === activeId);
    if (!active) return;

    const dialogs = Array.isArray(active.dialog) ? active.dialog : [active.dialog];
    const currentText = dialogs[dialogIndex] ?? '';

    if (!done) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(currentText);
      setDone(true);
    } else {
      const isLastDialog = dialogIndex >= dialogs.length - 1;
      if (!isLastDialog) {
        setDialogIndex(prev => prev + 1);
      }
    }
  };

  const handleChoice = (choice: { label: string; action: string; value?: string }) => {
    if (choice.action === 'open') {
      const allIcons = [...contacts.job, ...contacts.social];
      const active = allIcons.find(i => i.id === activeId);
      if (active) window.open(active.url, '_blank');
      setActiveId(null);
    } else if (choice.action === 'copy' && choice.value) {
      navigator.clipboard.writeText(choice.value).then(() => {
        setCopied(true);
        setTimeout(() => { setCopied(false); setActiveId(null); }, 1200);
      });
    } else if (choice.action === 'close') {
      setActiveId(null);
    }
  };

  if (!isOpen) return null;

  const allIcons = [...contacts.job, ...contacts.social];
  const active = allIcons.find(i => i.id === activeId);

  const DIALOGUE_HEIGHT = 120;
  const DOUBLE_BORDER = {
    border: '3px solid #fff',
    boxShadow: 'inset 0 0 0 3px #000, inset 0 0 0 6px #fff',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 'min(820px, 95vw)',
        height: 'min(560px, 85vh)',
        background: '#1a1a1a',
        border: '6px solid #111',
        borderRadius: '8px',
        boxShadow: '0 0 0 2px #555, 0 0 40px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-omori), monospace',
      }}>
        <div style={{
          flex: 1,
          background: '#2a2a2a',
          border: '4px solid #000',
          margin: '8px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Wallpaper */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: "url('https://www.transparenttextures.com/patterns/brick-wall.png')",
            backgroundSize: '200px',
            filter: 'grayscale(100%) contrast(1.2)',
            opacity: 0.6,
            pointerEvents: 'none', zIndex: 1,
          }}/>

          {/* CRT scanlines */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            pointerEvents: 'none', zIndex: 2,
          }}/>

          {/* Desktop icons */}
          <div
            onClick={activeId ? skipTyping : undefined}
            onTouchEnd={activeId ? (e) => { e.preventDefault(); skipTyping(); } : undefined}
            style={{
              position: 'relative', zIndex: 15,
              flex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              paddingBottom: activeId ? `${DIALOGUE_HEIGHT + 16}px` : '16px',
              transition: 'padding-bottom 0.2s ease',
              cursor: activeId ? 'pointer' : 'default',
            }}
          >
            {/* LEFT — Job */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              {contacts.job.map(icon => (
                <DesktopIcon
                  key={icon.id}
                  label={icon.label}
                  iconSrc={icon.icon}
                  isActive={activeId === icon.id}
                  onClick={() => { setDialogIndex(0); setActiveId(prev => prev === icon.id ? null : icon.id); }}
                  onDoubleClick={() => { setDialogIndex(0); setActiveId(icon.id); }}
                />
              ))}
            </div>

            {/* RIGHT — Social */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              {contacts.social.map(icon => (
                <DesktopIcon
                  key={icon.id}
                  label={icon.label}
                  iconSrc={icon.icon}
                  isActive={activeId === icon.id}
                  onClick={() => { setDialogIndex(0); setActiveId(prev => prev === icon.id ? null : icon.id); }}
                  onDoubleClick={() => { setDialogIndex(0); setActiveId(icon.id); }}
                />
              ))}
            </div>
          </div>

          {/* OMORI modal inside desktop — choices box */}
          {activeId && active && done && (() => {
            const dialogs = Array.isArray(active.dialog) ? active.dialog : [active.dialog];
            return dialogIndex >= dialogs.length - 1;
          })() && (
            <div style={{
              position: 'absolute',
              bottom: `${DIALOGUE_HEIGHT}px`,
              right: 0,
              zIndex: 70,
              backgroundColor: '#000',
              ...DOUBLE_BORDER,
              borderRight: 'none',
              color: '#fff',
              minWidth: '200px',
              padding: '4px 0',
            }}>
              {active.choices.map((choice, i) => (
                <DesktopChoiceItem
                  key={i}
                  label={copied && choice.action === 'copy' ? 'COPIED!' : choice.label}
                  onClick={() => handleChoice(choice)}
                />
              ))}
            </div>
          )}

          {/* OMORI dialogue box inside desktop */}
          {activeId && active && (
            <div
              onClick={skipTyping}
              onTouchEnd={(e) => { e.preventDefault(); skipTyping(); }}
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: `${DIALOGUE_HEIGHT}px`,
                zIndex: 70,
                backgroundColor: '#000',
                ...DOUBLE_BORDER,
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                color: '#fff',
                padding: '14px 20px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-omori), sans-serif',
                fontSize: '15px',
                lineHeight: '1.6',
                letterSpacing: '0.04em',
                margin: 0,
                whiteSpace: 'pre-line',
                flex: 1,
              }}>
                {displayed}
                {!done && (
                  <span style={{
                    display: 'inline-block',
                    width: '2px', height: '1em',
                    backgroundColor: '#fff',
                    marginLeft: '2px',
                    verticalAlign: 'text-bottom',
                    animation: 'blink 0.7s step-end infinite',
                  }}/>
                )}
              </p>

              {/* Hand indicator */}
              {done && (
                <div style={{
                  position: 'absolute',
                  bottom: '10px', right: '12px',
                  width: '30px', height: '24px',
                  pointerEvents: 'none',
                  animation: 'float 2s ease-in-out infinite',
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
          )}

          {/* Taskbar */}
          <div style={{
            position: 'relative', zIndex: 60,
            background: '#888',
            borderTop: '2px solid #ccc',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '3px 8px', height: '32px',
            flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                background: '#ccc',
                border: '2px solid',
                borderColor: '#fff #555 #555 #fff',
                padding: '2px 10px',
                fontFamily: 'inherit', fontSize: '13px',
                fontWeight: 'bold', letterSpacing: '0.05em',
                cursor: 'pointer', color: '#000', textTransform: 'uppercase',
              }}
            >SHUT DOWN</button>
            <div style={{
              background: '#aaa',
              border: '2px solid',
              borderColor: '#555 #fff #fff #555',
              padding: '2px 10px',
              fontSize: '12px', letterSpacing: '0.05em', color: '#000',
            }}>{time}</div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DesktopChoiceItem({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setHovered(false); onClick(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '7px 14px', cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '28px', height: '22px',
        position: 'relative', flexShrink: 0,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.05s',
      }}>
        <Image
          src="/assets/select_hover.png"
          alt="select"
          fill
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
        />
      </div>
      <span style={{
        fontFamily: 'var(--font-omori), sans-serif',
        fontSize: '14px', letterSpacing: '0.1em',
        textTransform: 'uppercase', whiteSpace: 'nowrap',
        color: '#fff',
      }}>{label}</span>
    </div>
  );
}

function DesktopIcon({
  label, iconSrc, isActive, onClick, onDoubleClick
}: {
  label: string;
  iconSrc: string;
  isActive: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const lastTap = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onDoubleClick();
    } else {
      onClick();
    }
    lastTap.current = now;
  };

  return (
    <div
      onClick={handleTap}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '4px', cursor: 'pointer',
        padding: '6px',
        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        border: isActive ? '1px dotted #fff' : '1px solid transparent',
        width: '64px',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
        <Image
          src={iconSrc}
          alt={label}
          fill
          style={{ imageRendering: 'pixelated', objectFit: 'contain', filter: 'grayscale(100%)' }}
        />
      </div>
      <span style={{
        fontSize: '10px', color: '#fff',
        textShadow: '1px 1px 0px #000, -1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000',
        letterSpacing: '0.05em', whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>{label}</span>
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
