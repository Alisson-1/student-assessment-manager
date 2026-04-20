import { FormEvent, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClassInput, ClassRoom } from '../types/class';

interface ClassFormProps {
  initialValue?: ClassRoom | null;
  submitLabel: string;
  onSubmit: (input: ClassInput) => Promise<void>;
  onCancel?: () => void;
}

interface FormValues {
  topic: string;
  year: string;
  semester: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const EMPTY: FormValues = {
  topic: '',
  year: String(CURRENT_YEAR),
  semester: '1',
};

export function ClassForm({
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
}: ClassFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValue) {
      setValues({
        topic: initialValue.topic,
        year: String(initialValue.year),
        semester: String(initialValue.semester),
      });
    } else {
      setValues(EMPTY);
    }
    setError(null);
    setFieldErrors({});
  }, [initialValue]);

  const handleChange =
    (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSubmit({
        topic: values.topic.trim(),
        year: Number(values.year),
        semester: Number(values.semester),
        studentIds: initialValue?.studentIds ?? [],
      });
      if (!initialValue) setValues(EMPTY);
    } catch (err) {
      const typed = err as Error & { fields?: Record<string, string> };
      if (typed.fields) setFieldErrors(typed.fields);
      setError(typed.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Class form" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="class-topic">Topic</Label>
        <Input
          id="class-topic"
          name="topic"
          value={values.topic}
          onChange={handleChange('topic')}
          placeholder="Introduction to Programming"
          required
        />
        {fieldErrors.topic && (
          <p role="alert" className="text-sm text-destructive">
            {fieldErrors.topic}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="class-year">Year</Label>
          <Input
            id="class-year"
            name="year"
            type="number"
            min={1900}
            max={2200}
            value={values.year}
            onChange={handleChange('year')}
            required
          />
          {fieldErrors.year && (
            <p role="alert" className="text-sm text-destructive">
              {fieldErrors.year}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="class-semester">Semester</Label>
          <select
            id="class-semester"
            name="semester"
            value={values.semester}
            onChange={handleChange('semester')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="1">1 (first semester)</option>
            <option value="2">2 (second semester)</option>
          </select>
          {fieldErrors.semester && (
            <p role="alert" className="text-sm text-destructive">
              {fieldErrors.semester}
            </p>
          )}
        </div>
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
