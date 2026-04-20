import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Goal, GoalInput } from '../types/assessment';
import { GoalForm } from './GoalForm';

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: Goal | null;
  onSubmit: (input: GoalInput) => Promise<void>;
}

export function GoalFormDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: GoalFormDialogProps) {
  const isEditing = Boolean(initialValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit goal' : 'New goal'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Rename this learning goal.'
              : 'Add a new learning goal column (e.g., Requirements, Testing).'}
          </DialogDescription>
        </DialogHeader>
        <GoalForm
          initialValue={initialValue}
          submitLabel={isEditing ? 'Save changes' : 'Create goal'}
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
