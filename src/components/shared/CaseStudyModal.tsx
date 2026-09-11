'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, Target, Database, Award, ShieldAlert, 
  Calendar, CheckCircle2, Mic2, MapPin, CloudSun, Zap, Filter
} from 'lucide-react';

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export default function CaseStudyModal({ isOpen, onClose, defaultTab = 'data' }: CaseStudyModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Historical data state
  const [histData, setHistData] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [artistFilter, setArtistFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch when tab opens
  useEffect(() => {
    if (isOpen && activeTab === 'data' && histData.length === 0) {
      setHistLoading(true);
      fetch('/api/game/training-data')
        .then(r => r.json())
        .then(json => setHistData(json.data || []))
        .catch(() => {})
        .finally(() => setHistLoading(false));
    }
  }, [isOpen, activeTab]);

  const uniqueArtists = useMemo(() => Array.from(new Set(histData.map(d => d.artistAct))).filter(Boolean), [histData]);
  const uniqueVenues = useMemo(() => Array.from(new Set(histData.map(d => d.venueType))).filter(Boolean), [histData]);

  const filtered = useMemo(() => histData.filter(d => {
    if (artistFilter && d.artistAct !== artistFilter) return false;
    if (venueFilter && d.venueType !== venueFilter) return false;
    return true;
  }), [histData, artistFilter, venueFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (!isOpen) return null;

  const tabs = [
    { id: 'data',     label: 'Historical Data (60)',   icon: Database   },
    { id: 'scenario', label: 'Case Study',             icon: BookOpen   },
    { id: 'rounds',   label: 'Six Live Rounds',        icon: Calendar   },
    { id: 'scoring',  label: 'Scoring & Rubric',       icon: Award      },
    { id: 'rules',    label: 'Rules & Checklist',      icon: ShieldAlert},
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-5xl h-[92vh] bg-[#0B1222] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 text-white"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 bg-[#070D18] flex items-center justify-between shrink-0">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#17D059] mb-0.5">
                UG Business Analytics Game 2026 · Live Resources
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="text-[#17D059] shrink-0" size={20} />
                Case Study, Data & Game Rules
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-[#0A101D] overflow-x-auto shrink-0 scrollbar-none px-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#17D059] text-[#17D059] bg-[#17D059]/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto text-slate-300 text-sm leading-relaxed">

            {/* ============= TAB: HISTORICAL DATA ============= */}
            {activeTab === 'data' && (
              <div className="flex flex-col h-full">
                {/* Filter bar */}
                <div className="px-5 py-3 border-b border-slate-800 bg-[#070D18] flex flex-wrap gap-3 items-center shrink-0">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={artistFilter}
                    onChange={e => { setArtistFilter(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-[#030712] text-xs text-white focus:outline-none"
                  >
                    <option value="">All Artists</option>
                    {uniqueArtists.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <select
                    value={venueFilter}
                    onChange={e => { setVenueFilter(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-[#030712] text-xs text-white focus:outline-none"
                  >
                    <option value="">All Venues</option>
                    {uniqueVenues.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {(artistFilter || venueFilter) && (
                    <button
                      onClick={() => { setArtistFilter(''); setVenueFilter(''); setPage(1); }}
                      className="text-xs text-red-400 hover:text-red-300 ml-1"
                    >
                      Clear
                    </button>
                  )}
                  <span className="ml-auto text-[11px] text-slate-500 font-mono">
                    {filtered.length} of 60 events
                  </span>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  {histLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="w-7 h-7 border-2 border-[#17D059] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs min-w-[800px]">
                      <thead className="bg-[#070D18] text-slate-400 font-mono uppercase text-[10px] sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-2.5">ID</th>
                          <th className="px-4 py-2.5">Artist</th>
                          <th className="px-4 py-2.5">Venue Type</th>
                          <th className="px-4 py-2.5 text-center">Promo</th>
                          <th className="px-4 py-2.5 text-center">Prestige</th>
                          <th className="px-4 py-2.5">Weather</th>
                          <th className="px-4 py-2.5">Day</th>
                          <th className="px-4 py-2.5">Competing</th>
                          <th className="px-4 py-2.5 text-right text-[#17D059]">Basic Occ.</th>
                          <th className="px-4 py-2.5 text-right text-cyan-400">Premium Occ.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {pageData.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-2 font-mono text-slate-400">{item.matchId}</td>
                            <td className="px-4 py-2 font-bold text-white">{item.artistAct}</td>
                            <td className="px-4 py-2 text-slate-300">{item.venueType}</td>
                            <td className="px-4 py-2 text-center">
                              <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-[#17D059]/10 text-[#17D059]">{item.promotionLevel}/5</span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-500/10 text-purple-400">{item.venuePrestige}/5</span>
                            </td>
                            <td className="px-4 py-2 text-slate-300">{item.weather}</td>
                            <td className="px-4 py-2 text-slate-300">{item.concertDay}</td>
                            <td className="px-4 py-2">
                              <span className={`text-[10px] font-mono ${
                                item.competingEvents === 'High' ? 'text-red-400' :
                                item.competingEvents === 'Moderate' ? 'text-amber-400' :
                                'text-slate-400'
                              }`}>{item.competingEvents}</span>
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-[#17D059]">{item.actualGa?.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-cyan-400">{item.actualVip?.toLocaleString()}</td>
                          </tr>
                        ))}
                        {pageData.length === 0 && (
                          <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-500">No events match selected filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                <div className="px-5 py-3 border-t border-slate-800 bg-[#070D18] flex items-center justify-between text-xs text-slate-400 shrink-0">
                  <span>Page {page} of {Math.max(1, totalPages)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold">Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold">Next</button>
                  </div>
                </div>
              </div>
            )}

            {/* ============= TAB: CASE STUDY ============= */}
            {activeTab === 'scenario' && (
              <div className="p-6 space-y-6 max-w-3xl">
                <div className="bg-[#030712] border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-white mb-2">🏢 The Business Context</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    You are part of the <strong className="text-white">Business Analytics Team</strong> of a premier live-entertainment company. Your company organizes concerts across different venue types. Before each event, management needs accurate attendance forecasts to optimize ticketing, logistics, staffing, and revenue.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-3">7 Core Demand Drivers:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Mic2,      color: 'text-[#17D059]', title: 'Artist / Act',           desc: 'Brand equity, fan loyalty, and baseline draw.' },
                      { icon: MapPin,    color: 'text-cyan-400',  title: 'Venue Type',             desc: 'Open-Air, Indoor Hall, Convention Centre, Arena.' },
                      { icon: Zap,       color: 'text-amber-400', title: 'Promotion Level',        desc: 'Scale 1 (Minimal) to 5 (Heavy Media Blitz).' },
                      { icon: Award,     color: 'text-purple-400',title: 'Venue Prestige',         desc: 'Level 1 (Budget) to Level 5 (Iconic 5-Star).' },
                      { icon: CloudSun,  color: 'text-blue-400',  title: 'Weather',                desc: 'Sunny, Cloudy, or Rain — critical for open-air events.' },
                      { icon: Calendar,  color: 'text-pink-400',  title: 'Event Day',              desc: 'Weekday, Weekend, or Holiday audience availability.' },
                      { icon: ShieldAlert,color:'text-red-400',   title: 'Competing Events',       desc: 'No Competition, Low, Moderate, or High rivalry.' },
                    ].map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#030712] border border-slate-800">
                        <d.icon className={`${d.color} shrink-0 mt-0.5`} size={16} />
                        <div>
                          <div className="font-bold text-white text-xs">{d.title}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{d.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#030712] border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-2">Forecast Targets & Valid Ranges</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#17D059]/5 border border-[#17D059]/20">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Basic / Economy Occupancy</div>
                      <div className="text-xl font-black text-[#17D059]">0 – 50,000 Seats</div>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Premium Occupancy</div>
                      <div className="text-xl font-black text-cyan-400">0 – 10,000 Seats</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============= TAB: SIX LIVE ROUNDS ============= */}
            {activeTab === 'rounds' && (
              <div className="p-6 space-y-4">
                <p className="text-slate-400 text-xs mb-4">Each round lasts exactly <strong className="text-white">10 minutes</strong>. Scenarios are revealed at round start.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { r: 1, code: 'T061', artist: 'Artist B', venue: 'Open-Air Venue',     promo: 2, prestige: 2, weather: 'Sunny',  day: 'Weekday',  comp: 'Low',            badge: 'text-emerald-400' },
                    { r: 2, code: 'T062', artist: 'Artist A', venue: 'Indoor Hall',         promo: 5, prestige: 4, weather: 'Sunny',  day: 'Holiday',  comp: 'High',           badge: 'text-blue-400'    },
                    { r: 3, code: 'T063', artist: 'Artist B', venue: 'Convention Centre',   promo: 4, prestige: 5, weather: 'Cloudy', day: 'Weekend',  comp: 'Moderate',       badge: 'text-purple-400'  },
                    { r: 4, code: 'T064', artist: 'Artist D', venue: 'Indoor Hall',         promo: 4, prestige: 4, weather: 'Cloudy', day: 'Weekday',  comp: 'High',           badge: 'text-red-400'     },
                    { r: 5, code: 'T065', artist: 'Artist A', venue: 'Open-Air Venue',     promo: 4, prestige: 1, weather: 'Cloudy', day: 'Weekday',  comp: 'High',           badge: 'text-orange-400'  },
                    { r: 6, code: 'T066', artist: 'Artist C', venue: 'Arena',              promo: 1, prestige: 2, weather: 'Sunny',  day: 'Weekday',  comp: 'No Competition', badge: 'text-amber-400'   },
                  ].map(s => (
                    <div key={s.r} className="p-4 rounded-2xl bg-[#030712] border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-slate-500">ROUND 0{s.r}</span>
                        <span className={`text-[10px] font-mono font-bold ${s.badge}`}>{s.code}</span>
                      </div>
                      <div className="font-bold text-white text-sm mb-2">{s.artist}</div>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div><span className="text-slate-500">Venue:</span> {s.venue} (P:{s.prestige})</div>
                        <div><span className="text-slate-500">Promo:</span> Level {s.promo}/5</div>
                        <div><span className="text-slate-500">Conditions:</span> {s.weather} · {s.day}</div>
                        <div><span className="text-slate-500">Competing:</span> <span className={s.comp === 'High' ? 'text-red-400' : s.comp === 'Moderate' ? 'text-amber-400' : 'text-slate-300'}>{s.comp}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============= TAB: SCORING ============= */}
            {activeTab === 'scoring' && (
              <div className="p-6 space-y-5 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-[#030712] border border-slate-800">
                    <div className="text-3xl font-black text-[#17D059] mb-1">60%</div>
                    <h3 className="font-bold text-white mb-2">Forecast Accuracy</h3>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Measured separately for Basic and Premium.</li>
                      <li>• Uses relative percentage error so neither category is unfair.</li>
                      <li>• Lower error = higher score.</li>
                    </ul>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#030712] border border-slate-800">
                    <div className="text-3xl font-black text-cyan-400 mb-1">40%</div>
                    <h3 className="font-bold text-white mb-2">Analytical Logic & Strategy</h3>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>1. Understanding of historical data patterns</li>
                      <li>2. Identification of demand drivers</li>
                      <li>3. Appropriateness of analytical method</li>
                      <li>4. Validation and rigor</li>
                      <li>5. Accuracy of scenario interpretation</li>
                      <li>6. Clarity of explanation</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Tournament Score</div>
                  <div className="text-2xl font-black text-white">Maximum 100 Points</div>
                </div>
              </div>
            )}

            {/* ============= TAB: RULES ============= */}
            {activeTab === 'rules' && (
              <div className="p-6 space-y-5 max-w-3xl">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#030712] border border-slate-800">
                    <div className="font-bold text-white text-sm mb-1">⏱ Strict 10-Minute Time Limit</div>
                    <p className="text-xs text-slate-400">Countdown starts when the round opens. Submissions must be made before the timer hits 0:00.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#030712] border border-slate-800">
                    <div className="font-bold text-white text-sm mb-1">🔒 Final Submissions Only</div>
                    <p className="text-xs text-slate-400">Once a round closes, no edits are allowed. The server's recorded submission is treated as final.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-[#17D059]" />
                    <span className="font-bold text-white text-sm">Pre-Submission Checklist</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                      <span className="text-[#17D059] font-bold">✓</span> Basic forecast: 0 to 50,000
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                      <span className="text-[#17D059] font-bold">✓</span> Premium forecast: 0 to 10,000
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                      <span className="text-[#17D059] font-bold">✓</span> Both forecast fields filled
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#030712] border border-slate-800">
                      <span className="text-[#17D059] font-bold">✓</span> Reasoning / logic entered
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-800 bg-[#070D18] flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-500 font-mono">UG Analytics Game 2026 · In-Game Resources</span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-[#17D059] to-emerald-600 text-slate-950 font-black text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              Back to Forecasting
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
