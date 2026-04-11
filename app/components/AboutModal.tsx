'use client';

import { useState } from 'react';
import Image from 'next/image';

const DOUBLE_BORDER = {
  border: '3px solid black',
  boxShadow: 'inset 0 0 0 2px white, inset 0 0 0 5px black',
};

const DOUBLE_BORDER_DARK = {
  border: '3px solid black',
  boxShadow: 'inset 0 0 0 2px black, inset 0 0 0 5px white',
};

type Stat = { label: string; value: string | number; };

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
  const [activeTab, setActiveTab] = useState('EQUIP');

  const tabs = ['???', 'EQUIP', 'POCKET', 'SKILLS', 'OPTIONS'];

  const content: Record<string, TabContent> = {
    '???': {
      title: 'UNKNOWN',
      level: 1,
      hp: '33/33',
      juice: '20/20',
      stats: [
        { label: 'HEART', value: 33 },
        { label: 'JUICE', value: 20 },
        { label: 'ATTACK', value: '???' },
        { label: 'DEFENSE', value: '???' },
        { label: 'SPEED', value: '???' },
        { label: 'LUCK', value: '???' },
        { label: 'HIT', value: '???' },
      ],
      description: "You don't know much about this person. But something feels familiar.",
    },
    EQUIP: {
      title: 'ETLIL',
      level: 20,
      hp: '33/33',
      juice: '20/20',
      stats: [
        { label: 'HEART', value: 33 },
        { label: 'JUICE', value: 20 },
        { label: 'ATTACK', value: 10 },
        { label: 'DEFENSE', value: 6 },
        { label: 'SPEED', value: 6 },
        { label: 'LUCK', value: 5 },
        { label: 'HIT', value: 100 },
      ],
      description: 'A developer living in White Space. You can see a faint glow of code in their eyes.',
      equipped: [
        { label: 'WEAPON', item: 'LAPTOP' },
        { label: 'CHARM', item: 'PIXEL ART' },
      ],
    },
    POCKET: {
      title: 'INVENTORY',
      level: 20,
      hp: '33/33',
      juice: '20/20',
      stats: [
        { label: 'NAME', value: 'Jezreel Pimentel' },
        { label: 'AGE', value: 20 },
        { label: 'LOCATION', value: 'Philippines' },
        { label: 'INTERESTS', value: 'Game Dev, UI/UX' },
        { label: 'TRAITS', value: 'Determined, Creative' },
        { label: 'EMAIL', value: 'jezreelpimentel@gmail.com' },
        { label: 'GITHUB', value: 'github.com/Etlil' },
      ],
      description: 'These are the things he carries with him. Always.',
    },
    SKILLS: {
      title: 'ABILITIES',
      level: 20,
      hp: '33/33',
      juice: '20/20',
      stats: [
        { label: 'FRONTEND', value: 'React, Next.js, Tailwind' },
        { label: 'BACKEND', value: 'Node.js, Express' },
        { label: 'DATABASE', value: 'MySQL, MongoDB' },
        { label: 'TOOLS', value: 'Git, VS Code, Figma' },
        { label: 'DESIGN', value: 'Pixel Art, UI/UX' },
        { label: 'LEARNING', value: 'Three.js, Rust' },
        { label: 'LANGUAGE', value: 'JS, TS, Python' },
      ],
      description: 'Skills forged through countless late nights and cold coffee.',
    },
    OPTIONS: {
      title: 'SETTINGS',
      level: 20,
      hp: '33/33',
      juice: '20/20',
      stats: [
        { label: 'SCHOOL', value: 'Your University' },
        { label: 'COURSE', value: 'Computer Science' },
        { label: 'YEAR', value: '3rd Year' },
        { label: 'GOAL', value: 'Full Stack Engineer' },
        { label: 'DREAM', value: 'Create an impactful RPG' },
        { label: 'STATUS', value: 'Open to Work' },
        { label: 'MOOD', value: 'Determined' },
      ],
      description: 'The future is bright. Something is waiting for you at the end.',
    },
  };

  if (!isOpen) return null;

  const current = content[activeTab];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9995,
      background: 'white',
      fontFamily: 'var(--font-omori), monospace',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      gap: '8px',
      overflow: 'hidden',
    }}>

      {/* TOP NAV BAR */}
      <div style={{
        ...DOUBLE_BORDER_DARK,
        background: 'black',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        height: '52px',
        flexShrink: 0,
      }}>
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontFamily: 'inherit',
              fontSize: '14px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '8px 16px',
              borderLeft: '2px solid #555',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = 'white')}
          >
            EXIT
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flex: 1,
        minHeight: 0,
      }}>

        {/* LEFT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '180px',
          flexShrink: 0,
        }}>

          {/* Portrait */}
          <div style={{
            ...DOUBLE_BORDER,
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px 8px 8px',
            flex: 1,
          }}>
            <div style={{ position: 'relative', width: '100px', height: '120px', marginBottom: '8px' }}>
              <Image src="/assets/me.png" alt="Profile" fill
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }}/>
            </div>
          </div>

          {/* Name + Level */}
          <div style={{
            ...DOUBLE_BORDER,
            background: 'white',
            padding: '8px 12px',
          }}>
            <div style={{ fontSize: '16px', letterSpacing: '0.05em' }}>
              {activeTab === '???' ? 'OMORI' : 'ETLIL'}
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
              LVL. {current.level}
            </div>
          </div>

          {/* HP / Juice bars */}
          <div style={{
            ...DOUBLE_BORDER,
            background: 'white',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <Bar icon="❤" color="#ef4444" value={current.hp ?? 'MAX'} pct={100} />
            <Bar icon="💧" color="#22d3ee" value={current.juice ?? '80%'} pct={80} />
          </div>

          {/* Equipped items */}
          {current.equipped && (
            <div style={{
              ...DOUBLE_BORDER,
              background: 'white',
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {current.equipped.map((eq, i) => (
                <div key={i}>
                  <div style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    color: '#555',
                    borderBottom: '1px solid #ddd',
                  }}>{eq.label}</div>
                  <div style={{
                    padding: '6px 12px 8px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: i < current.equipped!.length - 1 ? '2px solid black' : 'none',
                  }}>
                    <div style={{ position: 'relative', width: '20px', height: '14px', flexShrink: 0 }}>
                      <Image src="/assets/select_hover.png" alt="" fill
                        style={{ imageRendering: 'pixelated', objectFit: 'contain' }}/>
                    </div>
                    {eq.item}
                  </div>
                </div>
              ))}
              <div style={{ padding: '6px 12px', fontSize: '11px', color: '#aaa', letterSpacing: '0.1em' }}>
                ——————
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
          minWidth: 0,
        }}>

          {/* Stats table */}
          <div style={{
            ...DOUBLE_BORDER,
            background: 'white',
            padding: '16px 20px',
            flex: 1,
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '6px',
            }}>
              {current.stats.map((stat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '16px',
                  paddingBottom: '6px',
                  borderBottom: i < current.stats.length - 1 ? '1px solid #eee' : 'none',
                }}>
                  <span style={{
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    color: '#555',
                    minWidth: '90px',
                    flexShrink: 0,
                  }}>{stat.label}:</span>
                  <span style={{
                    fontSize: '15px',
                    letterSpacing: '0.05em',
                    color: 'black',
                  }}>{stat.value}</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '13px',
                    color: '#bbb',
                    letterSpacing: '0.1em',
                    flexShrink: 0,
                  }}>---</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description box */}
          <div style={{
            ...DOUBLE_BORDER_DARK,
            background: 'black',
            padding: '16px 20px',
            minHeight: '100px',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '8px', right: '12px',
              opacity: 0.15,
              transform: 'rotate(12deg)',
            }}>
              <Image src="/assets/select_hover.png" alt="" width={50} height={34}
                style={{ imageRendering: 'pixelated', filter: 'invert(1)' }}/>
            </div>
            <p style={{
              color: 'white',
              fontSize: '15px',
              lineHeight: '1.7',
              letterSpacing: '0.04em',
              margin: 0,
              fontStyle: 'italic',
            }}>
              {current.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const show = active || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <div style={{
        position: 'relative', width: '22px', height: '16px',
        flexShrink: 0,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.05s',
      }}>
        <Image src="/assets/select_hover.png" alt="" fill
          style={{ imageRendering: 'pixelated', objectFit: 'contain', filter: 'invert(1)' }}/>
      </div>
      <span style={{
        fontSize: '14px',
        letterSpacing: '0.15em',
        color: show ? 'white' : '#666',
        transition: 'color 0.05s',
      }}>{label}</span>
    </div>
  );
}

function Bar({ icon, color, value, pct }: { icon: string; color: string; value: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '14px', lineHeight: 1 }}>{icon}</span>
      <div style={{
        flex: 1, height: '20px',
        background: '#e5e7eb',
        border: '2px solid black',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${pct}%`,
          background: color,
          transition: 'width 0.5s ease',
        }}/>
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: 'white',
          mixBlendMode: 'difference',
          letterSpacing: '0.05em',
        }}>{value}</span>
      </div>
    </div>
  );
}