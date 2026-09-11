'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Home } from 'lucide-react';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/game/results');
        if (!res.ok) {
          if (res.status === 400 || res.status === 403) {
            router.push('/game');
            return;
          }
          throw new Error('Failed to fetch results');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [router]);

  const handleReturnHome = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) return <div className="p-12 text-center text-2xl font-bold">Generating Final Report...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-16">
      
      {/* HEADER */}
      <div className="text-center mt-8">
        <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
        <h1 className="text-5xl font-black mb-4">Game Complete</h1>
        <p className="text-2xl text-slate-400 mb-6">You completed all 6 rounds!</p>
        <p className="text-xl text-[#17D059] font-bold">Your results will be announced by the Game Master.</p>
      </div>

      {/* TABLE */}
      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1E293B] text-slate-300">
              <tr>
                <th className="p-4 text-center w-24">Round</th>
                <th className="p-4 text-right w-32">GA Forecast</th>
                <th className="p-4 text-right w-32">VIP Forecast</th>
                <th className="p-4 text-left">Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.submissions.map((r: any) => (
                <tr key={r.roundNumber} className="hover:bg-[#111827]">
                  <td className="p-4 text-center font-bold">R{r.roundNumber}</td>
                  <td className="p-4 text-right font-semibold text-[#17D059]">{r.predictedGa.toLocaleString()}</td>
                  <td className="p-4 text-right font-semibold text-[#38BDF8]">{r.predictedVip.toLocaleString()}</td>
                  <td className="p-4 text-left text-sm text-slate-400">
                    {r.reasoning ? (r.reasoning.length > 100 ? r.reasoning.substring(0, 100) + '...' : r.reasoning) : <span className="italic text-slate-600">None</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button 
          onClick={handleReturnHome}
          className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg transition-colors"
        >
          <Home size={20} /> Return to Home
        </button>
      </div>

    </div>
  );
}
