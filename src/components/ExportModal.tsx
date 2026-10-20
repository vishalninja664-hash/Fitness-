import React, { useState } from 'react';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  X,
  Check,
  Copy,
  Upload,
  AlertCircle,
  Database,
  Calendar,
} from 'lucide-react';
import { Habit, calculateStats } from '../logic/habits.ts';
import {
  generateHabitsJson,
  generateHabitsCsv,
  triggerFileDownload,
  parseAndValidateImportJson,
} from '../logic/export.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onImportHabits: (imported: Habit[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  habits,
  onImportHabits,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'restore'>('json');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: string; error?: string } | null>(null);

  if (!isOpen) return null;

  const stats = calculateStats(habits);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleDownloadJson = () => {
    const jsonStr = generateHabitsJson(habits);
    const filename = `tinysteps-backup-${todayStr}.json`;
    triggerFileDownload(jsonStr, filename, 'application/json');
  };

  const handleDownloadCsv = () => {
    const csvStr = generateHabitsCsv(habits);
    const filename = `tinysteps-habits-and-stats-${todayStr}.csv`;
    triggerFileDownload(csvStr, filename, 'text/csv');
  };

  const handleCopyJson = async () => {
    try {
      const jsonStr = generateHabitsJson(habits);
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy to clipboard', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateImportJson(content);
      if (res.valid && res.habits) {
        onImportHabits(res.habits);
        setImportStatus({
          success: `Successfully restored ${res.habits.length} habits from backup!`,
        });
      } else {
        setImportStatus({
          error: res.error || 'Failed to restore habits from file.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Download className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-xl font-black text-slate-800 tracking-tight">
                Export & Backup
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Save your streaks, habit definitions, and consistency statistics.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-6 pt-5 pb-1 flex items-center gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setSelectedFormat('json');
              setImportStatus(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFormat === 'json'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileJson className="w-4 h-4 text-emerald-400" />
            <span>JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedFormat('csv');
              setImportStatus(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFormat === 'csv'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>CSV Spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedFormat('restore');
              setImportStatus(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFormat === 'restore'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Restore Backup</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Data Summary Pill */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Current Data Snapshot:</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-semibold">
              <span>{stats.total} habits</span>
              <span>•</span>
              <span className="text-orange-600 font-bold">🔥 {stats.totalStreaks} streak days</span>
              <span>•</span>
              <span>{stats.completionPercentage}% today</span>
            </div>
          </div>

          {/* Tab 1: JSON Backup */}
          {selectedFormat === 'json' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-700" />
                  <span>Full Structured JSON Backup</span>
                </h4>
                <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                  Contains complete habit objects, big goals, micro-steps, streak records, completion history dates, categories, and reminder timestamps.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm bg-[#55E6C1] hover:bg-[#43d4af] text-slate-950 transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .JSON Backup</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: CSV Spreadsheet */}
          {selectedFormat === 'csv' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                  <span>Spreadsheet Format (CSV)</span>
                </h4>
                <p className="text-xs text-teal-800/90 mt-1 leading-relaxed">
                  Ready to open in Microsoft Excel, Google Sheets, or Apple Numbers. Includes computed statistics: Current Streak, Longest Streak, Completion Rate %, Total Actions, Milestones, and Reminders.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download .CSV Spreadsheet</span>
              </button>
            </div>
          )}

          {/* Tab 3: Restore Backup */}
          {selectedFormat === 'restore' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Restore from JSON File</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Select a previously downloaded `.json` backup file to restore your habits and streak records.
                </p>
              </div>

              {/* Status banner */}
              {importStatus?.success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importStatus.success}</span>
                </div>
              )}

              {importStatus?.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importStatus.error}</span>
                </div>
              )}

              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">
                  Click to select JSON backup file
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  .json files exported from TinySteps
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload JSON backup file"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Format: RFC 4180 CSV / Standard JSON</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
