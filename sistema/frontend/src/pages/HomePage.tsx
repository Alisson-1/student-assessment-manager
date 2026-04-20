import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, GraduationCap, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { routes } from '@/app/routes';

const sections = [
  {
    to: routes.students,
    title: 'Students',
    description: 'Register, update, and remove learners.',
    icon: Users,
    available: true,
  },
  {
    to: routes.classes,
    title: 'Classes',
    description: 'Manage course offerings and enrollments.',
    icon: GraduationCap,
    available: false,
  },
  {
    to: routes.assessments,
    title: 'Assessments',
    description: 'Track MANA, MPA, and MA per goal.',
    icon: ClipboardList,
    available: false,
  },
];

export function HomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of the modules available in the system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ to, title, description, icon: Icon, available }) => (
          <Card key={to} className="transition-colors hover:border-primary/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {available ? (
                <Link
                  to={to}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open module
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">Coming soon</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
