'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Users, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function TeamLogin() {
  const [teamCode, setTeamCode] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [sessionConflict, setSessionConflict] = useState(false);
  const [loading, setLoading] = useState(false);
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
        if (data.code === 'SESSION_CONFLICT') {
          setSessionConflict(true);
          setError('This team is already logged in on another device.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Login failed');
      }
      router.push('/game/briefing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#17D059]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#074870]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="block">
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#17D059] to-emerald-400 bg-clip-text text-transparent">
              Beyond The Stage
            </h1>
          </Link>
          <p className="text-slate-500 mt-1.5 text-xs tracking-widest uppercase font-mono">
            UG Business Analytics Game 2026
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0B1222] border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#17D059]/10 rounded-xl">
              <Users size={18} className="text-[#17D059]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Team Login</h2>
              <p className="text-xs text-slate-500">Use your Team ID &amp; Passcode to enter</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(false); }} className="space-y-4">
            {/* Team ID */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-400 uppercase tracking-wider">Team Name</label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Enter your team name"
                className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:ring-2 focus:ring-[#17D059] focus:border-transparent outline-none transition-all text-center font-bold text-base"
                required
                autoComplete="off"
              />
            </div>

            {/* Access Code */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-400 uppercase tracking-wider">Access Code</label>
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
                className="w-full bg-gradient-to-r from-[#17D059] to-emerald-500 text-white py-3.5 rounded-xl font-black text-base hover:shadow-lg hover:shadow-[#17D059]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {loading ? 'Authenticating...' : 'Enter Game Room →'}
              </button>
            )}
          </form>
        </div>

        <div className="mt-5 text-center">
          <Link href="/login/admin" className="block text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
