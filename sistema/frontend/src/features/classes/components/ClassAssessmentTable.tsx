import { useMemo } from 'react';
import { UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AssessmentCell } from '@/features/assessments/components/AssessmentCell';
import type {
  AssessmentValue,
  Goal,
} from '@/features/assessments/types/assessment';
import type { Student } from '@/features/students/types/student';
import type { ClassAssessment } from '../types/class';

interface ClassAssessmentTableProps {
  enrolledStudents: Student[];
  goals: Goal[];
  assessments: ClassAssessment[];
  onChangeAssessment: (
    studentId: string,
    goalId: string,
    value: AssessmentValue | null,
  ) => Promise<void>;
  onUnenroll: (studentId: string) => Promise<void>;
}

function buildIndex(assessments: ClassAssessment[]): Map<string, AssessmentValue> {
  const map = new Map<string, AssessmentValue>();
  for (const a of assessments) {
    map.set(`${a.studentId}:${a.goalId}`, a.value);
  }
  return map;
}

export function ClassAssessmentTable({
  enrolledStudents,
  goals,
  assessments,
  onChangeAssessment,
  onUnenroll,
}: ClassAssessmentTableProps) {
  const valueByKey = useMemo(() => buildIndex(assessments), [assessments]);

  if (enrolledStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Enroll students in this class to start recording assessments.
        </p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Add at least one goal (on the Assessments page) to start recording class assessments.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Student</TableHead>
            {goals.map((goal) => (
              <TableHead key={goal.id} className="min-w-[220px]">
                {goal.name}
              </TableHead>
            ))}
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrolledStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              {goals.map((goal) => {
                const key = `${student.id}:${goal.id}`;
                const value = valueByKey.get(key) ?? null;
                return (
                  <TableCell key={goal.id}>
                    <AssessmentCell
                      studentName={student.name}
                      goalName={goal.name}
                      value={value}
                      onChange={(next) => onChangeAssessment(student.id, goal.id, next)}
                    />
                  </TableCell>
                );
              })}
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void onUnenroll(student.id)}
                  aria-label={`Unenroll ${student.name}`}
                  className="text-destructive hover:text-destructive"
                >
                  <UserMinus />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
