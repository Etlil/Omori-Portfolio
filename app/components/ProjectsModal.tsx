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

// Simplified Polaroid: Just the photo frame
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
      style={{
        cursor: 'pointer',
        transform: `rotate(${rotation}deg) translateY(${hovered ? '-6px' : '0'})`,
        transition: 'all 0.15s ease',
        userSelect: 'none',
      }}
    >
      <div style={{
        background: 'white',
        padding: '8px 8px 16px',
        boxShadow: hovered ? '8px 8px 20px rgba(0,0,0,0.4)' : '4px 4px 10px rgba(0,0,0,0.2)',
      }}>
        <div style={{ position: 'relative', width: '140px', height: '140px', background: '#ccc', overflow: 'hidden' }}>
          {project.thumbnail && (
            <Image src={project.thumbnail} alt={project.id} fill sizes="140px"
              style={{ objectFit: 'cover', imageRendering: 'pixelated' }}/>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0); 
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  const openProject = (project: Project) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Reset all dialogue states BEFORE setting the active project
    setDisplayed('');
    setDone(false);
    setDialogIndex(0);
    indexRef.current = 0;
    setActiveProject(project);
  };

  const handleChoice = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
    // Close the project view regardless of choice
    setActiveProject(null);
    setDialogIndex(0);
    setDone(false);
  };

  useEffect(() => {
    fetch('/assets/projects.json')
      .then(r => r.json())
      .then(data => setProjects(data.projects))
      .catch(console.error);
  }, []);

  useEffect(() => { if (isOpen) setPage(0); }, [isOpen]);

  useEffect(() => {
    if (!activeProject) {
      setDone(false); // Reset done when nothing is active
      return;
    }

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
  }, [activeProject?.id, dialogIndex]); // Added ID check here

  const handleDialogAction = () => {
    if (!activeProject) return;
    
    const currentText = activeProject.dialog[dialogIndex] ?? '';
    // Check if the project has choices
    const hasChoices = (activeProject as any).choices && (activeProject as any).choices.length > 0;
    const isLastLine = dialogIndex >= activeProject.dialog.length - 1;

    if (!done) {
      // 1. If still typing, skip typing
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(currentText);
      setDone(true);
    } else {
      // 2. If typing is done...
      if (!isLastLine) {
        // Go to next line if not at the end
        setDialogIndex(prev => prev + 1);
      } else {
        // We are on the last line. 
        // ONLY close the modal if there are NO choices.
        // If there ARE choices, the user MUST click a choice button.
        if (!hasChoices) {
          setActiveProject(null);
          setDialogIndex(0);
          setDone(false);
        }
      }
    }
  };

  const turnPage = (dir: 'next' | 'prev') => {
    const totalSpreads = Math.ceil(projects.length / 2);
    if (dir === 'next' && page < totalSpreads) setPage(prev => prev + 1);
    if (dir === 'prev' && page > 0) setPage(prev => prev - 1);
  };

  if (!isOpen) return null;

  const leftProject = page > 0 ? projects[(page - 1) * 2] : null;
  const rightProject = page > 0 ? projects[(page - 1) * 2 + 1] : null;
  const maxSpread = Math.ceil(projects.length / 2);

  const DIALOGUE_HEIGHT = 140;
  const DOUBLE_BORDER = {
    border: '3px solid #fff',
    boxShadow: 'inset 0 0 0 3px #000, inset 0 0 0 6px #fff',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-omori), monospace' }}>
      
      {/* Book container */}
      <div style={{ position: 'relative', width: 'min(760px, 95vw)', height: 'min(520px, 80vh)' }}>
        
        {/* Background Logic */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src={page === 0 ? "/assets/books1.png" : "/assets/book2.png"} alt="book" fill priority style={{ objectFit: 'fill', imageRendering: 'pixelated' }} />
        </div>

        {/* Content Layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex' }}>
          {page === 0 ? (
            /* ── COVER PAGE ── */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', paddingRight: '11%', paddingBottom: '1%'}}>
                <h1 style={{ fontSize: 'min(64px, 12vw)', color: '#000', textTransform: 'uppercase', lineHeight: '0.8', transform: 'rotate(2deg)', textAlign: 'center' }}>
                  <div style={{ marginBottom: '10px' }}>
                    {"MY".split("").map((c, i) => <span key={i} style={{ display: 'inline-block', transform: `translate(${(i * 3) % 5}px, ${(i * 7) % 4}px) rotate(${(i * 13) % 10 - 5}deg)` }}>{c}</span>)}
                  </div>
                  <div>
                    {"PROJECTS".split("").map((c, i) => <span key={i} style={{ display: 'inline-block', transform: `translate(${(i * 4) % 7 - 3}px, ${(i * 9) % 6 - 3}px) rotate(${(i * 17) % 12 - 6}deg)` }}>{c}</span>)}
                  </div>
                </h1>
            </div>
          ) : (
            /* ── SPREAD PAGES ── */
            <>
              {/* LEFT PAGE */}
              <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', position: 'relative' }}>
                {leftProject && (
                  <>
                    <PolaroidCard project={leftProject} index={(page - 1) * 2} onClick={() => openProject(leftProject)} />
                    <p style={{ fontSize: '20px', color: '#222', textAlign: 'center', maxWidth: '180px', transform: 'rotate(-1deg)' }}>{leftProject.caption}</p>
                  </>
                )}
                {/* Left Page Number */}
                <span style={{ position: 'absolute', bottom: '30px', left: '30px', fontSize: '12px', color: '#000', opacity: 0.6 }}>{ (page * 2) - 1 }</span>
              </div>

              {/* RIGHT PAGE */}
              <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', position: 'relative' }}>
                {rightProject && (
                  <>
                    <PolaroidCard project={rightProject} index={(page - 1) * 2 + 1} onClick={() => openProject(rightProject)} />
                    <p style={{ fontSize: '20px', color: '#222', textAlign: 'center', maxWidth: '180px', transform: 'rotate(1deg)' }}>{rightProject.caption}</p>
                  </>
                )}
                {/* Right Page Number */}
                <span style={{ position: 'absolute', bottom: '30px', right: '30px', fontSize: '12px', color: '#000', opacity: 0.6 }}>{ page * 2 }</span>
              </div>
            </>
          )}
        </div>

        {/* Page Turn Buttons */}
        {page > 0 && (
          <button onClick={() => turnPage('prev')} style={{ position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%) scaleX(-1)', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10 }}>
            <Image src="/assets/select_hover.png" alt="prev" width={40} height={23} style={{ imageRendering: 'pixelated' }} />
          </button>
        )}
        {page < maxSpread && (
          <button onClick={() => turnPage('next')} style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10 }}>
            <Image src="/assets/select_hover.png" alt="next" width={40} height={23} style={{ imageRendering: 'pixelated' }} />
          </button>
        )}

        <button onClick={onClose} style={{ position: 'absolute', top: '-45px', right: 0, background: '#000', color: '#fff', border: '2px solid #fff', padding: '4px 12px', fontFamily: 'inherit', cursor: 'pointer', zIndex: 10, fontSize: '12px' }}>CLOSE X</button>
      </div>

      {/* Fullscreen Photo View */}
      {activeProject && (
        <div 
          key={activeProject.id}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={handleDialogAction}
        >
          {/* PHOTO BOX */}
          <div style={{ width: 'min(500px, 80vw)', height: 'min(500px, 50vh)', marginBottom: '160px', position: 'relative' }}>
            <Image src={activeProject.image} alt="p" fill style={{ objectFit: 'contain', imageRendering: 'pixelated' }} />
          </div>

          {/* --- CHOICES BOX --- */}
          {activeProject && (activeProject as any).choices && done && dialogIndex === activeProject.dialog.length - 1 && (
            <div style={{
              position: 'fixed',
              bottom: '170px', // Sits exactly above the 160px dialogue box
              right: '20px',
              zIndex: 10001,
              backgroundColor: 'black',
              border: '3px solid white',
              outline: '3px solid black',
              padding: '8px 0',
              minWidth: '220px',
              display: 'flex',
              flexDirection: 'column',
              // Prevent flicker: ensures box only appears if typing is truly done
              animation: 'omori-shock 0.1s steps(1)' 
            }}>
              {(activeProject as any).choices.map((choice: any, i: number) => (
                <div 
                  key={i}
                  className="group" // REQUIRED for hover to work
                  onClick={(e) => { e.stopPropagation(); handleChoice(choice.url); }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 16px', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  {/* THE HAND - Now uses group-hover correctly */}
                  <div 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ width: '24px', height: '18px', position: 'relative' }}
                  >
                    <Image 
                      src="/assets/select_hover.png" 
                      alt="h" 
                      fill 
                      style={{ 
                          imageRendering: 'pixelated', 
                          objectFit: 'contain', // Makes the hand white for the black box
                      }} 
                    />
                  </div>

                  <span style={{ 
                      color: 'white', 
                      fontSize: '18px', 
                      textTransform: 'uppercase', 
                      fontFamily: 'var(--font-omori)',
                      letterSpacing: '0.05em'
                  }}>
                    {choice.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* DIALOGUE BOX (Identical to page.tsx) */}
          <div
            key={`${activeProject.id}-${dialogIndex}`}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, width: '100%',
              height: '160px',
              zIndex: 10000, // Higher than the backdrop
              backgroundColor: 'black',
              borderTop: '3px solid white',
              outline: '3px solid black',
              boxShadow: 'inset 0 0 0 3px black, inset 0 0 0 6px white',
              padding: '25px 40px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
            onClick={(e) => { e.stopPropagation(); handleDialogAction(); }}
          >
            <p style={{ fontFamily: 'var(--font-omori), sans-serif', fontSize: '20px', lineHeight: '1.6', color: 'white', flex: 1, margin: 0 }}>
              {displayed}
              {!done && (
                <span style={{ display: 'inline-block', width: '8px', height: '18px', backgroundColor: 'white', marginLeft: '4px', verticalAlign: 'middle' }}/>
              )}
            </p>

            {done && (
              <div style={{ position: 'absolute', bottom: '15px', right: '25px', width: '30px', height: '20px', animation: 'float 2s ease-in-out infinite' }}>
                <Image src="/assets/select_hover.png" alt="next" fill style={{ imageRendering: 'pixelated', objectFit: 'contain'}} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Required Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes bob-right {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(8px); }
        }
        @keyframes bob-left {
          0%, 100% { transform: translateY(-50%) scaleX(-1) translateX(0); }
          50% { transform: translateY(-50%) scaleX(-1) translateX(8px); }
        }
      `}</style>
    </div>
  );
}