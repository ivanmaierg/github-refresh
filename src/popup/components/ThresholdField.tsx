import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  id: string;
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

export function ThresholdField({
  id,
  label,
  description,
  value,
  min = 1,
  max = 1440,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
          }}
          className="w-20"
        />
        <span className="text-[12px] text-fg-muted">minutes</span>
      </div>
      <p className="text-[11px] leading-snug text-fg-muted">{description}</p>
    </div>
  );
}
