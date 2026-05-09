import type { Prefs } from '@/lib/defaults';
import type { TabState } from '@/lib/storage';

export const MIN_MS = 60_000;

export type RefreshDecision =
  | { kind: 'skip'; reason: 'disabled' | 'active' | 'never-unfocused' | 'too-soon' }
  | { kind: 'refresh' };

export function decideRefresh(args: {
  prefs: Pick<Prefs, 'enabled' | 'refreshThresholdMin'>;
  state: Pick<TabState, 'lastUnfocusedAt'>;
  isActive: boolean;
  now: number;
}): RefreshDecision {
  const { prefs, state, isActive, now } = args;
  if (!prefs.enabled) return { kind: 'skip', reason: 'disabled' };
  if (isActive) return { kind: 'skip', reason: 'active' };
  if (state.lastUnfocusedAt === null) return { kind: 'skip', reason: 'never-unfocused' };
  const idleMs = now - state.lastUnfocusedAt;
  if (idleMs < prefs.refreshThresholdMin * MIN_MS) return { kind: 'skip', reason: 'too-soon' };
  return { kind: 'refresh' };
}

export type RemindDecision =
  | { kind: 'skip'; reason: 'inactive' | 'too-soon' | 'dismissed-recently' | 'reminded-recently' }
  | { kind: 'remind'; minutes: number };

export function decideRemind(args: {
  prefs: Pick<Prefs, 'remindThresholdMin'>;
  state: Pick<TabState, 'lastReloadedAt' | 'lastRemindedAt' | 'bannerDismissedAt'>;
  isActive: boolean;
  now: number;
}): RemindDecision {
  const { prefs, state, isActive, now } = args;
  if (!isActive) return { kind: 'skip', reason: 'inactive' };
  const remindMs = prefs.remindThresholdMin * MIN_MS;
  if (now - state.lastReloadedAt < remindMs) return { kind: 'skip', reason: 'too-soon' };
  const dismissedRecently =
    state.bannerDismissedAt !== null && state.bannerDismissedAt > state.lastReloadedAt;
  if (dismissedRecently) return { kind: 'skip', reason: 'dismissed-recently' };
  const lastRemind = state.lastRemindedAt ?? 0;
  if (now - lastRemind < remindMs) return { kind: 'skip', reason: 'reminded-recently' };
  const minutes = Math.round((now - state.lastReloadedAt) / MIN_MS);
  return { kind: 'remind', minutes };
}
