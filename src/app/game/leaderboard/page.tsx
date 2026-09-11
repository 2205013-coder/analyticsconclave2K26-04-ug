'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Lock } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState<{ visible: boolean; leaderboard: any[] }>({ visible: false, leaderboard: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/game/leaderboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    const int = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(int);
  }, []);

  if (loading) return <div className="p-8 text-center text-xl font-bold">Loading Leaderboard...</div>;

  if (!data.visible) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
        <div className="bg-[#0F172A] p-8 rounded-2xl border border-slate-800 max-w-md">
          <Lock size={64} className="mx-auto text-slate-400 mb-6" />
          <h2 className="text-3xl font-black mb-4">Classified</h2>
          <p className="text-slate-500 text-lg">Rankings will be announced by the Game Master.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      <div className="text-center">
        <Trophy size={64} className="mx-auto text-yellow-500 mb-4" />
        <h1 className="text-4xl font-black text-[#38BDF8]">Global Rankings</h1>
        <p className="text-slate-500 mt-2 text-lg">Current team standings</p>
      </div>

      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#074870] text-white">
            <tr>
              <th className="p-4 text-center w-24">Rank</th>
              <th className="p-4">Team</th>
              <th className="p-4">Institution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.leaderboard.map((team, idx) => {
              let medal = null;
              if (idx === 0) medal = <Medal className="text-yellow-500 inline mr-2" size={24} />;
              else if (idx === 1) medal = <Medal className="text-slate-400 inline mr-2" size={24} />;
              else if (idx === 2) medal = <Medal className="text-amber-700 inline mr-2" size={24} />;

              return (
                <tr key={team.id} className={`hover:bg-[#111827] transition-colors ${idx < 3 ? 'font-bold bg-[#0B1222]/50' : ''}`}>
                  <td className="p-4 text-center font-mono text-lg">
                    {idx + 1}
                  </td>
                  <td className="p-4 text-xl flex items-center">
                    {medal}
                    {team.name}
                  </td>
                  <td className="p-4 text-lg text-slate-400">
                    {team.institution || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.leaderboard.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-lg">No teams available.</div>
        )}
      </div>
    </div>
  );
}
