'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Target, Clock, Database, Award, CheckCircle2,
  Mic2, MapPin, Zap, ShieldAlert, Calendar, CloudSun,
  Lock, Users, AlertTriangle, ChevronDown, Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [teamCode, setTeamCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [sessionConflict, setSessionConflict] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const router = useRouter();

  const handleLogin = async (forceLogin = false) => {
    setError('');
    setSessionConflict(false);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/team-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode: teamCode.trim().toUpperCase(), pin, forceLogin }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'GAME_COMPLETED') {
          setGameCompleted(true);
          setLoading(false);
          return;
        }
        if (data.code === 'SESSION_CONFLICT') {
          setSessionConflict(true);
          setError('This team is already logged in on another device.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Invalid Team ID or Access Code');
      }
      router.push('/game/briefing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-white px-6">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#17D059]/8 blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#074870]/15 blur-[160px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="text-8xl mb-6">🏆</div>
          <div className="px-4 py-1.5 rounded-full bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] text-xs font-mono font-bold uppercase tracking-widest mb-5">
            All 6 Rounds Complete
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Thank You for <span className="text-[#17D059]">Participating!</span>
          </h1>
          <p className="text-slate-400 text-lg mb-2">
            Your team has successfully completed all 6 rounds of <strong className="text-white">Beyond The Stage</strong>.
          </p>
          <p className="text-[#38bdf8] font-semibold mb-8">
            Results will be announced by the Game Master.
          </p>
          <div className="flex gap-1.5 mb-10">
            {[1,2,3,4,5,6].map(r => (
              <div key={r} className="w-10 h-2 rounded-full bg-[#17D059]" />
            ))}
          </div>
          <button
            onClick={() => setGameCompleted(false)}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-white overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#17D059]/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#074870]/15 blur-[160px]" />
      </div>

      <main className="flex-1 flex flex-col w-full z-10">

        {/* ===== HERO ===== */}
        <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-16 max-w-7xl mx-auto w-full">

          {/* Left: Title + info */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] mb-6"
            >
              🏆 UG Business Analytics Game 2026
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative mb-5"
            >
              <div className="absolute inset-0 bg-[#17D059] blur-[80px] opacity-15 rounded-full" />
              <h1 className="relative text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-100 to-emerald-400 leading-none pb-2">
                Beyond<br />The Stage
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-base sm:text-lg text-slate-400 max-w-xl mb-8 leading-relaxed"
            >
              A live-entertainment forecasting challenge. Analyse <span className="text-white font-semibold">60 historical events</span>, interpret demand drivers, and predict attendance across <span className="text-[#17D059] font-semibold">6 competitive rounds</span>.
            </motion.p>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 max-w-md lg:max-w-none"
            >
              {[
                { value: '60', label: 'Events',   color: 'text-[#17D059]' },
                { value: '6',  label: 'Rounds',   color: 'text-cyan-400'  },
                { value: '10m',label: '/Round',   color: 'text-amber-400' },
                { value: '100',label: 'Max Pts',  color: 'text-purple-400'},
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#0B1222]/80 border border-slate-800 text-center">
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Login form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full max-w-sm shrink-0"
          >
            <div className="bg-[#0B1222] border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#17D059]/10 rounded-xl">
                  <Users size={20} className="text-[#17D059]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Enter Game Room</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Use credentials from Game Master</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleLogin(false); }} className="space-y-4">
                {/* Team ID */}
                <div>
                  <label className="block text-[11px] font-bold mb-1.5 text-slate-400 uppercase tracking-wider">Team Code</label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    placeholder="Enter your team code"
                    className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:ring-2 focus:ring-[#17D059] focus:border-transparent outline-none transition-all text-center font-bold text-base"
                    required
                    autoComplete="off"
                  />
                </div>

                {/* Access Code */}
                <div>
                  <label className="block text-[11px] font-bold mb-1.5 text-slate-400 uppercase tracking-wider">Access Code</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter access code"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:ring-2 focus:ring-[#17D059] focus:border-transparent outline-none transition-all text-center tracking-widest font-bold"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors cursor-pointer"
                      title={showPin ? "Hide access code" : "Show access code"}
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className={`text-xs text-center p-3 rounded-xl flex items-center justify-center gap-2 ${
                    sessionConflict
                      ? 'bg-amber-900/30 text-amber-400 border border-amber-800'
                      : 'bg-red-900/30 text-red-400 border border-red-800'
                  }`}>
                    <AlertTriangle size={13} /> {error}
                  </div>
                )}

                {/* Actions */}
                {sessionConflict ? (
                  <div className="space-y-2">
                    <button type="button" onClick={() => handleLogin(true)} disabled={loading}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 cursor-pointer">
                      {loading ? 'Logging in...' : '⚡ Force Login (kick other device)'}
                    </button>
                    <button type="button" onClick={() => { setSessionConflict(false); setError(''); }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !teamCode || !pin}
                    className="w-full bg-gradient-to-r from-[#17D059] to-emerald-500 text-white py-3.5 rounded-xl font-black text-base hover:shadow-lg hover:shadow-[#17D059]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1 flex items-center justify-center gap-2"
                  >
                    <Target size={18} />
                    {loading ? 'Authenticating...' : 'Enter Game Room'}
                  </button>
                )}
              </form>

              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <Link href="/login/admin" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  Admin Portal →
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600">
            <ChevronDown size={24} />
          </div>
        </section>

        {/* ===== OVERVIEW ===== */}
        <section className="w-full py-24 px-6 bg-[#070D18] border-y border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-[11px] font-mono text-[#17D059] uppercase tracking-widest mb-2">How It Works</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">The Challenge at a Glance</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { step: '01', title: 'Study the Data',       desc: 'Explore 60 historical events (2021–2025). Spot patterns across artist types, venues, promo levels, weather, and schedules.', icon: Database,     color: 'text-[#17D059]' },
                { step: '02', title: 'Read the Scenario',    desc: 'Each of the 6 live rounds reveals a unique event scenario. Interpret the 7 demand variables to form your forecast.', icon: Target,       color: 'text-cyan-400'  },
                { step: '03', title: 'Submit Your Forecast', desc: 'Enter Basic (0–50,000) and Premium (0–10,000) occupancy predictions and explain your analytical reasoning.', icon: Zap,          color: 'text-amber-400' },
                { step: '04', title: 'Win the Championship', desc: 'Scored on 60% Forecast Accuracy and 40% Analytical Logic. The most precise and well-reasoned team wins.', icon: Award,        color: 'text-purple-400'},
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-3xl bg-[#0B1222] border border-slate-800 hover:border-slate-600 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Step {s.step}</div>
                    <Icon className={`${s.color} mb-3`} size={32} />
                    <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* 7 Variables */}
            <div className="mt-12">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-white">7 Demand Variables to Master</h3>
                <p className="text-slate-400 text-sm mt-1">Every forecast hinges on your ability to read these signals from the dataset.</p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {[
                  { icon: Mic2,       color: 'text-[#17D059]', label: 'Artist'      },
                  { icon: MapPin,     color: 'text-cyan-400',  label: 'Venue'       },
                  { icon: Zap,        color: 'text-amber-400', label: 'Promo'       },
                  { icon: Award,      color: 'text-purple-400',label: 'Prestige'    },
                  { icon: CloudSun,   color: 'text-blue-400',  label: 'Weather'     },
                  { icon: Calendar,   color: 'text-pink-400',  label: 'Day'         },
                  { icon: ShieldAlert,color: 'text-red-400',   label: 'Competition' },
                ].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#030712] border border-slate-800 text-center">
                    <d.icon className={d.color} size={18} />
                    <span className="text-[10px] font-bold text-slate-300 leading-tight">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== RULES ===== */}
        <section className="w-full py-24 px-6 bg-[#030712]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest mb-2">Tournament Rules</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Rules & Scoring</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-[#0B1222] border border-slate-800">
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2"><Award size={18} className="text-[#17D059]" /> Scoring Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#17D059]/5 border border-[#17D059]/20">
                    <div>
                      <div className="font-bold text-white text-sm">Forecast Accuracy</div>
                      <div className="text-xs text-slate-400">Relative error on Basic &amp; Premium</div>
                    </div>
                    <div className="text-2xl font-black text-[#17D059]">60%</div>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <div>
                      <div className="font-bold text-white text-sm">Analytical Logic</div>
                      <div className="text-xs text-slate-400">Reasoning quality &amp; methodology</div>
                    </div>
                    <div className="text-2xl font-black text-cyan-400">40%</div>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="font-bold text-white text-sm">Maximum Score</div>
                    <div className="text-2xl font-black text-white">100 pts</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-[#0B1222] border border-slate-800">
                  <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2"><Target size={18} className="text-cyan-400" /> Valid Forecast Ranges</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#17D059]/5 border border-[#17D059]/20 text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Basic</div>
                      <div className="text-lg font-black text-[#17D059]">0 – 50,000</div>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Premium</div>
                      <div className="text-lg font-black text-cyan-400">0 – 10,000</div>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-[#0B1222] border border-slate-800">
                  <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2"><Clock size={18} className="text-amber-400" /> Time &amp; Submission Rules</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {[
                      '10-minute timer per round — no extensions',
                      'Timer expiry auto-submits zero score',
                      'Submissions lock immediately on confirm',
                      'Reasoning must be at least 10 characters',
                      'Team ID + Access Code required to enter',
                    ].map((rule, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-[#17D059] shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="w-full py-6 border-t border-slate-800 bg-[#070D18] text-center text-xs text-slate-500">
        Beyond The Stage · UG Business Analytics Game 2026 · Live Entertainment Forecasting Challenge
        <span className="mx-3 text-slate-700">·</span>
        <Link href="/login/admin" className="hover:text-slate-400 transition-colors">Admin</Link>
      </footer>
    </div>
  );
}
