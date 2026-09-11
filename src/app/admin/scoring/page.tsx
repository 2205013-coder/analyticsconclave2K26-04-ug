'use client';
import { useState, useEffect } from 'react';
import { Save, Calculator, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ScoringPage() {
  const [config, setConfig] = useState({
    gaWeight: 0.6,
    vipWeight: 0.4,
    maxRoundScore: 1000,
    underForecastPenalty: 1.0,
    overForecastPenalty: 1.0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/scoring');
      if (!res.ok) throw new Error('Failed to fetch scoring config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching scoring config');
    } finally {
      setLoading(false);
    }
  };

  const weightSum = config.gaWeight + config.vipWeight;
  const isWeightValid = Math.abs(weightSum - 1.0) < 0.001;

  const handleChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!isWeightValid) {
      setError('Weights must sum to 1.0');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/scoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save scoring config');
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save scoring config');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving scoring config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#17D059]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scoring Rules</h1>
        <p className="text-slate-600 dark:text-slate-400">Configure how accuracy and scores are calculated.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span>Scoring config saved successfully!</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Calculator className="text-[#074870] dark:text-[#38bdf8]" size={20} /> Weights
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GA Forecast Weight</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="1"
                value={config.gaWeight}
                onChange={(e) => handleChange('gaWeight', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#17D059] focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">VIP Forecast Weight</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="1"
                value={config.vipWeight}
                onChange={(e) => handleChange('vipWeight', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#17D059] focus:outline-none" 
              />
            </div>
          </div>
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isWeightValid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              Sum: {weightSum.toFixed(2)} {isWeightValid ? '(Valid)' : '(Must equal 1.0)'}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Base Scores & Multipliers</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Score Per Round</label>
              <input 
                type="number" 
                value={config.maxRoundScore}
                onChange={(e) => handleChange('maxRoundScore', e.target.value)}
                className="w-full max-w-[200px] px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#17D059] focus:outline-none" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Under-Forecast Penalty</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={config.underForecastPenalty}
                  onChange={(e) => handleChange('underForecastPenalty', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#17D059] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Over-Forecast Penalty</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={config.overForecastPenalty}
                  onChange={(e) => handleChange('overForecastPenalty', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-[#17D059] focus:outline-none" 
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Multipliers adjust how severely errors impact the final score. 1.0 = standard penalty.</p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={!isWeightValid || saving}
            className="px-6 py-2.5 bg-[#17D059] hover:bg-[#15ba50] disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
            {saving ? 'SAVING...' : 'SAVE SCORING CONFIG'}
          </button>
        </div>
      </div>
    </div>
  );
}
