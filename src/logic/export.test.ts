import test from 'node:test';
import assert from 'node:assert/strict';
import { createHabit } from './habits.ts';
import {
  generateHabitsJson,
  generateHabitsCsv,
  escapeCsvCell,
  parseAndValidateImportJson,
} from './export.ts';

test('escapeCsvCell properly quotes commas and double quotes', () => {
  assert.equal(escapeCsvCell('Simple text'), '"Simple text"');
  assert.equal(escapeCsvCell('Hello, World'), '"Hello, World"');
  assert.equal(escapeCsvCell('He said "Hi"'), '"He said ""Hi"""');
  assert.equal(escapeCsvCell(42), '"42"');
  assert.equal(escapeCsvCell(true), '"true"');
});

test('generateHabitsJson produces valid JSON payload with summary and habits', () => {
  const h1 = createHabit('Goal 1', 'Tiny 1', 'fitness', true, '08:00', 'h1');
  h1.streak = 5;
  const jsonStr = generateHabitsJson([h1], new Date('2026-10-20T10:00:00Z'));
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.app, 'TinySteps 🌱');
  assert.equal(parsed.totalHabits, 1);
  assert.equal(parsed.habits[0].name, 'Goal 1');
  assert.equal(parsed.habits[0].streak, 5);
  assert.equal(parsed.summary.totalStreaks, 5);
  assert.ok(typeof parsed.exportedAt === 'string');
});

test('generateHabitsCsv outputs valid CSV header and rows', () => {
  const h1 = createHabit('Read books, daily', 'Read "one" page', 'learning', true, '08:30', 'h1');
  h1.streak = 3;
  h1.bestStreak = 6;
  const csvStr = generateHabitsCsv([h1], new Date('2026-10-20T10:00:00Z'));
  const lines = csvStr.split('\r\n');

  assert.ok(lines.length >= 2);
  assert.ok(lines[0].includes('"Big Goal Name"'));
  assert.ok(lines[0].includes('"Completion Rate (%)"'));
  assert.ok(lines[1].includes('"Read books, daily"'));
  assert.ok(lines[1].includes('"Read ""one"" page"'));
  assert.ok(lines[1].includes('"8:30 AM"'));
});

test('parseAndValidateImportJson accepts valid export JSON structure', () => {
  const exportPayload = {
    app: 'TinySteps 🌱',
    habits: [
      {
        id: 'imported-1',
        name: 'Daily Meditation',
        tiny: 'Sit for 2 mins',
        completed: false,
        streak: 10,
        category: 'mindfulness',
        reminderEnabled: true,
        reminderTime: '07:00',
      },
    ],
  };

  const res = parseAndValidateImportJson(JSON.stringify(exportPayload));
  assert.equal(res.valid, true);
  assert.ok(res.habits);
  assert.equal(res.habits.length, 1);
  assert.equal(res.habits[0].name, 'Daily Meditation');
  assert.equal(res.habits[0].streak, 10);
});

test('parseAndValidateImportJson rejects invalid payload', () => {
  assert.equal(parseAndValidateImportJson('not json').valid, false);
  assert.equal(parseAndValidateImportJson('{}').valid, false);
  assert.equal(parseAndValidateImportJson(JSON.stringify({ habits: [] })).valid, false);
});
