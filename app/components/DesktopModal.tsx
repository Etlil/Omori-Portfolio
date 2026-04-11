'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type ContactIcon = {
  id: string;
  label: string;
  icon: string;
  url: string;
  dialog: string | string[];
  choices: { label: string; action: string; value?: string }[];
};

export default function DesktopModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: "url('https://www.transparenttextures.com/patterns/brick-wall.png')",
            backgroundSize: '200px',
            filter: 'grayscale(100%) contrast(1.2)',
            opacity: 0.6,
            pointerEvents: 'none', zIndex: 1,
          }}/>

          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            pointerEvents: 'none', zIndex: 2,
          }}/>

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
                borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
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
                fontSize: '15px', lineHeight: '1.6',
                letterSpacing: '0.04em', margin: 0,
                whiteSpace: 'pre-line', flex: 1,
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
              {done && (
                <div style={{
                  position: 'absolute',
                  bottom: '10px', right: '12px',
                  width: '30px', height: '24px',
                  pointerEvents: 'none',
                  animation: 'float 2s ease-in-out infinite',
                }}>
                  <Image src="/assets/select_hover.png" alt="next" fill
                    style={{ imageRendering: 'pixelated', objectFit: 'contain' }}/>
                </div>
              )}
            </div>
          )}

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
      <div style={{ width: '28px', height: '22px', position: 'relative', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.05s' }}>
        <Image src="/assets/select_hover.png" alt="select" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }}/>
      </div>
      <span style={{ fontFamily: 'var(--font-omori), sans-serif', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: '#fff' }}>{label}</span>
    </div>
  );
}

function DesktopIcon({ label, iconSrc, isActive, onClick, onDoubleClick }: {
  label: string; iconSrc: string; isActive: boolean; onClick: () => void; onDoubleClick: () => void;
}) {
  const lastTap = useRef(0);
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) { onDoubleClick(); } else { onClick(); }
    lastTap.current = now;
  };
  return (
    <div onClick={handleTap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '6px', background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent', border: isActive ? '1px dotted #fff' : '1px solid transparent', width: '64px', WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
        <Image src={iconSrc} alt={label} fill style={{ imageRendering: 'pixelated', objectFit: 'contain', filter: 'grayscale(100%)' }}/>
      </div>
      <span style={{ fontSize: '10px', color: '#fff', textShadow: '1px 1px 0px #000, -1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000', letterSpacing: '0.05em', whiteSpace: 'nowrap', textAlign: 'center' }}>{label}</span>
    </div>
  );
}