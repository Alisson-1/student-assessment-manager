import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Goal } from '../types/assessment';

interface DeleteGoalDialogProps {
  goal: Goal | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteGoalDialog({ goal, onOpenChange, onConfirm }: DeleteGoalDialogProps) {
  return (
    <AlertDialog open={goal !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete goal?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{' '}
            <span className="font-medium text-foreground">{goal?.name}</span> and every
            assessment recorded against it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }))}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
