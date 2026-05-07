export type BackgroundToContent =
  | { type: 'show-banner'; minutes: number }
  | { type: 'hide-banner' };

export type ContentToBackground =
  | { type: 'refresh-now' }
  | { type: 'dismiss-banner' };

export type PopupToBackground = { type: 'prefs-updated' };

export type Message = BackgroundToContent | ContentToBackground | PopupToBackground;
