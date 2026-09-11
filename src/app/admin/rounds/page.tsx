'use client';
import { useState, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2, Target, BookOpen, Settings2 } from 'lucide-react';

const ARTISTS   = ['Artist A', 'Artist B', 'Artist C', 'Artist D'];
const VENUES    = ['Arena', 'Open-Air Venue', 'Convention Centre', 'Indoor Hall'];
const WEATHERS  = ['Sunny', 'Cloudy'];
const DAYS      = ['Weekday', 'Weekend', 'Holiday'];
const COMPETING = ['None', 'Low', 'Moderate', 'High'];

const ROUND_THEMES: Record<number, {name: string, emoji: string}> = {
  1: { name: 'The Local Hero',     emoji: '🎸' },
  2: { name: 'The Weekend Bump',   emoji: '📅' },
  3: { name: 'The Weather Threat', emoji: '⛈️' },
  4: { name: 'The Rival Festival', emoji: '🎪' },
  5: { name: 'The Surprise Hit',   emoji: '📈' },
  6: { name: 'The Perfect Storm',  emoji: '🌪️' },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#17D059] outline-none transition";

export default function RoundsPage() {
  const [rounds, setRounds]           = useState<any[]>([]);
  const [expanded, setExpanded]       = useState<Record<number, boolean>>({ 1: true });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [savingRound, setSavingRound] = useState<number | null>(null);
  const [success, setSuccess]         = useState<number | null>(null);

  const fetchRounds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/rounds');
      if (!res.ok) throw new Error('Failed to fetch rounds');
      const data = await res.json();
      if (data.success) { setRounds(data.rounds); setError(null); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching rounds');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRounds(); }, []);

  const toggleExpand = (r: number) => setExpanded(prev => ({ ...prev, [r]: !prev[r] }));

  const handleChange = (roundId: string, field: string, value: any) =>
    setRounds(prev => prev.map(r => r.id === roundId ? { ...r, [field]: value } : r));

  const handleSave = async (round: any) => {
    try {
      setSavingRound(round.roundNumber);
      const res = await fetch('/api/admin/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(round),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update round');
      setSuccess(round.roundNumber);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving round');
    } finally { setSavingRound(null); }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-[#17D059]" size={32} /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Round Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Set scenario variables, define the correct answer key, configure acceptable ranges, and write evaluation criteria for each round.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={fetchRounds} className="ml-auto underline text-sm">Retry</button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <Settings2 size={12} className="text-[#17D059]" /> Scenario Variables
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <Target size={12} className="text-amber-500" /> Answer Key &amp; Ranges
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <BookOpen size={12} className="text-purple-500" /> Evaluation Criteria
        </div>
      </div>

      <div className="space-y-4">
        {rounds.map((round) => {
          const themeInfo  = ROUND_THEMES[round.roundNumber];
          const isExpanded = expanded[round.roundNumber];
          const rangePct   = round.acceptableRangePct ?? 15;
          const gaLow      = round.actualGa  ? Math.round(round.actualGa  * (1 - rangePct / 100)) : null;
          const gaHigh     = round.actualGa  ? Math.round(round.actualGa  * (1 + rangePct / 100)) : null;
          const vipLow     = round.actualVip ? Math.round(round.actualVip * (1 - rangePct / 100)) : null;
          const vipHigh    = round.actualVip ? Math.round(round.actualVip * (1 + rangePct / 100)) : null;

          return (
            <div key={round.roundNumber} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">

              {/* Collapsible header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleExpand(round.roundNumber)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-[#17D059]/10 border border-[#17D059]/30 flex items-center justify-center font-black text-[#17D059]">
                    {round.roundNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{round.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{themeInfo?.emoji} {themeInfo?.name}</p>
                  </div>
                  {round.actualGa > 0 ? (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-xs font-mono text-green-700 dark:text-green-400">
                      <Target size={11} /> Basic: {round.actualGa.toLocaleString()} · Premium: {round.actualVip?.toLocaleString()}
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                      ⚠ Answer key not set
                    </div>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
              </div>

              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-800">

                  {success === round.roundNumber && (
                    <div className="mx-6 mt-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                      <CheckCircle2 size={15} /> Round {round.roundNumber} saved successfully
                    </div>
                  )}

                  {/* ── Basic Info ── */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800">
                    <Field label="Round Title">
                      <input type="text" value={round.title || ''} onChange={e => handleChange(round.id, 'title', e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Instructions for Players">
                      <input type="text" value={round.instructions || ''} onChange={e => handleChange(round.id, 'instructions', e.target.value)} className={inputCls} placeholder="Briefing shown to teams before the round" />
                    </Field>
                  </div>

                  {/* ── Section 1: 7 Scenario Variables ── */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings2 size={16} className="text-[#17D059]" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">7 Scenario Variables</span>
                      <span className="text-xs text-slate-400">(displayed to players during the round)</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Field label="1. Artist / Act">
                        <select value={round.artistAct || ''} onChange={e => handleChange(round.id, 'artistAct', e.target.value)} className={inputCls}>
                          {ARTISTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </Field>
                      <Field label="Genre / Act Type">
                        <input type="text" value={round.genre || ''} onChange={e => handleChange(round.id, 'genre', e.target.value)} className={inputCls} placeholder="e.g. Headliner Rock/Pop" />
                      </Field>
                      <Field label="2. Venue Type">
                        <select value={round.venueType || ''} onChange={e => handleChange(round.id, 'venueType', e.target.value)} className={inputCls}>
                          {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </Field>
                      <Field label="3. Venue Prestige (1–5)">
                        <input type="number" min={1} max={5} value={round.venuePrestige || 1} onChange={e => handleChange(round.id, 'venuePrestige', parseInt(e.target.value))} className={inputCls} />
                      </Field>
                      <Field label="4. Promotion Level (1–5)">
                        <input type="number" min={1} max={5} value={round.promotionLevel || 1} onChange={e => handleChange(round.id, 'promotionLevel', parseInt(e.target.value))} className={inputCls} />
                      </Field>
                      <Field label="5. Weather">
                        <select value={round.weather || ''} onChange={e => handleChange(round.id, 'weather', e.target.value)} className={inputCls}>
                          {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </Field>
                      <Field label="6. Event Day">
                        <select value={round.concertDay || ''} onChange={e => handleChange(round.id, 'concertDay', e.target.value)} className={inputCls}>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </Field>
                      <Field label="7. Competing Events">
                        <select value={round.competingEvents || ''} onChange={e => handleChange(round.id, 'competingEvents', e.target.value)} className={inputCls}>
                          {COMPETING.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>

                  {/* ── Section 2: Answer Key ── */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-amber-50/30 dark:bg-amber-950/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Target size={16} className="text-amber-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Answer Key &amp; Acceptable Ranges</span>
                      <span className="text-xs text-slate-400">(hidden from players — used for auto-scoring)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Field label="✅ Correct Basic / Economy Occupancy">
                        <input
                          type="number" min={0} max={50000}
                          value={round.actualGa || ''}
                          onChange={e => handleChange(round.id, 'actualGa', parseInt(e.target.value) || 0)}
                          placeholder="Enter actual value (0 – 50,000)"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border-2 border-green-400 dark:border-green-700 rounded-lg text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-green-400 outline-none transition"
                        />
                      </Field>
                      <Field label="✅ Correct Premium / VIP Occupancy">
                        <input
                          type="number" min={0} max={10000}
                          value={round.actualVip || ''}
                          onChange={e => handleChange(round.id, 'actualVip', parseInt(e.target.value) || 0)}
                          placeholder="Enter actual value (0 – 10,000)"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border-2 border-cyan-400 dark:border-cyan-700 rounded-lg text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-cyan-400 outline-none transition"
                        />
                      </Field>
                      <Field label="Acceptable Range ±%  (for full marks)">
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min={0} max={50}
                            value={rangePct}
                            onChange={e => handleChange(round.id, 'acceptableRangePct', parseInt(e.target.value) || 15)}
                            className={inputCls}
                          />
                          <span className="text-slate-400 text-sm font-mono">%</span>
                        </div>
                      </Field>
                    </div>

                    {/* Live band preview */}
                    {(round.actualGa > 0 || round.actualVip > 0) && (
                      <div className="bg-[#030712] border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-6 text-xs font-mono">
                        <div>
                          <div className="text-slate-500 mb-1 uppercase tracking-wider">Basic — Acceptable Band (±{rangePct}%)</div>
                          <div className="text-green-400 font-black text-lg">{gaLow?.toLocaleString() ?? '—'} – {gaHigh?.toLocaleString() ?? '—'}</div>
                          <div className="text-slate-500 mt-0.5">Correct answer: <span className="text-white">{round.actualGa?.toLocaleString()}</span></div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1 uppercase tracking-wider">Premium — Acceptable Band (±{rangePct}%)</div>
                          <div className="text-cyan-400 font-black text-lg">{vipLow?.toLocaleString() ?? '—'} – {vipHigh?.toLocaleString() ?? '—'}</div>
                          <div className="text-slate-500 mt-0.5">Correct answer: <span className="text-white">{round.actualVip?.toLocaleString()}</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Section 3: Evaluation Criteria ── */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-purple-50/20 dark:bg-purple-950/10">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen size={16} className="text-purple-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Evaluation Criteria</span>
                      <span className="text-xs text-slate-400">(model answer + judge rubric for the 40% reasoning component)</span>
                    </div>
                    <div className="space-y-4">
                      <Field label="Model Answer / Expected Reasoning (for judges only)">
                        <textarea
                          value={round.evaluationCriteria || ''}
                          onChange={e => handleChange(round.id, 'evaluationCriteria', e.target.value)}
                          rows={6}
                          placeholder={`Write what a full-marks reasoning answer looks like. For example:
• Baseline: Artist X historical average in [Venue Type] is ~Y Basic, ~Z Premium (see T001–T060).
• Adjustment 1: Promotion Level 5 → +15% uplift on Basic.
• Adjustment 2: Holiday → +10% on both Basic and Premium.
• Adjustment 3: High Competition → -10% crowd dilution.
• Prestige impact: Venue Prestige 4/5 → Premium nearer the upper range.
• Final answer: Basic ≈ ${round.actualGa ? round.actualGa.toLocaleString() : 'XX,XXX'}, Premium ≈ ${round.actualVip ? round.actualVip.toLocaleString() : 'X,XXX'}.`}
                          className={`${inputCls} resize-none leading-relaxed`}
                        />
                      </Field>
                      <div className="grid grid-cols-3 gap-4">
                        <Field label="Accuracy Score Weight (%)">
                          <input type="number" min={0} max={100} value={round.accuracyWeight ?? 60}
                            onChange={e => handleChange(round.id, 'accuracyWeight', parseInt(e.target.value))} className={inputCls} />
                        </Field>
                        <Field label="Reasoning Score Weight (%)">
                          <input type="number" min={0} max={100} value={round.reasoningWeight ?? 40}
                            onChange={e => handleChange(round.id, 'reasoningWeight', parseInt(e.target.value))} className={inputCls} />
                        </Field>
                        <Field label="Round Timer (seconds)">
                          <input type="number" value={round.timerSeconds || 600}
                            onChange={e => handleChange(round.id, 'timerSeconds', parseInt(e.target.value))} className={inputCls} />
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="px-6 py-4 flex justify-end">
                    <button
                      onClick={() => handleSave(round)}
                      disabled={savingRound === round.roundNumber}
                      className="px-6 py-2.5 bg-[#17D059] hover:bg-[#15ba50] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-[#17D059]/20"
                    >
                      {savingRound === round.roundNumber
                        ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                        : <><Save size={15} /> Save Round {round.roundNumber}</>}
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
