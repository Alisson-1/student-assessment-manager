import { useCallback, useEffect, useState } from 'react';
import { listStudents } from '@/features/students/services/studentService';
import type { Student } from '@/features/students/types/student';
import * as assessmentService from '../services/assessmentService';
import * as goalService from '../services/goalService';
import type {
  Assessment,
  AssessmentValue,
  Goal,
  GoalInput,
} from '../types/assessment';

interface State {
  students: Student[];
  goals: Goal[];
  assessments: Assessment[];
  loading: boolean;
  error: string | null;
}

function assessmentKey(studentId: string, goalId: string): string {
  return `${studentId}:${goalId}`;
}

export function useAssessments() {
  const [state, setState] = useState<State>({
    students: [],
    goals: [],
    assessments: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [students, goals, assessments] = await Promise.all([
        listStudents(),
        goalService.listGoals(),
        assessmentService.listAssessments(),
      ]);
      setState({ students, goals, assessments, loading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load assessments',
      }));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createGoal = useCallback(async (input: GoalInput) => {
    const created = await goalService.createGoal(input);
    setState((prev) => ({ ...prev, goals: [...prev.goals, created] }));
    return created;
  }, []);

  const updateGoal = useCallback(async (id: string, input: GoalInput) => {
    const updated = await goalService.updateGoal(id, input);
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? updated : g)),
    }));
    return updated;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await goalService.deleteGoal(id);
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
      assessments: prev.assessments.filter((a) => a.goalId !== id),
    }));
  }, []);

  const setAssessment = useCallback(
    async (studentId: string, goalId: string, value: AssessmentValue) => {
      const saved = await assessmentService.setAssessment(studentId, goalId, value);
      setState((prev) => {
        const others = prev.assessments.filter(
          (a) => !(a.studentId === studentId && a.goalId === goalId),
        );
        return { ...prev, assessments: [...others, saved] };
      });
      return saved;
    },
    [],
  );

  const clearAssessment = useCallback(async (studentId: string, goalId: string) => {
    await assessmentService.clearAssessment(studentId, goalId);
    setState((prev) => ({
      ...prev,
      assessments: prev.assessments.filter(
        (a) => !(a.studentId === studentId && a.goalId === goalId),
      ),
    }));
  }, []);

  return {
    ...state,
    reload: load,
    createGoal,
    updateGoal,
    deleteGoal,
    setAssessment,
    clearAssessment,
    assessmentKey,
  };
}
