'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ROUND_THEMES } from '@/types';
import { 
  AlertCircle, CheckCircle2, ChevronRight, Clock, MapPin, 
  Mic2, CloudSun, Calendar, ShieldAlert, Zap, Award,
  ArrowRight
} from 'lucide-react';


type GamePhase = 'loading' | 'briefing' | 'prep' | 'playing' | 'review' | 'confirm' | 'result' | 'transition';

export default function GamePage() {
  const router = useRouter();
  
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundData, setRoundData] = useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [gaForecast, setGaForecast] = useState<string>('');
  const [vipForecast, setVipForecast] = useState<string>('');
  const [reasoning, setReasoning] = useState('');
  const [activeTab, setActiveTab] = useState('artist');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const roundNumberRef = useRef(1);
  const [nextRoundNumber, setNextRoundNumber] = useState(2);

  // Fetch current game status to know which round we are in
  // ── Timer localStorage helpers ─────────────────────────────
  const TIMER_LS_KEY = 'bts_timer';
  const saveTimerToStorage = (round: number, startedAt: number, duration: number) => {
    try { localStorage.setItem(TIMER_LS_KEY, JSON.stringify({ round, startedAt, duration })); } catch {}
  };
  const loadTimerFromStorage = () => {
    try { return JSON.parse(localStorage.getItem(TIMER_LS_KEY) || 'null'); } catch { return null; }
  };
  const clearTimerFromStorage = () => {
    try { localStorage.removeItem(TIMER_LS_KEY); } catch {}
  };

  useEffect(() => {
    const initGame = async () => {
      try {
        // ── Step 1: Check localStorage for instant same-device restore ──
        const saved = loadTimerFromStorage();

        const res = await fetch('/api/game/status');
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();

        if (data.status === 'completed' || data.currentRound > 6) {
          setPhase('completed');
          return;
        }

        const round = data.currentRound || 1;
        roundNumberRef.current = round;
        setRoundNumber(round);

        // ── Step 2: Use server timerState as the authoritative source ──
        const timerState = data.timerState;

        if (timerState?.timerStarted && timerState.remaining > 0) {
          // Server confirms timer is running — restore directly
          await fetchRoundData(round, timerState.remaining);
          setPhase('playing');
        } else if (timerState?.timerStarted && timerState.remaining <= 0) {
          // Timer expired while team was away — auto-submit zeros so currentRound advances in DB
          await fetchRoundData(round, 0);
          clearTimerFromStorage();
          // Fire-and-forget: idempotent — submit API ignores if already submitted
          fetch('/api/game/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roundNumber: round,
              predictedGa: 0,
              predictedVip: 0,
              reasoning: 'Time expired — no submission made.',
            }),
          }).catch(console.error);
          setPhase('result');
        } else if (saved && saved.round === round) {
          // Server says no timer, but localStorage says timer was started —
          // use localStorage as fallback (covers the case where server didn't save yet)
          const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
          const remaining = Math.max(0, saved.duration - elapsed);
          if (remaining > 0) {
            await fetchRoundData(round, remaining);
            setPhase('playing');
          } else {
            clearTimerFromStorage();
            await fetchRoundData(round, null);
            setPhase('prep');
          }
        } else {
          // No timer running at all — fresh prep
          clearTimerFromStorage();
          await fetchRoundData(round, null);
          setPhase('prep');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading game state.');
      }
    };
    initGame();
  }, [router]);


  const fetchRoundData = async (round: number, restoredTimeLeft: number | null) => {
    try {
      roundNumberRef.current = round;
      const res = await fetch(`/api/game/round/${round}`);
      if (!res.ok) throw new Error('Failed to fetch round data');
      const data = await res.json();
      setRoundData(data.round);
      // Use restored time if available; otherwise use the round's full duration
      setTimeLeft(restoredTimeLeft ?? data.round?.timerSeconds ?? 600);
      // NOTE: phase is NOT set here — the caller sets it after this resolves
      // so there is no race between prep and playing on refresh.
      
      // Reset inputs for fresh round
      setGaForecast('');
      setVipForecast('');
      setReasoning('');
    } catch (err) {
      console.error(err);
      setError('Error loading round data.');
    }
  };

  // Timer — use ref to avoid stale closure on auto-submit
  const autoSubmitCalledRef = useRef(false);
  useEffect(() => {
    autoSubmitCalledRef.current = false;
  }, [roundNumber]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (phase === 'playing' && timeLeft === 0 && !autoSubmitCalledRef.current) {
      autoSubmitCalledRef.current = true;
      // Auto-submit zeros — timer expired while on page
      clearTimerFromStorage();
      setPhase('result');
      setGaForecast('0');
      setVipForecast('0');
      setReasoning('Time expired — no submission made.');
      fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundNumber: roundNumberRef.current,
          predictedGa: 0,
          predictedVip: 0,
          reasoning: 'Time expired — no submission made.'
        })
      }).catch(console.error);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const [startingTimer, setStartingTimer] = useState(false);

  const handleStartPlaying = async () => {
    setStartingTimer(true);
    try {
      const res = await fetch('/api/game/start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundNumber }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server refused to start the timer. Please try again.');
      }
      const data = await res.json();
      const duration = data.duration ?? 600;
      const remaining = data.remaining ?? duration;
      // Back-calculate when the round actually started so localStorage matches server
      const startedAt = Date.now() - ((duration - remaining) * 1000);
      saveTimerToStorage(roundNumber, startedAt, duration);

      setTimeLeft(remaining);
      setPhase('playing');
    } catch (err: any) {
      setError(err.message || 'Failed to start timer. Please try again.');
    } finally {
      setStartingTimer(false);
    }
  };

  const basicNum = parseInt(gaForecast);
  const premiumNum = parseInt(vipForecast);
  
  const isBasicValid = !isNaN(basicNum) && basicNum >= 0 && basicNum <= 50000;
  const isPremiumValid = !isNaN(premiumNum) && premiumNum >= 0 && premiumNum <= 10000;
  const isBothEntered = gaForecast.trim() !== '' && vipForecast.trim() !== '';
  const isReasoningValid = reasoning.trim().length >= 10;
  const canSubmit = isBasicValid && isPremiumValid && isBothEntered;

  const handleReview = () => setPhase('review');

  const handleSubmitDirect = async () => {
    if (!isBasicValid || !isPremiumValid) return;
    setSubmitting(true);
    // Stop timer
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundNumber: roundNumberRef.current,
          predictedGa: basicNum,
          predictedVip: premiumNum,
          reasoning: reasoning || '(No reasoning provided)'
        })
      });
      if (!res.ok) throw new Error('Submission failed');
      // Clear localStorage timer so next round starts fresh
      clearTimerFromStorage();
      setPhase('result');
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        roundNumber,
        predictedGa: basicNum,
        predictedVip: premiumNum,
        reasoning
      };
      
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Submission failed');
      
      setPhase('result');
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
      setPhase('review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextRound = async () => {
    if (roundNumber >= 6) {
      setPhase('completed');
      return;
    }
    // Ask server for the authoritative current round to avoid client/server mismatch
    try {
      const res = await fetch('/api/game/status');
      const data = await res.json();
      const serverRound = data.currentRound || roundNumber;
      const next = serverRound; // server already incremented on submit
      if (next > 6) {
        setPhase('completed');
        return;
      }
      setNextRoundNumber(next);
      setPhase('transition');
      setTimeout(async () => {
        roundNumberRef.current = next;
        setRoundNumber(next);
        clearTimerFromStorage();
        await fetchRoundData(next, null);
        setPhase('prep');
      }, 1800);
    } catch {
      // Fallback to client increment if status fetch fails
      const next = roundNumber + 1;
      setNextRoundNumber(next);
      setPhase('transition');
      setTimeout(async () => {
        roundNumberRef.current = next;
        setRoundNumber(next);
        clearTimerFromStorage();
        await fetchRoundData(next, null);
        setPhase('prep');
      }, 1800);
    }
  };

  if (phase === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-center">
        <div className="w-12 h-12 border-4 border-[#17D059] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-white">Loading War Room...</h2>
        <p className="text-sm text-slate-400 mt-1">Fetching live scenario data</p>
      </div>
    );
  }

  if (phase === 'transition') {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-center">
        <div className="text-6xl mb-6 animate-bounce">⚡</div>
        <div className="px-4 py-1.5 rounded-full bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] text-xs font-mono font-bold uppercase tracking-widest mb-3">
          Round {nextRoundNumber - 1} Complete
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
          Entering Round <span className="text-[#17D059]">{nextRoundNumber}</span>
        </h2>
        <p className="text-slate-400 text-sm">Loading next live scenario variables...</p>
        <div className="mt-6 flex gap-1.5">
          {[1,2,3,4,5,6].map(r => (
            <div key={r} className={`w-8 h-1.5 rounded-full transition-all ${
              r < nextRoundNumber ? 'bg-[#17D059]' : r === nextRoundNumber ? 'bg-[#17D059]/50 animate-pulse' : 'bg-slate-800'
            }`} />
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'completed') {
    const handleReturnHome = async () => {
      await fetch('/api/auth/team-logout', { method: 'POST' });
      router.push('/');
    };

    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-center px-6">
        <div className="text-7xl mb-6">🏆</div>
        <div className="px-4 py-1.5 rounded-full bg-[#17D059]/10 border border-[#17D059]/30 text-[#17D059] text-xs font-mono font-bold uppercase tracking-widest mb-4">
          All 6 Rounds Complete
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">
          Thank You for <span className="text-[#17D059]">Participating!</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-lg mb-2">
          You have successfully completed all 6 rounds of <strong className="text-white">Beyond The Stage</strong>.
        </p>
        <p className="text-[#38bdf8] font-semibold mb-8">
          Your results will be announced by the Game Master.
        </p>
        <div className="flex gap-1.5 mb-8">
          {[1,2,3,4,5,6].map(r => (
            <div key={r} className="w-10 h-2 rounded-full bg-[#17D059]" />
          ))}
        </div>
        <button
          onClick={handleReturnHome}
          className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg transition-colors border border-slate-700"
        >
          🏠 Return to Home
        </button>
      </div>
    );
  }

  const themeInfo = ROUND_THEMES[roundNumber] || { 
    emoji: '🎵', 
    name: 'Live Round', 
    code: `T06${roundNumber}`, 
    color: '#17D059' 
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col text-white pb-12 px-4 py-6">
      

      {/* Header Info */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#17D059]">
              Round {roundNumber} of 6
            </span>
            <span className="text-slate-600">•</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Scenario {themeInfo.code}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3 text-white">
            <span className="text-3xl">{themeInfo.emoji}</span>
            {roundData?.title || themeInfo.name}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {phase === 'playing' && (
            <>
              {/* Submit button beside timer */}
              <button
                onClick={handleSubmitDirect}
                disabled={!isBasicValid || !isPremiumValid || submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#17D059] to-emerald-500 text-slate-950 font-black text-sm hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#17D059]/20 cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <><span className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <>✓ SUBMIT FORECAST</>
                )}
              </button>

              {/* Countdown timer */}
              <div className={`text-2xl font-mono font-black px-4 py-1.5 rounded-xl border flex items-center gap-2 ${
                timeLeft < 60
                  ? 'bg-red-950/60 border-red-800 text-red-400 animate-pulse'
                  : 'bg-[#030712] border-slate-800 text-[#17D059]'
              }`}>
                <Clock size={20} />
                {formatTime(timeLeft)}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 text-red-400 border border-red-800 p-4 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area based on Phase */}
      <div className="bg-[#0B1222] border border-slate-800 rounded-3xl shadow-xl flex flex-col">
        
        {/* ===== UNIFIED ROUND VIEW (prep + playing merged) ===== */}
        {(phase === 'prep' || phase === 'playing') && roundData && (
          <div className="p-5 sm:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">

            {/* ── ENTER ROUND GATE (only in prep) ── */}
            {phase === 'prep' && (
              <div className="rounded-2xl overflow-hidden border border-[#17D059]/40 bg-gradient-to-br from-[#17D059]/10 via-emerald-950/20 to-[#0B1222]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
                  <div>
                    <div className="text-[10px] font-mono text-[#17D059] uppercase tracking-widest mb-1">Round {roundNumber} of 6 — Ready to Play</div>
                    <div className="text-white font-black text-lg">Enter Round {roundNumber}</div>
                    <div className="text-slate-400 text-xs mt-0.5">Click to start your 10-minute timer. You may pre-fill your forecast below first.</div>
                  </div>
                  <button
                    onClick={handleStartPlaying}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#17D059] to-emerald-500 text-slate-950 rounded-2xl font-black text-base hover:scale-105 hover:shadow-2xl hover:shadow-[#17D059]/30 transition-all shadow-xl shadow-[#17D059]/20 cursor-pointer"
                  >
                    <ArrowRight size={20} /> Enter Round {roundNumber}
                  </button>
                </div>
                <div className="bg-[#17D059]/5 border-t border-[#17D059]/20 px-5 py-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <Clock size={11} className="text-[#17D059]" /> Timer starts when you click — 10 minutes to submit.
                </div>
              </div>
            )}

            {/* ── PLAYING: timer reminder strip ── */}
            {phase === 'playing' && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">⏱ Round {roundNumber} — Timer Running</span>
                <span className="text-xs text-slate-400">Submit before time expires</span>
              </div>
            )}

            {/* ── SCENARIO BRIEF ── */}
            <div className="bg-[#0B1222] p-4 rounded-2xl border border-slate-800 text-slate-300 text-sm leading-relaxed">
              <strong className="text-white block mb-1 text-xs font-mono uppercase tracking-wider text-slate-400">Scenario Brief</strong>
              {roundData.instructions || 'Analyze the event scenario parameters below and evaluate demand drivers against the 60 historical events.'}
            </div>

            {/* ── 7 SCENARIO VARIABLE CARDS ── */}
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">7 Scenario Variables — Round {roundNumber}</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1 Artist */}
                <div className="col-span-2 p-4 rounded-2xl bg-[#0B1222] border border-slate-700">
                  <div className="text-[10px] text-[#17D059] font-mono uppercase tracking-wider mb-1 flex items-center gap-1"><Mic2 size={10}/>Artist / Act</div>
                  <div className="font-black text-white text-xl">{roundData.artistAct}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{roundData.genre || 'Live Performer'}</div>
                </div>
                {/* 2 Venue Type */}
                <div className="p-4 rounded-2xl bg-[#0B1222] border border-slate-700">
                  <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={10}/>Venue Type</div>
                  <div className="font-bold text-white text-sm leading-tight">{roundData.venueType}</div>
                </div>
                {/* 3 Venue Prestige */}
                <div className="p-4 rounded-2xl bg-[#0B1222] border border-purple-900/50">
                  <div className="text-[10px] text-purple-400 font-mono uppercase tracking-wider mb-1 flex items-center gap-1"><Award size={10}/>Venue Prestige</div>
                  <div className="font-black text-purple-300 text-2xl">{roundData.venuePrestige}<span className="text-sm text-slate-500">/5</span></div>
                </div>
                {/* 4 Promotion Level */}
                <div className="p-4 rounded-2xl bg-[#0B1222] border border-amber-900/50">
                  <div className="text-[10px] text-amber-400 font-mono uppercase tracking-wider mb-1 flex items-center gap-1"><Zap size={10}/>Promotion Level</div>
                  <div className="font-black text-amber-300 text-2xl">{roundData.promotionLevel}<span className="text-sm text-slate-500">/5</span></div>
                </div>
                {/* 5 Weather */}
                <div className="p-4 rounded-2xl bg-[#0B1222] border border-blue-900/50">
                  <div className="text-[10px] text-blue-400 font-mono uppercase tracking-wider mb-1 flex items-center gap-1"><CloudSun size={10}/>Weather</div>
                  <div className="font-bold text-blue-300 text-sm">{roundData.weather}</div>
                </div>
                {/* 6 Event Day */}
                <div className="p-4 rounded-2xl bg-[#0B1222] border border-pink-900/50">
                  <div className="text-[10px] text-pink-400 font-mono uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={10}/>Event Day</div>
                  <div className="font-bold text-pink-300 text-sm">{roundData.concertDay}</div>
                </div>
                {/* 7 Competing Events */}
                <div className="col-span-2 p-4 rounded-2xl bg-[#0B1222] border border-red-900/50">
                  <div className="text-[10px] text-red-400 font-mono uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldAlert size={10}/>Competing Events</div>
                  <div className={`font-black text-lg ${
                    roundData.competingEvents === 'High' ? 'text-red-400' :
                    roundData.competingEvents === 'Moderate' ? 'text-amber-400' :
                    roundData.competingEvents === 'Low' ? 'text-blue-400' : 'text-green-400'
                  }`}>{roundData.competingEvents || 'None'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Level of competing entertainment in the city</div>
                </div>
              </div>
            </div>

            {/* ── INPUT FIELDS ── */}
            <div className="bg-[#0B1222] border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3">
                Your Forecast — Round {roundNumber}
              </div>

              {/* Field 1: Basic */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white">1. Basic / Economy Occupancy *</label>
                  <span className="text-xs font-mono text-[#17D059]">0 – 50,000</span>
                </div>
                <input
                  type="number" inputMode="numeric" min={0} max={50000}
                  value={gaForecast}
                  onChange={e => setGaForecast(e.target.value)}
                  placeholder="Enter Basic / Economy seat count  (0 – 50,000)"
                  className="w-full text-xl sm:text-2xl p-4 rounded-xl bg-[#030712] border border-slate-700 text-white placeholder-slate-600 focus:ring-2 focus:ring-[#17D059] focus:border-transparent outline-none transition-all font-mono"
                />
                {gaForecast && !isBasicValid && (
                  <p className="text-xs text-red-400 mt-1">Must be a whole number between 0 and 50,000.</p>
                )}
              </div>

              {/* Field 2: Premium */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white">2. Premium / VIP Occupancy *</label>
                  <span className="text-xs font-mono text-cyan-400">0 – 10,000</span>
                </div>
                <input
                  type="number" inputMode="numeric" min={0} max={10000}
                  value={vipForecast}
                  onChange={e => setVipForecast(e.target.value)}
                  placeholder="Enter Premium / VIP seat count  (0 – 10,000)"
                  className="w-full text-xl sm:text-2xl p-4 rounded-xl bg-[#030712] border border-slate-700 text-cyan-400 placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono"
                />
                {vipForecast && !isPremiumValid && (
                  <p className="text-xs text-red-400 mt-1">Must be a whole number between 0 and 10,000.</p>
                )}
              </div>

              {/* Field 3: Reasoning */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white">3. Forecast Logic &amp; Reasoning <span className="text-slate-400 font-normal">(40% Weightage)</span></label>
                  <span className="text-xs text-slate-400">Min 10 chars</span>
                </div>
                <textarea
                  value={reasoning}
                  onChange={e => setReasoning(e.target.value)}
                  placeholder={`Write your analytical reasoning here. For example:
• Historical baseline: Based on similar Artist X events in [venue type], average Basic occupancy was ~Y.
• Variable adjustments: Promotion Level adds ~10–15% uplift. Holiday boosts demand. High competition reduces draw by ~10%.
• Final estimate: Adjusted baseline gives Basic ≈ [your number] and Premium ≈ [your number] given Prestige [X]/5.`}
                  rows={5}
                  className="w-full p-4 rounded-xl bg-[#030712] border border-slate-700 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-[#17D059] focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {[
                  { ok: isBasicValid,     label: 'Basic forecast (0–50,000)' },
                  { ok: isPremiumValid,   label: 'Premium forecast (0–10,000)' },
                  { ok: isBothEntered,   label: 'Both forecasts entered' },
                  { ok: isReasoningValid, label: 'Reasoning entered (10+ chars)' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${item.ok ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${item.ok ? 'bg-[#17D059] text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                      {item.ok ? '✓' : '○'}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Submit or start-timer prompt */}
              <div className="pt-2 border-t border-slate-800">
                {phase === 'prep' ? (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">Or click above to start the timer and begin the round.</p>
                    <button
                      onClick={handleStartPlaying}
                      className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#17D059] to-emerald-500 text-slate-950 rounded-xl font-black text-sm hover:opacity-90 transition-all cursor-pointer"
                    >
                      <ArrowRight size={15} /> Enter Round {roundNumber}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitDirect}
                    disabled={!isBasicValid || !isPremiumValid || submitting}
                    className="w-full py-4 bg-gradient-to-r from-[#17D059] to-emerald-600 text-slate-950 font-black rounded-xl text-base hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#17D059]/20 cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : '✓ Submit Forecast for Round ' + roundNumber}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ================= REVIEW PHASE ================= */}
        {phase === 'review' && (
          <div className="p-6 sm:p-8 flex-1 flex flex-col max-w-2xl mx-auto w-full">
            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                Final Verification
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Lock In Your Round {roundNumber} Forecast</h2>
              <p className="text-xs text-slate-400 mt-1">Review your values carefully. No changes allowed after final submission.</p>
            </div>

            <div className="space-y-4 bg-[#030712] p-6 rounded-2xl border border-slate-800 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Scenario Code:</span>
                <span className="font-mono font-bold text-white">{themeInfo.code}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Basic / Economy Occupancy:</span>
                <span className="text-xl font-mono font-black text-[#17D059]">{basicNum.toLocaleString()} Seats</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Premium Occupancy:</span>
                <span className="text-xl font-mono font-black text-cyan-400">{premiumNum.toLocaleString()} Seats</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block mb-1">Forecast Logic / Strategy:</span>
                <div className="p-3.5 bg-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed border border-slate-800 max-h-32 overflow-y-auto">
                  {reasoning}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-auto">
              <button 
                onClick={() => setPhase('playing')}
                disabled={submitting}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors border border-slate-700 cursor-pointer"
              >
                ← Edit Forecast
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3.5 bg-gradient-to-r from-[#17D059] to-emerald-600 text-slate-950 rounded-xl font-black text-sm sm:text-base hover:opacity-95 transition-all shadow-lg shadow-[#17D059]/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'RECORDING SUBMISSION...' : 'CONFIRM & SUBMIT TO JUDGES'}
              </button>
            </div>
          </div>
        )}

        {/* ================= RESULT PHASE ================= */}
        {phase === 'result' && (
          <div className="p-8 sm:p-12 flex-1 flex flex-col justify-center items-center text-center max-w-xl mx-auto w-full">
            <div className="w-16 h-16 rounded-full bg-[#17D059]/20 border border-[#17D059] text-[#17D059] flex items-center justify-center text-3xl mb-4">
              ✓
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2">Round {roundNumber} Forecast Locked!</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Your Basic and Premium forecasts along with your analytical reasoning have been securely registered with the Game Master.
            </p>

            <div className="w-full bg-[#030712] p-5 rounded-2xl border border-slate-800 text-left text-xs text-slate-300 space-y-2 mb-8">
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Occupancy Forecast:</span>
                <span className="font-mono font-bold text-[#17D059]">{basicNum.toLocaleString()} Seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Premium Occupancy Forecast:</span>
                <span className="font-mono font-bold text-cyan-400">{premiumNum.toLocaleString()} Seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evaluation:</span>
                <span className="font-semibold text-amber-400">60% Accuracy + 40% Logic Review</span>
              </div>
            </div>

            <button 
              onClick={handleNextRound}
              className="w-full py-4 bg-gradient-to-r from-[#17D059] to-emerald-600 text-slate-950 font-black rounded-xl text-base hover:opacity-95 transition-all shadow-lg shadow-[#17D059]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {roundNumber >= 6 ? 'VIEW FINAL TOURNAMENT STANDINGS' : `PROCEED TO ROUND ${roundNumber + 1}`}
              <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
