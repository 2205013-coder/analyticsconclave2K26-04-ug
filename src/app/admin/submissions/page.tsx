'use client';
import { useState, useEffect } from 'react';
import { Search, Download, Filter, Loader2, AlertCircle } from 'lucide-react';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterRound, setFilterRound] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/submissions', window.location.origin);
      if (filterRound !== 'All') url.searchParams.set('round', filterRound);
      if (search) url.searchParams.set('teamCode', search);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterRound]); // Re-fetch on filter change

  // Optional: debounce search
  useEffect(() => {
    const handler = setTimeout(fetchSubmissions, 500);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Submissions</h1>
          <p className="text-slate-600 dark:text-slate-400">Review team forecasts and reasoning logic.</p>
        </div>
        
        <button onClick={() => window.open('/api/admin/game/export/submissions', '_blank')} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium">
          <Download size={16} /> Download CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchSubmissions} className="ml-auto underline text-sm hover:text-red-800 dark:hover:text-red-300">Retry</button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by team code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17D059] text-slate-900 dark:text-white"
            />
          </div>
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={filterRound}
              onChange={(e) => setFilterRound(e.target.value)}
              className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17D059] text-slate-900 dark:text-white appearance-none"
            >
              <option value="All">All Rounds</option>
              {[1, 2, 3, 4, 5, 6].map(r => <option key={r} value={r}>Round {r}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex justify-center items-center h-40">
               <Loader2 className="animate-spin text-[#17D059]" size={32} />
             </div>
          ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium text-center">Round</th>
                <th className="px-6 py-3 font-medium text-right text-[#17D059]">Basic Occupancy</th>
                <th className="px-6 py-3 font-medium text-right text-cyan-400">Premium Occupancy</th>
                <th className="px-6 py-3 font-medium max-w-[250px]">Analytical Reasoning (40%)</th>
                <th className="px-6 py-3 font-medium text-center">Accuracy (60%)</th>
                <th className="px-6 py-3 font-medium text-center">Total Score</th>
                <th className="px-6 py-3 font-medium text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{sub.team?.teamCode || sub.teamCode}</div>
                    <div className="text-xs text-slate-500">{sub.team?.name || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {sub.roundNumber}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {sub.predictedGa}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {sub.predictedVip}
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={sub.reasoning}>
                    {sub.reasoning}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {sub.accuracy !== null ? `${sub.accuracy.toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#074870] dark:text-[#38bdf8]">
                    {sub.score !== null ? Math.round(sub.score) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                    {new Date(sub.submittedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No submissions found.
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
