import { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Student } from '@/features/students/types/student';
import type {
  Assessment,
  AssessmentValue,
  Goal,
} from '../types/assessment';
import { AssessmentCell } from './AssessmentCell';

interface AssessmentTableProps {
  students: Student[];
  goals: Goal[];
  assessments: Assessment[];
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
  onChangeAssessment: (
    studentId: string,
    goalId: string,
    value: AssessmentValue | null,
  ) => Promise<void>;
}

function buildIndex(assessments: Assessment[]): Map<string, AssessmentValue> {
  const map = new Map<string, AssessmentValue>();
  for (const a of assessments) {
    map.set(`${a.studentId}:${a.goalId}`, a.value);
  }
  return map;
}

export function AssessmentTable({
  students,
  goals,
  assessments,
  onEditGoal,
  onDeleteGoal,
  onChangeAssessment,
}: AssessmentTableProps) {
  const valueByKey = useMemo(() => buildIndex(assessments), [assessments]);

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Register students before recording assessments.
        </p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Add at least one goal to start recording assessments.
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
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{goal.name}</span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditGoal(goal)}
                      aria-label={`Edit goal ${goal.name}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteGoal(goal)}
                      aria-label={`Delete goal ${goal.name}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
