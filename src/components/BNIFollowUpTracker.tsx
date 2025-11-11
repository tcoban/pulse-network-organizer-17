import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContacts } from '@/hooks/useContacts';
import { useBNIContactMetrics } from '@/hooks/useBNIContactMetrics';
import { 
  Calendar, 
  Gift, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowUpItem {
  contactId: string;
  contactName: string;
  company?: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  daysOverdue?: number;
  category: 'meeting' | 'gains' | 'referral' | 'followup';
}

export const BNIFollowUpTracker = () => {
  const { contacts } = useContacts();
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllFollowUps = async () => {
      setLoading(true);
      const allFollowUps: FollowUpItem[] = [];

      // Use a simple approach - just calculate follow-ups synchronously
      for (const contact of contacts.slice(0, 50)) { // Limit to first 50 to avoid performance issues
        // Use the hook's logic but inline to avoid hook rules
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          
          // Get opportunities
          const { data: opportunities } = await supabase
            .from('opportunities')
            .select('type, date')
            .eq('contact_id', contact.id)
            .order('date', { ascending: false });

          // Get GAINS meeting
          const { data: gainsMeeting } = await supabase
            .from('gains_meetings')
            .select('completed')
            .eq('contact_id', contact.id)
            .eq('completed', true)
            .maybeSingle();

          // Get referrals
          const { data: referralsGiven } = await supabase
            .from('referrals_given')
            .select('id')
            .eq('referred_to_contact_id', contact.id);

          const { data: referralsReceived } = await supabase
            .from('referrals_received')
            .select('id')
            .eq('from_contact_id', contact.id);

          // Calculate days since last contact
          const lastContactDate = contact.lastContact 
            ? new Date(contact.lastContact)
            : new Date(opportunities?.[0]?.date || Date.now());
          const daysSinceLastContact = Math.floor(
            (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Find last meeting
          const meetings = opportunities?.filter(o => o.type === 'meeting') || [];
          const lastMeeting = meetings[0];
          const daysSinceMeeting = lastMeeting 
            ? Math.floor((Date.now() - new Date(lastMeeting.date).getTime()) / (1000 * 60 * 60 * 24))
            : 999;

          const refGivenCount = referralsGiven?.length || 0;
          const refReceivedCount = referralsReceived?.length || 0;

          // Generate follow-ups
          if (daysSinceLastContact > 45) {
            allFollowUps.push({
              contactId: contact.id,
              contactName: contact.name,
              company: contact.company,
              action: 'Schedule catch-up meeting',
              priority: daysSinceLastContact > 60 ? 'high' : 'medium',
              daysOverdue: daysSinceLastContact - 45,
              category: 'followup'
            });
          }

          if (!gainsMeeting) {
            allFollowUps.push({
              contactId: contact.id,
              contactName: contact.name,
              company: contact.company,
              action: 'Conduct GAINS meeting',
              priority: 'high',
              category: 'gains'
            });
          }

          if (meetings.length === 0) {
            allFollowUps.push({
              contactId: contact.id,
              contactName: contact.name,
              company: contact.company,
              action: 'Schedule first meeting',
              priority: 'high',
              category: 'meeting'
            });
          } else if (daysSinceMeeting > 90) {
            allFollowUps.push({
              contactId: contact.id,
              contactName: contact.name,
              company: contact.company,
              action: 'Schedule meeting (overdue)',
              priority: 'medium',
              daysOverdue: daysSinceMeeting - 90,
              category: 'meeting'
            });
          }

          if (refReceivedCount > refGivenCount + 2) {
            allFollowUps.push({
              contactId: contact.id,
              contactName: contact.name,
              company: contact.company,
              action: 'Give referral to balance relationship',
              priority: 'low',
              category: 'referral'
            });
          }
        } catch (error) {
          console.error(`Error fetching follow-ups for ${contact.name}:`, error);
        }
      }

      // Sort by priority
      allFollowUps.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setFollowUps(allFollowUps);
      setLoading(false);
    };

    if (contacts.length > 0) {
      fetchAllFollowUps();
    } else {
      setLoading(false);
    }
  }, [contacts]);

  const highPriorityItems = useMemo(() => 
    followUps.filter(f => f.priority === 'high'), [followUps]
  );

  const mediumPriorityItems = useMemo(() => 
    followUps.filter(f => f.priority === 'medium'), [followUps]
  );

  const byCategory = useMemo(() => ({
    meeting: followUps.filter(f => f.category === 'meeting'),
    gains: followUps.filter(f => f.category === 'gains'),
    referral: followUps.filter(f => f.category === 'referral'),
    followup: followUps.filter(f => f.category === 'followup')
  }), [followUps]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'gains': return <Target className="h-4 w-4" />;
      case 'referral': return <Gift className="h-4 w-4" />;
      case 'followup': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const renderFollowUpItem = (item: FollowUpItem) => (
    <div key={`${item.contactId}-${item.action}`} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-1">
          {getCategoryIcon(item.category)}
        </div>
        <div className="flex-1">
          <div className="font-medium">{item.contactName}</div>
          {item.company && (
            <div className="text-xs text-muted-foreground">{item.company}</div>
          )}
          <div className="text-sm text-muted-foreground mt-1">{item.action}</div>
          {item.daysOverdue && item.daysOverdue > 0 && (
            <div className="text-xs text-destructive mt-1">
              {item.daysOverdue} days overdue
            </div>
          )}
        </div>
      </div>
      <Badge 
        variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}
      >
        {item.priority}
      </Badge>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>BNI Follow-up Tracker</span>
          <Badge variant="secondary">{followUps.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="priority" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="priority">By Priority</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="priority" className="space-y-4 mt-4">
            {highPriorityItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  High Priority ({highPriorityItems.length})
                </h3>
                <div className="space-y-2">
                  {highPriorityItems.map(renderFollowUpItem)}
                </div>
              </div>
            )}

            {mediumPriorityItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Medium Priority ({mediumPriorityItems.length})
                </h3>
                <div className="space-y-2">
                  {mediumPriorityItems.slice(0, 5).map(renderFollowUpItem)}
                </div>
              </div>
            )}

            {followUps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No pending follow-ups at this time.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="category" className="space-y-4 mt-4">
            {byCategory.meeting.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Meetings ({byCategory.meeting.length})
                </h3>
                <div className="space-y-2">
                  {byCategory.meeting.map(renderFollowUpItem)}
                </div>
              </div>
            )}

            {byCategory.gains.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  GAINS Meetings ({byCategory.gains.length})
                </h3>
                <div className="space-y-2">
                  {byCategory.gains.map(renderFollowUpItem)}
                </div>
              </div>
            )}

            {byCategory.referral.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Referrals ({byCategory.referral.length})
                </h3>
                <div className="space-y-2">
                  {byCategory.referral.map(renderFollowUpItem)}
                </div>
              </div>
            )}

            {byCategory.followup.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  General Follow-ups ({byCategory.followup.length})
                </h3>
                <div className="space-y-2">
                  {byCategory.followup.map(renderFollowUpItem)}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
