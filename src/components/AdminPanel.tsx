import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Crown, UserCheck } from 'lucide-react';
import { assignAllContactsToTeamMembers, getContactAssignmentStats } from '@/utils/assignContactsToTeam';
import { removeDuplicateContacts, checkForDuplicates } from '@/utils/removeDuplicateContacts';
import { insertSyntheticContacts } from '@/utils/insertSyntheticContacts';

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: 'admin' | 'user';
}

const AdminPanel = () => {
  const { isAdmin } = useUserRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [contactStats, setContactStats] = useState({
    totalContacts: 0,
    assignedContacts: 0,
    unassignedContacts: 0,
    teamMemberStats: [] as Array<{ name: string; contactCount: number; }>
  });
  const [duplicateStats, setDuplicateStats] = useState({
    duplicateCount: 0,
    uniqueEmails: 0,
    totalContacts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const [assignmentStats, duplicateInfo] = await Promise.all([
        getContactAssignmentStats(),
        checkForDuplicates()
      ]);
      
      setContactStats(assignmentStats);
      setDuplicateStats(duplicateInfo);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users with their roles
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
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async (userId: string) => {
    try {
      // Check if user already has admin role
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

      // Insert admin role
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
      // Find user by email
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

  const handleAssignContacts = async () => {
    try {
      setLoading(true);
      const result = await assignAllContactsToTeamMembers();
      
      if (result.success) {
        toast({
          title: "Contact Assignment Complete",
          description: `Successfully assigned ${result.assignments.length} contacts. ${result.errors.length} errors.`,
        });
        loadStats(); // Refresh stats
      } else {
        toast({
          title: "Assignment Failed",
          description: "Failed to assign contacts to team members",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Assignment Error",
        description: "An error occurred while assigning contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    try {
      setLoading(true);
      const result = await removeDuplicateContacts();
      
      toast({
        title: "Duplicate Removal Complete",
        description: `Removed ${result.removed} duplicate contacts. ${result.errors.length} errors.`,
      });
      
      loadStats(); // Refresh stats
    } catch (error) {
      toast({
        title: "Removal Error",
        description: "An error occurred while removing duplicates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const insertContacts = async () => {
    try {
      setLoading(true);
      const result = await insertSyntheticContacts();
      
      toast({
        title: "Contacts inserted",
        description: `Successfully inserted ${result.successCount} contacts with ${result.errorCount} errors`,
      });
      
      loadStats(); // Refresh stats after insertion
    } catch (error) {
      toast({
        title: "Error inserting contacts",
        description: "Failed to insert synthetic contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this panel
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Crown className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Contact Management */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Management</CardTitle>
          <CardDescription>
            Manage contacts and team member assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{contactStats.totalContacts}</div>
                <div className="text-sm text-muted-foreground">Total Contacts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{contactStats.assignedContacts}</div>
                <div className="text-sm text-muted-foreground">Assigned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{contactStats.unassignedContacts}</div>
                <div className="text-sm text-muted-foreground">Unassigned</div>
              </CardContent>
            </Card>
          </div>

          {/* Team Member Assignments */}
          {contactStats.teamMemberStats.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Team Member Assignments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contactStats.teamMemberStats.slice(0, 10).map((member, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">{member.name}</span>
                    <Badge variant="outline">{member.contactCount} contacts</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Statistics */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Duplicate Statistics</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">{duplicateStats.totalContacts}</div>
                <div className="text-muted-foreground">Total Contacts</div>
              </div>
              <div>
                <div className="font-medium">{duplicateStats.uniqueEmails}</div>
                <div className="text-muted-foreground">Unique Emails</div>
              </div>
              <div>
                <div className="font-medium text-red-600">{duplicateStats.duplicateCount}</div>
                <div className="text-muted-foreground">Duplicates</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAssignContacts} disabled={loading}>
              Assign Contacts to Team
            </Button>
            <Button onClick={handleRemoveDuplicates} disabled={loading} variant="outline">
              Remove Duplicates
            </Button>
            <Button onClick={insertContacts} disabled={loading} variant="outline">
              Insert Synthetic Contacts
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Promote User to Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Grant Admin Access</CardTitle>
          <CardDescription>
            Promote a user to admin by their email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
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
              <Button onClick={promoteUserByEmail} disabled={!adminEmail.trim()}>
                <UserCheck className="h-4 w-4 mr-2" />
                Grant Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    {user.role === 'admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAdminRole(user.id)}
                      >
                        Remove Admin
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => makeUserAdmin(user.id)}
                      >
                        Make Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;