'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, ChevronRight, ExternalLink } from 'lucide-react';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const [teamName, setTeamName] = useState('Loading...');
  const [round, setRound] = useState(1);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/game/status');
        if (res.status === 401) { router.push('/login'); return; }
        const data = await res.json();
        if (data.success) {
          setTeamName(data.teamName || 'Team');
          setRound(data.currentRound || 1);
        }
      } catch {}
    };
    fetchStatus();
    const int = setInterval(fetchStatus, 15000);
    return () => clearInterval(int);
  }, [router]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/game/announcements');
        if (res.ok) setAnnouncements(await res.json());
      } catch {}
    };
    fetchAnnouncements();
    const int = setInterval(fetchAnnouncements, 10000);
    return () => clearInterval(int);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/team-logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="h-screen flex flex-col bg-[#030712] text-white">

      {/* Announcement Ticker */}
      {announcements.length > 0 && (
        <div className="bg-[#17D059] text-black text-xs font-semibold py-1 px-4 flex items-center overflow-hidden whitespace-nowrap shrink-0">
          <Bell size={12} className="mr-2 shrink-0" />
          <div className="animate-marquee inline-block">
            {announcements.map(a => a.message).join(' • ')}
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="h-14 px-4 bg-[#0B1222] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#17D059] to-emerald-400 tracking-tight">
            Beyond The Stage
          </span>
          <ChevronRight size={14} className="text-slate-600" />
          <span className="text-sm text-slate-300 font-medium">{teamName}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-[#17D059]/10 border border-[#17D059]/30 text-xs font-bold text-[#17D059] font-mono">
            ROUND {round} / 6
          </div>
          <button
            onClick={() => window.open('/game/briefing?ref=game', '_blank')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer flex items-center gap-1.5"
            title="Open Case Study & Historical Data in a new tab"
          >
            📋 Briefing <ExternalLink size={11} className="text-slate-500" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Full-width game content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation: marquee 22s linear infinite; }
      ` }} />
    </div>
  );
}
