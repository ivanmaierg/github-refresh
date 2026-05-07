import { useEffect, useState } from 'react';
import { RefreshCw, Github } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { getPrefs, setPrefs } from '@/lib/storage';
import { DEFAULT_PREFS, type Prefs } from '@/lib/defaults';
import { ThresholdField } from './components/ThresholdField';
import { PatternList } from './components/PatternList';
import { NotificationStatus } from './components/NotificationStatus';

export function App() {
  const [prefs, setLocal] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPrefs().then((p) => {
      setLocal(p);
      setLoading(false);
    });
  }, []);

  const update = async (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setLocal(next);
    await setPrefs(next);
    chrome.runtime.sendMessage({ type: 'prefs-updated' }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="flex w-[360px] flex-col gap-3 bg-canvas p-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-canvas-subtle text-accent-fg">
            <RefreshCw size={16} />
          </span>
          <div className="leading-tight">
            <h1 className="text-[14px] font-semibold text-fg">GitHub Auto-Refresh</h1>
            <p className="text-[11px] text-fg-muted">Keep your tabs fresh.</p>
          </div>
        </div>
        <a
          href="https://github.com/ivanmaierg/github-refresh"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Source on GitHub"
          className="rounded-md p-1.5 text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-fg"
        >
          <Github size={16} />
        </a>
      </header>

      <Separator />

      {loading ? (
        <div className="flex h-32 items-center justify-center text-[12px] text-fg-muted">
          Loading…
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Enabled</CardTitle>
                <CardDescription>Master switch for the extension.</CardDescription>
              </div>
              <Switch
                checked={prefs.enabled}
                onCheckedChange={(v) => update({ enabled: v })}
                aria-label="Enable extension"
              />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timing</CardTitle>
              <CardDescription>How long until refresh and reminder fire.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              <ThresholdField
                id="refresh-threshold"
                label="Auto-refresh after"
                description="Reload a GitHub tab once it has been unfocused for this long."
                value={prefs.refreshThresholdMin}
                onChange={(n) => update({ refreshThresholdMin: n })}
                disabled={!prefs.enabled}
              />
              <Separator />
              <ThresholdField
                id="remind-threshold"
                label="Remind me after"
                description="Show a banner + notification if the active tab hasn't refreshed in this long."
                value={prefs.remindThresholdMin}
                onChange={(n) => update({ remindThresholdMin: n })}
                disabled={!prefs.enabled}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Desktop notifications</CardTitle>
                <CardDescription>System reminders for stale tabs.</CardDescription>
              </div>
              <Switch
                checked={prefs.notificationsEnabled}
                onCheckedChange={(v) => update({ notificationsEnabled: v })}
                aria-label="Enable desktop notifications"
                disabled={!prefs.enabled}
              />
            </CardHeader>
            <CardContent className="pt-0">
              <NotificationStatus enabled={prefs.enabled && prefs.notificationsEnabled} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3">
              <PatternList
                patterns={prefs.patterns}
                onChange={(patterns) => update({ patterns })}
                disabled={!prefs.enabled}
              />
            </CardContent>
          </Card>

          <footer className="flex items-center justify-between px-1 text-[11px] text-fg-muted">
            <span>v0.1.0</span>
            <span aria-live="polite" className={saved ? 'text-success-fg' : ''}>
              {saved ? 'Saved' : 'Auto-saved'}
            </span>
          </footer>
        </>
      )}
    </div>
  );
}
