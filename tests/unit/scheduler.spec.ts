import { describe, it, expect } from 'vitest';
import { decideRefresh, decideRemind, MIN_MS } from '@/background/scheduler';
import type { Prefs } from '@/lib/defaults';
import type { TabState } from '@/lib/storage';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const NOW = 1_000_000_000_000;

function makeRefreshPrefs(
  overrides: Partial<Pick<Prefs, 'enabled' | 'refreshThresholdMin'>> = {},
): Pick<Prefs, 'enabled' | 'refreshThresholdMin'> {
  return { enabled: true, refreshThresholdMin: 5, ...overrides };
}

function makeRefreshState(
  overrides: Partial<Pick<TabState, 'lastUnfocusedAt'>> = {},
): Pick<TabState, 'lastUnfocusedAt'> {
  return { lastUnfocusedAt: NOW - 10 * MIN_MS, ...overrides };
}

function makeRemindPrefs(
  overrides: Partial<Pick<Prefs, 'remindThresholdMin'>> = {},
): Pick<Prefs, 'remindThresholdMin'> {
  return { remindThresholdMin: 10, ...overrides };
}

function makeRemindState(
  overrides: Partial<Pick<TabState, 'lastReloadedAt' | 'lastRemindedAt' | 'bannerDismissedAt'>> = {},
): Pick<TabState, 'lastReloadedAt' | 'lastRemindedAt' | 'bannerDismissedAt'> {
  return {
    lastReloadedAt: NOW - 15 * MIN_MS,
    lastRemindedAt: null,
    bannerDismissedAt: null,
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// decideRefresh
// ──────────────────────────────────────────────────────────────────────────────

describe('decideRefresh', () => {
  it('skips when prefs.enabled is false', () => {
    const result = decideRefresh({
      prefs: makeRefreshPrefs({ enabled: false }),
      state: makeRefreshState(),
      isActive: false,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'disabled' });
  });

  it('skips when the tab is active', () => {
    const result = decideRefresh({
      prefs: makeRefreshPrefs(),
      state: makeRefreshState(),
      isActive: true,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'active' });
  });

  it('skips when lastUnfocusedAt is null (tab never lost focus)', () => {
    const result = decideRefresh({
      prefs: makeRefreshPrefs(),
      state: makeRefreshState({ lastUnfocusedAt: null }),
      isActive: false,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'never-unfocused' });
  });

  it('skips when idle time is below the threshold', () => {
    const result = decideRefresh({
      prefs: makeRefreshPrefs({ refreshThresholdMin: 5 }),
      state: makeRefreshState({ lastUnfocusedAt: NOW - 3 * MIN_MS }), // only 3 min idle
      isActive: false,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'too-soon' });
  });

  it('returns refresh when threshold is exceeded', () => {
    const result = decideRefresh({
      prefs: makeRefreshPrefs({ refreshThresholdMin: 5 }),
      state: makeRefreshState({ lastUnfocusedAt: NOW - 6 * MIN_MS }), // 6 min idle
      isActive: false,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'refresh' });
  });

  it('refreshes when idle equals threshold exactly (>= boundary)', () => {
    const result = decideRefresh({
      prefs: makeRefreshPrefs({ refreshThresholdMin: 5 }),
      state: makeRefreshState({ lastUnfocusedAt: NOW - 5 * MIN_MS }), // exactly 5 min
      isActive: false,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'refresh' });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// decideRemind
// ──────────────────────────────────────────────────────────────────────────────

describe('decideRemind', () => {
  it('skips when tab is not active', () => {
    const result = decideRemind({
      prefs: makeRemindPrefs(),
      state: makeRemindState(),
      isActive: false,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'inactive' });
  });

  it('skips when not enough time has passed since last reload', () => {
    const result = decideRemind({
      prefs: makeRemindPrefs({ remindThresholdMin: 10 }),
      state: makeRemindState({ lastReloadedAt: NOW - 5 * MIN_MS }), // only 5 min ago
      isActive: true,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'too-soon' });
  });

  it('skips when banner was dismissed after the last reload', () => {
    const lastReloadedAt = NOW - 15 * MIN_MS;
    const result = decideRemind({
      prefs: makeRemindPrefs(),
      state: makeRemindState({
        lastReloadedAt,
        bannerDismissedAt: lastReloadedAt + MIN_MS, // dismissed after reload
      }),
      isActive: true,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'dismissed-recently' });
  });

  it('skips when reminded too recently', () => {
    const result = decideRemind({
      prefs: makeRemindPrefs({ remindThresholdMin: 10 }),
      state: makeRemindState({
        lastRemindedAt: NOW - 3 * MIN_MS, // reminded only 3 min ago
      }),
      isActive: true,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'skip', reason: 'reminded-recently' });
  });

  it('returns remind with correct minutes when all conditions are met', () => {
    const lastReloadedAt = NOW - 12 * MIN_MS;
    const result = decideRemind({
      prefs: makeRemindPrefs({ remindThresholdMin: 10 }),
      state: makeRemindState({ lastReloadedAt }),
      isActive: true,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'remind', minutes: 12 });
  });

  it('does not skip when bannerDismissedAt predates last reload', () => {
    const lastReloadedAt = NOW - 12 * MIN_MS;
    const result = decideRemind({
      prefs: makeRemindPrefs(),
      state: makeRemindState({
        lastReloadedAt,
        bannerDismissedAt: lastReloadedAt - MIN_MS, // dismissed BEFORE this reload cycle
      }),
      isActive: true,
      now: NOW,
    });
    expect(result).toEqual({ kind: 'remind', minutes: 12 });
  });
});
