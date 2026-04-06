import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden">
      
      {/* Background "Noise" effect (Optional) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]"></div>

      {/* The Central Hub (White Space) */}
      <div className="z-10 flex flex-col items-center gap-12 text-center">
        
        {/* Floating Lightbulb (The "Black" Lightbulb) */}
        <div className="animate-bounce duration-[3000ms] grayscale">
            <span className="text-6xl cursor-pointer">💡</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tighter uppercase">
          Welcome to White Space.
        </h1>
        <p className="max-w-md text-lg italic">
          You have been living here for as long as you can remember.
        </p>

        {/* Portfolio "Items" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          
          {/* Laptop = Projects */}
          <a href="#projects" className="omori-border p-6 hover:bg-black hover:text-white transition-colors">
            <h2 className="text-xl font-bold">LAPTOP</h2>
            <p className="text-sm">View my works.</p>
          </a>

          {/* Sketchbook = About/Blog */}
          <a href="#about" className="omori-border p-6 hover:bg-black hover:text-white transition-colors">
            <h2 className="text-xl font-bold">SKETCHBOOK</h2>
            <p className="text-sm">Who am I?</p>
          </a>

          {/* Tissue Box = Contact */}
          <a href="#contact" className="omori-border p-6 hover:bg-black hover:text-white transition-colors">
            <h2 className="text-xl font-bold">TISSUE BOX</h2>
            <p className="text-sm">Wipe away the bugs.</p>
          </a>

        </div>

        {/* Mewo */}
        <div className="mt-20 opacity-80 hover:opacity-100 transition-opacity cursor-help">
          <p className="text-xs italic">Waiting for something to happen?</p>
          <span className="text-3xl">🐈‍⬛</span>
        </div>
      </div>

    </main>
  );
}