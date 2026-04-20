import { useState } from 'react';
import { ClipboardList, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AssessmentTable } from '../components/AssessmentTable';
import { DeleteGoalDialog } from '../components/DeleteGoalDialog';
import { GoalFormDialog } from '../components/GoalFormDialog';
import { useAssessments } from '../hooks/useAssessments';
import type { AssessmentValue, Goal, GoalInput } from '../types/assessment';

export function AssessmentsPage() {
  const {
    students,
    goals,
    assessments,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    setAssessment,
    clearAssessment,
  } = useAssessments();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingGoal(null);
    setFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const handleSubmitGoal = async (input: GoalInput) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, input);
    } else {
      await createGoal(input);
    }
    setEditingGoal(null);
  };

  const handleConfirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    try {
      await deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  const handleChangeAssessment = async (
    studentId: string,
    goalId: string,
    value: AssessmentValue | null,
  ) => {
    setActionError(null);
    try {
      if (value === null) {
        await clearAssessment(studentId, goalId);
      } else {
        await setAssessment(studentId, goalId, value);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save assessment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
            Assessments
          </h1>
          <p className="text-sm text-muted-foreground">
            Record <span className="font-mono">MANA</span>,{' '}
            <span className="font-mono">MPA</span>, and{' '}
            <span className="font-mono">MA</span> for each student and goal.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus />
          New goal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment matrix</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading assessment data…'
              : `${students.length} ${students.length === 1 ? 'student' : 'students'} × ${goals.length} ${goals.length === 1 ? 'goal' : 'goals'}.`}
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
          {actionError && (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {actionError}
            </p>
          )}
          {!loading && !error && (
            <AssessmentTable
              students={students}
              goals={goals}
              assessments={assessments}
              onEditGoal={handleEditGoal}
              onDeleteGoal={(goal) => setGoalToDelete(goal)}
              onChangeAssessment={handleChangeAssessment}
            />
          )}
        </CardContent>
      </Card>

      <GoalFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingGoal(null);
        }}
        initialValue={editingGoal}
        onSubmit={handleSubmitGoal}
      />

      <DeleteGoalDialog
        goal={goalToDelete}
        onOpenChange={(open) => {
          if (!open) setGoalToDelete(null);
        }}
        onConfirm={handleConfirmDeleteGoal}
      />
    </div>
  );
}
