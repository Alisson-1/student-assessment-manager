import { useCallback, useEffect, useState } from 'react';
import * as service from '../services/studentService';
import type { Student, StudentInput } from '../types/student';

interface UseStudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}

export function useStudents() {
  const [state, setState] = useState<UseStudentsState>({
    students: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const students = await service.listStudents();
      setState({ students, loading: false, error: null });
    } catch (err) {
      setState({
        students: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load students',
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (input: StudentInput) => {
    const created = await service.createStudent(input);
    setState((prev) => ({ ...prev, students: [...prev.students, created] }));
    return created;
  }, []);

  const update = useCallback(async (id: string, input: StudentInput) => {
    const updated = await service.updateStudent(id, input);
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? updated : s)),
    }));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await service.deleteStudent(id);
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  }, []);

  return { ...state, reload: load, create, update, remove };
}
