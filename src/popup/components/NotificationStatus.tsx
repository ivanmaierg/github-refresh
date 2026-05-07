import { useEffect, useState } from 'react';
import { Bell, BellOff, AlertTriangle } from 'lucide-react';

type PermissionLevel = 'granted' | 'denied';

export function NotificationStatus({ enabled }: { enabled: boolean }) {
  const [level, setLevel] = useState<PermissionLevel | null>(null);

  useEffect(() => {
    let cancelled = false;
    chrome.notifications.getPermissionLevel((l) => {
      if (!cancelled) setLevel(l as PermissionLevel);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-fg-muted">
        <BellOff size={12} /> Desktop notifications off.
      </p>
    );
  }

  if (level === 'granted') {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-success-fg">
        <Bell size={12} /> Desktop notifications enabled.
      </p>
    );
  }

  return (
    <p className="flex items-start gap-1.5 text-[11px] text-attention-fg">
      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
      <span>
        Chrome notifications appear blocked. Enable them in <em>System Settings → Notifications →
        Google Chrome</em> for desktop reminders.
      </span>
    </p>
  );
}
