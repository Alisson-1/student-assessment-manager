import { FormEvent, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Student } from '@/features/students/types/student';

interface EnrollStudentFormProps {
  availableStudents: Student[];
  onEnroll: (studentId: string) => Promise<void>;
}

export function EnrollStudentForm({
  availableStudents,
  onEnroll,
}: EnrollStudentFormProps) {
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await onEnroll(selected);
      setSelected('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  if (availableStudents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        All registered students are already enrolled in this class.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[220px] space-y-2">
        <Label htmlFor="enroll-student">Enroll a student</Label>
        <select
          id="enroll-student"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select a student…</option>
          {availableStudents.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={!selected || submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {submitting ? 'Enrolling…' : 'Enroll'}
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
