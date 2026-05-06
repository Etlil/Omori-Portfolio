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

export default function AboutModal({ isOpen, onClose, onOpenProjects, isDark = false }: { isOpen: boolean; onClose: () => void; onOpenProjects: () => void; isDark?: boolean; }) {
  const bg = isDark ? 'black' : 'white';
  const fg = isDark ? 'white' : 'black';
  const bgAlt = isDark ? '#111' : '#f5f5f5';
  const borderStyle = isDark
    ? { border: '3px solid white', boxShadow: 'inset 0 0 0 2px black, inset 0 0 0 5px white' }
    : { border: '3px solid black', boxShadow: 'inset 0 0 0 2px white, inset 0 0 0 5px black' };
  const borderStyleDark = isDark
    ? { border: '3px solid white', boxShadow: 'inset 0 0 0 2px white, inset 0 0 0 5px black' }
    : { border: '3px solid black', boxShadow: 'inset 0 0 0 2px black, inset 0 0 0 5px white' };
  const [data, setData] = useState<{ tabs: string[]; content: Record<string, TabContent>; introDialog?: { text: string; face: string }[] } | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [pfpPupilOffset, setPfpPupilOffset] = useState({ x: 0, y: 0 });

  const [introSeen, setIntroSeen] = useState(false);
  const [interestView, setInterestView] = useState<null | 'categories' | string>(null);

  // --- NEW STATES FOR DIALOGUE & HOVER ---
  // Change this type at the top
  const [modalData, setModalData] = useState<{ 
    isOpen: boolean; 
    dialog: { text: string; face: string }[];
    choices?: { label: string; action: string; url?: string }[];
  }>({ isOpen: false, dialog: [] });
  const [dialogIndex, setDialogIndex] = useState(0); // Track current line
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!modalData.isOpen) return;
    const currentText = modalData.dialog[dialogIndex]?.text || "";
    setDisplayed('');
    setDone(false);
    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(currentText.slice(0, i));
      if (i >= currentText.length) {
        setDone(true);
        clearInterval(intervalRef.current);
      }
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, [modalData.isOpen, modalData.dialog, dialogIndex]);

  const handleDialogueAction = () => {
    if (!done) {
      clearInterval(intervalRef.current);
      setDisplayed(modalData.dialog[dialogIndex]?.text || "");
      setDone(true);
    } else {
      if (dialogIndex < modalData.dialog.length - 1) {
        setDialogIndex(prev => prev + 1);
      } else {
        // If there are choices, don't auto-close — wait for choice click
        if (!modalData.choices?.length) {
          setModalData({ isOpen: false, dialog: [] });
          setDialogIndex(0);
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen && data && !introSeen) {
      setModalData({ isOpen: true, dialog: data.introDialog || [] });
      setDialogIndex(0);
      setIntroSeen(true);
    }
  }, [isOpen]);

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
      background: bg,
      fontFamily: 'var(--font-omori), monospace',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '8px' : '20px',
      gap: '12px',
      overflow: 'hidden',
    }}>

      {/* TOP NAV BAR */}
      <div style={{
        border: isDark ? '3px solid white' : '3px solid black',
        boxShadow: isDark ? 'inset 0 0 0 2px black, inset 0 0 0 5px white' : 'inset 0 0 0 2px black, inset 0 0 0 5px white',
        background: isDark ? 'white' : 'black',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        height: isMobile ? '50px' : '65px',
        flexShrink: 0,
      }}>
        {isMobile ? (
          <>
            <button
              onClick={() => setBurgerOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDark ? 'black' : 'white',
                fontFamily: 'inherit',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '8px 12px',
                letterSpacing: '0.1em',
              }}
            >
              ☰
            </button>
            <span style={{
              color: isDark ? 'black' : 'white',
              fontSize: '15px',
              fontWeight: 'bold',
              letterSpacing: '0.15em',
              flex: 1,
              textAlign: 'center',
            }}>
              {activeTab}
            </span>
          </>
        ) : (
          tabs.map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onClick={() => { setActiveTab(tab); setInterestView(null); }}
              isMobile={isMobile}
              isDark={isDark}
            />
          ))
        )}
        <div style={{ marginLeft: isMobile ? '0' : 'auto', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? 'black' : 'white',
              fontFamily: 'inherit',
              fontSize: isMobile ? '16px' : '20px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '8px 20px',
              borderLeft: `2px solid ${isDark ? '#aaa' : '#555'}`,
              whiteSpace: 'nowrap',
            }}
          >
            EXIT
          </button>
        </div>
      </div>

      {/* BURGER SIDE DRAWER */}
      {isMobile && burgerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setBurgerOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 10010,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: '220px', zIndex: 10011,
            background: isDark ? 'white' : 'black',
            border: `3px solid ${isDark ? 'black' : 'white'}`,
            boxShadow: `inset 0 0 0 2px ${isDark ? 'white' : 'black'}, inset 0 0 0 5px ${isDark ? 'black' : 'white'}`,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 0',
          }}>
            <div style={{
              color: isDark ? 'black' : 'white', fontSize: '11px', letterSpacing: '0.2em',
              padding: '8px 20px 16px', borderBottom: `1px solid ${isDark ? '#ccc' : '#333'}`,
              opacity: 0.5,
            }}>
              NAVIGATE
            </div>
            {tabs.map((tab) => (
              <div
                key={tab}
                onClick={() => { setActiveTab(tab); setInterestView(null); setBurgerOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  background: activeTab === tab ? '#222' : 'transparent',
                  borderLeft: activeTab === tab ? '3px solid white' : '3px solid transparent',
                }}
              >
                <span style={{
                  color: activeTab === tab ? (isDark ? 'black' : 'white') : '#888',
                  fontSize: '16px',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-omori), monospace',
                }}>
                  {tab}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

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
            border: `3px solid ${fg}`, 
            background: bg,
            flexShrink: 0,
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <Image 
              src={modalData.isOpen 
                ? `/assets/${modalData.dialog[dialogIndex]?.face || 'act0'}.png` 
                : (isMobile ? '/assets/act0.png' : '/assets/pfp.png')}
              alt="P" 
              fill 
              style={{ imageRendering: 'pixelated', objectFit: 'cover' }} 
            />

            {!modalData.isOpen && !isMobile && (
              <div style={{
                position: 'absolute',
                top: '45%',
                left: '27.5%',
                width: '50%',
                height: '9.2%',
                transform: `translate(${pfpPupilOffset.x}px, ${pfpPupilOffset.y}px)`,
                transition: 'transform 0.05s ease-out',
                pointerEvents: 'none',
              }}>
                <Image src="/assets/pupil.png" alt="" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: isMobile ? 'auto' : '100%', flex: isMobile ? 1 : 'none', boxSizing: 'border-box' }}>
            <div style={{ ...borderStyle, background: bg, color: fg, padding: '8px 16px', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold' }}>ETLIL</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{ ...borderStyle, background: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white', padding: '10px 20px', fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold' }}>
            {current.title} — {activeTab}
          </div>

          {/* STATS TABLE - ADDED HOVER & CLICK DIALOGUE */}
          <div style={{ ...borderStyle, background: bg, color: fg, padding: '20px', flex: 1, overflowY: 'auto' }}>
          
          {/* BACK BUTTON — shown when drilling into a category */}
          {interestView && (
            <div
              onClick={() => setInterestView(interestView === 'categories' ? null : 'categories')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', marginBottom: '12px', borderBottom: `2px solid ${isDark ? '#333' : '#eee'}`, cursor: 'pointer' }}
            >
              <span style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', letterSpacing: '0.1em' }}>← BACK</span>
            </div>
          )}

          {/* NORMAL STATS VIEW */}
          {!interestView && current.stats.map((stat, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredStat(i)}
              onMouseLeave={() => setHoveredStat(null)}
              onClick={() => {
                if (stat.label === "PROJECTS") {
                  const dialogs = (stat as any).dialog || [{ text: "View my projects?", face: 'act1' }];
                  const choices = (stat as any).choices || [];
                  setModalData({ isOpen: true, dialog: dialogs, choices });
                  setDialogIndex(0);
                } else if (stat.label === "INTERESTS") {
                  setInterestView('categories');
                } else {
                  const dialogs = (stat as any).dialog ||
                    [{ text: `${stat.label}... It says "${stat.value}".`, face: 'act1' }];
                  setModalData({ isOpen: true, dialog: dialogs });
                  setDialogIndex(0);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: `2px solid ${isDark ? '#333' : '#eee'}`, cursor: 'pointer', gap: '10px' }}
            >
              <div style={{ width: '24px', height: '18px', position: 'relative', opacity: hoveredStat === i ? 1 : 0, animation: hoveredStat === i ? 'bob-nav 0.8s infinite' : 'none' }}>
                <Image src="/assets/select_hover.png" alt="h" fill style={{ imageRendering: 'pixelated', objectFit: 'contain', filter: isDark ? 'invert(1)' : 'none' }} />
              </div>
              <span style={{ fontSize: isMobile ? '14px' : '16px', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', minWidth: isMobile ? '90px' : '130px', fontWeight: 'bold' }}>{stat.label}:</span>
              <span style={{ fontSize: isMobile ? '16px' : '20px', color: isDark ? 'white' : 'black', flex: 1 }}>{stat.value}</span>
            </div>
          ))}

          {/* INTEREST CATEGORIES VIEW */}
          {interestView === 'categories' && (() => {
            const interestStat = current.stats.find(s => s.label === "INTERESTS") as any;
            const categories = interestStat?.interests ? Object.keys(interestStat.interests) : [];
            return categories.map((cat, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={() => {
                  const catData = interestStat.interests[cat];
                  if (cat === 'Programming') {
                    if (catData?.dialog) {
                      setModalData({ isOpen: true, dialog: catData.dialog });
                      setDialogIndex(0);
                    }
                  } else if (cat === 'Art') {
                    if (catData?.dialog) {
                      setModalData({ isOpen: true, dialog: catData.dialog });
                      setDialogIndex(0);
                    }
                  } else {
                    setInterestView(cat);
                    if (catData?.dialog) {
                      setModalData({ isOpen: true, dialog: catData.dialog });
                      setDialogIndex(0);
                    }
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: `2px solid ${isDark ? '#333' : '#eee'}`, cursor: 'pointer', gap: '10px' }}
              >
                <div style={{ width: '24px', height: '18px', position: 'relative', opacity: hoveredStat === i ? 1 : 0, animation: hoveredStat === i ? 'bob-nav 0.8s infinite' : 'none' }}>
                  <Image src="/assets/select_hover.png" alt="h" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: isMobile ? '16px' : '20px', color: isDark ? 'white' : 'black', flex: 1 }}>{cat}</span>
              </div>
            ));
          })()}

          {/* INTEREST ITEMS VIEW */}
          {interestView && interestView !== 'categories' && (() => {
            const interestStat = current.stats.find(s => s.label === "INTERESTS") as any;
            const items = interestStat?.interests?.[interestView]?.items || [];
            return items.map((item: any, i: number) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={() => {
                  setModalData({ isOpen: true, dialog: item.dialog || [{ text: item.name, face: 'act0' }] });
                  setDialogIndex(0);
                }}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '2px solid #eee', cursor: 'pointer', gap: '10px' }}
              >
                <div style={{ width: '24px', height: '18px', position: 'relative', opacity: hoveredStat === i ? 1 : 0, animation: hoveredStat === i ? 'bob-nav 0.8s infinite' : 'none' }}>
                  <Image src="/assets/select_hover.png" alt="h" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: isMobile ? '14px' : '16px', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', minWidth: isMobile ? '90px' : '130px', fontWeight: 'bold' }}>#{i + 1}</span>
                <span style={{ fontSize: isMobile ? '16px' : '20px', color: isDark ? 'white' : 'black', flex: 1 }}>{item.name}</span>
              </div>
            ));
          })()}

        </div>
        </div>
      </div>

      {/* --- OMORI DIALOGUE MODAL --- */}
      {modalData.isOpen && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'transparent' }} onClick={handleDialogueAction} />
        
        {/* CHOICES BOX */}
        {done && modalData.choices && modalData.choices.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '215px',
            right: 0,
            zIndex: 10002,
            backgroundColor: 'black',
            border: '3px solid white',
            boxShadow: 'inset 0 0 0 3px black, inset 0 0 0 6px white',
            borderRight: 'none',
            color: 'white',
            minWidth: '260px',
            padding: '4px 0',
          }}>
            {modalData.choices.map((choice, i) => (
              <ChoiceRow
                key={i}
                label={choice.label}
                onClick={() => {
                  if (choice.action === 'open' && choice.url) {
                    window.open(choice.url, '_blank');
                  } else if (choice.action === 'projects') {
                    onOpenProjects();
                  }
                  setModalData({ isOpen: false, dialog: [] });
                  setDialogIndex(0);
                }}
              />
            ))}
          </div>
        )}

        <div
          style={{
            bottom: 0, left: 0, width: '100%', height: '160px', zIndex: 10001,
            backgroundColor: 'black', borderTop: '3px solid white', outline: '3px solid black',
            boxShadow: 'inset 0 0 0 3px black, inset 0 0 0 6px white',
            color: 'white', padding: '25px 40px', display: 'flex', cursor: 'pointer',
            position: 'fixed',
          }}
          onClick={(e) => { e.stopPropagation(); handleDialogueAction(); }}
        >
          <p style={{ fontFamily: 'var(--font-omori)', fontSize: '20px', lineHeight: '1.6', flex: 1, margin: 0 }}>
            {displayed}
            {!done && <span style={{ display: 'inline-block', width: '8px', height: '18px', backgroundColor: 'white', marginLeft: '4px' }}/>}
          </p>
          {done && !modalData.choices?.length && (
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

function ChoiceRow({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer' }}
    >
      <div style={{ width: '24px', height: '18px', position: 'relative', flexShrink: 0, opacity: hovered ? 1 : 0 }}>
        <Image src="/assets/select_hover.png" alt="" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-omori)', fontSize: '18px', letterSpacing: '0.1em', color: 'white' }}>{label}</span>
    </div>
  );
}
// Sub-components
function TabButton({ label, active, onClick, isMobile, isDark }: any) {
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
          color: show ? (isDark ? 'black' : 'white') : (isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'),
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