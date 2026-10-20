import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHabit,
  validateHabitInput,
  toggleHabitInList,
  deleteHabitFromList,
  editHabitInList,
  checkHabitReminderDue,
  formatTime12h,
  calculateStats,
  calculateHabitStats,
  filterHabits,
} from './habits.ts';

test('validateHabitInput validates required fields', () => {
  assert.equal(validateHabitInput('', 'tiny step').valid, false);
  assert.equal(validateHabitInput('Big goal', '').valid, false);
  assert.equal(validateHabitInput('   ', '   ').valid, false);
  assert.equal(validateHabitInput('Read 50 books', 'Read 1 page').valid, true);
});

test('createHabit initializes habit with correct defaults', () => {
  const habit = createHabit('Walk 10,000 steps', 'Put on walking shoes', 'fitness', true, '08:30', 'test-1');
  assert.equal(habit.id, 'test-1');
  assert.equal(habit.name, 'Walk 10,000 steps');
  assert.equal(habit.tiny, 'Put on walking shoes');
  assert.equal(habit.completed, false);
  assert.equal(habit.streak, 0);
  assert.equal(habit.bestStreak, 0);
  assert.equal(habit.category, 'fitness');
  assert.equal(habit.reminderEnabled, true);
  assert.equal(habit.reminderTime, '08:30');
});

test('toggleHabitInList increments streak and updates bestStreak on completion', () => {
  const initialHabit = createHabit('Drink 2L water', 'Drink 1 glass', 'health', false, '09:00', 'h-1');
  const habits = [initialHabit];

  // Toggle on
  const res1 = toggleHabitInList(habits, 'h-1', '2026-10-20');
  assert.equal(res1.justCompleted, true);
  assert.equal(res1.updatedHabits[0].completed, true);
  assert.equal(res1.updatedHabits[0].streak, 1);
  assert.equal(res1.updatedHabits[0].bestStreak, 1);
  assert.ok(res1.updatedHabits[0].completedDates.includes('2026-10-20'));

  // Toggle off (undo)
  const res2 = toggleHabitInList(res1.updatedHabits, 'h-1', '2026-10-20');
  assert.equal(res2.justCompleted, false);
  assert.equal(res2.updatedHabits[0].completed, false);
  assert.equal(res2.updatedHabits[0].streak, 0);
  assert.equal(res2.updatedHabits[0].bestStreak, 1); // Best streak preserved!
  assert.ok(!res2.updatedHabits[0].completedDates.includes('2026-10-20'));
});

test('deleteHabitFromList removes specified habit', () => {
  const h1 = createHabit('Goal 1', 'Tiny 1', 'learning', false, '08:00', '1');
  const h2 = createHabit('Goal 2', 'Tiny 2', 'learning', false, '08:00', '2');
  const updated = deleteHabitFromList([h1, h2], '1');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, '2');
});

test('editHabitInList updates habit properties accurately', () => {
  const h1 = createHabit('Old Goal', 'Old Tiny', 'other', false, '08:00', '1');
  const updated = editHabitInList([h1], '1', {
    name: 'New Goal',
    tiny: 'New Tiny Step',
    category: 'mindfulness',
    reminderEnabled: true,
    reminderTime: '07:45',
  });
  assert.equal(updated[0].name, 'New Goal');
  assert.equal(updated[0].tiny, 'New Tiny Step');
  assert.equal(updated[0].category, 'mindfulness');
  assert.equal(updated[0].reminderEnabled, true);
  assert.equal(updated[0].reminderTime, '07:45');
});

test('checkHabitReminderDue returns true only when matching time, enabled, and uncompleted', () => {
  const habit = createHabit('Morning Run', 'Step outside', 'fitness', true, '07:30', 'h-remind');
  assert.equal(checkHabitReminderDue(habit, '07:30', '2026-10-20'), true);
  assert.equal(checkHabitReminderDue(habit, '07:31', '2026-10-20'), false);

  // If completed, do not nag
  const completedHabit = { ...habit, completed: true };
  assert.equal(checkHabitReminderDue(completedHabit, '07:30', '2026-10-20'), false);

  // If reminder disabled, false
  const disabledHabit = { ...habit, reminderEnabled: false };
  assert.equal(checkHabitReminderDue(disabledHabit, '07:30', '2026-10-20'), false);

  // If already reminded today, false
  const firedHabit = { ...habit, lastReminderFiredDate: '2026-10-20' };
  assert.equal(checkHabitReminderDue(firedHabit, '07:30', '2026-10-20'), false);
});

test('formatTime12h converts 24h string to 12h AM/PM properly', () => {
  assert.equal(formatTime12h('00:15'), '12:15 AM');
  assert.equal(formatTime12h('08:30'), '8:30 AM');
  assert.equal(formatTime12h('12:00'), '12:00 PM');
  assert.equal(formatTime12h('19:45'), '7:45 PM');
});

test('calculateHabitStats computes streaks, milestones, and completion rate', () => {
  const habit = createHabit('Meditate', 'Breathe 3 times', 'mindfulness', false, '08:00', 'h-stats');
  habit.streak = 8;
  habit.bestStreak = 10;
  habit.completed = true;
  habit.createdAt = Date.now() - 10 * 86400000;
  habit.completedDates = ['2026-10-18', '2026-10-19'];

  const stats = calculateHabitStats(habit, new Date('2026-10-20T10:00:00Z'));
  assert.equal(stats.currentStreak, 8);
  assert.equal(stats.longestStreak, 10);
  assert.ok(stats.completionRate > 0);
  assert.equal(stats.currentMilestone.label, 'Spark'); // >= 7 days
  assert.equal(stats.nextMilestone?.label, 'Steady'); // 14 days
  assert.equal(stats.last7Days.length, 7);
});

test('filterHabits handles tabs, category, and search query', () => {
  const h1 = createHabit('Read', '1 page', 'learning', true, '08:00', '1');
  const h2 = createHabit('Pushups', '2 reps', 'fitness', false, '09:00', '2');
  h2.completed = true;

  const all = filterHabits([h1, h2], 'all');
  assert.equal(all.length, 2);

  const active = filterHabits([h1, h2], 'active');
  assert.equal(active.length, 1);
  assert.equal(active[0].id, '1');

  const completed = filterHabits([h1, h2], 'completed');
  assert.equal(completed.length, 1);
  assert.equal(completed[0].id, '2');

  const learningOnly = filterHabits([h1, h2], 'all', 'learning');
  assert.equal(learningOnly.length, 1);
  assert.equal(learningOnly[0].name, 'Read');
});
