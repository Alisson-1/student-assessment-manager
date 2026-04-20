import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, GraduationCap, LayoutDashboard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { routes } from './routes';

const navItems = [
  { to: routes.home, label: 'Dashboard', icon: LayoutDashboard },
  { to: routes.students, label: 'Students', icon: Users },
  { to: routes.classes, label: 'Classes', icon: GraduationCap },
  { to: routes.assessments, label: 'Assessments', icon: ClipboardList },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">TALP2</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === routes.home}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4 text-xs text-muted-foreground">
          Student &amp; Assessment Management
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center border-b bg-background px-6 md:hidden">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold tracking-tight">TALP2</span>
        </header>
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
