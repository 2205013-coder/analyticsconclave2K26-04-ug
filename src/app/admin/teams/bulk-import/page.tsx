'use client';
import { useState, useRef } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, XCircle,
  Download, Loader2, RefreshCw, Users, ChevronRight, Eye
} from 'lucide-react';

type RowStatus = 'ready' | 'already_imported' | 'error' | 'created' | 'skipped';

interface PreviewRow {
  rowIndex: number;
  teamName: string;
  college: string;
  leader?: string;
  email?: string;
  phone?: string;
  members?: string;
  status: RowStatus;
  gameId?: string;
  password?: string;
  error?: string;
  duplicate?: boolean;
}

interface ParseResult {
  totalRows: number;
  preview: PreviewRow[];
  readyCnt: number;
  duplicateCnt: number;
  errorCnt: number;
}

interface ImportResult {
  created: number;
  skipped: number;
  results: PreviewRow[];
}

const STATUS_CONFIG: Record<RowStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  ready:           { label: 'Ready',          icon: <CheckCircle2 size={13} />, cls: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' },
  already_imported:{ label: 'Already Imported', icon: <Eye size={13} />,         cls: 'bg-blue-950/40 border-blue-800/50 text-blue-400' },
  error:           { label: 'Error',           icon: <XCircle size={13} />,      cls: 'bg-red-950/40 border-red-800/50 text-red-400' },
  created:         { label: 'Created',         icon: <CheckCircle2 size={13} />, cls: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' },
  skipped:         { label: 'Skipped',         icon: <AlertCircle size={13} />,  cls: 'bg-amber-950/40 border-amber-800/50 text-amber-400' },
};

function downloadCSV(rows: PreviewRow[], filename: string) {
  const header = ['Game ID', 'Team Name', 'College', 'Leader', 'Email', 'Phone', 'Password', 'Status'];
  const lines = [
    header.join(','),
    ...rows.map(r => [
      r.gameId || '',
      `"${r.teamName}"`,
      `"${r.college}"`,
      `"${r.leader || ''}"`,
      r.email || '',
      r.phone || '',
      r.password || '',
      r.status,
    ].join(','))
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImportPage() {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [file, setFile]               = useState<File | null>(null);
  const [parsing, setParsing]         = useState(false);
  const [confirming, setConfirming]   = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError]   = useState<string | null>(null);
  const [step, setStep]               = useState<'upload' | 'preview' | 'done'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setParseResult(null); setParseError(null); setStep('upload'); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      setFile(f);
      setParseResult(null);
      setParseError(null);
      setStep('upload');
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setParseError(null);
    setParseResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/admin/bulk-import', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Parse failed');
      setParseResult(data);
      setStep('preview');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parseResult) return;
    setConfirming(true);
    try {
      const readyRows = parseResult.preview.filter(r => r.status === 'ready');
      const res  = await fetch('/api/admin/bulk-import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: readyRows }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Import failed');
      setImportResult(data);
      setStep('done');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setConfirming(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParseResult(null);
    setImportResult(null);
    setParseError(null);
    setStep('upload');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <Users size={14} />
          <span>Team Management</span>
          <ChevronRight size={12} />
          <span className="text-slate-900 dark:text-white font-medium">Bulk Import</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bulk Team Import</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Upload an Excel file (.xlsx) from your Google Form export to create game accounts in bulk.
          Accounts are NOT created until you review and confirm the import.
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-0">
        {[
          { id: 'upload',  label: '1. Upload File' },
          { id: 'preview', label: '2. Review & Validate' },
          { id: 'done',    label: '3. Confirm & Export' },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${step === s.id ? 'bg-[#17D059] text-slate-950' : ['upload','preview','done'].indexOf(step) > i ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              {s.label}
            </div>
            {i < 2 && <div className="w-6 h-px bg-slate-300 dark:bg-slate-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {parseError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Error</div>
            <div className="text-sm mt-0.5">{parseError}</div>
          </div>
        </div>
      )}

      {/* ─── STEP 1: Upload ─── */}
      {step === 'upload' && (
        <div className="space-y-4">
          {/* Format guide */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 text-sm">
            <div className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <FileSpreadsheet size={15} /> Expected Excel Format
            </div>
            <div className="text-blue-700 dark:text-blue-400 space-y-1 text-xs">
              <div><strong>Required columns:</strong> Team Name, College Name</div>
              <div><strong>Optional columns:</strong> Team Leader Name, Email, Phone, Member Names</div>
              <div className="mt-2 font-mono bg-blue-100 dark:bg-blue-950/40 rounded p-2 overflow-x-auto whitespace-nowrap">
                Team Name | College Name | Team Leader Name | Email | Phone
              </div>
              <div className="mt-1 text-blue-600 dark:text-blue-500">Column names are flexible — "Team", "Name", "Institution", "University" etc. are all recognized.</div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${file ? 'border-[#17D059] bg-[#17D059]/5' : 'border-slate-300 dark:border-slate-700 hover:border-[#17D059]/50 hover:bg-[#17D059]/5'}`}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet size={40} className="text-[#17D059]" />
                <div className="font-bold text-slate-900 dark:text-white">{file.name}</div>
                <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload size={40} className="text-slate-400" />
                <div className="font-bold text-slate-700 dark:text-slate-200">Drop your Excel file here</div>
                <div className="text-sm text-slate-400">or click to browse · Supports .xlsx and .xls</div>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleParse}
              disabled={parsing}
              className="w-full py-3.5 bg-gradient-to-r from-[#17D059] to-emerald-500 text-slate-950 font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {parsing ? <><Loader2 size={18} className="animate-spin" /> Parsing file...</> : <><FileSpreadsheet size={18} /> Parse &amp; Validate File</>}
            </button>
          )}
        </div>
      )}

      {/* ─── STEP 2: Preview ─── */}
      {step === 'preview' && parseResult && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-[#17D059]">{parseResult.readyCnt}</div>
              <div className="text-xs text-slate-500 mt-1">Ready to Import</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-blue-500">{parseResult.duplicateCnt}</div>
              <div className="text-xs text-slate-500 mt-1">Already Imported</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-red-500">{parseResult.errorCnt}</div>
              <div className="text-xs text-slate-500 mt-1">Errors</div>
            </div>
          </div>

          {parseResult.errorCnt > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              {parseResult.errorCnt} row(s) have errors and will be skipped. Fix the Excel file and re-upload to include them.
            </div>
          )}

          {/* Preview table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Preview — {parseResult.totalRows} rows</span>
              <span className="text-xs text-slate-400">Game IDs are provisional — final IDs assigned on import</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">#</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Team Name</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">College</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Leader</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Game ID</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.preview.map((row, i) => {
                    const cfg = STATUS_CONFIG[row.status];
                    return (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2.5 text-slate-400 font-mono">{row.rowIndex}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{row.teamName}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{row.college}</td>
                        <td className="px-4 py-2.5 text-slate-500">{row.leader || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[#17D059]">{row.gameId || '—'}</td>
                        <td className="px-4 py-2.5">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${cfg.cls}`}>
                            {cfg.icon} {cfg.label}
                            {row.error && <span className="ml-1 text-red-400">· {row.error}</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw size={15} /> Re-upload
            </button>
            {parseResult.readyCnt > 0 && (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#17D059] to-emerald-500 text-slate-950 font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {confirming
                  ? <><Loader2 size={16} className="animate-spin" /> Creating {parseResult.readyCnt} accounts...</>
                  : <><CheckCircle2 size={16} /> Confirm &amp; Create {parseResult.readyCnt} Accounts</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── STEP 3: Done ─── */}
      {step === 'done' && importResult && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 text-center">
            <CheckCircle2 size={48} className="text-[#17D059] mx-auto mb-3" />
            <div className="text-2xl font-black text-slate-900 dark:text-white">{importResult.created} Accounts Created!</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {importResult.skipped > 0 && `${importResult.skipped} skipped (already existed). `}
              Download credentials to distribute to teams.
            </div>
          </div>

          {/* Warning: show passwords once */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Download credentials now.</strong> Passwords are shown here once for distribution purposes.
              After you leave this page, plain-text passwords are no longer accessible — they are stored hashed in the database.
            </div>
          </div>

          {/* Results table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Generated Credentials</span>
              <button
                onClick={() => downloadCSV(importResult.results.filter(r => r.status === 'created'), `beyond-the-stage-credentials-${new Date().toISOString().slice(0,10)}.csv`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17D059] text-slate-950 rounded-lg text-xs font-bold hover:opacity-90 transition-all"
              >
                <Download size={13} /> Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Game ID</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Team Name</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">College</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Leader</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Password</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.results.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-4 py-2.5 font-mono font-bold text-[#17D059]">{row.gameId}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{row.teamName}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.college}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.leader || '—'}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-white tracking-wider">{row.password || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${STATUS_CONFIG[row.status as RowStatus]?.cls || ''}`}>
                          {STATUS_CONFIG[row.status as RowStatus]?.icon}
                          {STATUS_CONFIG[row.status as RowStatus]?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => downloadCSV(importResult.results.filter(r => r.status === 'created'), `beyond-the-stage-credentials-${new Date().toISOString().slice(0,10)}.csv`)}
              className="flex-1 py-3 bg-gradient-to-r from-[#17D059] to-emerald-500 text-slate-950 font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Credentials CSV
            </button>
            <button onClick={reset} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw size={15} /> Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
