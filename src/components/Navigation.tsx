import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  UsersRound,
  Settings,
  Shield,
  Award,
  Briefcase,
  Network,
  HelpCircle
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { ContextualHelp } from '@/components/ContextualHelp';

export function Navigation() {
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const [helpOpen, setHelpOpen] = useState(false);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard
    },
    {
      title: 'My Workbench',
      href: '/workbench',
      icon: Briefcase
    },
    {
      title: 'Contacts',
      href: '/contacts',
      icon: Users
    },
    {
      title: 'BNI System',
      href: '/bni',
      icon: Award
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
      title: 'Network Map',
      href: '/network-map',
      icon: Network
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
    <>
      <nav className="w-64 bg-card border-r min-h-screen p-4 flex flex-col">
        <div className="space-y-1 flex-1">
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

        {/* Help Button */}
        <div className="pt-4 border-t mt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="h-5 w-5" />
            <span className="font-medium">Help & Guides</span>
          </Button>
        </div>
      </nav>

      <ContextualHelp open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
