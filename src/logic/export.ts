/**
 * Data Export and Backup Utilities for TinySteps
 * Supports JSON backup and CSV spreadsheet exports with statistics
 */

import { type Habit, calculateHabitStats, formatTime12h, getTodayDateString } from './habits.ts';

export interface ExportDataPayload {
  app: string;
  version: string;
  exportedAt: string;
  totalHabits: number;
  habits: Habit[];
  summary: {
    totalStreaks: number;
    bestStreakAcrossHabits: number;
    averageCompletionRate: number;
  };
}

/**
 * Generates formatted JSON backup string containing habits and overall statistics
 */
export function generateHabitsJson(habits: Habit[], exportDate: Date = new Date()): string {
  const statsList = habits.map((h) => calculateHabitStats(h, exportDate));
  const totalStreaks = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || h.streak || 0), 0);
  const avgCompletionRate =
    statsList.length > 0
      ? Math.round(statsList.reduce((acc, s) => acc + s.completionRate, 0) / statsList.length)
      : 0;

  const payload: ExportDataPayload = {
    app: 'TinySteps 🌱',
    version: '1.0.0',
    exportedAt: exportDate.toISOString(),
    totalHabits: habits.length,
    habits,
    summary: {
      totalStreaks,
      bestStreakAcrossHabits: bestStreak,
      averageCompletionRate: avgCompletionRate,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Escapes a single CSV cell value according to RFC 4180
 */
export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates standard RFC 4180 CSV spreadsheet containing habits and calculated statistics
 */
export function generateHabitsCsv(habits: Habit[], exportDate: Date = new Date()): string {
  const headers = [
    'Habit ID',
    'Big Goal Name',
    'Tiny Step Description',
    'Category',
    'Completed Today',
    'Current Streak (Days)',
    'Longest Streak (Days)',
    'Completion Rate (%)',
    'Total Small Wins Count',
    'Days Tracked',
    'Current Milestone',
    'Reminder Enabled',
    'Reminder Time (24h)',
    'Reminder Time (12h)',
    'Created Date',
  ];

  const rows: string[] = [headers.map(escapeCsvCell).join(',')];

  habits.forEach((habit) => {
    const stats = calculateHabitStats(habit, exportDate);
    const createdDateStr = new Date(habit.createdAt).toISOString().split('T')[0];

    const rowValues = [
      habit.id,
      habit.name,
      habit.tiny,
      habit.category,
      habit.completed ? 'Yes' : 'No',
      stats.currentStreak,
      stats.longestStreak,
      `${stats.completionRate}%`,
      stats.totalCompletions,
      stats.daysTracked,
      stats.currentMilestone.label,
      habit.reminderEnabled ? 'Yes' : 'No',
      habit.reminderTime || 'None',
      formatTime12h(habit.reminderTime) || 'None',
      createdDateStr,
    ];

    rows.push(rowValues.map(escapeCsvCell).join(','));
  });

  return rows.join('\r\n');
}

/**
 * Triggers a file download in the browser
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses an imported JSON file string
 */
export function parseAndValidateImportJson(jsonString: string): { valid: boolean; habits?: Habit[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    let habitsArray: unknown[] = [];

    if (Array.isArray(parsed)) {
      habitsArray = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { habits: unknown[] }).habits)) {
      habitsArray = (parsed as { habits: unknown[] }).habits;
    } else {
      return { valid: false, error: 'Invalid backup format. Expected a habit list or backup object.' };
    }

    const validatedHabits: Habit[] = [];
    for (const item of habitsArray) {
      if (item && typeof item === 'object') {
        const h = item as Record<string, unknown>;
        if (typeof h.name === 'string' && typeof h.tiny === 'string') {
          validatedHabits.push({
            id: typeof h.id === 'string' ? h.id : Date.now().toString() + Math.random().toString(36).slice(2, 6),
            name: h.name,
            tiny: h.tiny,
            completed: Boolean(h.completed),
            streak: typeof h.streak === 'number' ? Math.max(0, h.streak) : 0,
            bestStreak: typeof h.bestStreak === 'number' ? Math.max(0, h.bestStreak) : (typeof h.streak === 'number' ? h.streak : 0),
            category: (typeof h.category === 'string' ? h.category : 'other') as Habit['category'],
            createdAt: typeof h.createdAt === 'number' ? h.createdAt : Date.now(),
            completedDates: Array.isArray(h.completedDates) ? h.completedDates.filter((d): d is string => typeof d === 'string') : [],
            reminderEnabled: Boolean(h.reminderEnabled),
            reminderTime: typeof h.reminderTime === 'string' ? h.reminderTime : '09:00',
          });
        }
      }
    }

    if (validatedHabits.length === 0) {
      return { valid: false, error: 'No valid habit entries found in file.' };
    }

    return { valid: true, habits: validatedHabits };
  } catch (err) {
    return { valid: false, error: 'Failed to parse JSON file. Ensure it is valid JSON.' };
  }
}
