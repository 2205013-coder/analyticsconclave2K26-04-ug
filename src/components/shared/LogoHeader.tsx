import Image from 'next/image';

export default function LogoHeader() {
  return (
    <div className="w-full bg-[#030712] border-b border-slate-700/50 py-3 px-6 flex items-center justify-between relative">
      
      {/* KIIT Logo — left, no white background just the image */}
      <div className="flex items-center gap-3">
        <Image
          src="/kiit-logo.jpg"
          alt="KIIT School of Management"
          width={200}
          height={60}
          className="object-contain h-12 w-auto rounded"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Game title — center */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">Presented by Optix</div>
        <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#17D059] to-emerald-400 tracking-tight whitespace-nowrap">
          Beyond The Stage
        </div>
      </div>

      {/* Optix Logo — right */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-black text-white leading-tight">Optix</div>
          <div className="text-[11px] font-semibold text-slate-300 leading-tight">Operations &amp; Analytics Club</div>
          <div className="text-[10px] text-slate-500 leading-tight">KIIT School of Management</div>
        </div>
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-800/60 shadow-lg shadow-blue-900/30">
          <Image
            src="/optix-logo.jpg"
            alt="Optix — Operations & Analytics Club"
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

    </div>
  );
}
