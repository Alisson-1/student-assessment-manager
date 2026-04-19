import { FormEvent, useEffect, useState } from 'react';
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

  const handleChange = (field: keyof StudentInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <form onSubmit={handleSubmit} aria-label="Student form">
      <div>
        <label htmlFor="student-name">Nome</label>
        <input
          id="student-name"
          name="name"
          value={values.name}
          onChange={handleChange('name')}
          required
        />
        {fieldErrors.name && <span role="alert">{fieldErrors.name}</span>}
      </div>
      <div>
        <label htmlFor="student-cpf">CPF</label>
        <input
          id="student-cpf"
          name="cpf"
          value={values.cpf}
          onChange={handleChange('cpf')}
          required
        />
        {fieldErrors.cpf && <span role="alert">{fieldErrors.cpf}</span>}
      </div>
      <div>
        <label htmlFor="student-email">E-mail</label>
        <input
          id="student-email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          required
        />
        {fieldErrors.email && <span role="alert">{fieldErrors.email}</span>}
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Salvando…' : submitLabel}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      )}
    </form>
  );
}
