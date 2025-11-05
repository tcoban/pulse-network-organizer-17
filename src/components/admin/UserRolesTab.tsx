import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, UserCheck, Shield, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: 'admin' | 'user';
}

export function UserRolesTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          created_at,
          user_roles (role)
        `);

      if (profilesError) throw profilesError;

      const usersWithRoles = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        created_at: profile.created_at,
        role: (profile.user_roles as any)?.[0]?.role || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users"
      });
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async (userId: string) => {
    try {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .limit(1);

      if (existingRole && existingRole.length > 0) {
        toast({
          title: "User is already an admin",
          description: "This user already has admin privileges"
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Admin role granted",
        description: "User has been given admin privileges"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to grant admin privileges"
      });
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast({
        title: "Admin role removed",
        description: "User's admin privileges have been revoked"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove admin privileges"
      });
    }
  };

  const promoteUserByEmail = async () => {
    if (!adminEmail.trim()) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', adminEmail.trim())
        .limit(1);

      if (profileError || !profile || profile.length === 0) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "No user found with that email address"
        });
        return;
      }

      await makeUserAdmin(profile[0].id);
      setAdminEmail('');
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to promote user"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Grant Admin Access
          </CardTitle>
          <CardDescription>
            Promote a user to admin by their email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="admin-email">User Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="user@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={promoteUserByEmail}>
                <Shield className="h-4 w-4 mr-2" />
                Grant Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            Manage user access levels and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {user.role === 'admin' ? (
                    <Crown className="h-5 w-5 text-primary" />
                  ) : (
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  {user.role === 'admin' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAdminRole(user.id)}
                    >
                      Revoke Admin
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => makeUserAdmin(user.id)}
                    >
                      Make Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
