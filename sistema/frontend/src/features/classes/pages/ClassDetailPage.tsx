import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, GraduationCap, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { routes } from '@/app/routes';
import type { AssessmentValue } from '@/features/assessments/types/assessment';
import { ClassAssessmentTable } from '../components/ClassAssessmentTable';
import { EnrollStudentForm } from '../components/EnrollStudentForm';
import { useClassDetail } from '../hooks/useClassDetail';

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    classRoom,
    students,
    goals,
    assessments,
    loading,
    error,
    enroll,
    unenroll,
    setAssessment,
    clearAssessment,
  } = useClassDetail(id ?? null);

  const [actionError, setActionError] = useState<string | null>(null);

  const enrolledStudents = useMemo(() => {
    if (!classRoom) return [];
    const ids = new Set(classRoom.studentIds);
    return students.filter((s) => ids.has(s.id));
  }, [classRoom, students]);

  const availableStudents = useMemo(() => {
    if (!classRoom) return [];
    const ids = new Set(classRoom.studentIds);
    return students.filter((s) => !ids.has(s.id));
  }, [classRoom, students]);

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

  const handleEnroll = async (studentId: string) => {
    setActionError(null);
    await enroll(studentId);
  };

  const handleUnenroll = async (studentId: string) => {
    setActionError(null);
    try {
      await unenroll(studentId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to unenroll student');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to={routes.classes}>
              <ArrowLeft />
              Back to classes
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
            {classRoom ? classRoom.topic : 'Class'}
          </h1>
          {classRoom && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {classRoom.year} · Semester {classRoom.semester}
            </p>
          )}
        </div>
      </div>

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

      {!loading && !error && classRoom && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
              <CardDescription>
                {enrolledStudents.length}{' '}
                {enrolledStudents.length === 1 ? 'student' : 'students'} enrolled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollStudentForm
                availableStudents={availableStudents}
                onEnroll={handleEnroll}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class assessments</CardTitle>
              <CardDescription>
                Record MANA, MPA, and MA for enrolled students within this class.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionError && (
                <p role="alert" className="mb-3 text-sm text-destructive">
                  {actionError}
                </p>
              )}
              <ClassAssessmentTable
                enrolledStudents={enrolledStudents}
                goals={goals}
                assessments={assessments}
                onChangeAssessment={handleChangeAssessment}
                onUnenroll={handleUnenroll}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
