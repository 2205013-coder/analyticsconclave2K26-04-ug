'use client';
import { useState, useEffect } from 'react';
import { Gamepad2, Timer, Trophy, AlertTriangle, Power, Loader2, AlertCircle } from 'lucide-react';

export default function GameControlPage() {
  const [control, setControl] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchControl = async () => {
    try {
      const res = await fetch('/api/admin/game-control');
      if (!res.ok) throw new Error('Failed to fetch game control');
      const data = await res.json();
      if (data.success && data.control) {
        setControl(data.control);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching game control');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControl();
    const interval = setInterval(fetchControl, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string, payload?: any) => {
    try {
      // Optimistic update
      if (payload) {
        setControl((prev: any) => ({ ...prev, ...payload }));
      }
      const res = await fetch('/api/admin/game-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed');
      fetchControl();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
      fetchControl(); // Revert on error
    }
  };

  const handleReset = async () => {
    if (confirm('DANGER: This will delete ALL submissions and reset ALL teams to Round 1. Are you sure?')) {
      await handleAction('resetGame');
      alert('Game reset successfully.');
    }
  };

  if (loading && !control) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#17D059]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Game Control</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage the live session state in real-time.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {control && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Round Control */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Gamepad2 className="text-[#074870] dark:text-[#38bdf8]" /> Active Round
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(r => (
              <button
                key={r}
                onClick={() => handleAction('setActiveRound', { round: r })}
                className={`py-3 rounded-lg font-bold transition-all ${
                  control.activeRound === r 
                    ? 'bg-[#17D059] text-white shadow-md scale-[1.02]' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                R{r}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">
            Currently on Round {control.activeRound}
          </p>
        </div>

        {/* Global Toggles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Power className="text-[#074870] dark:text-[#38bdf8]" /> Global Toggles
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${control.timerEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                <Timer size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Submission Timer</p>
                <p className="text-xs text-slate-500">Enable/disable the round timer</p>
              </div>
            </div>
            <button 
              onClick={() => handleAction('toggleTimer')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${control.timerEnabled ? 'bg-[#17D059]' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${control.timerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${control.leaderboardEnabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                <Trophy size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Public Leaderboard</p>
                <p className="text-xs text-slate-500">Visible to teams on their UI</p>
              </div>
            </div>
            <button 
              onClick={() => handleAction('toggleLeaderboard')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${control.leaderboardEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${control.leaderboardEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-6 mt-8">
        <h2 className="text-lg font-bold text-red-700 dark:text-red-500 flex items-center gap-2 mb-2">
          <AlertTriangle /> Danger Zone
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Actions here are destructive and cannot be undone. Use only for testing or restarting the entire event.
        </p>
        <button 
          onClick={handleReset}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
        >
          RESET ENTIRE GAME
        </button>
      </div>
    </div>
  );
}
