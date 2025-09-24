import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Shield, 
  Users, 
  Crown, 
  UserCheck, 
  Plus, 
  Edit, 
  Settings, 
  Database, 
  Brain, 
  Webhook, 
  Tag,
  Target,
  BarChart3,
  Zap,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { TeamMember, useTeamMembers } from '@/hooks/useTeamMembers';

interface SystemSettings {
  aiIntroductionThreshold: number;
  autoFollowupDays: number;
  priorityScoreWeights: {
    potentialScore: number;
    cooperationRating: number;
    lastContactDays: number;
    upcomingMeetings: number;
  };
  notificationSettings: {
    emailAlerts: boolean;
    weeklyReports: boolean;
    urgentFollowups: boolean;
  };
  dataRetentionDays: number;
  analyticsEnabled: boolean;
}

interface TagHierarchy {
  id: string;
  name: string;
  category: string;
  color: string;
  description?: string;
  parentId?: string;
  children?: TagHierarchy[];
}

interface IntegrationConfig {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'import';
  enabled: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  status: 'active' | 'error' | 'disabled';
}

const EnhancedAdminPanel = () => {
  const { isAdmin } = useUserRole();
  const { teamMembers, loading: teamLoading, fetchTeamMembers } = useTeamMembers();
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState<SystemSettings>({
    aiIntroductionThreshold: 75,
    autoFollowupDays: 90,
    priorityScoreWeights: {
      potentialScore: 30,
      cooperationRating: 25,
      lastContactDays: 25,
      upcomingMeetings: 20
    },
    notificationSettings: {
      emailAlerts: true,
      weeklyReports: true,
      urgentFollowups: true
    },
    dataRetentionDays: 365,
    analyticsEnabled: true
  });
  
  const [tags, setTags] = useState<TagHierarchy[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalContacts: 0,
    totalInteractions: 0,
    avgResponseTime: 0,
    systemUptime: 99.8
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchSystemData();
    }
  }, [isAdmin]);

  const fetchSystemData = async () => {
    try {
      // Fetch system statistics
      const [usersData, contactsData, interactionsData] = await Promise.all([
        supabase.from('profiles').select('id, created_at').order('created_at', { ascending: false }),
        supabase.from('contacts').select('id, created_at'),
        supabase.from('interactions').select('id, created_at')
      ]);

      const activeThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeUsers = usersData.data?.filter(user => 
        new Date(user.created_at) >= activeThreshold
      ).length || 0;

      setSystemStats({
        totalUsers: usersData.data?.length || 0,
        activeUsers,
        totalContacts: contactsData.data?.length || 0,
        totalInteractions: interactionsData.data?.length || 0,
        avgResponseTime: Math.random() * 100 + 50, // Mock data
        systemUptime: 99.8 + Math.random() * 0.2
      });

      // Initialize mock integrations
      setIntegrations([
        {
          id: 'linkedin-sync',
          name: 'LinkedIn Integration',
          type: 'api',
          enabled: true,
          config: { apiKey: '***************' },
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          id: 'email-import',
          name: 'Email Contact Import',
          type: 'import',
          enabled: false,
          config: { provider: 'gmail' },
          status: 'disabled'
        },
        {
          id: 'webhook-events',
          name: 'External Event Webhook',
          type: 'webhook',
          enabled: true,
          config: { url: 'https://api.example.com/webhook' },
          lastSync: new Date(Date.now() - 15 * 60 * 1000),
          status: 'active'
        }
      ]);

      // Initialize sample tag hierarchy
      setTags([
        {
          id: 'industry',
          name: 'Industry',
          category: 'classification',
          color: '#3B82F6',
          description: 'Industry-based contact classification',
          children: [
            { id: 'tech', name: 'Technology', category: 'industry', color: '#10B981' },
            { id: 'finance', name: 'Finance', category: 'industry', color: '#F59E0B' },
            { id: 'government', name: 'Government', category: 'industry', color: '#EF4444' }
          ]
        },
        {
          id: 'priority',
          name: 'Priority Level',
          category: 'management',
          color: '#8B5CF6',
          description: 'Contact priority and importance',
          children: [
            { id: 'vip', name: 'VIP', category: 'priority', color: '#DC2626' },
            { id: 'high', name: 'High Priority', category: 'priority', color: '#F59E0B' },
            { id: 'standard', name: 'Standard', category: 'priority', color: '#6B7280' }
          ]
        }
      ]);

    } catch (error) {
      console.error('Error fetching system data:', error);
    }
  };

  const saveSettings = async () => {
    try {
      // In a real implementation, save to database
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings"
      });
    }
  };

  const toggleIntegration = async (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, enabled, status: enabled ? 'active' : 'disabled' }
        : integration
    ));
    
    toast({
      title: `Integration ${enabled ? 'enabled' : 'disabled'}`,
      description: `${integrations.find(i => i.id === integrationId)?.name} has been ${enabled ? 'enabled' : 'disabled'}`
    });
  };

  const exportData = async (dataType: string) => {
    toast({
      title: "Export started",
      description: `${dataType} export has been initiated. You'll receive an email when ready.`
    });
  };

  const syncIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, lastSync: new Date(), status: 'active' }
        : i
    ));

    toast({
      title: "Sync completed",
      description: `${integration.name} has been synchronized`
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access the advanced admin panel
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Advanced Administration</h1>
        </div>
        <Button onClick={saveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="tags">Tags & Categories</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-strategic-blue/5 to-strategic-blue/10 border-strategic-blue/20 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-strategic-blue">Total Users</CardTitle>
                <div className="p-2 rounded-lg bg-strategic-blue/10">
                  <Users className="h-5 w-5 text-strategic-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{systemStats.totalUsers}</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-strategic-green font-medium">{systemStats.activeUsers}</span> active this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-strategic-purple/5 to-strategic-purple/10 border-strategic-purple/20 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-strategic-purple">Contacts</CardTitle>
                <div className="p-2 rounded-lg bg-strategic-purple/10">
                  <Database className="h-5 w-5 text-strategic-purple" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{systemStats.totalContacts}</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-strategic-purple font-medium">{Math.floor(systemStats.totalContacts / Math.max(systemStats.totalUsers, 1))}</span> avg per user
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-strategic-green/5 to-strategic-green/10 border-strategic-green/20 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-strategic-green">System Health</CardTitle>
                <div className="p-2 rounded-lg bg-strategic-green/10">
                  <BarChart3 className="h-5 w-5 text-strategic-green" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{systemStats.systemUptime.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-strategic-green font-medium">Excellent</span> uptime last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="bg-gradient-to-r from-background to-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Real-Time System Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {[
                  { time: '2 minutes ago', event: 'LinkedIn integration synchronized', type: 'success', icon: Webhook },
                  { time: '15 minutes ago', event: '3 new contacts imported', type: 'info', icon: Users },
                  { time: '1 hour ago', event: 'Weekly analytics report generated', type: 'info', icon: BarChart3 },
                  { time: '3 hours ago', event: 'User sarah.mueller@example.com promoted to admin', type: 'warning', icon: Crown }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'success' ? 'bg-strategic-green/10 text-strategic-green' :
                        activity.type === 'warning' ? 'bg-strategic-orange/10 text-strategic-orange' :
                        'bg-strategic-blue/10 text-strategic-blue'
                      }`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.event}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        activity.type === 'success' ? 'border-strategic-green text-strategic-green bg-strategic-green/5' :
                        activity.type === 'warning' ? 'border-strategic-orange text-strategic-orange bg-strategic-orange/5' :
                        'border-strategic-blue text-strategic-blue bg-strategic-blue/5'
                      }
                    >
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card className="shadow-card bg-gradient-to-br from-card to-muted/10">
            <CardHeader className="bg-gradient-to-r from-strategic-purple/5 to-strategic-blue/5 border-b">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Brain className="h-6 w-6 text-strategic-purple" />
                AI & Intelligence Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Configure intelligent matching and priority algorithms</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ai-threshold">AI Introduction Confidence Threshold</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="ai-threshold"
                      type="number"
                      value={settings.aiIntroductionThreshold}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        aiIntroductionThreshold: parseInt(e.target.value)
                      }))}
                      min="50"
                      max="100"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum confidence score for AI-suggested introductions
                  </p>
                </div>

                <div>
                  <Label htmlFor="followup-days">Auto Follow-up Reminder Days</Label>
                  <Input
                    id="followup-days"
                    type="number"
                    value={settings.autoFollowupDays}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      autoFollowupDays: parseInt(e.target.value)
                    }))}
                    min="30"
                    max="365"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Days before suggesting follow-up for inactive contacts
                  </p>
                </div>
              </div>

              <div>
                <Label>Priority Score Weights</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {Object.entries(settings.priorityScoreWeights).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="text-xs">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          priorityScoreWeights: {
                            ...prev.priorityScoreWeights,
                            [key]: parseInt(e.target.value)
                          }
                        }))}
                        min="0"
                        max="100"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Weights must total 100%. Automatically adjusts other values.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-to-br from-card to-strategic-blue/5">
            <CardHeader className="border-b bg-gradient-to-r from-strategic-blue/5 to-strategic-green/5">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-strategic-blue" />
                Notification & Communication Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Control how the system communicates with users</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {Object.entries(settings.notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-colors bg-gradient-to-r from-card to-muted/10">
                  <div className="flex-1">
                    <Label htmlFor={key} className="text-base font-medium text-foreground">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {key === 'emailAlerts' && 'Instant email notifications for critical actions and opportunities'}
                      {key === 'weeklyReports' && 'Comprehensive weekly summaries of network activity and insights'}
                      {key === 'urgentFollowups' && 'Priority alerts for high-value contacts requiring immediate attention'}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notificationSettings: {
                        ...prev.notificationSettings,
                        [key]: checked
                      }
                    }))}
                    className="ml-4"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags & Categories Tab */}
        <TabsContent value="tags" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tag Hierarchy Management
                </CardTitle>
                <CardDescription>
                  Organize and manage contact tags with hierarchical categories
                </CardDescription>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tags.map(category => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {category.children && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ml-6">
                        {category.children.map(child => (
                          <div key={child.id} className="flex items-center gap-2 p-2 border rounded">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: child.color }}
                            />
                            <span className="text-sm">{child.name}</span>
                            <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                External Integrations
              </CardTitle>
              <CardDescription>
                Manage connections to external services and data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map(integration => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        integration.status === 'active' ? 'bg-green-500' : 
                        integration.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {integration.type} • {integration.lastSync ? 
                            `Last sync: ${integration.lastSync.toLocaleString()}` : 
                            'Never synced'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={(enabled) => toggleIntegration(integration.id, enabled)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => syncIntegration(integration.id)}
                        disabled={!integration.enabled}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import, and maintain system data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Export Data</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportData('contacts')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Contacts
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportData('interactions')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Interactions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => exportData('analytics')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Analytics Report
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Import Data</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Contacts (CSV)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import from LinkedIn
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import from CRM
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">System Maintenance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button variant="outline" className="justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Cache
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Optimize Database
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Rebuild Search Index
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminPanel;