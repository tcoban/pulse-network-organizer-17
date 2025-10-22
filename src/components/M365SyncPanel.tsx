import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar, Users, Mail, AlertCircle } from 'lucide-react';
import { useM365Sync } from '@/hooks/useM365Sync';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SyncStatus {
  resource_type: string;
  last_sync_at: string | null;
  is_mock: boolean;
}

export const M365SyncPanel = () => {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { syncing, syncContacts, syncCalendar, syncEmails } = useM365Sync();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSyncStatuses();
    }
  }, [user]);

  const fetchSyncStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('m365_sync_status')
        .select('resource_type, last_sync_at, is_mock')
        .eq('user_id', user!.id);

      if (error) throw error;
      setSyncStatuses(data || []);
    } catch (error) {
      console.error('Error fetching sync statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSyncStatus = (resourceType: string) => {
    return syncStatuses.find(s => s.resource_type === resourceType);
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Microsoft 365 Integration
            </CardTitle>
            <CardDescription>
              Sync contacts, calendar, and email interactions
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Mock Mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Currently running in test mode with simulated data.
            See <code className="text-xs">PRODUCTION_CHECKLIST.md</code> to configure real Azure AD integration.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3">
          {/* Contacts Sync */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Outlook Contacts</p>
                <p className="text-xs text-muted-foreground">
                  Last sync: {formatLastSync(getSyncStatus('contacts')?.last_sync_at || null)}
                </p>
              </div>
            </div>
            <Button
              onClick={syncContacts}
              disabled={syncing || loading}
              size="sm"
              variant="outline"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          {/* Calendar Sync */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Calendar Events</p>
                <p className="text-xs text-muted-foreground">
                  Last sync: {formatLastSync(getSyncStatus('calendar')?.last_sync_at || null)}
                </p>
              </div>
            </div>
            <Button
              onClick={syncCalendar}
              disabled={syncing || loading}
              size="sm"
              variant="outline"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          {/* Email Sync */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Interactions</p>
                <p className="text-xs text-muted-foreground">
                  Last sync: {formatLastSync(getSyncStatus('email')?.last_sync_at || null)}
                </p>
              </div>
            </div>
            <Button
              onClick={syncEmails}
              disabled={syncing || loading}
              size="sm"
              variant="outline"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        <Button
          onClick={async () => {
            await syncContacts();
            await syncCalendar();
            await syncEmails();
            fetchSyncStatuses();
          }}
          disabled={syncing}
          className="w-full"
          variant="default"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync All Resources
        </Button>
      </CardContent>
    </Card>
  );
};
