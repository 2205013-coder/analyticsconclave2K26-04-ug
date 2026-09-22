'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-4">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#074870]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-[#17D059]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-[#17D059] to-emerald-400 bg-clip-text text-transparent">
            Beyond The Stage
          </h1>
          <div className="inline-flex items-center gap-2 mt-3 bg-[#074870]/20 border border-[#074870]/30 rounded-full px-4 py-1">
            <Shield size={14} className="text-cyan-400" />
            <span className="text-cyan-300 text-xs font-bold tracking-widest uppercase">Admin Access</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0B1222] border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#074870]/20 rounded-lg">
              <Shield size={20} className="text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Command Center</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-400">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="optixclubgame@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-400">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 p-1 rounded-lg transition-colors cursor-pointer z-10"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-center p-3 rounded-lg bg-red-900/30 text-red-400 border border-red-800 flex items-center justify-center gap-2">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#074870] to-cyan-600 text-white py-3.5 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'AUTHENTICATING...' : '🔐 ACCESS COMMAND CENTER'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
