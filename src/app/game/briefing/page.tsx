'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import {
  BookOpen, Database, Download, ChevronDown, ChevronUp,
  Mic2, MapPin, Zap, Award, CloudSun, Calendar, ShieldAlert,
  Target, TrendingUp, Filter
} from 'lucide-react';

/* ── Collapsible Section ─────────────────────────────────── */
function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden bg-[#0B1222]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors text-left"
      >
        <span className="font-bold text-white text-sm">{title}</span>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-4 text-slate-300 text-sm leading-relaxed">{children}</div>}
    </div>
  );
}

/* ── Custom Tooltip for Chart ─────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0B1222] border border-slate-700 rounded-xl p-3 text-xs shadow-xl">
        <div className="font-mono font-bold text-slate-300 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value?.toLocaleString()}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Main Briefing Page ───────────────────────────────────── */
function BriefingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // When opened in a new tab from the game page (?ref=game), hide the Enter Round CTA
  const isReferenceTab = searchParams.get('ref') === 'game';
  const [activeTab, setActiveTab] = useState<'study' | 'data'>('study');
  const [histData, setHistData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistFilter, setArtistFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [currentRound, setCurrentRound] = useState(1);

  // Fetch current round number so the CTA shows the right round
  useEffect(() => {
    fetch('/api/game/status')
      .then(r => r.json())
      .then(d => { if (d.currentRound) setCurrentRound(d.currentRound); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/game/training-data')
      .then(r => r.json())
      .then(json => setHistData(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const uniqueArtists = useMemo(() => Array.from(new Set(histData.map((d: any) => d.artistAct))).filter(Boolean) as string[], [histData]);
  const uniqueVenues  = useMemo(() => Array.from(new Set(histData.map((d: any) => d.venueType))).filter(Boolean)  as string[], [histData]);

  const filtered = useMemo(() =>
    histData.filter((d: any) =>
      (!artistFilter || d.artistAct === artistFilter) &&
      (!venueFilter  || d.venueType  === venueFilter)
    ), [histData, artistFilter, venueFilter]);

  /* Chart data — x axis = matchId, two lines = basic & premium */
  const chartData = useMemo(() =>
    filtered.map((d: any) => ({
      id: d.matchId,
      Basic:   d.actualGa,
      Premium: d.actualVip,
      artist:  d.artistAct,
      venue:   d.venueType,
      day:     d.concertDay,
    })), [filtered]);

  /* Download CSV */
  const downloadCSV = () => {
    const headers = ['Event_ID','Artist_Act','Venue_Type','Promotion_Level','Venue_Prestige',
                     'Weather','Event_Day','Competing_Events','Event_Occupancy_Basic','Event_Occupancy_Premium'];
    const rows = histData.map((d: any) => [
      d.matchId, d.artistAct, d.venueType, d.promotionLevel, d.venuePrestige,
      d.weather, d.concertDay, d.competingEvents, d.actualGa, d.actualVip
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'BeyondTheStage_HistoricalData.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#030712] text-white pb-28">

      {/* ── Compact Hero strip ──────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-r from-[#030712] via-[#06111F] to-[#030712] py-4 px-6 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
            UG Business Analytics Game 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            War Room Briefing
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Study the case, analyse 60 historical events, and download the data.
          </p>
        </div>
      </div>

      {/* ── Tab bar ── sticky, full-width, flush under header ── */}
      <div className="sticky top-0 z-40 bg-[#030712] backdrop-blur-md border-b-2 border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <div className="flex max-w-6xl mx-auto">
          {([
            { id: 'study', label: 'Case Study',     Icon: BookOpen },
            { id: 'data',  label: 'Historical Data', Icon: Database },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-b-2 -mb-[2px] transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'border-[#17D059] text-[#17D059]'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-32">

        {/* ═══════════════ CASE STUDY ═══════════════ */}
        {activeTab === 'study' && (
          <div className="space-y-4 max-w-3xl mx-auto">

            <Section title="📋 Business Scenario">
              <p className="mb-3">
                You are the <strong className="text-white">Business Analytics Team</strong> of{' '}
                <em className="text-[#17D059]">StageForward Entertainment</em> — a premier live-event company
                operating across India, running large-scale concerts featuring Artists A, B, C, and D across
                four venue types.
              </p>
              <p className="mb-3">
                The leadership team needs <strong className="text-white">accurate attendance forecasts</strong> for
                6 upcoming events to optimise pricing, staffing, merchandise procurement, and sponsorship deals.
                <span className="text-amber-300"> Over-forecasting leads to wasted resources; under-forecasting means missed revenue opportunities.</span>
              </p>
              <p>
                Your task: use the <strong className="text-white">60 historical events (T001–T060)</strong> to identify
                demand patterns and predict <strong className="text-[#17D059]">Basic/Economy occupancy</strong> (0–50,000 seats)
                and <strong className="text-cyan-400">Premium occupancy</strong> (0–10,000 seats) for each live round.
              </p>
            </Section>

            <Section title="🎯 Forecasting Targets">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="p-4 rounded-xl bg-[#17D059]/5 border border-[#17D059]/20 text-center">
                  <div className="text-xs font-mono text-slate-400 uppercase mb-1">Basic / Economy Seats</div>
                  <div className="text-3xl font-black text-[#17D059]">0 – 50,000</div>
                  <div className="text-xs text-slate-500 mt-1">General Admission</div>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
                  <div className="text-xs font-mono text-slate-400 uppercase mb-1">Premium / VIP Seats</div>
                  <div className="text-3xl font-black text-cyan-400">0 – 10,000</div>
                  <div className="text-xs text-slate-500 mt-1">VIP / Premium tier</div>
                </div>
              </div>
              <p className="text-slate-400 text-xs">Both values must be submitted every round. Your analytical reasoning is evaluated alongside the numbers.</p>
            </Section>

            <Section title="📊 Variable Dictionary — The 7 Demand Drivers">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 pr-4 text-slate-400 font-mono text-xs uppercase">Variable</th>
                      <th className="text-left py-2 text-slate-400 font-mono text-xs uppercase">Description &amp; Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      { icon: Mic2,       color:'text-[#17D059]',  var: 'Artist / Act',       desc: 'Core demand driver. Each artist has a distinct fan base and draw power. Filter historical data by artist first — it is the strongest predictor.' },
                      { icon: MapPin,     color:'text-cyan-400',   var: 'Venue Type',          desc: 'Arena, Convention Centre, Open-Air Venue, Indoor Hall. Affects capacity, ambiance and fan experience. Arena venues see the widest occupancy range.' },
                      { icon: Zap,        color:'text-amber-400',  var: 'Promotion Level (1–5)', desc: '1 = minimal buzz, 5 = full media blitz. High promotion amplifies Basic occupancy more than Premium. Critical variable for mass-appeal artists.' },
                      { icon: Award,      color:'text-purple-400', var: 'Venue Prestige (1–5)', desc: '1 = budget/local, 5 = landmark/iconic. Premium seats are more sensitive to prestige than Basic seats. Prestige-1 venues rarely exceed 4k Premium.' },
                      { icon: CloudSun,   color:'text-blue-400',   var: 'Weather',             desc: 'Sunny vs Cloudy. Matters most for Open-Air Venues. Indoor venues are weather-insensitive. Rain-day events historically see 15–25% lower occupancy.' },
                      { icon: Calendar,   color:'text-pink-400',   var: 'Event Day',           desc: 'Holiday > Weekend > Weekday. Holidays see the strongest uplift, especially for Premium. Weekday events have the lowest average occupancy.' },
                      { icon: ShieldAlert,color:'text-red-400',    var: 'Competing Events',    desc: 'None / Low / Moderate / High. High competition dilutes audience significantly. None/Low allows near-peak draw. Always factor this in your logic.' },
                    ].map((d, i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 pr-4 align-top">
                          <div className="flex items-center gap-2">
                            <d.icon size={14} className={d.color} />
                            <span className="font-bold text-white text-xs whitespace-nowrap">{d.var}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400 text-xs leading-relaxed">{d.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="🔍 4-Step Forecasting Methodology">
              <div className="space-y-3">
                {[
                  { step: '01', title: 'Filter by Artist', body: 'Go to the Historical Data tab and filter by the round\'s performing artist. Compute the average and range of Basic and Premium occupancy for that artist. This gives your baseline.' },
                  { step: '02', title: 'Match Venue Type', body: 'Narrow down to events with the same Venue Type. This tightens your range significantly. Compare how the artist performs in that specific setting.' },
                  { step: '03', title: 'Apply Variable Modifiers', body: 'Adjust your baseline estimate based on: Promotion Level (higher = +occupancy), Venue Prestige (higher = +Premium), Weather (Sunny = +for Open-Air), Event Day (Holiday = peak), Competing Events (High = reduce estimate).' },
                  { step: '04', title: 'Justify & Lock In', body: 'Write your reasoning before locking numbers. Structured reasoning catches errors and earns full marks on the 40% logic component even if your final numbers aren\'t perfect.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-4 p-4 rounded-xl bg-[#0A111F] border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] font-black text-xs flex items-center justify-center shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm mb-1">{s.title}</div>
                      <div className="text-slate-400 text-xs leading-relaxed">{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="🏆 Evaluation Rubric">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-4 rounded-xl bg-[#17D059]/5 border border-[#17D059]/20">
                  <div className="text-3xl font-black text-[#17D059] mb-1">60%</div>
                  <div className="font-bold text-white text-sm">Forecast Accuracy</div>
                  <div className="text-xs text-slate-400 mt-1">How close your Basic &amp; Premium predictions are to actual figures</div>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <div className="text-3xl font-black text-cyan-400 mb-1">40%</div>
                  <div className="font-bold text-white text-sm">Analytical Reasoning</div>
                  <div className="text-xs text-slate-400 mt-1">Quality of logic, use of historical data, and variable analysis in your write-up</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-800/30">
                <div className="text-amber-300 font-bold text-xs mb-1">💡 Judge's Note</div>
                <div className="text-amber-200/80 text-xs">A well-reasoned answer with moderate accuracy can outscore a lucky guess with poor reasoning. Always explain WHY — which historical patterns, which variables, and how you adjusted.</div>
              </div>
            </Section>

            <Section title="⏱ Rules & Format" defaultOpen={false}>
              <ul className="space-y-2 text-slate-400 text-sm">
                {[
                  ['10 minutes per round', 'Strictly enforced. Auto-submits zeros if time expires.'],
                  ['Submit anytime', 'Use the green Submit button at the top of the game screen. Submit early if confident.'],
                  ['Submissions are final', 'No edits after submission. Double-check before clicking Submit.'],
                  ['Both fields required', 'Basic AND Premium must be filled for every round.'],
                  ['6 rounds total', 'Events T061 to T066. Briefing data (T001–T060) is your training set.'],
                  ['No team sharing', 'Do not share answers between teams during live rounds.'],
                ].map(([rule, detail], i) => (
                  <li key={i} className="flex gap-3 p-3 rounded-lg bg-[#0A111F] border border-slate-800">
                    <span className="text-[#17D059] font-black shrink-0">→</span>
                    <div>
                      <div className="font-bold text-white text-sm">{rule}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="💡 Strategy Tips" defaultOpen={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Holiday + High Promo + Prestige 4–5 is historically the strongest attendance combination.',
                  'Cloudy + Weekday + High Competition = lowest occupancy. Adjust your forecast down significantly.',
                  'Indoor Hall venues show the most stable, predictable occupancy. Open-Air is more volatile.',
                  'Premium seats at Prestige-1 venues rarely exceed 4,000 even under ideal conditions.',
                  'Average 5–8 similar historical events for a stronger baseline rather than anchoring on one.',
                  'Write reasoning before entering numbers — it forces structured thinking and catches errors.',
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2 p-3 rounded-xl bg-[#0A111F] border border-slate-800 text-xs text-slate-400">
                    <span className="text-amber-400 shrink-0">✦</span> {tip}
                  </div>
                ))}
              </div>
            </Section>

          </div>
        )}

        {/* ═══════════════ HISTORICAL DATA ═══════════════ */}
        {activeTab === 'data' && (
          <div className="space-y-6">

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#0B1222] border border-slate-700 rounded-xl px-3 py-2">
                <Filter size={14} className="text-slate-500" />
                <select
                  value={artistFilter}
                  onChange={e => setArtistFilter(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none"
                >
                  <option value="">All Artists</option>
                  {uniqueArtists.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-[#0B1222] border border-slate-700 rounded-xl px-3 py-2">
                <Filter size={14} className="text-slate-500" />
                <select
                  value={venueFilter}
                  onChange={e => setVenueFilter(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none"
                >
                  <option value="">All Venues</option>
                  {uniqueVenues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {(artistFilter || venueFilter) && (
                <button
                  onClick={() => { setArtistFilter(''); setVenueFilter(''); }}
                  className="text-xs text-red-400 hover:text-red-300 px-3 py-2 border border-red-800/40 rounded-xl"
                >✕ Clear filters</button>
              )}
              <div className="ml-auto">
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#17D059] to-emerald-500 text-slate-950 font-black text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#17D059]/20"
                >
                  <Download size={15} /> Download CSV
                </button>
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Events Shown',     value: filtered.length, color: 'text-white' },
                { label: 'Avg Basic',         value: filtered.length ? Math.round(filtered.reduce((s,d)=>s+d.actualGa,0)/filtered.length).toLocaleString() : '—', color: 'text-[#17D059]' },
                { label: 'Avg Premium',       value: filtered.length ? Math.round(filtered.reduce((s,d)=>s+d.actualVip,0)/filtered.length).toLocaleString() : '—', color: 'text-cyan-400'   },
                { label: 'Max Basic',         value: filtered.length ? Math.max(...filtered.map(d=>d.actualGa)).toLocaleString() : '—', color: 'text-amber-400' },
              ].map((s,i) => (
                <div key={i} className="bg-[#0B1222] border border-slate-700 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                  <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Line Chart */}
            <div className="bg-[#0B1222] border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-white">Occupancy Trend Chart</div>
                  <div className="text-xs text-slate-500 mt-0.5">Basic &amp; Premium occupancy across {filtered.length} events</div>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#17D059] rounded" /><span className="text-slate-400">Basic</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-cyan-400 rounded" /><span className="text-slate-400">Premium</span></div>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-2 border-[#17D059] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="id"
                      tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                      interval={4}
                      tickLine={false}
                      axisLine={{ stroke: '#1e293b' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                      width={36}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="Basic"
                      stroke="#17D059"
                      strokeWidth={2}
                      dot={{ fill: '#17D059', r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Premium"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={{ fill: '#22d3ee', r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Full data table */}
            <div className="bg-[#0B1222] border border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="font-bold text-white text-sm">Full Event Log — {filtered.length} records</div>
                <div className="text-xs text-slate-500 font-mono">T001 – T060</div>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#060C1A] border-b border-slate-700">
                    <tr>
                      {['Event ID','Artist','Venue Type','Promo','Prestige','Weather','Day','Competition','Basic Occ.','Premium Occ.'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-slate-400 font-mono uppercase text-[10px] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filtered.map((d: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-2 font-mono text-slate-400 text-[11px]">{d.matchId}</td>
                        <td className="px-3 py-2 font-bold text-white">{d.artistAct}</td>
                        <td className="px-3 py-2 text-slate-300">{d.venueType}</td>
                        <td className="px-3 py-2 text-center text-amber-400 font-bold">{d.promotionLevel}</td>
                        <td className="px-3 py-2 text-center text-purple-400 font-bold">{d.venuePrestige}</td>
                        <td className="px-3 py-2 text-slate-300">{d.weather}</td>
                        <td className="px-3 py-2 text-slate-300">{d.concertDay}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            d.competingEvents === 'High' ? 'bg-red-900/40 text-red-400' :
                            d.competingEvents === 'Moderate' ? 'bg-amber-900/40 text-amber-400' :
                            d.competingEvents === 'Low' ? 'bg-blue-900/40 text-blue-400' :
                            'bg-green-900/40 text-green-400'
                          }`}>{d.competingEvents}</span>
                        </td>
                        <td className="px-3 py-2 font-mono font-black text-[#17D059] text-right">{d.actualGa?.toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono font-black text-cyan-400 text-right">{d.actualVip?.toLocaleString()}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={10} className="px-3 py-10 text-center text-slate-600">No events match current filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Sticky Enter Round CTA ── only shown when navigating directly (not opened as reference tab) */}
      {!isReferenceTab && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#030712]/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-4">
            <div className="text-sm text-slate-400 hidden sm:block">
              <span className="text-white font-bold">Ready?</span> Enter the game room to start your 10-minute timer.
            </div>
            <button
              onClick={() => router.push('/game')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#17D059] to-emerald-400 text-slate-950 font-black text-base rounded-xl hover:scale-105 transition-all shadow-xl shadow-[#17D059]/25 cursor-pointer"
            >
              Enter Round {currentRound} →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BriefingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712]" />}>
      <BriefingContent />
    </Suspense>
  );
}
