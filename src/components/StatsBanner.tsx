import React from 'react';
import { Flame, CheckCircle2, Target, BellRing, Sparkles } from 'lucide-react';
import { Habit, calculateStats } from '../logic/habits.ts';

interface StatsBannerProps {
  habits: Habit[];
  onOpenAddModal: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ habits }) => {
  const stats = calculateStats(habits);

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-sky-500/10 rounded-2xl p-4 sm:p-5 border border-emerald-200/60 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Today's progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Today&apos;s Momentum
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {stats.completedCount} of {stats.total} habits completed ({stats.completionPercentage}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5" role="progressbar" aria-valuenow={stats.completionPercentage} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-[#55E6C1] rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${Math.max(stats.total === 0 ? 0 : 4, stats.completionPercentage)}%` }}
            />
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            {stats.completionPercentage === 100 && stats.total > 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> All micro-actions crushed today! Fantastic momentum.
              </span>
            ) : stats.completedCount > 0 ? (
              <span>Great start! Keep the chain going one small win at a time.</span>
            ) : (
              <span>Ready for your first 2-minute step? Pick one habit below!</span>
            )}
          </div>
        </div>

        {/* Right: Quick metric chips */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium leading-none">Streaks</div>
              <div className="text-base font-extrabold text-slate-800 leading-tight">
                {stats.totalStreaks} <span className="text-xs font-normal text-slate-500">days</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium leading-none">Best Run</div>
              <div className="text-base font-extrabold text-slate-800 leading-tight">
                {stats.bestStreak} <span className="text-xs font-normal text-slate-500">days</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BellRing className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium leading-none">Reminders</div>
              <div className="text-base font-extrabold text-slate-800 leading-tight">
                {stats.remindersActive} <span className="text-xs font-normal text-slate-500">set</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
