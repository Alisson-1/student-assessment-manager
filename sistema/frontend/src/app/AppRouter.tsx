import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AssessmentsPage } from '@/features/assessments';
import { ClassDetailPage, ClassesPage } from '@/features/classes';
import { StudentsPage } from '@/features/students';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppLayout } from './AppLayout';
import { routes } from './routes';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.students} element={<StudentsPage />} />
          <Route path={routes.classes} element={<ClassesPage />} />
          <Route path={routes.classDetail} element={<ClassDetailPage />} />
          <Route path={routes.assessments} element={<AssessmentsPage />} />
          <Route path="/home" element={<Navigate to={routes.home} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
