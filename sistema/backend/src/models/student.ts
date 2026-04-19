export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

export type StudentInput = Omit<Student, 'id'>;
