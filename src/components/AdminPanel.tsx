import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserRole } from '@/hooks/useUserRole';
import { Shield, Users, Crown, UserCheck, Plus, Edit, Briefcase, Building, Star } from 'lucide-react';
import { TeamMember, useTeamMembers } from '@/hooks/useTeamMembers';
import { assignAllContactsToTeamMembers, getContactAssignmentStats } from '@/utils/assignContactsToTeam';
import { removeDuplicateContacts, checkForDuplicates } from '@/utils/removeDuplicateContacts';
import { insertSyntheticContacts } from '@/utils/insertSyntheticContacts';
import { GenerateHistoricalDataButton } from '@/components/GenerateHistoricalDataButton';

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: 'admin' | 'user';
}

const AdminPanel = () => {
  const { isAdmin } = useUserRole();
  const { teamMembers, loading: teamLoading, fetchTeamMembers } = useTeamMembers();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [contactStats, setContactStats] = useState({
    totalContacts: 0,
    assignedContacts: 0,
    unassignedContacts: 0,
    teamMemberStats: [] as Array<{ name: string; contactCount: number; department: string; role: string; }>
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

  const handleAssignContacts = async () => {
    try {
      setLoading(true);
      const result = await assignAllContactsToTeamMembers();
      
      if (result.success) {
        toast({
          title: "Contact Assignment Complete",
          description: `Successfully assigned ${result.assignments.length} contacts. ${result.errors.length} errors.`,
        });
        loadStats();
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
      
      loadStats();
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
      
      loadStats();
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

  const updateTeamMember = async (member: TeamMember, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          first_name: updates.firstName || member.firstName,
          last_name: updates.lastName || member.lastName,
          email: updates.email || member.email,
          department: updates.department || member.department,
          role: updates.role || member.role,
          specializations: updates.specializations || member.specializations,
          bio: updates.bio || member.bio
        })
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: "Team member updated",
        description: `${member.name} has been updated successfully`
      });

      fetchTeamMembers();
      loadStats();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team member"
      });
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
              <h4 className="font-medium mb-3">Team Member Workload</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contactStats.teamMemberStats.slice(0, 10).map((member, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">{member.name}</span>
                      <div className="text-xs text-muted-foreground">{member.department} • {member.role}</div>
                    </div>
                    <Badge variant="outline">{member.contactCount} contacts</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAssignContacts} disabled={loading}>
              Smart Assign All Contacts
            </Button>
            <Button onClick={handleRemoveDuplicates} disabled={loading} variant="outline">
              Remove Duplicates
            </Button>
            <Button onClick={insertContacts} disabled={loading} variant="outline">
              Insert Test Contacts
            </Button>
            <GenerateHistoricalDataButton />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Team Members Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Swiss Team Members</span>
          </CardTitle>
          <CardDescription>
            Manage KOF team members and their specializations for smart contact assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="text-center py-4">Loading team members...</div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline">{member.department}</Badge>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{member.email}</p>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground mt-1">{member.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.specializations.map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spec.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {contactStats.teamMemberStats.find(s => s.name === member.name)?.contactCount || 0} contacts
                      </div>
                    </div>
                    <Dialog open={isEditDialogOpen && selectedMember?.id === member.id} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Team Member</DialogTitle>
                          <DialogDescription>
                            Update team member information and specializations for better contact assignment
                          </DialogDescription>
                        </DialogHeader>
                        {selectedMember && (
                          <TeamMemberEditForm 
                            member={selectedMember} 
                            onSave={(updates) => {
                              updateTeamMember(selectedMember, updates);
                              setIsEditDialogOpen(false);
                              setSelectedMember(null);
                            }}
                            onCancel={() => {
                              setIsEditDialogOpen(false);
                              setSelectedMember(null);
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles & Permissions</CardTitle>
          <CardDescription>
            Manage user access and admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Promote User to Admin */}
          <div className="border rounded-lg p-4">
            <Label htmlFor="admin-email" className="text-sm font-medium">Grant Admin Access</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="admin-email"
                type="email"
                placeholder="user@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <Button onClick={promoteUserByEmail} disabled={!adminEmail.trim()}>
                <UserCheck className="h-4 w-4 mr-2" />
                Grant Admin
              </Button>
            </div>
          </div>

          {/* Users List */}
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

// Team Member Edit Form Component
interface TeamMemberEditFormProps {
  member: TeamMember;
  onSave: (updates: Partial<TeamMember>) => void;
  onCancel: () => void;
}

const TeamMemberEditForm = ({ member, onSave, onCancel }: TeamMemberEditFormProps) => {
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [email, setEmail] = useState(member.email);
  const [department, setDepartment] = useState(member.department);
  const [role, setRole] = useState(member.role);
  const [bio, setBio] = useState(member.bio || '');
  const [specializations, setSpecializations] = useState(member.specializations.join(', '));

  const handleSave = () => {
    const updates: Partial<TeamMember> = {
      firstName,
      lastName,
      email,
      department,
      role,
      bio,
      specializations: specializations.split(',').map(s => s.trim()).filter(s => s)
    };
    onSave(updates);
  };

  const departments = ['Research', 'Data Services', 'Communications', 'International', 'Administration', 'Management'];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio/Description</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe this team member's expertise and role for better contact assignment"
        />
      </div>

      <div>
        <Label htmlFor="specializations">Specializations (comma-separated)</Label>
        <Textarea
          id="specializations"
          value={specializations}
          onChange={(e) => setSpecializations(e.target.value)}
          placeholder="e.g., monetary-policy, banking, financial-markets"
        />
        <p className="text-xs text-muted-foreground mt-1">
          These specializations are used for smart contact assignment
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default AdminPanel;