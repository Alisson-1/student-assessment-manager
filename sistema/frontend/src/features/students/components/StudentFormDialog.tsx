import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Student, StudentInput } from '../types/student';
import { StudentForm } from './StudentForm';

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: Student | null;
  onSubmit: (input: StudentInput) => Promise<void>;
}

export function StudentFormDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: StudentFormDialogProps) {
  const isEditing = Boolean(initialValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit student' : 'New student'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the student details and save your changes.'
              : 'Register a new student by filling in their information.'}
          </DialogDescription>
        </DialogHeader>
        <StudentForm
          initialValue={initialValue}
          submitLabel={isEditing ? 'Save changes' : 'Create student'}
          onSubmit={async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
