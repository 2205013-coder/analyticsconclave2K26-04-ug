'use client';

import { useState, useEffect, useMemo } from 'react';
import { Database, BookOpen, Filter, Mic2, MapPin, CloudSun, Calendar, ShieldAlert, Zap, Award, Target, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MiniTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className="bg-[#0B1222] border border-slate-700 rounded-lg p-2 text-[10px] shadow-xl">
      <div className="font-mono text-slate-400 mb-1">{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value?.toLocaleString()}</div>)}
    </div>
  );
  return null;
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl bg-[#030712] border border-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-800/30 transition-colors"
      >
        <span className="font-bold text-white text-[11px] tracking-wide">{title}</span>
        {open ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function ResourcePanel() {
  const [activeTab, setActiveTab] = useState<'data' | 'study'>('data');
  const [histData, setHistData] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [artistFilter, setArtistFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    if (activeTab === 'data' && histData.length === 0) {
      setHistLoading(true);
      fetch('/api/game/training-data')
        .then(r => r.json())
        .then(json => setHistData(json.data || []))
        .catch(() => {})
        .finally(() => setHistLoading(false));
    }
  }, [activeTab]);

  const uniqueArtists = useMemo(() => Array.from(new Set(histData.map(d => d.artistAct))).filter(Boolean), [histData]);
  const uniqueVenues = useMemo(() => Array.from(new Set(histData.map(d => d.venueType))).filter(Boolean), [histData]);

  const filtered = useMemo(() =>
    histData.filter(d =>
      (!artistFilter || d.artistAct === artistFilter) &&
      (!venueFilter || d.venueType === venueFilter)
    ),
    [histData, artistFilter, venueFilter]
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex flex-col h-full bg-[#070D18] border-l border-slate-800 text-white text-xs">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-bold text-[11px] border-b-2 transition-all ${
            activeTab === 'data'
              ? 'border-[#17D059] text-[#17D059] bg-[#17D059]/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database size={12} /> Historical Data (60)
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-bold text-[11px] border-b-2 transition-all ${
            activeTab === 'study'
              ? 'border-[#17D059] text-[#17D059] bg-[#17D059]/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen size={12} /> Case Study
        </button>
      </div>

      {/* ===== HISTORICAL DATA TAB ===== */}
      {activeTab === 'data' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Filters */}
          <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2 shrink-0 bg-[#060B15]">
            <Filter size={11} className="text-slate-500 shrink-0" />
            <select
              value={artistFilter}
              onChange={e => { setArtistFilter(e.target.value); setPage(1); }}
              className="flex-1 bg-[#030712] border border-slate-700 rounded text-[10px] text-white px-2 py-1 focus:outline-none"
            >
              <option value="">All Artists</option>
              {uniqueArtists.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={venueFilter}
              onChange={e => { setVenueFilter(e.target.value); setPage(1); }}
              className="flex-1 bg-[#030712] border border-slate-700 rounded text-[10px] text-white px-2 py-1 focus:outline-none"
            >
              <option value="">All Venues</option>
              {uniqueVenues.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {(artistFilter || venueFilter) && (
              <button onClick={() => { setArtistFilter(''); setVenueFilter(''); setPage(1); }} className="text-red-400 hover:text-red-300 text-[10px]">✕</button>
            )}
          </div>

          {/* Mini Line Chart */}
          <div className="px-2 pt-2 pb-1 border-b border-slate-800 bg-[#060B15] shrink-0">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1 px-1">
              Occupancy Trend — {filtered.length} events
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={filtered.map(d => ({ id: d.matchId, Basic: d.actualGa, Premium: d.actualVip }))}
                margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="id" tick={false} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 8 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<MiniTooltip />} />
                <Line type="monotone" dataKey="Basic" stroke="#17D059" strokeWidth={1.5}
                  dot={false} activeDot={{ r: 3 }} />
                <Line type="monotone" dataKey="Premium" stroke="#22d3ee" strokeWidth={1.5}
                  dot={false} activeDot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-3 justify-center mt-0.5">
              <div className="flex items-center gap-1"><div className="w-2.5 h-0.5 bg-[#17D059] rounded"/><span className="text-[8px] text-slate-500">Basic</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-0.5 bg-cyan-400 rounded"/><span className="text-[8px] text-slate-500">Premium</span></div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {histLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="w-5 h-5 border-2 border-[#17D059] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#040810] text-slate-500 text-[9px] font-mono uppercase sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Artist</th>
                    <th className="px-2 py-2">Venue</th>
                    <th className="px-2 py-2 text-center">P/V</th>
                    <th className="px-2 py-2 text-right text-[#17D059]">Basic</th>
                    <th className="px-2 py-2 text-right text-cyan-400">Prem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pageData.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 py-1.5 font-mono text-slate-500 text-[9px]">{item.matchId}</td>
                      <td className="px-2 py-1.5 font-bold text-white text-[10px]">{item.artistAct}</td>
                      <td className="px-2 py-1.5 text-slate-300 text-[10px] leading-tight">
                        <div>{item.venueType?.split(' ')[0]}</div>
                        <div className="text-[9px] text-slate-500">{item.weather} · {item.concertDay?.slice(0, 3)} · {item.competingEvents?.slice(0,3)}</div>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className="text-[9px] font-mono text-amber-400">{item.promotionLevel}</span>
                        <span className="text-[9px] text-slate-600">/</span>
                        <span className="text-[9px] font-mono text-purple-400">{item.venuePrestige}</span>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono font-bold text-[#17D059] text-[10px]">{(item.actualGa / 1000).toFixed(1)}k</td>
                      <td className="px-2 py-1.5 text-right font-mono font-bold text-cyan-400 text-[10px]">{(item.actualVip / 1000).toFixed(1)}k</td>
                    </tr>
                  ))}
                  {pageData.length === 0 && (
                    <tr><td colSpan={6} className="px-2 py-8 text-center text-slate-600">No events found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="px-3 py-2 border-t border-slate-800 bg-[#060B15] flex items-center justify-between shrink-0">
            <span className="text-[9px] text-slate-500 font-mono">{filtered.length} events · pg {page}/{Math.max(1, totalPages)}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-[10px] font-bold">‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-[10px] font-bold">›</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CASE STUDY TAB ===== */}
      {activeTab === 'study' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[11px] text-slate-300 leading-relaxed">

          {/* Header badge */}
          <div className="text-center py-2">
            <div className="inline-block px-3 py-1 rounded-full bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] text-[10px] font-mono font-bold uppercase tracking-wider">
              UG Business Analytics Game 2026
            </div>
            <div className="text-white font-black text-base mt-1">Beyond The Stage</div>
            <div className="text-slate-500 text-[10px]">Presented by Optix — Operations &amp; Analytics Club, KSOM</div>
          </div>

          <Section title="📋 Business Scenario">
            <p className="text-slate-400 text-[10px] leading-relaxed">
              You are the <strong className="text-white">Business Analytics Team</strong> of <em className="text-[#17D059]">StageForward Entertainment</em> — a premier live-event company operating across India. The company runs large-scale concerts featuring Artists A, B, C, and D across four venue types.
            </p>
            <p className="text-slate-400 text-[10px] leading-relaxed mt-2">
              The leadership team needs <strong className="text-white">accurate attendance forecasts</strong> for 6 upcoming events to optimize pricing, staffing, merchandise procurement, and sponsorship deals. Over-forecasting leads to wasted resources; under-forecasting means missed revenue opportunities.
            </p>
            <p className="text-slate-400 text-[10px] leading-relaxed mt-2">
              Your task: use the <strong className="text-white">60 historical events</strong> (T001–T060) to identify demand patterns and predict <strong className="text-[#17D059]">Basic/Economy occupancy</strong> (0–50,000 seats) and <strong className="text-cyan-400">Premium occupancy</strong> (0–10,000 seats) for each live round.
            </p>
          </Section>

          <Section title="🎯 Forecasting Targets">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 rounded-lg bg-[#17D059]/5 border border-[#17D059]/20 text-center">
                <div className="text-[9px] font-mono text-slate-400 uppercase mb-1">Basic / Economy</div>
                <div className="text-base font-black text-[#17D059]">0 – 50,000</div>
                <div className="text-[9px] text-slate-500">General Admission seats</div>
              </div>
              <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-center">
                <div className="text-[9px] font-mono text-slate-400 uppercase mb-1">Premium / VIP</div>
                <div className="text-base font-black text-cyan-400">0 – 10,000</div>
                <div className="text-[9px] text-slate-500">Premium / VIP seats</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Both must be submitted for every round. Reasoning/logic behind your forecast is equally important.</p>
          </Section>

          <Section title="📊 The 7 Demand Drivers">
            <div className="space-y-1.5">
              {[
                { icon: Mic2,       color: 'text-[#17D059]',  label: 'Artist / Act',       detail: 'Core driver. Each artist has a distinct fan base and draw strength. Analyse historical Basic & Premium for that artist specifically.' },
                { icon: MapPin,     color: 'text-cyan-400',   label: 'Venue Type',         detail: 'Arena > Convention Centre > Open-Air Venue > Indoor Hall (general prestige). Venue type affects both capacity and ambiance.' },
                { icon: Zap,        color: 'text-amber-400',  label: 'Promotion Level',    detail: '1 = minimal buzz, 5 = full media blitz. Higher promotion correlates with higher occupancy especially for mass-market artists.' },
                { icon: Award,      color: 'text-purple-400', label: 'Venue Prestige',     detail: '1 = budget/local, 5 = landmark/iconic. Premium seats are more sensitive to prestige than Basic seats.' },
                { icon: CloudSun,   color: 'text-blue-400',   label: 'Weather',            detail: 'Sunny events historically outperform Cloudy ones for Open-Air venues. Indoor venues are less weather-sensitive.' },
                { icon: Calendar,   color: 'text-pink-400',   label: 'Event Day',          detail: 'Holiday > Weekend > Weekday for attendance. Holidays see the strongest uplift especially for Premium seats.' },
                { icon: ShieldAlert,color: 'text-red-400',    label: 'Competing Events',   detail: 'High competition dilutes the audience. None/Low competition allows stronger draws. Always check this variable carefully.' },
              ].map((d, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[#0A111F] border border-slate-800/60">
                  <d.icon className={`${d.color} shrink-0 mt-0.5`} size={11} />
                  <div>
                    <div className="font-bold text-white text-[10px]">{d.label}</div>
                    <div className="text-slate-500 text-[9px] leading-relaxed">{d.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="🔍 How to Read the Historical Data">
            <div className="space-y-2 text-[10px] text-slate-400">
              <p><strong className="text-white">Step 1 — Filter by Artist:</strong> Use the Historical Data tab and filter by the round's artist. This is the single strongest predictor of occupancy range.</p>
              <p><strong className="text-white">Step 2 — Match Venue Type:</strong> Narrow down to similar venue types to get a tighter baseline.</p>
              <p><strong className="text-white">Step 3 — Apply Modifiers:</strong> Adjust up/down based on Promotion Level, Prestige, Weather, Event Day, and Competing Events.</p>
              <p><strong className="text-white">Step 4 — Justify Your Logic:</strong> Explain which patterns from historical data guided your numbers. The judging panel evaluates your reasoning.</p>
              <div className="mt-2 p-2 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <div className="text-amber-300 font-bold text-[10px] mb-1">⚠ Key Insight</div>
                <div className="text-amber-200/70 text-[9px]">Premium occupancy is more volatile than Basic. It is highly sensitive to Venue Prestige and Artist brand. A prestige-5 venue with a top artist can push Premium close to the cap, while the same artist in a prestige-1 venue may see 50% lower Premium turnout.</div>
              </div>
            </div>
          </Section>

          <Section title="🏆 Evaluation Rubric" defaultOpen={false}>
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#17D059]/5 border border-[#17D059]/20">
                <div>
                  <div className="font-bold text-white text-[10px]">Forecast Accuracy</div>
                  <div className="text-[9px] text-slate-500">How close Basic & Premium predictions are to actual figures</div>
                </div>
                <span className="font-black text-[#17D059] text-base ml-2">60%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                <div>
                  <div className="font-bold text-white text-[10px]">Analytical Reasoning</div>
                  <div className="text-[9px] text-slate-500">Quality of logic, use of historical data, and variable analysis</div>
                </div>
                <span className="font-black text-cyan-400 text-base ml-2">40%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Judges evaluate reasoning even if your numbers aren't perfect. A well-reasoned answer with moderate accuracy can outscore a lucky guess with poor reasoning.</p>
          </Section>

          <Section title="⏱ Rules & Time Limits" defaultOpen={false}>
            <ul className="space-y-1.5 text-[10px] text-slate-400">
              <li className="flex gap-2"><span className="text-[#17D059] font-bold shrink-0">→</span><span><strong className="text-white">10 minutes</strong> per round, strictly enforced. Auto-submit zeros if time expires.</span></li>
              <li className="flex gap-2"><span className="text-[#17D059] font-bold shrink-0">→</span><span>You may submit <strong className="text-white">before time runs out</strong> — use the Submit button at the top.</span></li>
              <li className="flex gap-2"><span className="text-[#17D059] font-bold shrink-0">→</span><span>Submissions are <strong className="text-white">final</strong> once confirmed. No edits after submission.</span></li>
              <li className="flex gap-2"><span className="text-[#17D059] font-bold shrink-0">→</span><span>Both <strong className="text-white">Basic and Premium</strong> forecasts are required every round.</span></li>
              <li className="flex gap-2"><span className="text-[#17D059] font-bold shrink-0">→</span><span>Use the <strong className="text-white">Historical Data tab</strong> to analyse past events while filling your forecast.</span></li>
              <li className="flex gap-2"><span className="text-[#17D059] font-bold shrink-0">→</span><span>6 rounds total — Event IDs T061 to T066.</span></li>
            </ul>
          </Section>

          <div className="text-center py-2 text-[9px] text-slate-600 font-mono">
            © 2026 Optix — Operations &amp; Analytics Club · KIIT School of Management
          </div>

        </div>
      )}
    </div>
  );
}
