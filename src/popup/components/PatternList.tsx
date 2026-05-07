import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidPattern } from '@/lib/matcher';

interface Props {
  patterns: string[];
  onChange: (patterns: string[]) => void;
  disabled?: boolean;
}

export function PatternList({ patterns, onChange, disabled }: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!isValidPattern(trimmed)) {
      setError('Pattern must start with https:// and use * for wildcards.');
      return;
    }
    if (patterns.includes(trimmed)) {
      setError('Pattern already added.');
      return;
    }
    onChange([...patterns, trimmed]);
    setDraft('');
    setError(null);
  };

  const remove = (idx: number) => {
    onChange(patterns.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="pattern-draft">URL patterns</Label>
      <p className="text-[11px] leading-snug text-fg-muted">
        Only act on tabs whose URL matches one of these patterns. Use{' '}
        <code className="rounded bg-canvas-subtle px-1 py-0.5 text-[10px]">*</code> for wildcards.
      </p>

      <ul className="flex flex-col gap-1">
        {patterns.map((p, i) => (
          <li
            key={p}
            className="group flex items-center justify-between gap-2 rounded-md border border-border bg-canvas-subtle px-2 py-1"
          >
            <code className="truncate text-[12px] text-fg">{p}</code>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${p}`}
              disabled={disabled}
              onClick={() => remove(i)}
              className="h-6 w-6 opacity-60 group-hover:opacity-100"
            >
              <X size={14} />
            </Button>
          </li>
        ))}
        {patterns.length === 0 && (
          <li className="rounded-md border border-dashed border-border px-2 py-2 text-center text-[11px] text-fg-muted">
            No patterns — extension will not act on any tab.
          </li>
        )}
      </ul>

      <div className="mt-1 flex items-start gap-1.5">
        <div className="flex-1">
          <Input
            id="pattern-draft"
            placeholder="https://github.com/*/pulls"
            value={draft}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          {error && <p className="mt-1 text-[11px] text-danger-fg">{error}</p>}
        </div>
        <Button variant="default" size="md" onClick={add} disabled={disabled || !draft.trim()}>
          <Plus size={14} />
          Add
        </Button>
      </div>
    </div>
  );
}
