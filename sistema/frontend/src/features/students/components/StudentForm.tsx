import { FormEvent, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Student, StudentInput } from '../types/student';

interface StudentFormProps {
  initialValue?: Student | null;
  submitLabel: string;
  onSubmit: (input: StudentInput) => Promise<void>;
  onCancel?: () => void;
}

const EMPTY: StudentInput = { name: '', cpf: '', email: '' };

export function StudentForm({ initialValue, submitLabel, onSubmit, onCancel }: StudentFormProps) {
  const [values, setValues] = useState<StudentInput>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValue) {
      setValues({ name: initialValue.name, cpf: initialValue.cpf, email: initialValue.email });
    } else {
      setValues(EMPTY);
    }
    setError(null);
    setFieldErrors({});
  }, [initialValue]);

  const handleChange =
    (field: keyof StudentInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

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
      setError(typed.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Student form" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student-name">Name</Label>
        <Input
          id="student-name"
          name="name"
          value={values.name}
          onChange={handleChange('name')}
          placeholder="Jane Doe"
          required
        />
        {fieldErrors.name && (
          <p role="alert" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-cpf">CPF</Label>
        <Input
          id="student-cpf"
          name="cpf"
          value={values.cpf}
          onChange={handleChange('cpf')}
          placeholder="000.000.000-00"
          required
        />
        {fieldErrors.cpf && (
          <p role="alert" className="text-sm text-destructive">
            {fieldErrors.cpf}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-email">Email</Label>
        <Input
          id="student-email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          placeholder="student@example.com"
          required
        />
        {fieldErrors.email && (
          <p role="alert" className="text-sm text-destructive">
            {fieldErrors.email}
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
