export interface FieldDiff {
  field: string;
  oldValue: string;
  newValue: string;
}

export function computeDiff(
  oldValues: Record<string, any> | null | undefined,
  newValues: Record<string, any> | null | undefined
): FieldDiff[] {
  if (!oldValues && !newValues) return [];

  const diffs: FieldDiff[] = [];
  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ]);

  for (const key of allKeys) {
    // Skip metadata fields
    if (['updated_at', 'created_at'].includes(key)) continue;

    const oldVal = oldValues?.[key];
    const newVal = newValues?.[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({
        field: key,
        oldValue: oldVal != null ? String(oldVal) : '—',
        newValue: newVal != null ? String(newVal) : '—',
      });
    }
  }

  return diffs;
}

export function summarizeDiff(
  oldValues: Record<string, any> | null | undefined,
  newValues: Record<string, any> | null | undefined
): string {
  const diffs = computeDiff(oldValues, newValues);
  if (diffs.length === 0) return 'No changes';
  if (diffs.length === 1) {
    const d = diffs[0];
    return `${d.field}: ${d.oldValue} → ${d.newValue}`;
  }
  return `${diffs.length} fields changed`;
}
