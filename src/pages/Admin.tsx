import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Database, Settings, Tag } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { TeamManagementTab } from '@/components/admin/TeamManagementTab';
import { UserRolesTab } from '@/components/admin/UserRolesTab';
import { DataManagementTab } from '@/components/admin/DataManagementTab';
import { TagManagementTab } from '@/components/admin/TagManagementTab';
import { SystemSettingsTab } from '@/components/admin/SystemSettingsTab';

export default function Admin() {
  const { isAdmin } = useUserRole();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage users, team members, data, and system settings
        </p>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="users">
            <Shield className="h-4 w-4 mr-2" />
            User Roles
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data Management
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Tag className="h-4 w-4 mr-2" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          <TeamManagementTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserRolesTab />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataManagementTab />
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <TagManagementTab />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
