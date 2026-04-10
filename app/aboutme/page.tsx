'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AboutMe() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('PERSONAL');

  const tabs = ['PERSONAL', 'EDUCATION', 'WORK', 'GOALS'];

  // Content Mapping
  const content: any = {
    PERSONAL: {
      title: "ETLIL",
      level: 20,
      hp: "33/33",
      juice: "20/20",
      stats: [
        { label: "NAME", value: "ETLIL" },
        { label: "BIO", value: "A developer living in White Space for as long as they can remember." },
        { label: "INTERESTS", value: "Game Dev, UI/UX, Pixel Art" },
        { label: "TRAITS", value: "Determined, Creative, Calm" },
      ],
      description: "A mysterious developer. You can see a faint glow of code in their eyes."
    },
    EDUCATION: {
      title: "KNOWLEDGE",
      level: 4,
      stats: [
        { label: "SCHOOL", value: "Your University Name" },
        { label: "COURSE", value: "Computer Science" },
        { label: "YEAR", value: "3rd Year Student" },
        { label: "SUBJECTS", value: "Data Structures, Web Systems" },
      ],
      description: "Education is a powerful weapon. It sharpens the mind like a knife."
    },
    WORK: {
      title: "EXPERIENCE",
      level: 12,
      stats: [
        { label: "INTERNSHIP", value: "Tech Corp Inc." },
        { label: "FREELANCE", value: "UI Designer for Indie Games" },
        { label: "PROJECTS", value: "Omori Portfolio, AI Chatbots" },
      ],
      description: "Hard work pays off. Every bug fixed is a step toward reality."
    },
    GOALS: {
      title: "DESTINY",
      level: 99,
      stats: [
        { label: "CAREER", value: "Full Stack Engineer" },
        { label: "DREAM", value: "Create an impactful RPG" },
        { label: "IMPROVE", value: "Mastering Backend Architecture" },
      ],
      description: "The future is bright. Something is waiting for you at the end."
    }
  };

  const current = content[activeTab];

  const DOUBLE_BORDER = {
    border: '3px solid white',
    outline: '3px solid black',
    boxShadow: 'inset 0 0 0 3px black',
  };

  return (
    <main className="min-h-screen bg-white p-4 font-omori flex flex-col items-center select-none cursor-default">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div 
        style={{ ...DOUBLE_BORDER }} 
        className="w-full max-w-5xl bg-black flex justify-around py-3 px-6 mb-6"
      >
        {tabs.map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <div className={`w-6 h-4 relative ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <Image src="/assets/select_hover.png" alt="hand" fill style={{ imageRendering: 'pixelated', objectFit: 'contain', filter: 'invert(1)' }} />
            </div>
            <span className={`text-xl tracking-widest ${activeTab === tab ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
              {tab}
            </span>
          </div>
        ))}
        <button onClick={() => router.push('/')} className="text-white border-l-2 border-white pl-8 hover:text-red-500 transition-colors">EXIT</button>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 h-[600px]">
        
        {/* --- LEFT SIDEBAR (Status) --- */}
        <div className="flex flex-col gap-4 w-full md:w-[300px]">
          {/* Portrait Box */}
          <div style={{ ...DOUBLE_BORDER }} className="bg-white p-4 flex flex-col items-center justify-center flex-1">
             <div className="relative w-40 h-40 mb-4">
                <Image src="/assets/me.png" alt="Profile" fill style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
             </div>
             <div className="w-full border-t-2 border-black pt-2">
                <h2 className="text-2xl uppercase">{activeTab === 'PERSONAL' ? 'ETLIL' : 'OMORI'}</h2>
                <p className="text-sm">LVL. {current.level}</p>
             </div>
          </div>

          {/* HP/JUICE Box */}
          <div style={{ ...DOUBLE_BORDER }} className="bg-white p-4 flex flex-col gap-3">
            {/* Heart Bar */}
            <div className="flex items-center gap-2">
               <span className="text-red-500 text-xl">❤</span>
               <div className="flex-1 h-6 bg-gray-200 border-2 border-black relative">
                  <div className="h-full bg-red-500 transition-all duration-500" style={{ width: '100%' }}></div>
                  <span className="absolute inset-0 flex justify-center items-center text-xs text-white mix-blend-difference">{current.hp || "MAX"}</span>
               </div>
            </div>
            {/* Juice Bar */}
            <div className="flex items-center gap-2">
               <span className="text-cyan-400 text-xl">💧</span>
               <div className="flex-1 h-6 bg-gray-200 border-2 border-black relative">
                  <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: '80%' }}></div>
                  <span className="absolute inset-0 flex justify-center items-center text-xs text-white mix-blend-difference">{current.juice || "80%"}</span>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex flex-col gap-4 flex-1">
          
          {/* Stats Box (Middle Area) */}
          <div style={{ ...DOUBLE_BORDER }} className="bg-white p-8 flex-1 relative overflow-hidden">
            {/* Background Lines (Notebook style) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 30px' }}></div>
            
            <h3 className="text-3xl border-b-4 border-black inline-block mb-6 uppercase tracking-tighter">
                {current.title} Details
            </h3>

            <div className="grid grid-cols-1 gap-4">
               {current.stats.map((stat: any, i: number) => (
                 <div key={i} className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="text-gray-500 w-32 uppercase font-bold">{stat.label}:</span>
                    <span className="text-black text-xl">{stat.value}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Description Box (Bottom Area) */}
          <div style={{ ...DOUBLE_BORDER }} className="bg-black p-6 h-[150px] relative overflow-hidden">
             <div className="absolute top-2 right-4 opacity-20 transform rotate-12">
                <Image src="/assets/select_hover.png" alt="decor" width={60} height={40} style={{ filter: 'invert(1)' }} />
             </div>
             <p className="text-white text-xl leading-relaxed italic">
                {current.description}
             </p>
          </div>

        </div>

      </div>

      {/* Global Omori Styles */}
      <style jsx global>{`
        @font-face {
          font-family: 'Omori';
          src: url('/fonts/omori_font.ttf');
        }
        .font-omori {
          font-family: 'Omori', 'Courier New', Courier, monospace;
        }
      `}</style>
    </main>
  );
}