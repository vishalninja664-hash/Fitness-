import React from 'react';
import { Bell, Check, X, Sparkles, Timer } from 'lucide-react';
import { Habit } from '../logic/habits.ts';

interface ReminderAlertToastProps {
  habit: Habit | null;
  onClose: () => void;
  onCompleteHabit: (id: string) => void;
  onOpenTimer: (habit: Habit) => void;
}

export const ReminderAlertToast: React.FC<ReminderAlertToastProps> = ({
  habit,
  onClose,
  onCompleteHabit,
  onOpenTimer,
}) => {
  if (!habit) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 animate-in slide-in-from-bottom-5 duration-300"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center shrink-0 font-bold shadow-md">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                TinySteps Reminder
              </span>
              <span className="text-xs">🌱</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">
              Time for your tiny win!
            </h4>
            <p className="text-xs text-slate-300 italic mt-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              &ldquo;{habit.tiny}&rdquo;
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Goal: {habit.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onCompleteHabit(habit.id);
            onClose();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#55E6C1] hover:bg-[#43d4af] text-slate-950 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Mark Done Now (+1 🔥)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenTimer(habit);
            onClose();
          }}
          className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <Timer className="w-3.5 h-3.5 text-emerald-400" />
          <span>2 Min</span>
        </button>
      </div>
    </div>
  );
};
