import { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import {
  ASSESSMENT_LABELS,
  ASSESSMENT_VALUES,
  AssessmentValue,
} from '../types/assessment';

interface AssessmentCellProps {
  studentName: string;
  goalName: string;
  value: AssessmentValue | null;
  onChange: (value: AssessmentValue | null) => Promise<void> | void;
}

const NONE = '__NONE__';

const badgeClass: Record<AssessmentValue, string> = {
  MANA: 'bg-destructive/10 text-destructive border-destructive/30',
  MPA: 'bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/30',
  MA: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-emerald-500/30',
};

export function AssessmentCell({ studentName, goalName, value, onChange }: AssessmentCellProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    if (next === NONE) {
      void onChange(null);
    } else {
      void onChange(next as AssessmentValue);
    }
  };

  return (
    <select
      aria-label={`Assessment for ${studentName} on ${goalName}`}
      value={value ?? NONE}
      onChange={handleChange}
      className={cn(
        'block w-full rounded-md border bg-background px-2 py-1 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        value ? badgeClass[value] : 'border-input text-muted-foreground',
      )}
    >
      <option value={NONE}>—</option>
      {ASSESSMENT_VALUES.map((option) => (
        <option key={option} value={option}>
          {option} — {ASSESSMENT_LABELS[option]}
        </option>
      ))}
    </select>
  );
}
