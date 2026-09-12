'use client';
import { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Download, Trash2, 
  RefreshCw, LogOut, Eye, EyeOff, Loader2, AlertCircle 
} from 'lucide-react';

interface Team {
  id: string;
  teamCode: string;
  name: string;
  leaderName: string | null;
  institution: string | null;
  currentRound: number;
  totalScore: number;
  status: string;
  rawPin: string | null;
  isOnline: boolean;
  lastActiveAt: string | null;
  _count?: { submissions: number };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bulkResult, setBulkResult] = useState<Team[] | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/game/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to load teams');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // Auto-refresh every 30s to keep online status current
    const interval = setInterval(fetchTeams, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string, body: any) => {
    try {
      const res = await fetch('/api/admin/game/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Action failed');
      }
      return data;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team?')) return;
    try {
      await handleAction('delete', { id });
      fetchTeams();
    } catch (e) {}
  };

  const handleReset = async (id: string) => {
    if (!confirm('Reset this team to round 1?')) return;
    try {
      await handleAction('reset', { id });
      fetchTeams();
    } catch (e) {}
  };

  const handleForceLogout = async (id: string) => {
    if (!confirm('Force logout this team?')) return;
    try {
      await handleAction('forceLogout', { id });
      fetchTeams();
    } catch (e) {}
  };

  const filteredTeams = teams.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.teamCode?.toLowerCase().includes(search.toLowerCase())
  );

  const togglePin = (id: string) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Teams Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage all participating teams and access codes.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => window.open('/api/admin/game/export/teams', '_blank')} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium">
            <Download size={16} /> Teams CSV
          </button>
          <button onClick={() => window.open('/api/admin/game/export/submissions', '_blank')} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium">
            <Download size={16} /> Submissions CSV
          </button>
          <button onClick={() => {setBulkResult(null); setShowBulkModal(true);}} className="px-4 py-2 bg-[#074870] hover:bg-[#06385a] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
            <Users size={16} /> Bulk Generate
          </button>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#17D059] hover:bg-[#15ba50] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
            <Plus size={16} /> Create Team
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchTeams} className="ml-auto underline text-sm hover:text-red-800 dark:hover:text-red-300">Retry</button>
        </div>
      )}

      {bulkResult && (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
          <h2 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">Successfully created {bulkResult.length} teams</h2>
          <div className="max-h-60 overflow-y-auto bg-white dark:bg-slate-900 rounded p-2 border border-green-100 dark:border-green-900">
             <table className="w-full text-left text-sm">
               <thead><tr><th>Code</th><th>Name</th><th>Access Code</th></tr></thead>
               <tbody>
                 {bulkResult.map(t => (
                   <tr key={t.id}>
                     <td className="font-mono">{t.teamCode}</td>
                     <td>{t.name}</td>
                     <td className="font-mono">{t.rawPin}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
          <button onClick={() => setBulkResult(null)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Close</button>
        </div>
      )}

      {showBulkModal && (
        <BulkModal 
          onClose={() => setShowBulkModal(false)}
          onSuccess={(teams) => { setShowBulkModal(false); setBulkResult(teams); fetchTeams(); }}
        />
      )}

      {showCreateModal && (
        <CreateModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchTeams(); }}
        />
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search teams by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17D059] text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex justify-center items-center h-40">
               <Loader2 className="animate-spin text-[#17D059]" size={32} />
             </div>
          ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 font-medium">Team Code</th>
                <th className="px-6 py-3 font-medium">Access Code</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Institution</th>
                <th className="px-6 py-3 font-medium text-center">Round</th>
                <th className="px-6 py-3 font-medium text-center">Score</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-white">
                    {team.teamCode}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-white">
                      {showPins[team.id] ? team.rawPin || 'N/A' : '****'}
                      <button 
                        onClick={() => togglePin(team.id)}
                        className="text-slate-400 hover:text-slate-300"
                      >
                        {showPins[team.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {team.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {team.institution || '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-white">
                    {team.currentRound > 6 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950/50 border border-emerald-700/50 text-emerald-400">
                        ✓ Done
                      </span>
                    ) : team.currentRound}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#38bdf8]">
                    {Math.round(team.totalScore)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {team.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/50 border border-emerald-700/50 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex flex-col items-center gap-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Offline
                        </span>
                        {team.lastActiveAt && (
                          <span className="text-[10px] text-slate-600">
                            {(() => {
                              const diff = Math.floor((Date.now() - new Date(team.lastActiveAt!).getTime()) / 60000);
                              return diff < 60 ? `${diff}m ago` : `${Math.floor(diff/60)}h ago`;
                            })()}
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleReset(team.id)} title="Reset Progress" className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors inline-block">
                      <RefreshCw size={16} />
                    </button>
                    <button onClick={() => handleForceLogout(team.id)} title="Force Logout" className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors inline-block">
                      <LogOut size={16} />
                    </button>
                    <button onClick={() => handleDelete(team.id)} title="Delete Team" className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors inline-block">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No teams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}

function BulkModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (t: any) => void }) {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    try {
      const res = await fetch('/api/admin/game/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk',
          count: parseInt(fd.get('count') as string),
          prefix: fd.get('prefix'),
          institution: fd.get('institution'),
          namePattern: fd.get('namePattern')
        })
      });
      const data = await res.json();
      if(data.success) onSuccess(data.teams);
      else alert(data.error);
    } catch(e) {
      alert('Error bulk generating');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Bulk Generate Teams</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 dark:text-slate-300">Count</label>
            <input name="count" type="number" min="1" max="100" required defaultValue="10" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 dark:text-slate-300">Prefix</label>
            <input name="prefix" required defaultValue="TEAM" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 dark:text-slate-300">Institution (optional)</label>
            <input name="institution" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded dark:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#074870] text-white rounded flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    try {
      const res = await fetch('/api/admin/game/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: fd.get('name'),
          teamCode: fd.get('teamCode'),
          pin: fd.get('pin'),
          leaderName: fd.get('leaderName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          institution: fd.get('institution'),
          department: fd.get('department'),
          year: fd.get('year')
        })
      });
      const data = await res.json();
      if(data.success) onSuccess();
      else alert(data.error);
    } catch(e) {
      alert('Error creating team');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Create Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Team Name *</label>
            <input name="name" required className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Team Code *</label>
            <input name="teamCode" required className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white uppercase" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Access Code *</label>
            <input name="pin" required className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono" placeholder="e.g. BTS-A7X or 1234" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Leader Name</label>
            <input name="leaderName" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Email</label>
            <input name="email" type="email" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Phone</label>
            <input name="phone" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1 dark:text-slate-300">Institution</label>
            <input name="institution" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Department</label>
            <input name="department" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm mb-1 dark:text-slate-300">Year</label>
            <input name="year" className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="col-span-2 flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded dark:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#17D059] text-white rounded flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
