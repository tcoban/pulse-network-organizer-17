import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Database, RefreshCw, Trash2, Users, Building2 } from 'lucide-react';
import { assignAllContactsToTeamMembers, getContactAssignmentStats } from '@/utils/assignContactsToTeam';
import { removeDuplicateContacts, checkForDuplicates } from '@/utils/removeDuplicateContacts';
import { insertSyntheticContacts } from '@/utils/insertSyntheticContacts';

export function DataManagementTab() {
  const [loading, setLoading] = useState(false);
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
    loadStats();
  }, []);

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

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contactStats.totalContacts}</div>
            <p className="text-sm text-muted-foreground">
              {contactStats.unassignedContacts} unassigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assigned Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contactStats.assignedContacts}</div>
            <p className="text-sm text-muted-foreground">
              {contactStats.teamMemberStats.length} team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{duplicateStats.duplicateCount}</div>
            <p className="text-sm text-muted-foreground">
              {duplicateStats.uniqueEmails} unique emails
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Operations
          </CardTitle>
          <CardDescription>
            Manage and maintain your contact database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Assign Unassigned Contacts</p>
              <p className="text-sm text-muted-foreground">
                Automatically distribute {contactStats.unassignedContacts} unassigned contacts to team members
              </p>
            </div>
            <Button
              onClick={handleAssignContacts}
              disabled={loading || contactStats.unassignedContacts === 0}
            >
              <Users className="h-4 w-4 mr-2" />
              Assign Contacts
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Remove Duplicate Contacts</p>
              <p className="text-sm text-muted-foreground">
                Clean up {duplicateStats.duplicateCount} duplicate contact entries
              </p>
            </div>
            <Button
              onClick={handleRemoveDuplicates}
              disabled={loading || duplicateStats.duplicateCount === 0}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Duplicates
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Insert Test Data</p>
              <p className="text-sm text-muted-foreground">
                Add synthetic contacts for testing purposes
              </p>
            </div>
            <Button
              onClick={insertContacts}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Insert Test Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Distribution by Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contactStats.teamMemberStats.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.department} • {member.role}
                  </p>
                </div>
                <Badge variant="secondary">{member.contactCount} contacts</Badge>
              </div>
            ))}
            {contactStats.teamMemberStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No team members found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
