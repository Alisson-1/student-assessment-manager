import { useState } from 'react';
import { GraduationCap, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClassFormDialog } from '../components/ClassFormDialog';
import { ClassList } from '../components/ClassList';
import { DeleteClassDialog } from '../components/DeleteClassDialog';
import { useClasses } from '../hooks/useClasses';
import type { ClassInput, ClassRoom } from '../types/class';

export function ClassesPage() {
  const { classes, loading, error, create, update, remove } = useClasses();
  const [editing, setEditing] = useState<ClassRoom | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ClassRoom | null>(null);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (classRoom: ClassRoom) => {
    setEditing(classRoom);
    setFormOpen(true);
  };

  const handleSubmit = async (input: ClassInput) => {
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
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
            Classes
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage course offerings, enrollments, and per-class assessments.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus />
          New class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All classes</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading classes…'
              : `${classes.length} ${classes.length === 1 ? 'class' : 'classes'} registered.`}
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
            <ClassList
              classes={classes}
              onEdit={handleEdit}
              onDelete={(classRoom) => setToDelete(classRoom)}
            />
          )}
        </CardContent>
      </Card>

      <ClassFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initialValue={editing}
        onSubmit={handleSubmit}
      />

      <DeleteClassDialog
        classRoom={toDelete}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
