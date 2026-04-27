'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const DOUBLE_BORDER = {
  border: '3px solid black',
  boxShadow: 'inset 0 0 0 2px white, inset 0 0 0 5px black',
};

const DOUBLE_BORDER_DARK = {
  border: '3px solid black',
  boxShadow: 'inset 0 0 0 2px black, inset 0 0 0 5px white',
};

type Stat = { label: string; value: string | number };
type TabContent = {
  title: string;
  level: number;
  hp?: string;
  juice?: string;
  stats: Stat[];
  description: string;
  equipped?: { label: string; item: string }[];
};

export default function AboutModal({ isOpen, onClose, onOpenProjects }: { isOpen: boolean; onClose: () => void; onOpenProjects: () => void; }) {
  const [data, setData] = useState<{ tabs: string[]; content: Record<string, TabContent> } | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [pfpPupilOffset, setPfpPupilOffset] = useState({ x: 0, y: 0 });

  // --- NEW STATES FOR DIALOGUE & HOVER ---
  const [modalData, setModalData] = useState({ isOpen: false, text: "" });
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const intervalRef = useRef<any>(null);

  // 1. Typewriter logic for the dialogue
  useEffect(() => {
    if (!modalData.isOpen) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(modalData.text.slice(0, i));
      if (i >= modalData.text.length) {
        setDone(true);
        clearInterval(intervalRef.current);
      }
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, [modalData.isOpen, modalData.text]);

  const handleDialogueAction = () => {
    if (!done) {
      clearInterval(intervalRef.current);
      setDisplayed(modalData.text);
      setDone(true);
    } else {
      setModalData({ isOpen: false, text: "" });
    }
  };

  // Pupil tracking logic (KEPT AS REQUESTED)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile || !isOpen) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPfpPupilOffset({ x: x * 4, y: y * 4 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, isOpen]);

  // Fetch JSON
  useEffect(() => {
    fetch('/assets/aboutData.json')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setActiveTab(d.tabs[0]);
      })
      .catch(console.error);
  }, []);

  // Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen || !data) return null;

  const { tabs, content } = data;
  const current = content[activeTab];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9995,
      background: 'white',
      fontFamily: 'var(--font-omori), monospace',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '8px' : '20px',
      gap: '12px',
      overflow: 'hidden',
    }}>

      {/* TOP NAV BAR */}
      <div style={{
        ...DOUBLE_BORDER_DARK,
        background: 'black',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        height: isMobile ? '50px' : '65px',
        flexShrink: 0,
        overflowX: 'auto',
      }}>
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            isMobile={isMobile}
          />
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontFamily: 'inherit',
              fontSize: isMobile ? '16px' : '20px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '8px 20px',
              borderLeft: '2px solid #555',
              whiteSpace: 'nowrap',
            }}
          >
            EXIT
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '12px',
        flex: 1,
        minHeight: 0,
      }}>

        {/* LEFT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: '12px',
          width: isMobile ? '100%' : '220px',
          flexShrink: 0,
          justifyContent: 'flex-start',
          alignItems: 'flex-start' 
        }}>
          <div style={{ 
            position: 'relative', 
            width: isMobile ? '100px' : '100%', 
            aspectRatio: '1/1', 
            border: '3px solid black', 
            background: 'white',
            flexShrink: 0,
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <Image 
              src="/assets/pfp.png" 
              alt="P" 
              fill 
              style={{ imageRendering: 'pixelated', objectFit: 'cover' }} 
            />

            <div style={{
              position: 'absolute',
              top: isMobile ? '9.5%' : '45%',
              left: isMobile ? '42.5%' : '27.5%',
              width: isMobile ? '50%' : '50%',
              height: isMobile ? '9.2%' : '9.2%',
              transform: `translate(${pfpPupilOffset.x}px, ${pfpPupilOffset.y}px)`,
              transition: 'transform 0.05s ease-out',
              pointerEvents: 'none',
            }}>
              <Image src="/assets/pupil.png" alt="" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: isMobile ? 'auto' : '100%', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }}>
            <div style={{ ...DOUBLE_BORDER, background: 'white', padding: '8px 16px', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold' }}>ETLIL</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{ ...DOUBLE_BORDER, background: 'black', color: 'white', padding: '10px 20px', fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold' }}>
            {current.title} — {activeTab}
          </div>

          {/* STATS TABLE - ADDED HOVER & CLICK DIALOGUE */}
          <div style={{ ...DOUBLE_BORDER, background: 'white', padding: '20px', flex: 1, overflowY: 'auto' }}>
            {current.stats.map((stat, i) => (
              <div 
                key={i} 
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={() => {
                  // If the label is PROJECTS, trigger the special navigation
                  if (stat.label === "PROJECTS") {
                    onOpenProjects();
                  } else {
                    // Otherwise, show the normal dialogue
                    setModalData({ 
                      isOpen: true, 
                      text: `${stat.label}... It says "${stat.value}".` 
                    });
                  }
                }}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '12px 0', 
                  borderBottom: '2px solid #eee', cursor: 'pointer', gap: '10px' 
                }}
              >
                {/* THE HOVER HAND */}
                <div style={{ 
                  width: '24px', height: '18px', position: 'relative', 
                  opacity: hoveredStat === i ? 1 : 0,
                  animation: hoveredStat === i ? 'bob-nav 0.8s infinite' : 'none'
                }}>
                  <Image src="/assets/select_hover.png" alt="h" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
                </div>

                <span style={{ fontSize: isMobile ? '14px' : '16px', color: '#555', minWidth: isMobile ? '90px' : '130px', fontWeight: 'bold' }}>{stat.label}:</span>
                <span style={{ fontSize: isMobile ? '16px' : '20px', color: 'black', flex: 1 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- OMORI DIALOGUE MODAL --- */}
      {modalData.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent' }} onClick={handleDialogueAction} />
          <div
            style={{
              bottom: 0, left: 0, width: '100%', height: '160px', zIndex: 10001,
              backgroundColor: 'black', borderTop: '3px solid white', outline: '3px solid black',
              boxShadow: 'inset 0 0 0 3px black, inset 0 0 0 6px white',
              color: 'white', padding: '25px 40px', display: 'flex', cursor: 'pointer'
            }}
            onClick={(e) => { e.stopPropagation(); handleDialogueAction(); }}
          >
            <p style={{ fontFamily: 'var(--font-omori)', fontSize: '20px', lineHeight: '1.6', flex: 1, margin: 0 }}>
              {displayed}
              {!done && <span style={{ display: 'inline-block', width: '8px', height: '18px', backgroundColor: 'white', marginLeft: '4px' }}/>}
            </p>
            {done && (
              <div style={{ position: 'absolute', bottom: '15px', right: '20px', width: '30px', height: '20px', animation: 'float 2s infinite' }}>
                <Image src="/assets/select_hover.png" alt="next" fill style={{ imageRendering: 'pixelated', objectFit: 'contain'}} />
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes bob-nav {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

// Sub-components
function TabButton({ label, active, onClick, isMobile }: any) {
  const [hovered, setHovered] = useState(false);
  const show = active || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isMobile ? '8px 12px' : '12px 20px',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: isMobile ? '24px' : '32px',
          height: isMobile ? '16px' : '20px',
          flexShrink: 0,
          opacity: show ? 1 : 0,
          animation: show ? 'bob-nav 0.8s ease-in-out infinite' : 'none',
        }}
      >
        <Image
          src="/assets/select_hover.png"
          alt=""
          fill
          style={{
            imageRendering: 'pixelated',
            objectFit: 'contain',
            // USER REQUESTED: NO INVERT ON THE HAND
          }}
        />
      </div>

      <span
        style={{
          fontSize: isMobile ? '15px' : '19px',
          color: show ? 'white' : '#c3c3c3',
          whiteSpace: 'nowrap',
          fontWeight: active ? 'bold' : 'normal',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
    </div>
  );
}