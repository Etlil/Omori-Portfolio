'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type Project = {
  id: string;
  image: string;
  thumbnail: string;
  caption: string;
  dialog: string[];
};

function ScrawlText({ lines = 4, width = 120 }: { lines?: number; width?: number }) {
  const widths = [0.9, 0.7, 0.85, 0.6, 0.75, 0.95, 0.65];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: '7px',
          width: `${widths[i % widths.length] * 100}%`,
          background: 'repeating-linear-gradient(90deg, #888 0px, #888 4px, transparent 4px, transparent 7px)',
          opacity: 0.35,
          borderRadius: '2px',
        }}/>
      ))}
    </div>
  );
}

function PolaroidCard({ project, index, onClick }: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const rotations = [-3, 2, -1.5, 3, -2, 1.5];
  const rotation = rotations[index % rotations.length];

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={(e) => { e.preventDefault(); setHovered(false); onClick(); }}
      style={{
        cursor: 'pointer',
        transform: `rotate(${rotation}deg) translateY(${hovered ? '-6px' : '0'})`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <div style={{
        background: 'white',
        padding: '7px 7px 24px',
        boxShadow: hovered ? '6px 6px 20px rgba(0,0,0,0.45)' : '3px 3px 10px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.15s ease',
      }}>
        <div style={{ position: 'relative', width: '160px', height: '160px', background: '#ccc', overflow: 'hidden' }}>
          {project.thumbnail && (
            <Image src={project.thumbnail} alt={project.id} fill
              style={{ objectFit: 'cover', imageRendering: 'pixelated' }}/>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    fetch('/assets/projects.json')
      .then(r => r.json())
      .then(data => setProjects(data.projects))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    const currentText = activeProject.dialog[dialogIndex] ?? '';
    setDisplayed('');
    setDone(false);
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
  }, [activeProject, dialogIndex]);

  const handleDialogAction = () => {
    if (!activeProject) return;
    const currentText = activeProject.dialog[dialogIndex] ?? '';
    if (!done) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(currentText);
      setDone(true);
    } else {
      const isLast = dialogIndex >= activeProject.dialog.length - 1;
      if (!isLast) {
        setDisplayed('');
        setDone(false);
        setDialogIndex(prev => prev + 1);
      } else {
        setActiveProject(null);
        setDialogIndex(0);
      }
    }
  };

  const openProject = (project: Project) => {
    setDisplayed('');
    setDone(false);
    setDialogIndex(0);
    setActiveProject(project);
  };

  if (!isOpen) return null;

  const DIALOGUE_HEIGHT = 140;
  const DOUBLE_BORDER = {
    border: '3px solid #fff',
    boxShadow: 'inset 0 0 0 3px #000, inset 0 0 0 6px #fff',
  };

  const layoutPattern = [
    ['photo:0', 'text:0'],
    ['text:1', 'photo:1'],
    ['photo:2', 'text:2'],
    ['text:3', 'photo:3'],
    ['photo:4', 'text:4'],
    ['text:5', 'photo:5'],
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990,
      fontFamily: 'var(--font-omori), sans-serif',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#5b3fa0',
        backgroundImage: `
          radial-gradient(1px 1px at 10% 15%, white, transparent),
          radial-gradient(1px 1px at 25% 40%, white, transparent),
          radial-gradient(1px 1px at 40% 10%, white, transparent),
          radial-gradient(1px 1px at 55% 60%, white, transparent),
          radial-gradient(1px 1px at 70% 25%, white, transparent),
          radial-gradient(1px 1px at 85% 50%, white, transparent),
          radial-gradient(1px 1px at 15% 70%, white, transparent),
          radial-gradient(1px 1px at 60% 80%, white, transparent),
          radial-gradient(1px 1px at 90% 90%, white, transparent),
          radial-gradient(2px 2px at 45% 45%, rgba(255,255,255,0.5), transparent),
          radial-gradient(2px 2px at 80% 70%, rgba(255,255,255,0.5), transparent)
        `,
      }}/>

      {/* Teal ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '80px',
        background: 'linear-gradient(to bottom, #2dd4bf, #0d9488)',
        zIndex: 1, pointerEvents: 'none',
      }}/>

      {/* Scrollable content */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', overflowY: 'auto' }}>

        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky', top: '16px',
            marginLeft: '16px',
            zIndex: 50,
            background: '#000', color: '#fff',
            border: '3px solid #fff',
            boxShadow: 'inset 0 0 0 2px #000, inset 0 0 0 4px #fff',
            padding: '6px 14px',
            fontFamily: 'inherit', fontSize: '12px',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'block',
          }}
        >← Back</button>

        {/* Title */}
        <div style={{
          textAlign: 'center',
          paddingTop: '16px', paddingBottom: '16px',
          color: '#fff', fontSize: '13px',
          letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8,
        }}>Projects</div>

        {/* Scrapbook */}
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px 140px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0ebe0, #e8e2d5)',
            border: '2px solid #ccc',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6), inset 0 0 0 1px #ddd',
            padding: '28px 20px',
            position: 'relative',
          }}>
            {/* Spine */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: '50%', transform: 'translateX(-50%)',
              width: '4px',
              background: 'linear-gradient(to bottom, #c8bfb0, #a89880, #c8bfb0)',
              zIndex: 1,
            }}/>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 2 }}>
              {layoutPattern.map((row, rowIdx) => {
                const [leftSlot, rightSlot] = row;
                const renderSlot = (slot: string) => {
                  const [type, idxStr] = slot.split(':');
                  const idx = parseInt(idxStr);
                  const project = projects[idx];
                  if (type === 'photo' && project) {
                    return <PolaroidCard key={`photo-${rowIdx}-${idx}`} project={project} index={idx} onClick={() => openProject(project)} />;
                  }
                  if (type === 'text' && project) {
                    return (
                      <div key={`text-${rowIdx}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 12px', justifyContent: 'center', alignSelf: 'center' }}>
                        <ScrawlText lines={3} width={140} />
                        <ScrawlText lines={4} width={160} />
                        <ScrawlText lines={2} width={120} />
                        <div style={{ marginTop: '4px' }}><ScrawlText lines={1} width={80} /></div>
                      </div>
                    );
                  }
                  return <div key={`empty-${rowIdx}-${slot}`}/>;
                };
                return (
                  <div key={rowIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    {renderSlot(leftSlot)}
                    {renderSlot(rightSlot)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen photo + dialog */}
      {activeProject && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(50, 30, 100, 0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={handleDialogAction}
          onTouchEnd={(e) => { e.preventDefault(); handleDialogAction(); }}
        >
          <div style={{
            position: 'relative',
            width: 'min(460px, 80vw)',
            height: 'min(460px, 50vh)',
            background: '#f5f0e8',
            border: '10px solid #f5f0e8',
            boxShadow: '0 0 60px rgba(0,0,0,0.7)',
            marginBottom: `${DIALOGUE_HEIGHT + 20}px`,
          }}>
            {activeProject.image && (
              <Image src={activeProject.image} alt={activeProject.id} fill
                style={{ objectFit: 'cover', imageRendering: 'pixelated' }}/>
            )}
          </div>

          <div
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              height: `${DIALOGUE_HEIGHT}px`,
              zIndex: 100,
              backgroundColor: '#000',
              ...DOUBLE_BORDER,
              borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
              color: '#fff',
              padding: '18px 28px',
              boxSizing: 'border-box',
              display: 'flex', alignItems: 'flex-start',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.stopPropagation(); handleDialogAction(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleDialogAction(); }}
          >
            <p style={{
              fontFamily: 'var(--font-omori), sans-serif',
              fontSize: '18px', lineHeight: '1.7',
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
                bottom: '12px', right: '16px',
                width: '36px', height: '28px',
                pointerEvents: 'none',
                animation: 'float 2s ease-in-out infinite',
              }}>
                <Image src="/assets/select_hover.png" alt="next" fill
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}/>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes blink { from, to { opacity: 1; } 50% { opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
}