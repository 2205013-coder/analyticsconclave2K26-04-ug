'use client';
import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AnswerRow {
  roundNumber: number;
  actualGa: number | null;
  actualVip: number | null;
}

export default function AnswersPage() {
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAnswers();
  }, []);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/answers');
      if (!res.ok) throw new Error('Failed to fetch answers');
      const data = await res.json();
      if (data.success) {
        setAnswers(data.rounds);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to load answers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching answers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (roundIndex: number, field: keyof AnswerRow, value: string) => {
    const parsed = value === '' ? null : parseInt(value, 10);
    const newAnswers = [...answers];
    newAnswers[roundIndex] = { ...newAnswers[roundIndex], [field]: parsed };
    setAnswers(newAnswers);
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/answers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: answers }),
      });
      if (!res.ok) throw new Error('Failed to save answers');
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save answers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving answers');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#17D059]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hidden Answers</h1>
        <p className="text-slate-600 dark:text-slate-400">Set the actual attendance figures used to calculate team accuracy and scores.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span>Answers saved successfully!</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Round</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Actual GA Attendance</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Actual VIP Attendance</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {answers.map((ans, idx) => {
              const isComplete = ans.actualGa !== null && ans.actualVip !== null && ans.actualGa !== undefined && ans.actualVip !== undefined;
              return (
                <tr key={ans.roundNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Round {ans.roundNumber}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      value={ans.actualGa === null ? '' : ans.actualGa}
                      onChange={(e) => handleChange(idx, 'actualGa', e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full max-w-[150px] px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#17D059]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      value={ans.actualVip === null ? '' : ans.actualVip}
                      onChange={(e) => handleChange(idx, 'actualVip', e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full max-w-[150px] px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#17D059]"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isComplete ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                        <CheckCircle2 size={14} /> Complete
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium">
                        <AlertCircle size={14} /> Incomplete
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#17D059] hover:bg-[#15ba50] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
            {saving ? 'SAVING...' : 'SAVE ALL ANSWERS'}
          </button>
        </div>
      </div>
    </div>
  );
}
