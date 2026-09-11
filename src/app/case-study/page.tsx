'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import { 
  BookOpen, Target, Database, Award, ShieldAlert, 
  Calendar, CheckCircle2, ChevronRight, Mic2, MapPin, 
  CloudSun, Zap, ArrowLeft, ExternalLink, Download, FileText, Check
} from 'lucide-react';

export default function CaseStudyPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [copied, setCopied] = useState(false);

  const copyGuidelinesLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-white selection:bg-[#17D059]/30">
      <Navbar />

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#17D059]/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#074870]/20 blur-[160px]" />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Homepage
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={copyGuidelinesLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              {copied ? <Check size={14} className="text-[#17D059]" /> : <FileText size={14} />}
              {copied ? 'Link Copied!' : 'Share Case Study'}
            </button>
            <Link
              href="/game/market"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#17D059] text-slate-950 rounded-xl text-xs font-black hover:opacity-90 transition-opacity shadow-lg shadow-[#17D059]/20"
            >
              <Database size={14} /> Explore 60 Events Dataset
            </Link>
          </div>
        </div>

        {/* HERO TITLE HEADER */}
        <section className="mb-14 border-b border-slate-800/80 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] mb-4">
            Official Case Study & Tournament Rulebook
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4">
            UG BUSINESS ANALYTICS GAME 2026
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#17D059] via-emerald-300 to-cyan-400 bg-clip-text text-transparent mb-6">
            LIVE ENTERTAINMENT FORECASTING CHALLENGE
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
            Theme: <strong className="text-white">The Audience Analytics Challenge</strong>. Master the interplay of artist brand power, venue acoustics, pricing tiers, marketing intensity, weather shocks, and market clash dynamics across 6 live scenario rounds.
          </p>
        </section>

        {/* SUMMARY STATS / HIGHLIGHTS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          <div className="p-5 rounded-2xl bg-[#0B1222] border border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 mb-1">Historical Dataset</div>
            <div className="text-2xl sm:text-3xl font-black text-[#17D059]">60 Events</div>
            <div className="text-xs text-slate-500 mt-1">Multi-year 2021–2025 archive</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0B1222] border border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 mb-1">Live Rounds</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">6 Rounds</div>
            <div className="text-xs text-slate-500 mt-1">10 minutes per round</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0B1222] border border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 mb-1">Forecast Targets</div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400">2 Streams</div>
            <div className="text-xs text-slate-500 mt-1">Basic & Premium Seats</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0B1222] border border-slate-800">
            <div className="text-xs font-mono uppercase text-slate-400 mb-1">Scoring Balance</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">60% / 40%</div>
            <div className="text-xs text-slate-500 mt-1">Accuracy vs Analytical Logic</div>
          </div>
        </section>

        {/* SECTION 1: BUSINESS SCENARIO */}
        <section id="business-scenario" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#17D059]/10 text-[#17D059] border border-[#17D059]/20">
              <Target size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-[#17D059] uppercase font-bold tracking-wider">Section 01</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">The Business Scenario</h2>
            </div>
          </div>

          <div className="bg-[#0B1222] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-300">
            <p className="text-base sm:text-lg leading-relaxed">
              You are part of the <strong className="text-white font-bold">Business Analytics Team</strong> of a high-growth live-entertainment and concert production company.
              Your enterprise plans, promotes, and executes music concerts and live entertainment shows across diversified venue tiers. Before each event is launched, senior management requires precision forecasts of expected audience turnout to optimize ticket pricing thresholds, stage layouts, staffing, food and beverage inventory, and security logistics.
            </p>

            <div className="p-5 rounded-2xl bg-[#030712] border border-slate-800">
              <h3 className="text-white font-bold text-lg mb-3">Seven Core Factors Governing Live Attendance:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <Mic2 className="text-[#17D059] shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="text-white">1. The Artist or Act:</strong> Historical brand equity, fan engagement, and core draw (e.g. Artist A, Artist B, Artist C, Artist D).
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <MapPin className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="text-white">2. Venue Characteristics:</strong> Open-Air Venue, Indoor Hall, Convention Centre, or Mega Arena.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <Zap className="text-amber-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="text-white">3. Promotional Intensity:</strong> Graded on a scale of 1 (Organic/Minimal) to 5 (Heavy Media Blitz & Influencer Campaign).
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <Award className="text-purple-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="text-white">4. Venue Prestige:</strong> Relative prestige and quality rating from Level 1 (Budget/Basic) to Level 5 (Iconic 5-Star).
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <CloudSun className="text-blue-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="text-white">5. Weather Forecast:</strong> Sunny, Cloudy, or Rain conditions (crucial multiplier for open-air venues).
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <Calendar className="text-pink-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="text-white">6. Day of the Event:</strong> Weekday, Weekend, or Holiday timings driving consumer leisure budgets.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 md:col-span-2">
                  <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="text-white">7. Competing Entertainment Events:</strong> Level of rival activity in the metropolitan area (No Competition, Low, Moderate, High).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: FORECAST TARGETS */}
        <section id="forecast-targets" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">Section 02</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Forecasting Outcomes & Submission Limits</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-8 rounded-3xl bg-[#0B1222] border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#17D059]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="text-xs font-mono uppercase text-[#17D059] font-bold tracking-wider mb-2">Outcome Target 01</div>
              <h3 className="text-2xl font-black text-white mb-2">Basic / Economy Occupancy</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                The expected count of general admission attendees occupying standard seating, lawn, and economy tier tickets.
              </p>
              <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Permitted Input Range:</span>
                <span className="font-mono font-black text-xl text-[#17D059]">0 — 50,000 Seats</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0B1222] border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider mb-2">Outcome Target 02</div>
              <h3 className="text-2xl font-black text-white mb-2">Premium Occupancy</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                The expected count of high-yield attendees occupying VIP, hospitality suites, and front-row premium ticket tiers.
              </p>
              <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Permitted Input Range:</span>
                <span className="font-mono font-black text-xl text-cyan-400">0 — 10,000 Seats</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1222] border border-slate-800">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="text-amber-400" size={20} />
              Requirement 3: Written Analytical Logic & Reasoning
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every round submission requires a qualitative statement explaining the data patterns discovered, multiplier factors applied, and business rationale behind the submitted numbers.
            </p>
          </div>
        </section>

        {/* SECTION 3: HISTORICAL DATASET */}
        <section id="historical-dataset" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Database size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-purple-400 uppercase font-bold tracking-wider">Section 03</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Historical Data (60 Events)</h2>
            </div>
          </div>

          <div className="bg-[#0B1222] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Teams are provided with a robust training dataset comprising <strong className="text-white">60 historical events</strong> containing all primary independent variables and observed outcomes.
                </p>
              </div>
              <Link 
                href="/game/market" 
                className="px-5 py-2.5 bg-gradient-to-r from-[#17D059] to-emerald-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 transition-all shrink-0 cursor-pointer"
              >
                Open Historical Data Explorer <ExternalLink size={16} />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#070D18] text-slate-400 text-xs font-mono uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Variable Name</th>
                    <th className="px-5 py-3.5">Definition & Analytical Role</th>
                    <th className="px-5 py-3.5">Range / Possible Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans text-xs sm:text-sm">
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-[#17D059] font-bold">Event_ID</td>
                    <td className="px-5 py-3.5 text-slate-300">Unique event tracking identifier</td>
                    <td className="px-5 py-3.5 text-slate-400">E001 to E060</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-cyan-400 font-bold">Artist_Act</td>
                    <td className="px-5 py-3.5 text-slate-300">Headline artist brand & performer</td>
                    <td className="px-5 py-3.5 text-slate-400">Artist A, Artist B, Artist C, Artist D</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-white font-bold">Venue_Type</td>
                    <td className="px-5 py-3.5 text-slate-300">Facility structure & capacity category</td>
                    <td className="px-5 py-3.5 text-slate-400">Open-Air Venue, Indoor Hall, Convention Centre, Arena</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-amber-400 font-bold">Promotion_Level</td>
                    <td className="px-5 py-3.5 text-slate-300">Marketing budget intensity & media campaign scale</td>
                    <td className="px-5 py-3.5 text-slate-400">1 (Minimal) to 5 (Maximum Blitz)</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-purple-400 font-bold">Venue_Prestige</td>
                    <td className="px-5 py-3.5 text-slate-300">Perceived venue brand value & acoustic prestige</td>
                    <td className="px-5 py-3.5 text-slate-400">1 (Standard/Budget) to 5 (Iconic 5-Star)</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-blue-400 font-bold">Weather</td>
                    <td className="px-5 py-3.5 text-slate-300">Atmospheric condition on event date</td>
                    <td className="px-5 py-3.5 text-slate-400">Sunny, Cloudy, Rain</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-pink-400 font-bold">Event_Day</td>
                    <td className="px-5 py-3.5 text-slate-300">Calendar scheduling bracket</td>
                    <td className="px-5 py-3.5 text-slate-400">Weekday, Weekend, Holiday</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-mono text-red-400 font-bold">Competing_Events</td>
                    <td className="px-5 py-3.5 text-slate-300">City-wide competing concerts/sports clashes</td>
                    <td className="px-5 py-3.5 text-slate-400">No Competition, Low, Moderate, High</td>
                  </tr>
                  <tr className="bg-[#17D059]/5">
                    <td className="px-5 py-3.5 font-mono text-[#17D059] font-bold">Event_Occupancy_Basic</td>
                    <td className="px-5 py-3.5 text-white font-semibold">Historical Basic/Economy turnout (Target 1)</td>
                    <td className="px-5 py-3.5 text-[#17D059]">Observed attendance [0–50,000]</td>
                  </tr>
                  <tr className="bg-cyan-500/5">
                    <td className="px-5 py-3.5 font-mono text-cyan-400 font-bold">Event_Occupancy_Premium</td>
                    <td className="px-5 py-3.5 text-white font-semibold">Historical Premium turnout (Target 2)</td>
                    <td className="px-5 py-3.5 text-cyan-400">Observed VIP attendance [0–10,000]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 4: SCORING & EVALUATION */}
        <section id="scoring-evaluation" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">Section 04</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Scoring System & Evaluation Rubric (100 Points)</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-8 rounded-3xl bg-[#0B1222] border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-black text-[#17D059]">60%</span>
                <span className="px-3 py-1 rounded-full bg-[#17D059]/20 text-[#17D059] text-xs font-black uppercase">Weightage</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Forecast Accuracy</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Forecasts are matched against actual event turnouts using a balanced relative percentage accuracy model:
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#17D059] shrink-0 mt-0.5" />
                  <span><strong>Balanced Accuracy:</strong> Evaluates Basic and Premium categories separately to ensure fair weighting.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#17D059] shrink-0 mt-0.5" />
                  <span><strong>Relative Error Normalization:</strong> Prevents smaller absolute Premium numbers from being overshadowed by large Basic volumes.</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0B1222] border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-black text-cyan-400">40%</span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black uppercase">Weightage</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Analytical Logic & Strategy</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Evaluated by faculty and judges across six core analytical competencies:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">1. Data Understanding</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">2. Demand Driver ID</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">3. Method Appropriateness</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">4. Validation & Rigor</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">5. Scenario Interpretation</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">6. Explanatory Clarity</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: THE SIX LIVE ROUNDS */}
        <section id="six-rounds" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calendar size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-blue-400 uppercase font-bold tracking-wider">Section 05</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">The Six Live Forecasting Rounds</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { round: 1, code: 'T061', title: 'Open-Air Baseline', artist: 'Artist B', venue: 'Open-Air Venue', promo: 2, prestige: 2, weather: 'Sunny', day: 'Weekday', comp: 'Low', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
              { round: 2, code: 'T062', title: 'Holiday Surge & Competition', artist: 'Artist A', venue: 'Indoor Hall', promo: 5, prestige: 4, weather: 'Sunny', day: 'Holiday', comp: 'High', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
              { round: 3, code: 'T063', title: 'Prestige Weekend Showcase', artist: 'Artist B', venue: 'Convention Centre', promo: 4, prestige: 5, weather: 'Cloudy', day: 'Weekend', comp: 'Moderate', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
              { round: 4, code: 'T064', title: 'Indoor Hall Clash', artist: 'Artist D', venue: 'Indoor Hall', promo: 4, prestige: 4, weather: 'Cloudy', day: 'Weekday', comp: 'High', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30' },
              { round: 5, code: 'T065', title: 'High Promo / Entry Venue', artist: 'Artist A', venue: 'Open-Air Venue', promo: 4, prestige: 1, weather: 'Cloudy', day: 'Weekday', comp: 'High', badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
              { round: 6, code: 'T066', title: 'Solo Arena Grand Finale', artist: 'Artist C', venue: 'Arena', promo: 1, prestige: 2, weather: 'Sunny', day: 'Weekday', comp: 'No Competition', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
            ].map((r) => (
              <div key={r.round} className="bg-[#0B1222] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">ROUND 0{r.round}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${r.badgeColor}`}>
                      {r.code}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{r.artist}</h3>
                  <div className="text-xs text-slate-400 mb-4 font-semibold">{r.title}</div>
                  
                  <div className="space-y-2 text-xs text-slate-300 bg-[#030712] p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Venue:</span>
                      <span className="font-semibold text-white">{r.venue} (Prestige: {r.prestige}/5)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Promotion:</span>
                      <span className="font-semibold text-[#17D059]">Level {r.promo} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weather & Day:</span>
                      <span className="font-semibold text-white">{r.weather} • {r.day}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Competing Events:</span>
                      <span className="font-semibold text-amber-400">{r.comp}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Duration: 10 mins</span>
                  <span className="text-[#17D059]">Live Evaluated</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: TOURNAMENT RULES & CHECKLIST */}
        <section id="rules-checklist" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-wider">Section 06</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Rules of the Game & Pre-Submission Checklist</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-[#0B1222] border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-2">Rule I: Strict 10-Minute Time Limit</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Each round provides exactly 10 minutes of active forecasting time. Countdown commences automatically upon round reveal.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B1222] border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-2">Rule II: Final Submissions Only</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Once the 10-minute round closes, no modifications can be submitted. The server's recorded submission is treated as final.
              </p>
            </div>
          </div>

          {/* CHECKLIST */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#0B1222] to-[#0B1222] border border-emerald-800/40 rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-[#17D059]" size={22} />
              Before Submitting, Verify the 4 Mandatory Checks:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-200">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#030712] border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-[#17D059]/20 text-[#17D059] flex items-center justify-center font-bold text-xs">✓</span>
                <span>Basic forecast is strictly between <strong>0 and 50,000</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#030712] border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-[#17D059]/20 text-[#17D059] flex items-center justify-center font-bold text-xs">✓</span>
                <span>Premium forecast is strictly between <strong>0 and 10,000</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#030712] border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-[#17D059]/20 text-[#17D059] flex items-center justify-center font-bold text-xs">✓</span>
                <span>Both numerical forecast fields are populated</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#030712] border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-[#17D059]/20 text-[#17D059] flex items-center justify-center font-bold text-xs">✓</span>
                <span>Analytical reasoning and methodology are entered</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BOTTOM BAR */}
        <section className="text-center bg-gradient-to-br from-[#074870]/40 via-slate-900 to-[#17D059]/10 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-black text-white mb-3">Ready to Enter the Arena?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Historical Data + Analytics + Scenario Interpretation + Business Judgment = Defensible Forecast.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-[#17D059] to-emerald-600 text-slate-950 font-black text-base rounded-full hover:scale-105 transition-all shadow-xl shadow-[#17D059]/20 flex items-center gap-2"
            >
              <Target size={20} /> ENTER THE WAR ROOM
            </Link>
            <Link
              href="/game/market"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-full transition-colors flex items-center gap-2 border border-slate-700"
            >
              <Database size={20} /> View Historical Data Archive
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
