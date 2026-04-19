import { useState } from 'react';
import { StudentForm } from '../components/StudentForm';
import { StudentList } from '../components/StudentList';
import { useStudents } from '../hooks/useStudents';
import type { Student, StudentInput } from '../types/student';

export function StudentsPage() {
  const { students, loading, error, create, update, remove } = useStudents();
  const [editing, setEditing] = useState<Student | null>(null);

  const handleSubmit = async (input: StudentInput) => {
    if (editing) {
      await update(editing.id, input);
      setEditing(null);
    } else {
      await create(input);
    }
  };

  const handleDelete = async (student: Student) => {
    const confirmed = window.confirm(`Excluir o aluno ${student.name}?`);
    if (!confirmed) return;
    await remove(student.id);
    if (editing?.id === student.id) setEditing(null);
  };

  return (
    <main>
      <h1>Alunos</h1>

      <section>
        <h2>{editing ? 'Editar aluno' : 'Novo aluno'}</h2>
        <StudentForm
          initialValue={editing}
          submitLabel={editing ? 'Atualizar' : 'Cadastrar'}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </section>

      <section>
        <h2>Lista de alunos</h2>
        {loading && <p>Carregando…</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && (
          <StudentList students={students} onEdit={setEditing} onDelete={handleDelete} />
        )}
      </section>
    </main>
  );
}
