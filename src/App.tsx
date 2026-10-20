/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ListFilter,
  Sparkles,
  Bell,
  Clock,
  RotateCcw,
} from 'lucide-react';
import {
  Habit,
  HabitCategory,
  DEFAULT_HABITS,
  CATEGORY_CONFIG,
  createHabit,
  toggleHabitInList,
  deleteHabitFromList,
  editHabitInList,
  toggleReminderInList,
  checkHabitReminderDue,
  markReminderFiredInList,
  filterHabits,
  getCurrentTimeString,
  getTodayDateString,
} from './logic/habits.ts';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendHabitNotification,
  NotificationStatus,
} from './utils/notification.ts';
import { fireCelebration } from './utils/confetti.ts';
import { Header } from './components/Header.tsx';
import { StatsBanner } from './components/StatsBanner.tsx';
import { HabitCard } from './components/HabitCard.tsx';
import { StatisticsSection } from './components/StatisticsSection.tsx';
import { AddEditModal } from './components/AddEditModal.tsx';
import { TimerModal } from './components/TimerModal.tsx';
import { ReminderAlertToast } from './components/ReminderAlertToast.tsx';
import { ExportModal } from './components/ExportModal.tsx';

const STORAGE_KEY = 'tiny-habits';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse habits from storage', e);
    }
    return DEFAULT_HABITS;
  });

  const [currentView, setCurrentView] = useState<'tracker' | 'stats'>('tracker');
  const [modalVisible, setModalVisible] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [activeTimerHabit, setActiveTimerHabit] = useState<Habit | null>(null);
  const [activeAlertHabit, setActiveAlertHabit] = useState<Habit | null>(null);

  // Filters
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed' | 'reminders'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Notification status
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('default');

  // Load notification permission on mount
  useEffect(() => {
    setNotificationStatus(getNotificationPermission());
  }, []);

  // Save habits whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits to localStorage', e);
    }
  }, [habits]);

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
  };

  // Reminder interval engine: checks every 15 seconds if any habit reminder is due
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTimeStr = getCurrentTimeString(now);
      const todayStr = getTodayDateString(now);

      habits.forEach((habit) => {
        if (checkHabitReminderDue(habit, currentTimeStr, todayStr)) {
          // Trigger device notification + chime
          sendHabitNotification(habit.name, habit.tiny, () => {
            setActiveAlertHabit(habit);
          });

          // Show in-app alert toast
          setActiveAlertHabit(habit);

          // Mark reminder as fired today to prevent repeated alerts during the same minute
          setHabits((prev) => markReminderFiredInList(prev, habit.id, todayStr));
        }
      });
    };

    const interval = setInterval(checkReminders, 15000);
    checkReminders(); // check immediately on mount or habit update

    return () => clearInterval(interval);
  }, [habits]);

  // Toggle habit completion
  const handleToggleHabit = (id: string) => {
    const { updatedHabits, justCompleted } = toggleHabitInList(habits, id);
    setHabits(updatedHabits);

    if (justCompleted) {
      fireCelebration();
    }
  };

  // Add or Edit habit
  const handleSaveHabit = (data: {
    name: string;
    tiny: string;
    category: HabitCategory;
    reminderEnabled: boolean;
    reminderTime: string;
  }) => {
    if (habitToEdit) {
      const updated = editHabitInList(habits, habitToEdit.id, data);
      setHabits(updated);
      setHabitToEdit(null);
    } else {
      const newHabit = createHabit(
        data.name,
        data.tiny,
        data.category,
        data.reminderEnabled,
        data.reminderTime
      );
      setHabits([newHabit, ...habits]);
    }
    setModalVisible(false);
  };

  // Delete habit
  const handleDeleteHabit = (id: string) => {
    const updated = deleteHabitFromList(habits, id);
    setHabits(updated);
  };

  // Toggle reminder for a habit
  const handleToggleReminder = (id: string) => {
    const updated = toggleReminderInList(habits, id);
    setHabits(updated);
    if (notificationStatus !== 'granted') {
      handleRequestNotificationPermission();
    }
  };

  // Trigger test reminder
  const handleTriggerTestReminder = (habit: Habit) => {
    sendHabitNotification(habit.name, habit.tiny);
    setActiveAlertHabit(habit);
  };

  // Open Edit Modal
  const handleOpenEdit = (habit: Habit) => {
    setHabitToEdit(habit);
    setModalVisible(true);
  };

  // Reset to sample habits
  const handleResetToSamples = () => {
    setHabits(DEFAULT_HABITS);
  };

  // Filtered list
  const filteredList = filterHabits(habits, filterTab, selectedCategory, searchQuery);
  const activeRemindersCount = habits.filter((h) => h.reminderEnabled).length;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Header with View Switcher, Export, and Notification Status */}
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenAddModal={() => {
            setHabitToEdit(null);
            setModalVisible(true);
          }}
          onOpenExportModal={() => setExportModalOpen(true)}
          notificationStatus={notificationStatus}
          onRequestNotificationPermission={handleRequestNotificationPermission}
          activeRemindersCount={activeRemindersCount}
        />

        {/* View 1: Tracker View */}
        {currentView === 'tracker' && (
          <main className="space-y-6">
            {/* Stats Momentum Banner */}
            <StatsBanner
              habits={habits}
              onOpenAddModal={() => {
                setHabitToEdit(null);
                setModalVisible(true);
              }}
            />

            {/* Filter Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tab Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({habits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('active')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'active'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Active ({habits.filter((h) => !h.completed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('completed')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === 'completed'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Completed ({habits.filter((h) => h.completed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('reminders')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    filterTab === 'reminders'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bell className="w-3 h-3" />
                  <span>Reminders ({activeRemindersCount})</span>
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search habits..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-emerald-400 focus:bg-white transition-all"
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 focus:outline-emerald-400 cursor-pointer"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {(Object.keys(CATEGORY_CONFIG) as HabitCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Habits List */}
            <div className="space-y-3" role="list" aria-label="Habit items">
              {filteredList.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteHabit}
                  onEdit={handleOpenEdit}
                  onOpenTimer={setActiveTimerHabit}
                  onToggleReminder={handleToggleReminder}
                  onTriggerTestReminder={handleTriggerTestReminder}
                />
              ))}

              {/* Empty State */}
              {filteredList.length === 0 && (
                <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-7 h-7 text-[#55E6C1]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No habits found</h3>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mt-1">
                    {searchQuery || selectedCategory !== 'all' || filterTab !== 'all'
                      ? 'Try clearing your filters or search query.'
                      : 'No habits yet. Remember: start with a tiny version taking under 2 minutes!'}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setHabitToEdit(null);
                        setModalVisible(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-[#55E6C1] hover:bg-[#43d4af] transition-all shadow-xs cursor-pointer"
                    >
                      + Add New Habit
                    </button>
                    {habits.length === 0 && (
                      <button
                        type="button"
                        onClick={handleResetToSamples}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Load Sample Habits</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* View 2: Statistics & Streak Analytics View */}
        {currentView === 'stats' && (
          <StatisticsSection
            habits={habits}
            onBackToHabits={() => setCurrentView('tracker')}
            onOpenAddModal={() => {
              setHabitToEdit(null);
              setModalVisible(true);
            }}
            onOpenExportModal={() => setExportModalOpen(true)}
          />
        )}
      </div>

      {/* Floating Action Button (FAB) - matches mobile React Native design */}
      <button
        type="button"
        onClick={() => {
          setHabitToEdit(null);
          setModalVisible(true);
        }}
        id="fab-add-habit"
        aria-label="Quick add habit floating button"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 rounded-full bg-[#55E6C1] hover:bg-[#43d4af] text-slate-900 font-extrabold text-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer z-40"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Add / Edit Habit Modal */}
      <AddEditModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setHabitToEdit(null);
        }}
        onSave={handleSaveHabit}
        habitToEdit={habitToEdit}
        notificationPermissionGranted={notificationStatus === 'granted'}
        onRequestNotificationPermission={handleRequestNotificationPermission}
      />

      {/* 2-Minute Quick Timer Modal */}
      <TimerModal
        habit={activeTimerHabit}
        isOpen={Boolean(activeTimerHabit)}
        onClose={() => setActiveTimerHabit(null)}
        onCompleteHabit={(id) => {
          handleToggleHabit(id);
          setActiveTimerHabit(null);
        }}
      />

      {/* Export / Backup Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        habits={habits}
        onImportHabits={(imported) => {
          setHabits(imported);
        }}
      />

      {/* In-app Reminder Alert Toast */}
      <ReminderAlertToast
        habit={activeAlertHabit}
        onClose={() => setActiveAlertHabit(null)}
        onCompleteHabit={(id) => {
          handleToggleHabit(id);
        }}
        onOpenTimer={(habit) => {
          setActiveTimerHabit(habit);
        }}
      />
    </div>
  );
}
