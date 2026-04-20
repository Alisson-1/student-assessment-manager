import { FormEvent, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Goal, GoalInput } from '../types/assessment';

interface GoalFormProps {
  initialValue?: Goal | null;
  submitLabel: string;
  onSubmit: (input: GoalInput) => Promise<void>;
  onCancel?: () => void;
}

const EMPTY: GoalInput = { name: '' };

export function GoalForm({ initialValue, submitLabel, onSubmit, onCancel }: GoalFormProps) {
  const [values, setValues] = useState<GoalInput>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValue) {
      setValues({ name: initialValue.name });
    } else {
      setValues(EMPTY);
    }
    setError(null);
    setFieldErrors({});
  }, [initialValue]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSubmit(values);
      if (!initialValue) setValues(EMPTY);
    } catch (err) {
      const typed = err as Error & { fields?: Record<string, string> };
      if (typed.fields) setFieldErrors(typed.fields);
      setError(typed.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Goal form" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goal-name">Name</Label>
        <Input
          id="goal-name"
          name="name"
          value={values.name}
          onChange={(e) => setValues({ name: e.target.value })}
          placeholder="Requirements"
          required
        />
        {fieldErrors.name && (
          <p role="alert" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
