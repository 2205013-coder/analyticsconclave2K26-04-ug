'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter, Search, BookOpen, ExternalLink, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function MarketDataPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [artistFilter, setArtistFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [weatherFilter, setWeatherFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/game/training-data');
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (artistFilter && item.artistAct !== artistFilter) return false;
      if (venueFilter && item.venueType !== venueFilter) return false;
      if (weatherFilter && item.weather !== weatherFilter) return false;
      if (dayFilter && item.concertDay !== dayFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = 
          (item.matchId && item.matchId.toLowerCase().includes(q)) ||
          (item.artistAct && item.artistAct.toLowerCase().includes(q)) ||
          (item.venueType && item.venueType.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [data, artistFilter, venueFilter, weatherFilter, dayFilter, search]);

  // Chart Data: Avg by Artist
  const avgByArtist = useMemo(() => {
    const sums: Record<string, { basic: number, premium: number, count: number }> = {};
    filteredData.forEach(d => {
      if (!sums[d.artistAct]) sums[d.artistAct] = { basic: 0, premium: 0, count: 0 };
      sums[d.artistAct].basic += d.actualGa;
      sums[d.artistAct].premium += d.actualVip;
      sums[d.artistAct].count++;
    });
    return Object.entries(sums).map(([name, val]) => ({
      name,
      avgBasic: Math.round(val.basic / val.count),
      avgPremium: Math.round(val.premium / val.count),
    }));
  }, [filteredData]);

  // Chart Data: Avg by Venue
  const avgByVenue = useMemo(() => {
    const sums: Record<string, { total: number, count: number }> = {};
    filteredData.forEach(d => {
      if (!sums[d.venueType]) sums[d.venueType] = { total: 0, count: 0 };
      sums[d.venueType].total += d.actualGa + d.actualVip;
      sums[d.venueType].count++;
    });
    return Object.entries(sums).map(([name, val]) => ({
      name: name.replace(' Venue', '').replace(' Centre', ''),
      avg: Math.round(val.total / val.count)
    }));
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const uniqueArtists = Array.from(new Set(data.map(d => d.artistAct))).filter(Boolean);
  const uniqueVenues = Array.from(new Set(data.map(d => d.venueType))).filter(Boolean);
  const uniqueWeathers = Array.from(new Set(data.map(d => d.weather))).filter(Boolean);
  const uniqueDays = Array.from(new Set(data.map(d => d.concertDay))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-center">
        <div className="w-10 h-10 border-4 border-[#17D059] border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-xl font-bold text-white">Loading Historical Data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 text-white pb-12 px-4 py-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#17D059]/10 text-[#17D059] border border-[#17D059]/30">
              UG Analytics Game 2026
            </span>
            <span className="text-xs text-slate-400 font-mono">Training Dataset (60 Events)</span>
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Historical Data Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Examine the 60 benchmark events to discover demand driver correlations, artist baseline draw, and venue multipliers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/case-study" 
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <BookOpen size={14} className="text-[#17D059]" />
            <span>Case Study & Rules</span>
          </Link>

          <Link 
            href="/game" 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#17D059] text-slate-950 rounded-xl hover:opacity-90 transition-opacity font-bold text-xs sm:text-sm shadow-lg shadow-[#17D059]/20"
          >
            <ArrowLeft size={16} /> Return to War Room
          </Link>
        </div>
      </div>

      {/* CHARTS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0B1222] p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white">Avg Basic vs. Premium by Artist</h3>
            <span className="text-xs text-slate-400 font-mono">Seats</span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer>
              <BarChart data={avgByArtist}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#030712', borderColor: '#334155', borderRadius: '12px', color: '#fff'}} />
                <Bar dataKey="avgBasic" fill="#17D059" radius={[4,4,0,0]} name="Avg Basic" />
                <Bar dataKey="avgPremium" fill="#38BDF8" radius={[4,4,0,0]} name="Avg Premium" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[#0B1222] p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white">Avg Total Attendance by Venue Type</h3>
            <span className="text-xs text-slate-400 font-mono">Total Seats</span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer>
              <BarChart data={avgByVenue}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#030712', borderColor: '#334155', borderRadius: '12px', color: '#fff'}} />
                <Bar dataKey="avg" fill="#074870" radius={[4,4,0,0]} name="Avg Total Occupancy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTERS & DATA TABLE */}
      <div className="bg-[#0B1222] rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
        
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-800 flex flex-wrap gap-3 items-center bg-[#070D18]">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase mr-2 font-mono">
            <Filter size={14} className="text-[#17D059]" /> Filters:
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ID / Artist..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-[#030712] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#17D059]"
            />
          </div>

          <select 
            value={artistFilter}
            onChange={(e) => { setArtistFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#030712] text-xs text-white focus:outline-none"
          >
            <option value="">All Artists</option>
            {uniqueArtists.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          
          <select 
            value={venueFilter}
            onChange={(e) => { setVenueFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#030712] text-xs text-white focus:outline-none"
          >
            <option value="">All Venues</option>
            {uniqueVenues.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <select 
            value={weatherFilter}
            onChange={(e) => { setWeatherFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#030712] text-xs text-white focus:outline-none"
          >
            <option value="">All Weather</option>
            {uniqueWeathers.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          <select 
            value={dayFilter}
            onChange={(e) => { setDayFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#030712] text-xs text-white focus:outline-none"
          >
            <option value="">All Days</option>
            {uniqueDays.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {(artistFilter || venueFilter || weatherFilter || dayFilter || search) && (
            <button
              onClick={() => {
                setArtistFilter('');
                setVenueFilter('');
                setWeatherFilter('');
                setDayFilter('');
                setSearch('');
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 transition-colors ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070D18] text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold">Event_ID</th>
                <th className="px-4 py-3 font-bold">Artist_Act</th>
                <th className="px-4 py-3 font-bold">Venue_Type</th>
                <th className="px-4 py-3 font-bold text-center">Promo</th>
                <th className="px-4 py-3 font-bold text-center">Prestige</th>
                <th className="px-4 py-3 font-bold">Weather</th>
                <th className="px-4 py-3 font-bold">Event_Day</th>
                <th className="px-4 py-3 font-bold">Competing</th>
                <th className="px-4 py-3 font-bold text-right text-[#17D059]">Basic Occupancy</th>
                <th className="px-4 py-3 font-bold text-right text-cyan-400">Premium Occupancy</th>
                <th className="px-4 py-3 font-bold text-right text-white">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-300">{item.matchId}</td>
                  <td className="px-4 py-3 font-bold text-white">{item.artistAct}</td>
                  <td className="px-4 py-3 text-slate-300">{item.venueType}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#17D059]/10 text-[#17D059]">
                      {item.promotionLevel}/5
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-purple-500/10 text-purple-400">
                      {item.venuePrestige}/5
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.weather}</td>
                  <td className="px-4 py-3 text-slate-300">{item.concertDay}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      item.competingEvents === 'High' ? 'bg-red-950/60 text-red-400' :
                      item.competingEvents === 'Moderate' ? 'bg-amber-950/60 text-amber-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {item.competingEvents}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-[#17D059]">
                    {item.actualGa?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-cyan-400">
                    {item.actualVip?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-right text-white">
                    {((item.actualGa || 0) + (item.actualVip || 0)).toLocaleString()}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                    No matching historical events found for the active filter combination.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-[#070D18] text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}</strong> to <strong className="text-white">{Math.min(page * itemsPerPage, filteredData.length)}</strong> of <strong className="text-white">{filteredData.length}</strong> events
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white font-bold"
            >
              Previous
            </button>
            <span className="px-2 font-mono">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white font-bold"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
