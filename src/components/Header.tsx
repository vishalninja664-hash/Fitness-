import React from 'react';
import { Bell, BellOff, BarChart3, ListTodo, Plus, Sparkles, Download } from 'lucide-react';
import { NotificationStatus } from '../utils/notification.ts';

interface HeaderProps {
  currentView: 'tracker' | 'stats';
  onViewChange: (view: 'tracker' | 'stats') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  notificationStatus: NotificationStatus;
  onRequestNotificationPermission: () => void;
  activeRemindersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenAddModal,
  onOpenExportModal,
  notificationStatus,
  onRequestNotificationPermission,
  activeRemindersCount,
}) => {
  return (
    <header className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span>TinySteps</span>
              <span className="text-2xl" role="img" aria-label="sprout">🌱</span>
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Micro Habits
            </span>
          </div>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Small wins, every single day. 2 minutes is all it takes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Notification Permission Indicator / Trigger */}
          <button
            type="button"
            onClick={onRequestNotificationPermission}
            aria-label={
              notificationStatus === 'granted'
                ? `Notifications enabled (${activeRemindersCount} active reminders)`
                : 'Enable habit reminder notifications'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
              notificationStatus === 'granted'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : notificationStatus === 'denied'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 animate-pulse'
            }`}
            title={
              notificationStatus === 'granted'
                ? 'Notifications active on device'
                : 'Click to enable local habit reminders'
            }
          >
            {notificationStatus === 'granted' ? (
              <>
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reminders Active ({activeRemindersCount})</span>
              </>
            ) : notificationStatus === 'denied' ? (
              <>
                <BellOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Audio Only (Alerts Blocked)</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                <span>Enable Reminders</span>
              </>
            )}
          </button>

          {/* View Switcher: Habits vs Stats */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onViewChange('tracker')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentView === 'tracker'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="View Habits Tracker"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Habits</span>
            </button>
            <button
              type="button"
              onClick={() => onViewChange('stats')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentView === 'stats'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="View Habit Statistics and Streaks"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statistics</span>
            </button>
          </div>

          {/* Export / Backup Button */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
            aria-label="Open export and backup options"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* New Habit Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-[#55E6C1] hover:bg-[#43d4af] transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
            aria-label="Create new tiny habit"
          >
            <Plus className="w-4 h-4" />
            <span>New Tiny Habit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
