'use client';
import { useState, useEffect } from 'react';
import { Trophy, Medal, Loader2, AlertCircle } from 'lucide-react';

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      // We can use the teams API since it includes totalScore, or a dedicated leaderboard API if it exists.
      const res = await fetch('/api/admin/game/teams');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      if (data.success) {
        // Sort teams by totalScore descending
        const sortedTeams = data.teams.sort((a: any, b: any) => b.totalScore - a.totalScore);
        setRankings(sortedTeams);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
    const interval = setInterval(fetchRankings, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Master Leaderboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Current standings for all participating teams.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[300px]">
          {loading && rankings.length === 0 ? (
             <div className="flex justify-center items-center h-40">
               <Loader2 className="animate-spin text-[#17D059]" size={32} />
             </div>
          ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-medium text-center w-20">Rank</th>
                <th className="px-6 py-4 font-medium">Team Code</th>
                <th className="px-6 py-4 font-medium">Team Name</th>
                <th className="px-6 py-4 font-medium">Institution</th>
                <th className="px-6 py-4 font-medium text-center">Rounds Completed</th>
                <th className="px-6 py-4 font-medium text-right text-lg">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rankings.map((team, index) => {
                const rank = index + 1;
                let RankBadge = null;
                
                if (rank === 1) RankBadge = <div className="mx-auto w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center"><Trophy size={16} /></div>;
                else if (rank === 2) RankBadge = <div className="mx-auto w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center"><Medal size={16} /></div>;
                else if (rank === 3) RankBadge = <div className="mx-auto w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center"><Medal size={16} /></div>;
                else RankBadge = <div className="text-center font-bold text-slate-400">{rank}</div>;

                return (
                  <tr key={team.teamCode} className={`transition-colors ${rank <= 3 ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                    <td className="px-6 py-4">{RankBadge}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{team.teamCode}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{team.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{team.institution || '-'}</td>
                    <td className="px-6 py-4 text-center">{team._count?.submissions || 0}</td>
                    <td className="px-6 py-4 text-right font-bold text-xl text-[#074870] dark:text-[#38bdf8]">{Math.round(team.totalScore)}</td>
                  </tr>
                );
              })}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No teams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
