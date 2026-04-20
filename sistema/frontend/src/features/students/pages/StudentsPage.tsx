import { useState } from 'react';
import { Loader2, Plus, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeleteStudentDialog } from '../components/DeleteStudentDialog';
import { StudentFormDialog } from '../components/StudentFormDialog';
import { StudentList } from '../components/StudentList';
import { useStudents } from '../hooks/useStudents';
import type { Student, StudentInput } from '../types/student';

export function StudentsPage() {
  const { students, loading, error, create, update, remove } = useStudents();
  const [editing, setEditing] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Student | null>(null);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditing(student);
    setFormOpen(true);
  };

  const handleSubmit = async (input: StudentInput) => {
    if (editing) {
      await update(editing.id, input);
    } else {
      await create(input);
    }
    setEditing(null);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await remove(toDelete.id);
    if (editing?.id === toDelete.id) {
      setEditing(null);
      setFormOpen(false);
    }
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <UserRound className="h-6 w-6 text-muted-foreground" />
            Students
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the learners enrolled across your classes.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus />
          New student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All students</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading students…'
              : `${students.length} ${students.length === 1 ? 'student' : 'students'} registered.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {!loading && !error && (
            <StudentList
              students={students}
              onEdit={handleEdit}
              onDelete={(student) => setToDelete(student)}
            />
          )}
        </CardContent>
      </Card>

      <StudentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initialValue={editing}
        onSubmit={handleSubmit}
      />

      <DeleteStudentDialog
        student={toDelete}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
