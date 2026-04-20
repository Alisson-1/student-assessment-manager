import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ClassInput, ClassRoom } from '../types/class';
import { ClassForm } from './ClassForm';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: ClassRoom | null;
  onSubmit: (input: ClassInput) => Promise<void>;
}

export function ClassFormDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: ClassFormDialogProps) {
  const isEditing = Boolean(initialValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit class' : 'New class'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the class details and save your changes.'
              : 'Create a new class by providing its topic, year, and semester.'}
          </DialogDescription>
        </DialogHeader>
        <ClassForm
          initialValue={initialValue}
          submitLabel={isEditing ? 'Save changes' : 'Create class'}
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
