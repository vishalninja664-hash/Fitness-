/**
 * Pure habit logic for TinySteps
 * Decoupled from React UI for deterministic testing and reliability
 */

export type HabitCategory = 'learning' | 'fitness' | 'mindfulness' | 'health' | 'productivity' | 'creativity' | 'other';

export interface Habit {
  id: string;
  name: string; // The big goal
  tiny: string; // The tiny version (2 mins max)
  completed: boolean;
  streak: number;
  bestStreak: number;
  category: HabitCategory;
  createdAt: number;
  completedDates: string[]; // Array of YYYY-MM-DD
  // Reminder feature
  reminderEnabled?: boolean;
  reminderTime?: string; // HH:mm format, e.g. "08:30"
  lastReminderFiredDate?: string; // YYYY-MM-DD when reminder last fired
}

export const CATEGORY_CONFIG: Record<HabitCategory, { label: string; emoji: string; color: string; bgLight: string }> = {
  learning: { label: 'Learning', emoji: '📚', color: '#3B82F6', bgLight: '#EFF6FF' },
  fitness: { label: 'Fitness', emoji: '⚡', color: '#EF4444', bgLight: '#FEF2F2' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘', color: '#10B981', bgLight: '#ECFDF5' },
  health: { label: 'Health', emoji: '💧', color: '#06B6D4', bgLight: '#ECFEFF' },
  productivity: { label: 'Productivity', emoji: '🎯', color: '#8B5CF6', bgLight: '#F5F3FF' },
  creativity: { label: 'Creativity', emoji: '🎨', color: '#F59E0B', bgLight: '#FFFBEB' },
  other: { label: 'General', emoji: '🌱', color: '#10B981', bgLight: '#F0FDF4' },
};

export const STREAK_MILESTONES = [
  { days: 3, label: 'Sprout', emoji: '🌱' },
  { days: 7, label: 'Spark', emoji: '⚡' },
  { days: 14, label: 'Steady', emoji: '🌟' },
  { days: 21, label: 'Habit Forming', emoji: '🔥' },
  { days: 30, label: 'Iron Will', emoji: '💎' },
  { days: 66, label: 'Automatic', emoji: '👑' },
  { days: 100, label: 'Mastery', emoji: '🏆' },
];

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'demo-1',
    name: 'Read 50 books this year',
    tiny: 'Read just 1 page with morning coffee',
    completed: true,
    streak: 4,
    bestStreak: 7,
    category: 'learning',
    createdAt: Date.now() - 4 * 86400000,
    completedDates: [],
    reminderEnabled: true,
    reminderTime: '08:00',
  },
  {
    id: 'demo-2',
    name: 'Get in the best shape of my life',
    tiny: 'Do 2 clean push-ups before shower',
    completed: false,
    streak: 12,
    bestStreak: 12,
    category: 'fitness',
    createdAt: Date.now() - 12 * 86400000,
    completedDates: [],
    reminderEnabled: true,
    reminderTime: '18:30',
  },
  {
    id: 'demo-3',
    name: 'Master daily meditation & focus',
    tiny: 'Take 3 slow mindful breaths upon waking',
    completed: false,
    streak: 1,
    bestStreak: 5,
    category: 'mindfulness',
    createdAt: Date.now() - 2 * 86400000,
    completedDates: [],
    reminderEnabled: false,
    reminderTime: '07:30',
  },
];

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTime12h(time24?: string): string {
  if (!time24) return '';
  const parts = time24.split(':');
  if (parts.length !== 2) return time24;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${period}`;
}

export function validateHabitInput(name: string, tiny: string): { valid: boolean; error?: string } {
  const trimmedName = name.trim();
  const trimmedTiny = tiny.trim();

  if (!trimmedName) {
    return { valid: false, error: 'Please enter your big goal.' };
  }
  if (!trimmedTiny) {
    return { valid: false, error: "Please specify a 'Tiny Version' (2 mins or less)." };
  }
  if (trimmedName.length > 100) {
    return { valid: false, error: 'Goal name is too long (maximum 100 characters).' };
  }
  if (trimmedTiny.length > 140) {
    return { valid: false, error: 'Tiny version description is too long (maximum 140 characters).' };
  }
  return { valid: true };
}

export function createHabit(
  name: string,
  tiny: string,
  category: HabitCategory = 'other',
  reminderEnabled: boolean = false,
  reminderTime: string = '09:00',
  id: string = Date.now().toString()
): Habit {
  return {
    id,
    name: name.trim(),
    tiny: tiny.trim(),
    completed: false,
    streak: 0,
    bestStreak: 0,
    category,
    createdAt: Date.now(),
    completedDates: [],
    reminderEnabled,
    reminderTime,
  };
}

export function toggleHabitInList(habits: Habit[], id: string, todayStr: string = getTodayDateString()): {
  updatedHabits: Habit[];
  toggledHabit?: Habit;
  justCompleted: boolean;
} {
  let toggledHabit: Habit | undefined;
  let justCompleted = false;

  const updatedHabits = habits.map((habit) => {
    if (habit.id !== id) return habit;

    const newCompleted = !habit.completed;
    justCompleted = newCompleted;
    const newStreak = newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);
    const newBest = Math.max(habit.bestStreak || 0, newStreak);

    let updatedDates = habit.completedDates || [];
    if (newCompleted) {
      if (!updatedDates.includes(todayStr)) {
        updatedDates = [...updatedDates, todayStr];
      }
    } else {
      updatedDates = updatedDates.filter((d) => d !== todayStr);
    }

    toggledHabit = {
      ...habit,
      completed: newCompleted,
      streak: newStreak,
      bestStreak: newBest,
      completedDates: updatedDates,
    };
    return toggledHabit;
  });

  return { updatedHabits, toggledHabit, justCompleted };
}

export function deleteHabitFromList(habits: Habit[], id: string): Habit[] {
  return habits.filter((h) => h.id !== id);
}

export function editHabitInList(
  habits: Habit[],
  id: string,
  updates: {
    name: string;
    tiny: string;
    category?: HabitCategory;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }
): Habit[] {
  return habits.map((h) => {
    if (h.id !== id) return h;
    return {
      ...h,
      name: updates.name.trim(),
      tiny: updates.tiny.trim(),
      category: updates.category || h.category || 'other',
      reminderEnabled: updates.reminderEnabled ?? h.reminderEnabled ?? false,
      reminderTime: updates.reminderTime ?? h.reminderTime ?? '09:00',
    };
  });
}

export function toggleReminderInList(habits: Habit[], id: string, newTime?: string): Habit[] {
  return habits.map((h) => {
    if (h.id !== id) return h;
    const isEnabled = !h.reminderEnabled;
    return {
      ...h,
      reminderEnabled: isEnabled,
      reminderTime: newTime || h.reminderTime || '09:00',
    };
  });
}

export function checkHabitReminderDue(
  habit: Habit,
  currentTimeStr: string,
  todayStr: string = getTodayDateString()
): boolean {
  if (!habit.reminderEnabled) return false;
  if (!habit.reminderTime) return false;
  if (habit.completed) return false; // don't nag if already completed today
  if (habit.lastReminderFiredDate === todayStr) return false; // already reminded today

  return habit.reminderTime === currentTimeStr;
}

export function markReminderFiredInList(habits: Habit[], habitId: string, todayStr: string = getTodayDateString()): Habit[] {
  return habits.map((h) => {
    if (h.id !== habitId) return h;
    return {
      ...h,
      lastReminderFiredDate: todayStr,
    };
  });
}

export interface HabitDetailedStats {
  id: string;
  name: string;
  tiny: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0 to 100 percentage
  totalCompletions: number;
  daysTracked: number;
  currentMilestone: { days: number; label: string; emoji: string };
  nextMilestone: { days: number; label: string; emoji: string } | null;
  milestoneProgressPercent: number; // 0 to 100 progress towards next milestone
  last7Days: { date: string; dayName: string; completed: boolean }[];
}

export function calculateHabitStats(habit: Habit, todayDate: Date = new Date()): HabitDetailedStats {
  const todayStr = getTodayDateString(todayDate);
  const completedSet = new Set(habit.completedDates || []);
  if (habit.completed) {
    completedSet.add(todayStr);
  }

  // Calculate days active since createdAt
  const oneDayMs = 86400000;
  const daysSinceCreated = Math.max(1, Math.ceil((todayDate.getTime() - habit.createdAt) / oneDayMs));
  const totalCompletions = completedSet.size;
  const completionRate = Math.min(100, Math.round((totalCompletions / daysSinceCreated) * 100));

  // Determine current milestone and next milestone
  let currentMilestone = { days: 0, label: 'Starting Out', emoji: '🌱' };
  let nextMilestone: { days: number; label: string; emoji: string } | null = STREAK_MILESTONES[0];

  for (let i = 0; i < STREAK_MILESTONES.length; i++) {
    if (habit.streak >= STREAK_MILESTONES[i].days) {
      currentMilestone = STREAK_MILESTONES[i];
      nextMilestone = STREAK_MILESTONES[i + 1] || null;
    } else {
      nextMilestone = STREAK_MILESTONES[i];
      break;
    }
  }

  let milestoneProgressPercent = 100;
  if (nextMilestone) {
    const range = nextMilestone.days - currentMilestone.days;
    const progress = habit.streak - currentMilestone.days;
    milestoneProgressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  // Calculate past 7 days history
  const last7Days: { date: string; dayName: string; completed: boolean }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);
    const dayName = dayNames[d.getDay()];
    last7Days.push({
      date: dateStr,
      dayName,
      completed: completedSet.has(dateStr),
    });
  }

  return {
    id: habit.id,
    name: habit.name,
    tiny: habit.tiny,
    currentStreak: habit.streak,
    longestStreak: Math.max(habit.streak, habit.bestStreak || 0),
    completionRate,
    totalCompletions,
    daysTracked: daysSinceCreated,
    currentMilestone,
    nextMilestone,
    milestoneProgressPercent,
    last7Days,
  };
}

export function calculateStats(habits: Habit[]) {
  const total = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;
  const totalStreaks = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || h.streak || 0), 0);
  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const remindersActive = habits.filter((h) => h.reminderEnabled).length;

  return {
    total,
    completedCount,
    totalStreaks,
    bestStreak,
    completionPercentage,
    remindersActive,
  };
}

export function filterHabits(
  habits: Habit[],
  filterTab: 'all' | 'active' | 'completed' | 'reminders',
  categoryFilter: string = 'all',
  searchQuery: string = ''
): Habit[] {
  return habits.filter((habit) => {
    // Tab filter
    if (filterTab === 'active' && habit.completed) return false;
    if (filterTab === 'completed' && !habit.completed) return false;
    if (filterTab === 'reminders' && !habit.reminderEnabled) return false;

    // Category filter
    if (categoryFilter !== 'all' && habit.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = habit.name.toLowerCase().includes(q);
      const matchTiny = habit.tiny.toLowerCase().includes(q);
      if (!matchName && !matchTiny) return false;
    }

    return true;
  });
}

// Preset starter samples
export const STARTER_HABITS_PRESETS = [
  { name: 'Read 50 books this year', tiny: 'Read 1 page with morning coffee', category: 'learning' as HabitCategory },
  { name: 'Master deep meditation', tiny: 'Take 3 mindful breaths upon waking', category: 'mindfulness' as HabitCategory },
  { name: 'Get into peak physical fitness', tiny: 'Do 2 clean pushups before shower', category: 'fitness' as HabitCategory },
  { name: 'Drink 2 liters of water daily', tiny: 'Drink one fresh glass after getting out of bed', category: 'health' as HabitCategory },
  { name: 'Learn Spanish fluently', tiny: 'Review 1 flashcard lesson (2 mins)', category: 'learning' as HabitCategory },
  { name: 'Keep a clean, organized room', tiny: 'Hang up one coat or clear one surface', category: 'productivity' as HabitCategory },
  { name: 'Write a novel', tiny: 'Write just one single sentence', category: 'creativity' as HabitCategory },
  { name: 'Floss daily for dental health', tiny: 'Floss just one tooth', category: 'health' as HabitCategory },
];
