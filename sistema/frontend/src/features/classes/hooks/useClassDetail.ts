import { useCallback, useEffect, useState } from 'react';
import { listGoals } from '@/features/assessments/services/goalService';
import type {
  AssessmentValue,
  Goal,
} from '@/features/assessments/types/assessment';
import { listStudents } from '@/features/students/services/studentService';
import type { Student } from '@/features/students/types/student';
import * as classAssessmentService from '../services/classAssessmentService';
import * as classService from '../services/classService';
import type { ClassAssessment, ClassRoom } from '../types/class';

interface State {
  classRoom: ClassRoom | null;
  students: Student[];
  goals: Goal[];
  assessments: ClassAssessment[];
  loading: boolean;
  error: string | null;
}

export function useClassDetail(classId: string | null) {
  const [state, setState] = useState<State>({
    classRoom: null,
    students: [],
    goals: [],
    assessments: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    if (!classId) {
      setState({
        classRoom: null,
        students: [],
        goals: [],
        assessments: [],
        loading: false,
        error: null,
      });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [classRoom, students, goals, assessments] = await Promise.all([
        classService.getClass(classId),
        listStudents(),
        listGoals(),
        classAssessmentService.listClassAssessments(classId),
      ]);
      setState({
        classRoom,
        students,
        goals,
        assessments,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        classRoom: null,
        students: [],
        goals: [],
        assessments: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load class',
      });
    }
  }, [classId]);

  useEffect(() => {
    void load();
  }, [load]);

  const enroll = useCallback(
    async (studentId: string) => {
      if (!classId) return;
      const updated = await classService.enrollStudent(classId, studentId);
      setState((prev) => ({ ...prev, classRoom: updated }));
    },
    [classId],
  );

  const unenroll = useCallback(
    async (studentId: string) => {
      if (!classId) return;
      const updated = await classService.unenrollStudent(classId, studentId);
      setState((prev) => ({
        ...prev,
        classRoom: updated,
        assessments: prev.assessments.filter((a) => a.studentId !== studentId),
      }));
    },
    [classId],
  );

  const setAssessment = useCallback(
    async (studentId: string, goalId: string, value: AssessmentValue) => {
      if (!classId) return;
      const saved = await classAssessmentService.setClassAssessment(
        classId,
        studentId,
        goalId,
        value,
      );
      setState((prev) => {
        const others = prev.assessments.filter(
          (a) => !(a.studentId === studentId && a.goalId === goalId),
        );
        return { ...prev, assessments: [...others, saved] };
      });
    },
    [classId],
  );

  const clearAssessment = useCallback(
    async (studentId: string, goalId: string) => {
      if (!classId) return;
      await classAssessmentService.clearClassAssessment(classId, studentId, goalId);
      setState((prev) => ({
        ...prev,
        assessments: prev.assessments.filter(
          (a) => !(a.studentId === studentId && a.goalId === goalId),
        ),
      }));
    },
    [classId],
  );

  return { ...state, reload: load, enroll, unenroll, setAssessment, clearAssessment };
}
