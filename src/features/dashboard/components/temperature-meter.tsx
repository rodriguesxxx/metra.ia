import { formatGrade, formatPercent } from "@/lib/formatters";

export function TemperatureMeter({ value, max, label }: { value?: number; max: 10 | 100; label: string }) {
  if (value === undefined || !Number.isFinite(value)) return <span>—</span>;
  const position = Math.max(7, Math.min(93, value / max * 100));
  const formatted = max === 10 ? formatGrade(value) : formatPercent(value);
  return <span className="temperature-meter" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={formatted}>
    <strong className="temperature-value" style={{ left: `${position}%` }}>{formatted}</strong>
    <span className="temperature-track"><span className="temperature-marker" style={{ left: `${position}%` }} /></span>
  </span>;
}
