import React from 'react';
import {
  Check,
  Flame,
  Bell,
  BellOff,
  Trash2,
  Edit2,
  Timer,
  PlayCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Habit, CATEGORY_CONFIG, formatTime12h } from '../logic/habits.ts';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onOpenTimer: (habit: Habit) => void;
  onToggleReminder: (id: string) => void;
  onTriggerTestReminder: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggle,
  onDelete,
  onEdit,
  onOpenTimer,
  onToggleReminder,
  onTriggerTestReminder,
}) => {
  const categoryMeta = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.other;

  return (
    <div
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 transition-all duration-200 border shadow-xs hover:shadow-md ${
        habit.completed
          ? 'bg-emerald-50/70 border-emerald-200/90 text-slate-700'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        {/* Left: Checkbox + Goal + Tiny Details */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
          {/* Custom Checkbox Button */}
          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            role="checkbox"
            aria-checked={habit.completed}
            aria-label={`Mark habit '${habit.name}' as ${habit.completed ? 'incomplete' : 'complete'}`}
            className={`mt-0.5 sm:mt-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              habit.completed
                ? 'bg-[#55E6C1] border-[#55E6C1] text-slate-900 shadow-xs scale-105'
                : 'border-slate-300 hover:border-[#55E6C1] bg-white'
            }`}
          >
            {habit.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Text Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: categoryMeta.bgLight, color: categoryMeta.color }}
              >
                <span>{categoryMeta.emoji}</span>
                <span>{categoryMeta.label}</span>
              </span>

              {/* Reminder Badge */}
              {habit.reminderEnabled && habit.reminderTime && (
                <button
                  type="button"
                  onClick={() => onToggleReminder(habit.id)}
                  title="Click to toggle or adjust reminder"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70 hover:bg-indigo-100 transition-colors"
                  aria-label={`Daily reminder at ${formatTime12h(habit.reminderTime)}`}
                >
                  <Bell className="w-3 h-3 text-indigo-600" />
                  <span>{formatTime12h(habit.reminderTime)}</span>
                </button>
              )}
            </div>

            {/* Big Goal Name */}
            <h3
              className={`text-base sm:text-lg font-bold tracking-tight break-words transition-all ${
                habit.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800'
              }`}
            >
              {habit.name}
            </h3>

            {/* Tiny Version */}
            <p
              className={`text-xs sm:text-sm italic mt-0.5 transition-colors ${
                habit.completed ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <span className="font-semibold not-italic text-slate-700">Tiny step:</span>{' '}
              &ldquo;{habit.tiny}&rdquo;
            </p>
          </div>
        </div>

        {/* Right: Streak & Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Streak indicator */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-extrabold shadow-2xs border ${
              habit.streak > 0
                ? 'bg-orange-50 border-orange-200/80 text-orange-600'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
            title={`Current streak: ${habit.streak} days (Best: ${Math.max(habit.streak, habit.bestStreak || 0)} days)`}
          >
            <span role="img" aria-label="fire">🔥</span>
            <span>{habit.streak}</span>
            <span className="text-[10px] font-normal text-slate-500 uppercase ml-0.5">days</span>
          </div>

          {/* Quick 2-Minute Timer Button */}
          <button
            type="button"
            onClick={() => onOpenTimer(habit)}
            title="Start 2-minute focus timer for this tiny step"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300/60 transition-all cursor-pointer"
            aria-label={`Start 2-minute timer for ${habit.name}`}
          >
            <Timer className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden xs:inline">2 Min Timer</span>
          </button>

          {/* Action icon group */}
          <div className="flex items-center gap-1 text-slate-400">
            {/* Quick Test Reminder Button */}
            <button
              type="button"
              onClick={() => onTriggerTestReminder(habit)}
              title="Test notification alert for this habit right now"
              className="p-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
              aria-label={`Test reminder alert for ${habit.name}`}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(habit)}
              title="Edit habit details or reminder"
              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label={`Edit habit ${habit.name}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(habit.id)}
              title="Delete habit"
              className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              aria-label={`Delete habit ${habit.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
