'use client';

import { useState, useEffect } from 'react';
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

export default function AboutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [data, setData] = useState<{ tabs: string[]; content: Record<string, TabContent> } | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Pupil tracking state for the profile picture
  const [pfpPupilOffset, setPfpPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Don't run on mobile or if modal is closed
      if (isMobile || !isOpen) return;

      // Calculate mouse position relative to the center of the screen
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Update pupil offset (6.25 is the sensitivity you used before)
      setPfpPupilOffset({
        x: x * 4,
        y: y * 4
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, isOpen]);

  // 1. Fetch JSON Implementation (Desktop Modal Style)
  useEffect(() => {
    fetch('/assets/aboutData.json')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setActiveTab(d.tabs[0]);
      })
      .catch(console.error);
  }, []);

  // 2. Mobile Detection
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
      padding: isMobile ? '8px' : '20px', // Increased padding
      gap: '12px',
      overflow: 'hidden',
    }}>

      {/* TOP NAV BAR - Increased height */}
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
              fontSize: isMobile ? '16px' : '20px', // Increased from 12/14
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

      {/* MAIN AREA */}
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
          {/* Portrait Box - Simple 1:1 Frame */}
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
            {/* Base Head Image */}
            <Image 
              src="/assets/pfp.png" 
              alt="P" 
              fill 
              style={{ imageRendering: 'pixelated', objectFit: 'cover' }} 
            />

            {/* Pupils Layer — Added on top */}
            <div style={{
              position: 'absolute',
              // Using the eye-alignment percentages from your main page
              top: isMobile ? '9.5%' : '45%',
              left: isMobile ? '42.5%' : '26.5%',
              width: isMobile ? '50%' : '50%',
              height: isMobile ? '9.2%' : '9.2%',
              transform: `translate(${pfpPupilOffset.x}px, ${pfpPupilOffset.y}px)`,
              transition: 'transform 0.05s ease-out',
              pointerEvents: 'none',
            }}>
              <Image
                src="/assets/pupil.png"
                alt=""
                fill
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Name Box - Aligned to the Portrait Box width */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: isMobile ? 'auto' : '100%', // Match full width on desktop
            flex: isMobile ? 1 : 'none',       // Fill remaining space on mobile
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              ...DOUBLE_BORDER, 
              background: 'white', 
              padding: '8px 16px',
              width: '100%',
              boxSizing: 'border-box', // Keeps the border aligned with the PFP frame
              textAlign: 'center'      // Centers the name like a status screen
            }}>
              <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold' }}>ETLIL</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{ ...DOUBLE_BORDER, background: 'black', color: 'white', padding: '10px 20px', fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold' }}>
            {current.title} — {activeTab}
          </div>

          <div style={{ ...DOUBLE_BORDER, background: 'white', padding: '20px', flex: 1, overflowY: 'auto' }}>
            {current.stats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', padding: '12px 0', borderBottom: '2px solid #eee', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: isMobile ? '14px' : '16px', color: '#555', minWidth: isMobile ? '90px' : '130px', fontWeight: 'bold' }}>{stat.label}:</span>
                <span style={{ fontSize: isMobile ? '16px' : '20px', color: 'black', flex: 1 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes bob-nav {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
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
      {/* The Cursor Container */}
      <div
        style={{
          position: 'relative',
          width: isMobile ? '24px' : '32px', // Original-style size
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

function Bar({ icon, color, value, pct, isMobile }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: isMobile ? '18px' : '22px' }}>{icon}</span>
      <div style={{ flex: 1, height: isMobile ? '20px' : '28px', background: '#e5e7eb', border: '3px solid black', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: color }}/>
        <span style={{ 
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: isMobile ? '11px' : '13px', color: 'white', mixBlendMode: 'difference', fontWeight: 'bold' 
        }}>{value}</span>
      </div>
    </div>
  );
}