'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full py-4 px-6 flex items-center justify-between bg-white/80 dark:bg-[#030712]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
      <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#17D059] to-[#0a8a38]">
        Beyond The Stage
      </Link>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <Link 
          href="/case-study" 
          className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-[#17D059] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50"
        >
          Case Study
        </Link>

        <span className="text-slate-600 select-none">|</span>

        <Link 
          href="/game/market" 
          className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-[#17D059] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50"
        >
          Historical Data
        </Link>
        
        <Link 
          href="/login" 
          className="bg-gradient-to-r from-[#17D059] to-[#0a8a38] text-slate-950 px-5 py-2 rounded-full font-black text-xs sm:text-sm hover:scale-105 transition-transform shadow-lg shadow-[#17D059]/20"
        >
          Enter the Arena
        </Link>

        <Link 
          href="/login/admin"
          className="text-slate-400 hover:text-slate-200 transition-colors ml-1 p-1.5 rounded-lg hover:bg-slate-800/50"
          aria-label="Admin Command Center"
        >
          <Settings size={18} />
        </Link>
      </div>
    </nav>
  );
}
