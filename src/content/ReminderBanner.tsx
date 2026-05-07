import { useEffect, useState } from 'react';
import type { BackgroundToContent } from '@/lib/messages';

export function ReminderBanner() {
  const [visible, setVisible] = useState(false);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const listener = (msg: BackgroundToContent) => {
      if (msg.type === 'show-banner') {
        setMinutes(msg.minutes);
        setVisible(true);
      } else if (msg.type === 'hide-banner') {
        setVisible(false);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-3 z-[2147483647] flex -translate-x-1/2 items-center gap-3 rounded-md border border-attention/40 bg-canvas-subtle px-4 py-2.5 shadow-md"
      style={{
        borderColor: 'var(--gh-attention-emphasis)',
        background: 'var(--gh-canvas-subtle)',
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        fill="var(--gh-attention-fg)"
      >
        <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>

      <span className="text-[13px] font-medium" style={{ color: 'var(--gh-fg-default)' }}>
        Tab not refreshed in <strong>{minutes} min</strong>. Content may be stale.
      </span>

      <div className="ml-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            chrome.runtime.sendMessage({ type: 'refresh-now' });
            setVisible(false);
          }}
          className="cursor-pointer rounded-md border px-3 py-1 text-[12px] font-semibold transition-colors hover:brightness-110"
          style={{
            background: 'var(--gh-success-emphasis)',
            color: '#ffffff',
            borderColor: 'rgba(31,35,40,0.15)',
          }}
        >
          Refresh now
        </button>
        <button
          type="button"
          onClick={() => {
            chrome.runtime.sendMessage({ type: 'dismiss-banner' });
            setVisible(false);
          }}
          aria-label="Dismiss"
          className="cursor-pointer rounded-md border px-2 py-1 text-[12px] transition-colors"
          style={{
            background: 'transparent',
            color: 'var(--gh-fg-muted)',
            borderColor: 'var(--gh-border-default)',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
