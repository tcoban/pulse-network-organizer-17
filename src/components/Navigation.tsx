import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  UsersRound,
  Settings,
  Shield,
  Award
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export function Navigation() {
  const location = useLocation();
  const { isAdmin } = useUserRole();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard
    },
    {
      title: 'Contacts',
      href: '/contacts',
      icon: Users
    },
    {
      title: 'Team Opportunities',
      href: '/?view=opportunities',
      icon: UsersRound
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: Target
    },
    {
      title: 'Goals',
      href: '/goals',
      icon: Target
    },
    {
      title: 'BNI System',
      href: '/bni',
      icon: Award
    },
    {
      title: 'Team',
      href: '/team',
      icon: UsersRound
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  if (isAdmin) {
    navItems.push({
      title: 'Admin',
      href: '/admin',
      icon: Shield
    });
  }

  return (
    <nav className="w-64 bg-card border-r min-h-screen p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href.includes('view=opportunities') && location.search.includes('view=opportunities'));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
