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
function PolaroidCard({ project, index, onClick, isMobile }: { // Add isMobile here
  project: Project;
  index: number;
  onClick: () => void;
  isMobile: boolean; // Add this
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
        padding: isMobile ? '4px 4px 10px' : '8px 8px 16px', // Smaller padding on mobile
        boxShadow: hovered ? '8px 8px 20px rgba(0,0,0,0.4)' : '4px 4px 10px rgba(0,0,0,0.2)',
      }}>
        {/* Responsive Photo Frame */}
        <div style={{ 
          position: 'relative', 
          width: isMobile ? '80px' : '140px', // Shrink photo on mobile
          height: isMobile ? '80px' : '140px', 
          background: '#ccc', 
          overflow: 'hidden' 
        }}>
          {project.thumbnail && (
            <Image src={project.thumbnail} alt={project.id} fill sizes={isMobile ? "80px" : "140px"}
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

  const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
      <div style={{ 
        position: 'relative', 
        width: isMobile ? '80vw' : '760px', 
        height: isMobile ? '50vw' : '520px', // Maintain aspect ratio on mobile
        transform: isMobile ? 'scale(1.1)' : 'none', // Slight zoom for readability
      }}>
        
        {/* Background Logic */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src={page === 0 ? "/assets/books1.png" : "/assets/book2.png"} alt="book" fill priority style={{ objectFit: 'fill', imageRendering: 'pixelated' }} />
        </div>

        {/* Content Layer */}
        <div style={{ position: 'absolute', marginLeft: '0', inset: 0, zIndex: 1, display: 'flex' }}>
          {page === 0 ? (
            /* ── COVER PAGE ── */
            <div style={{ 
                flex: 1, 
                transform: isMobile ? 'translateX(10px)' : 'none',
                display: 'flex', 
                flexDirection: 'column', 
                // On mobile, we center it more; on desktop, we keep it to the right
                alignItems: isMobile ? 'center' : 'flex-end', 
                justifyContent: 'center', 
                // Reduce padding on mobile so it doesn't get squished
                paddingRight: isMobile ? '0' : '11%', 
                // Shift slightly to the right on mobile to avoid the "book spine"
                marginLeft: isMobile ? '45%' : '0',
                paddingBottom: '1%'
            }}>
                <h1 style={{ 
                    // Smaller font for mobile (40px) vs desktop (64px)
                    fontSize: isMobile ? 'min(30px, 10vw)' : 'min(64px, 12vw)', 
                    color: '#000', 
                    textTransform: 'uppercase', 
                    lineHeight: '0.8', 
                    transform: 'rotate(2deg)', 
                    textAlign: 'center',
                    userSelect: 'none',
                    pointerEvents: 'none',
                }}>
                    <div style={{ marginBottom: isMobile ? '5px' : '10px' }}>
                        {"MY".split("").map((c, i) => (
                            <span key={i} style={{ 
                                display: 'inline-block', 
                                transform: `translate(${(i * 3) % 5}px, ${(i * 7) % 4}px) rotate(${(i * 13) % 10 - 5}deg)` 
                            }}>
                                {c}
                            </span>
                        ))}
                    </div>
                    <div>
                        {"PROJECTS".split("").map((c, i) => (
                            <span key={i} style={{ 
                                display: 'inline-block', 
                                // Scale the random movement down slightly on mobile so words stay readable
                                transform: `translate(${((i * 4) % 7 - 3) * (isMobile ? 0.5 : 1)}px, ${((i * 9) % 6 - 3) * (isMobile ? 0.5 : 1)}px) rotate(${(i * 17) % 12 - 6}deg)` 
                            }}>
                                {c}
                            </span>
                        ))}
                    </div>
                </h1>
            </div>
          ) : (
            /* ── SPREAD PAGES ── */
            <>
              {/* LEFT PAGE */}
              <div style={{ 
                  flex: 1, 
                  padding: isMobile ? '10px' : '40px', // Reduced padding
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: isMobile ? '10px' : '20px', // Reduced gap
                  position: 'relative' 
              }}>
                {leftProject && (
                  <>
                    <PolaroidCard project={leftProject} index={(page - 1) * 2} onClick={() => openProject(leftProject)} isMobile={isMobile} />
                    <p style={{ 
                        fontSize: isMobile ? '11px' : '20px', // Scaled text size
                        color: '#222', 
                        textAlign: 'center', 
                        maxWidth: isMobile ? '100px' : '180px', 
                        transform: 'rotate(-1deg)' 
                    }}>{leftProject.caption}</p>
                  </>
                )}
                <span style={{ position: 'absolute', bottom: isMobile ? '15px' : '30px', left: isMobile ? '15px' : '30px', fontSize: '12px', color: '#000', opacity: 0.6 }}>{ (page * 2) - 1 }</span>
              </div>

              {/* RIGHT PAGE */}
              <div style={{ 
                  flex: 1, 
                  padding: isMobile ? '10px' : '40px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: isMobile ? '10px' : '20px', 
                  position: 'relative' 
              }}>
                {rightProject && (
                  <>
                    <PolaroidCard project={rightProject} index={(page - 1) * 2 + 1} onClick={() => openProject(rightProject)} isMobile={isMobile} />
                    <p style={{ 
                        fontSize: isMobile ? '11px' : '20px', 
                        color: '#222', 
                        textAlign: 'center', 
                        maxWidth: isMobile ? '100px' : '180px', 
                        transform: 'rotate(1deg)' 
                    }}>{rightProject.caption}</p>
                  </>
                )}
                <span style={{ position: 'absolute', bottom: isMobile ? '15px' : '30px', right: isMobile ? '15px' : '30px', fontSize: '12px', color: '#000', opacity: 0.6 }}>{ page * 2 }</span>
              </div>
            </>
          )}
        </div>

        {/* Page Turn Buttons */}
        {page > 0 && (
          <button onClick={() => turnPage('prev')} style={{ 
            position: 'absolute', 
            left: isMobile ? '-15px' : '-50px', // Closer to edge on mobile
            top: '50%', 
            transform: 'translateY(-50%)', // Logic handled by keyframes now
            background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10,
            animation: 'bob-left 1s ease-in-out infinite' 
        }}>
          <Image src="/assets/select_hover.png" alt="prev" width={isMobile ? 30 : 40} height={isMobile ? 18 : 23} style={{ imageRendering: 'pixelated' }} />
        </button>
        )}
        {page < maxSpread && (
          <button onClick={() => turnPage('next')} style={{ 
              position: 'absolute', 
              right: isMobile ? '-15px' : '-50px', // Closer to edge on mobile
              top: '50%', 
              background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10,
              animation: 'bob-right 1s ease-in-out infinite' 
          }}>
            <Image src="/assets/select_hover.png" alt="next" width={isMobile ? 30 : 40} height={isMobile ? 18 : 23} style={{ imageRendering: 'pixelated' }} />
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
          <div style={{ 
            width: isMobile ? '50vw' : '300px', 
            height: isMobile ? '50vw' : '300px', 
            marginBottom: isMobile ? '120px' : '160px', // Less margin on mobile
            position: 'relative' 
          }}>
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
            style={{
              position: 'fixed',
              bottom: 0, left: 0, width: '100%',
              height: isMobile ? '120px' : '160px', // Shorter on mobile
              zIndex: 10000,
              backgroundColor: 'black',
              borderTop: `3px solid white`,
              boxShadow: `inset 0 0 0 3px black, inset 0 0 0 6px white`,
              padding: isMobile ? '15px 20px' : '25px 40px', // Less padding on mobile
              boxSizing: 'border-box',
              display: 'flex',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
            onClick={(e) => { e.stopPropagation(); handleDialogAction(); }}
          >
            <p style={{ 
              fontFamily: 'var(--font-omori), sans-serif', 
              fontSize: isMobile ? '16px' : '20px', // Smaller font on mobile
              lineHeight: '1.4', 
              color: 'white', 
              margin: 0, 
              flex: 1 
            }}>
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