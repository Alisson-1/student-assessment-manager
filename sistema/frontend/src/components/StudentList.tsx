import type { Student } from '../types/student';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  if (students.length === 0) {
    return <p>Nenhum aluno cadastrado.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>CPF</th>
          <th>E-mail</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.name}</td>
            <td>{student.cpf}</td>
            <td>{student.email}</td>
            <td>
              <button type="button" onClick={() => onEdit(student)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(student)}>
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
