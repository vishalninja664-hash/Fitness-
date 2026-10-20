import React from 'react';
import {
  Flame,
  Trophy,
  Percent,
  CheckCircle,
  Calendar,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  ArrowRight,
  Download,
} from 'lucide-react';
import {
  Habit,
  calculateHabitStats,
  CATEGORY_CONFIG,
  STREAK_MILESTONES,
} from '../logic/habits.ts';

interface StatisticsSectionProps {
  habits: Habit[];
  onBackToHabits: () => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  habits,
  onBackToHabits,
  onOpenAddModal,
  onOpenExportModal,
}) => {
  const detailedStatsList = habits.map((h) => calculateHabitStats(h));

  const totalCompletionsAll = detailedStatsList.reduce((acc, s) => acc + s.totalCompletions, 0);
  const maxStreakAll = detailedStatsList.reduce((max, s) => Math.max(max, s.longestStreak), 0);
  const avgCompletionRate =
    detailedStatsList.length > 0
      ? Math.round(
          detailedStatsList.reduce((acc, s) => acc + s.completionRate, 0) / detailedStatsList.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span>Habit Analytics & Streaks</span>
            </h2>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Visualize your consistency, streak milestones, and completion rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
            aria-label="Export habit data and statistics as JSON or CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={onBackToHabits}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span>Back to Habits</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50/60 p-5 rounded-2xl border border-orange-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
              Longest Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{maxStreakAll}</span>
            <span className="text-sm font-semibold text-slate-500">days in a row</span>
          </div>
          <p className="text-xs text-orange-700/90 mt-1 font-medium">
            Your personal best streak across all habits
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 rounded-2xl border border-emerald-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Avg. Completion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{avgCompletionRate}%</span>
            <span className="text-sm font-semibold text-slate-500">consistency</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-emerald-200/60 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${avgCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 p-5 rounded-2xl border border-indigo-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
              Total Small Wins
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{totalCompletionsAll}</span>
            <span className="text-sm font-semibold text-slate-500">actions logged</span>
          </div>
          <p className="text-xs text-indigo-700/90 mt-1 font-medium">
            Every 2-minute step compounds into massive change
          </p>
        </div>
      </div>

      {/* Habit Formation Science Guide Callout */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>The 66-Day Science of Habit Formation</span>
              <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                BJ Fogg & James Clear
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Research shows it takes 66 days on average for a new behavior to become automatic.
              By making the initial behavior so tiny it takes under 2 minutes, resistance disappears.
            </p>
          </div>
        </div>

        {/* Milestone Steps pill row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-[11px] font-semibold text-slate-300">
          {STREAK_MILESTONES.slice(0, 5).map((m) => (
            <span
              key={m.days}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700/80 whitespace-nowrap"
            >
              <span>{m.emoji}</span>
              <span>{m.days}d</span>
            </span>
          ))}
        </div>
      </div>

      {/* Per-Habit Detailed Cards */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span>Habit Streaks & Progress</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {habits.length} habits
          </span>
        </h3>

        {detailedStatsList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">No habits created yet.</p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-3 px-4 py-2 bg-[#55E6C1] text-slate-900 font-bold text-sm rounded-xl"
            >
              Add First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {detailedStatsList.map((stat) => {
              const habit = habits.find((h) => h.id === stat.id);
              const categoryMeta =
                CATEGORY_CONFIG[habit?.category || 'other'] || CATEGORY_CONFIG.other;

              return (
                <div
                  key={stat.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
                >
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                          style={{
                            backgroundColor: categoryMeta.bgLight,
                            color: categoryMeta.color,
                          }}
                        >
                          <span>{categoryMeta.emoji}</span>
                          <span>{categoryMeta.label}</span>
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900">{stat.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Tiny version: &ldquo;{stat.tiny}&rdquo;
                      </p>
                    </div>

                    {/* Milestone pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 self-start sm:self-auto">
                      <span>{stat.currentMilestone.emoji}</span>
                      <span>Level: {stat.currentMilestone.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({stat.currentStreak}d)
                      </span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    {/* Current Streak with flame icons */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                        <span>Current Streak</span>
                        <span className="text-orange-500 font-bold">🔥</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800">{stat.currentStreak}</span>
                        <span className="text-xs text-slate-500 font-medium">days</span>
                      </div>

                      {/* Visual Streak Flame Icons Bar */}
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        {Array.from({ length: Math.min(7, Math.max(1, stat.currentStreak)) }).map(
                          (_, i) => (
                            <span
                              key={i}
                              role="img"
                              aria-label="streak flame"
                              className={`transition-all ${
                                i < stat.currentStreak ? 'opacity-100 scale-100' : 'opacity-20'
                              }`}
                            >
                              🔥
                            </span>
                          )
                        )}
                        {stat.currentStreak > 7 && (
                          <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                            +{stat.currentStreak - 7}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Longest Streak (Trophy) */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                        <span>Longest Streak</span>
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800">{stat.longestStreak}</span>
                        <span className="text-xs text-slate-500 font-medium">days record</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        Total completions: {stat.totalCompletions} times
                      </p>
                    </div>

                    {/* Completion Rate with Progress Bar */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                        <span>Completion Rate</span>
                        <span className="text-emerald-600 font-bold">{stat.completionRate}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div
                        className="w-full h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden"
                        role="progressbar"
                        aria-valuenow={stat.completionRate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stat.completionRate >= 75
                              ? 'bg-emerald-500'
                              : stat.completionRate >= 40
                              ? 'bg-[#55E6C1]'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${stat.completionRate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>{stat.totalCompletions} completed</span>
                        <span>{stat.daysTracked} days tracked</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestone Progress Bar & 7-Day History */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Next Milestone progress */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-600 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Next Goal: {stat.nextMilestone ? `${stat.nextMilestone.emoji} ${stat.nextMilestone.label} (${stat.nextMilestone.days} days)` : 'Legendary Habit 👑'}
                        </span>
                        <span className="font-bold text-slate-700">
                          {stat.nextMilestone ? `${stat.milestoneProgressPercent}%` : '100%'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${stat.milestoneProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Past 7 Days Consistency Dots */}
                    <div className="flex items-center gap-1.5 self-start md:self-auto">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Last 7d:</span>
                      {stat.last7Days.map((day) => (
                        <div
                          key={day.date}
                          className="flex flex-col items-center gap-1"
                          title={`${day.date} (${day.dayName}): ${day.completed ? 'Completed' : 'Missed'}`}
                        >
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {day.dayName[0]}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              day.completed
                                ? 'bg-[#55E6C1] text-slate-900 shadow-2xs font-bold'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {day.completed ? '✓' : '·'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
