import { useCallback, useEffect, useState } from 'react';
import * as service from '../services/classService';
import type { ClassInput, ClassRoom } from '../types/class';

interface State {
  classes: ClassRoom[];
  loading: boolean;
  error: string | null;
}

export function useClasses() {
  const [state, setState] = useState<State>({ classes: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const classes = await service.listClasses();
      setState({ classes, loading: false, error: null });
    } catch (err) {
      setState({
        classes: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load classes',
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (input: ClassInput) => {
    const created = await service.createClass(input);
    setState((prev) => ({ ...prev, classes: [...prev.classes, created] }));
    return created;
  }, []);

  const update = useCallback(async (id: string, input: ClassInput) => {
    const updated = await service.updateClass(id, input);
    setState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await service.deleteClass(id);
    setState((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== id),
    }));
  }, []);

  return { ...state, reload: load, create, update, remove };
}
