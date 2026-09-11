'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Trash2, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  urgency: 'INFO' | 'WARNING' | 'EMERGENCY';
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newUrgency, setNewUrgency] = useState<'INFO' | 'WARNING' | 'EMERGENCY'>('INFO');
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/game/announcement');
      if (!res.ok) throw new Error('Failed to fetch announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSend = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    
    try {
      setSending(true);
      const res = await fetch('/api/admin/game/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          message: newMessage,
          urgency: newUrgency,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send');
      
      setNewTitle('');
      setNewMessage('');
      setNewUrgency('INFO');
      fetchAnnouncements();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error sending announcement');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch('/api/admin/game/announcement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      fetchAnnouncements();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting announcement');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'WARNING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
        <p className="text-slate-600 dark:text-slate-400">Broadcast live messages to all teams.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchAnnouncements} className="ml-auto underline text-sm hover:text-red-800 dark:hover:text-red-300">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Megaphone className="text-[#074870] dark:text-[#38bdf8]" size={20} /> New Broadcast
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Urgency</label>
                <select 
                  value={newUrgency}
                  onChange={(e) => setNewUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#17D059]"
                >
                  <option value="INFO">Information (Cyan)</option>
                  <option value="WARNING">Warning (Amber)</option>
                  <option value="EMERGENCY">Emergency (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Short heading..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#17D059]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea 
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Detailed announcement text..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#17D059]"
                />
              </div>

              <button 
                onClick={handleSend}
                disabled={!newTitle.trim() || !newMessage.trim() || sending}
                className="w-full px-4 py-2 bg-[#17D059] hover:bg-[#15ba50] disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                {sending ? 'SENDING...' : 'SEND BROADCAST'}
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Broadcast History</h2>
          
          {loading ? (
             <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-[#17D059]" size={32} />
             </div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
              No announcements have been broadcasted yet.
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className={`p-4 rounded-xl border bg-white dark:bg-slate-900 flex justify-between items-start gap-4 ${
                ann.urgency === 'EMERGENCY' ? 'border-red-200 dark:border-red-900/50' : 
                ann.urgency === 'WARNING' ? 'border-amber-200 dark:border-amber-900/50' : 
                'border-slate-200 dark:border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getUrgencyColor(ann.urgency)}`}>
                      {ann.urgency}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-1">{ann.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{ann.message}</p>
                </div>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                  title="Delete Announcement"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
