import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, LogOut, User, Users, Settings } from 'lucide-react';
import { User as AuthUser } from '@supabase/supabase-js';

interface HeaderProps {
  onAddContact: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSignOut: () => void;
  user: AuthUser;
}

const Header = ({ onAddContact, searchQuery, onSearchChange, onSignOut, user }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">KOF ConnectBridge</h1>
          </div>
          
          <div className="relative ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {user.email}
          </div>
          
          <Button onClick={onAddContact} className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
          
          <Button 
            onClick={onSignOut} 
            variant="outline"
            size="sm"
            className="text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;