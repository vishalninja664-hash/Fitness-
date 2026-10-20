import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bell,
  Clock,
  Lightbulb,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  Habit,
  HabitCategory,
  CATEGORY_CONFIG,
  STARTER_HABITS_PRESETS,
  validateHabitInput,
} from '../logic/habits.ts';
import { formatTime12h, getCurrentTimeString } from '../logic/habits.ts';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    tiny: string;
    category: HabitCategory;
    reminderEnabled: boolean;
    reminderTime: string;
  }) => void;
  habitToEdit?: Habit | null;
  notificationPermissionGranted: boolean;
  onRequestNotificationPermission: () => void;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  habitToEdit,
  notificationPermissionGranted,
  onRequestNotificationPermission,
}) => {
  const [name, setName] = useState('');
  const [tiny, setTiny] = useState('');
  const [category, setCategory] = useState<HabitCategory>('other');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:30');
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setTiny(habitToEdit.tiny);
      setCategory(habitToEdit.category || 'other');
      setReminderEnabled(habitToEdit.reminderEnabled || false);
      setReminderTime(habitToEdit.reminderTime || '08:30');
    } else {
      setName('');
      setTiny('');
      setCategory('other');
      setReminderEnabled(false);
      setReminderTime('08:30');
    }
    setError(null);
    setShowPresets(false);
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateHabitInput(name, tiny);
    if (!validation.valid) {
      setError(validation.error || 'Please fill in both fields.');
      return;
    }

    // If reminder enabled and permission not granted, prompt
    if (reminderEnabled && !notificationPermissionGranted) {
      onRequestNotificationPermission();
    }

    onSave({
      name,
      tiny,
      category,
      reminderEnabled,
      reminderTime: reminderTime || '08:30',
    });
  };

  const handlePickPreset = (preset: (typeof STARTER_HABITS_PRESETS)[0]) => {
    setName(preset.name);
    setTiny(preset.tiny);
    setCategory(preset.category);
    setShowPresets(false);
    setError(null);
  };

  const TIME_PRESETS = [
    { label: 'Morning 8:00 AM', time: '08:00' },
    { label: 'Midday 12:30 PM', time: '12:30' },
    { label: 'Evening 6:30 PM', time: '18:30' },
    { label: 'Night 9:00 PM', time: '21:00' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-teal-50/50 border-b border-emerald-100/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#55E6C1]/30 flex items-center justify-center text-slate-800">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-black text-slate-800 tracking-tight">
                {habitToEdit ? 'Edit Tiny Habit' : 'New Tiny Habit 🌱'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Make it ridiculously small so you never fail.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Validation error */}
          {error && (
            <div
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Ideas Presets Toggle */}
          {!habitToEdit && (
            <div>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{showPresets ? 'Hide habit ideas' : 'Need inspiration? Pick a proven tiny habit'}</span>
              </button>

              {showPresets && (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {STARTER_HABITS_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePickPreset(preset)}
                      className="text-left p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                    >
                      <div className="font-bold text-slate-800 group-hover:text-emerald-700">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        ↳ &ldquo;{preset.tiny}&rdquo;
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Big Goal Input */}
          <div>
            <label htmlFor="habit-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              1. What is the big goal?
            </label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Read 50 books a year, Run a marathon, Master Spanish"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#55E6C1] focus:ring-3 focus:ring-[#55E6C1]/20 text-slate-800 text-sm placeholder:text-slate-400 font-medium outline-hidden transition-all"
              autoFocus
            />
          </div>

          {/* Tiny Version Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="habit-tiny" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. What is the TINY version? (2 mins max)
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Micro-Action
              </span>
            </div>
            <input
              id="habit-tiny"
              type="text"
              value={tiny}
              onChange={(e) => {
                setTiny(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Read 1 single page, Put on running shoes, 1 flashcard"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#55E6C1] focus:ring-3 focus:ring-[#55E6C1]/20 text-slate-800 text-sm placeholder:text-slate-400 font-medium outline-hidden transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1 italic">
              Rule: If it feels too big to do when exhausted, make it even smaller!
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Category
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(CATEGORY_CONFIG) as HabitCategory[]).map((catKey) => {
                const config = CATEGORY_CONFIG[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs scale-105'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Reminder Settings Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="reminder-toggle" className="text-sm font-bold text-slate-800 cursor-pointer">
                    Daily Device Reminder
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Get a local notification at your target time
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <input
                id="reminder-toggle"
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => {
                  setReminderEnabled(e.target.checked);
                  if (e.target.checked && !notificationPermissionGranted) {
                    onRequestNotificationPermission();
                  }
                }}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                aria-label="Enable daily reminder"
              />
            </div>

            {/* Time Picker and Presets when enabled */}
            {reminderEnabled && (
              <div className="pt-2 border-t border-slate-200/60 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      aria-label="Reminder time"
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-emerald-400"
                    />
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-2 rounded-xl border border-indigo-100 whitespace-nowrap">
                    {formatTime12h(reminderTime)}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => setReminderTime(preset.time)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        reminderTime === preset.time
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {!notificationPermissionGranted && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    Tip: Allow browser notifications when prompted so alerts sound even when viewing another tab.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-extrabold text-slate-900 bg-[#55E6C1] hover:bg-[#43d4af] active:scale-95 transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {habitToEdit ? 'Save Changes' : 'Start Small 🌱'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
