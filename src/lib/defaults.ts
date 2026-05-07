export interface Prefs {
  enabled: boolean;
  refreshThresholdMin: number;
  remindThresholdMin: number;
  notificationsEnabled: boolean;
  patterns: string[];
}

export const DEFAULT_PREFS: Prefs = {
  enabled: true,
  refreshThresholdMin: 5,
  remindThresholdMin: 10,
  notificationsEnabled: true,
  patterns: ['https://github.com/*'],
};

export const PREFS_KEY = 'prefs';
export const TAB_STATE_KEY_PREFIX = 'tab:';
export const ALARM_TICK = 'gh-refresh-tick';
