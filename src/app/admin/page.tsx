'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Gamepad2, 
  FileText,
  Trophy,
  ArrowRight,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Stats {
  activeRound: number;
  totalTeams: number;
  totalSubmissions: number;
  avgScore: number;
  activeTeams: number;
  completedTeams: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#074870] rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Game Master</h1>
        <p className="text-blue-100 max-w-2xl">
          The Beyond The Stage forecasting engine is running smoothly. Monitor active rounds, manage teams, and adjust game variables from this control center.
        </p>
      </div>

      {loading && !stats ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-[#17D059]" size={32} />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchStats} className="ml-auto underline text-sm hover:text-red-800 dark:hover:text-red-300">Retry</button>
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Round</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">Round {stats.activeRound}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Target size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Teams</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalTeams}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <Users size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submissions</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalSubmissions}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Score</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{Math.round(stats.avgScore)}</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                <Trophy size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/teams" className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#17D059] dark:hover:border-[#17D059] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Manage Teams</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Add, remove, or edit team details and generate access codes.</p>
          <div className="flex items-center text-sm font-medium text-[#074870] dark:text-[#38bdf8] group-hover:text-[#17D059] transition-colors">
            Go to Teams <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>

        <Link href="/admin/game-control" className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#17D059] dark:hover:border-[#17D059] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              <Gamepad2 size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Game Control</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Advance rounds, toggle timers, and manage the live session.</p>
          <div className="flex items-center text-sm font-medium text-[#074870] dark:text-[#38bdf8] group-hover:text-[#17D059] transition-colors">
            Go to Control <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>

        <Link href="/admin/submissions" className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#17D059] dark:hover:border-[#17D059] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Submissions</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Review all team forecasts, scores, and reasoning for each round.</p>
          <div className="flex items-center text-sm font-medium text-[#074870] dark:text-[#38bdf8] group-hover:text-[#17D059] transition-colors">
            Go to Submissions <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
