const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Continuous visual scale only; it does not classify a student's situation. */
export function academicTone(value?: number, max = 100) {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  const hue = Math.round(5 + clamp(value / max) * 140);
  return `hsl(${hue} 65% 34%)`;
}

export function attentionTone(count?: number, total?: number) {
  if (count === undefined || !Number.isFinite(count) || !total || total <= 0) return undefined;
  if (count <= 0) return academicTone(100);
  const hue = Math.round(39 - clamp(count / total) * 35);
  return `hsl(${hue} 70% 36%)`;
}
