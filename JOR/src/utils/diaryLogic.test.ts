import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWordCount,
  calculateReadingTime,
  filterEntries,
  groupEntriesByDate,
  computeMoodStats,
  getPaperClasses,
  getFontClass,
} from './diaryLogic';
import { DiaryEntry } from '../types';

test('calculateWordCount calculates word length properly', () => {
  assert.equal(calculateWordCount(''), 0);
  assert.equal(calculateWordCount('   '), 0);
  assert.equal(calculateWordCount('Today was a serene and quiet morning by the lake.'), 10);
  assert.equal(calculateWordCount('One\nTwo\tThree   Four'), 4);
});

test('calculateReadingTime provides calm estimation', () => {
  assert.equal(calculateReadingTime(0), 0);
  assert.equal(calculateReadingTime(50), 1);
  assert.equal(calculateReadingTime(200), 1);
  assert.equal(calculateReadingTime(201), 2);
});

test('groupEntriesByDate categorizes entries by natural timeframe', () => {
  const now = new Date();
  const sampleEntries: DiaryEntry[] = [
    {
      id: 'e1',
      journalId: 'daily',
      title: 'Morning Sun',
      content: 'Woke up early.',
      date: now.toISOString(),
      wordCount: 3,
      readingTimeMinutes: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'e2',
      journalId: 'daily',
      title: 'Old memories',
      content: 'From last year.',
      date: '2025-01-01T10:00:00Z',
      wordCount: 3,
      readingTimeMinutes: 1,
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
    },
  ];

  const grouped = groupEntriesByDate(sampleEntries);
  assert.ok(grouped['Today']);
  assert.equal(grouped['Today'].length, 1);
  assert.ok(grouped['Older']);
  assert.equal(grouped['Older'].length, 1);
});

test('filterEntries handles journal filtering, search and mood filters', () => {
  const entries: DiaryEntry[] = [
    {
      id: '1',
      journalId: 'daily',
      title: 'Walk in Kyoto',
      content: 'The moss garden was quiet and serene.',
      date: '2026-10-20T10:00:00Z',
      userMoodTag: 'peaceful',
      wordCount: 7,
      readingTimeMinutes: 1,
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    },
    {
      id: '2',
      journalId: 'trips',
      title: 'Alps Hiking Trail',
      content: 'Challenging climb but stunning vistas.',
      date: '2026-10-21T10:00:00Z',
      userMoodTag: 'energetic',
      wordCount: 5,
      readingTimeMinutes: 1,
      createdAt: '2026-10-21T10:00:00Z',
      updatedAt: '2026-10-21T10:00:00Z',
    },
  ];

  const tripsOnly = filterEntries(entries, 'trips', '');
  assert.equal(tripsOnly.length, 1);
  assert.equal(tripsOnly[0].id, '2');

  const searchResult = filterEntries(entries, 'all', 'Kyoto');
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, '1');

  const moodResult = filterEntries(entries, 'all', '', 'energetic');
  assert.equal(moodResult.length, 1);
  assert.equal(moodResult[0].id, '2');
});

test('computeMoodStats aggregates mood score and streaks', () => {
  const entries: DiaryEntry[] = [
    {
      id: '1',
      journalId: 'daily',
      title: 'Peaceful Morning',
      content: 'Tea and books.',
      date: '2026-10-24T10:00:00Z',
      wordCount: 3,
      readingTimeMinutes: 1,
      moodAnalysis: {
        primaryMood: 'Peaceful',
        moodCategory: 'peaceful',
        moodScore: 8.5,
        emotionalSpectrum: [{ emotion: 'Tranquil', percentage: 90 }],
        keyThemes: ['tea', 'reading'],
        personalizedReflection: 'Gentle morning.',
        soothingAdvice: 'Breathe deeply.',
        reflectivePrompt: 'What brought you warmth?',
        analyzedAt: '2026-10-24T10:05:00Z',
      },
      createdAt: '2026-10-24T10:00:00Z',
      updatedAt: '2026-10-24T10:00:00Z',
    },
  ];

  const stats = computeMoodStats(entries);
  assert.equal(stats.totalEntries, 1);
  assert.equal(stats.averageMoodScore, 8.5);
  assert.equal(stats.dominantMood, 'Peaceful');
  assert.equal(stats.streakDays, 1);
});

test('getPaperClasses and getFontClass return valid styling definitions', () => {
  const paper = getPaperClasses('soft-sage');
  assert.equal(paper.id, 'soft-sage');
  assert.ok(paper.containerClass.includes('bg-'));

  const font = getFontClass('cormorant');
  assert.equal(font, 'font-cormorant');
});
