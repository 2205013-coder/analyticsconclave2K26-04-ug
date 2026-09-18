'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  EyeOff, 
  Calculator, 
  Gamepad2, 
  FileText, 
  Trophy, 
  Megaphone,
  BookOpen,
  Upload,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin',                    label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/admin/teams',              label: 'Teams',              icon: Users },
  { href: '/admin/teams/bulk-import',  label: '  ↳ Bulk Import',   icon: Upload },
  { href: '/admin/rounds',             label: 'Round Settings',     icon: Settings },
  { href: '/admin/answers',            label: 'Hidden Answers',     icon: EyeOff },
  { href: '/admin/scoring',            label: 'Scoring Rules',      icon: Calculator },
  { href: '/admin/game-control',       label: 'Game Control',       icon: Gamepad2 },
  { href: '/admin/submissions',        label: 'Submissions',        icon: FileText },
  { href: '/admin/leaderboard',        label: 'Leaderboard',        icon: Trophy },
  { href: '/admin/announcements',      label: 'Announcements',      icon: Megaphone },
  { href: '/case-study',               label: 'Case Study & Rules', icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = NAV_ITEMS.find(item => item.href === pathname)?.label || 'Dashboard';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login/admin');
    } catch {
      router.push('/login/admin');
    }
  };

  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden">
      {/* Sidebar - Always Dark #0F172A */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-lg font-black tracking-tight text-white leading-tight">
            Beyond The Stage
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Game Master Admin</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#17D059] text-slate-950 font-medium' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
          <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
            <span>Game Master</span>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-white">{currentPage}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SERVER ONLINE
            </div>
            <Link 
              href="/" 
              target="_blank"
              className="text-sm text-[#074870] dark:text-[#38bdf8] hover:underline font-medium flex items-center gap-1"
            >
              Open Game UI ↗
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-[#030712]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
