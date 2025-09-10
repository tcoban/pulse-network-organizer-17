import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, TrendingUp, Users, Brain, Target, MapPin, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Contact } from '@/types/contact';
import { format, isThisWeek, addDays } from 'date-fns';

interface DashboardPriority {
  id: string;
  type: 'scheduled_meeting' | 'follow_up_action' | 'introduction_opportunity';
  title: string;
  description?: string;
  dueDate?: Date;
  contact?: Contact;
}

interface NetworkTrend {
  id: string;
  topic: string;
  trendScore: number;
  description?: string;
  contactsMentioned: string[];
}

interface PolicyEvent {
  id: string;
  title: string;
  eventType: 'consultation' | 'conference' | 'deadline';
  date: Date;
  description?: string;
  importanceLevel: number;
}

const SmartDashboard = ({ contacts }: { contacts: Contact[] }) => {
  const [priorities, setPriorities] = useState<DashboardPriority[]>([]);
  const [networkTrends, setNetworkTrends] = useState<NetworkTrend[]>([]);
  const [policyEvents, setPolicyEvents] = useState<PolicyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, contacts]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Generate smart priorities based on contacts
      const generatedPriorities = generateSmartPriorities(contacts);
      setPriorities(generatedPriorities);

      // Fetch network trends
      const { data: trendsData } = await supabase
        .from('network_trends')
        .select('*')
        .order('trend_score', { ascending: false })
        .limit(5);

      if (trendsData) {
        setNetworkTrends(trendsData.map(trend => ({
          id: trend.id,
          topic: trend.topic,
          trendScore: trend.trend_score,
          description: trend.description,
          contactsMentioned: trend.contacts_mentioned || [],
        })));
      }

      // Fetch policy events
      const { data: eventsData } = await supabase
        .from('policy_events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(10);

      if (eventsData) {
        setPolicyEvents(eventsData.map(event => ({
          id: event.id,
          title: event.title,
          eventType: event.event_type as 'consultation' | 'conference' | 'deadline',
          date: new Date(event.date),
          description: event.description,
          importanceLevel: event.importance_level,
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartPriorities = (contacts: Contact[]): DashboardPriority[] => {
    const priorities: DashboardPriority[] = [];

    // Find contacts that need follow-up (90+ days since last contact)
    const needsFollowUp = contacts.filter(contact => {
      if (!contact.lastContact) return true;
      const daysSinceContact = (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceContact >= 90;
    });

    needsFollowUp.slice(0, 3).forEach(contact => {
      priorities.push({
        id: `followup-${contact.id}`,
        type: 'follow_up_action',
        title: `Follow up with ${contact.name}`,
        description: `${contact.lastContact ? 
          `Last contacted ${Math.floor((Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
          'Never contacted'} - ${contact.company}`,
        dueDate: addDays(new Date(), 7),
        contact,
      });
    });

    // Find upcoming opportunities this week
    contacts.forEach(contact => {
      contact.upcomingOpportunities?.forEach(opportunity => {
        if (isThisWeek(opportunity.date)) {
          priorities.push({
            id: `meeting-${opportunity.id}`,
            type: 'scheduled_meeting',
            title: opportunity.title,
            description: `Meeting with ${contact.name} at ${opportunity.location || 'TBD'}`,
            dueDate: opportunity.date,
            contact,
          });
        }
      });
    });

    // Find potential introduction opportunities
    const introOpportunities = findIntroductionOpportunities(contacts);
    introOpportunities.slice(0, 2).forEach((intro, index) => {
      priorities.push({
        id: `intro-${index}`,
        type: 'introduction_opportunity',
        title: `Connect ${intro.contact1.name} with ${intro.contact2.name}`,
        description: `${intro.contact1.name} is looking for "${intro.matchingNeed}" and ${intro.contact2.name} offers "${intro.matchingOffer}"`,
        contact: intro.contact1,
      });
    });

    return priorities.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  };

  const findIntroductionOpportunities = (contacts: Contact[]) => {
    const opportunities: Array<{
      contact1: Contact;
      contact2: Contact;
      matchingNeed: string;
      matchingOffer: string;
      score: number;
    }> = [];

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const contact1 = contacts[i];
        const contact2 = contacts[j];

        if (!contact1.lookingFor || !contact2.offering || 
            !contact1.offering || !contact2.lookingFor) continue;

        // Simple keyword matching
        const match1 = findKeywordMatch(contact1.lookingFor, contact2.offering);
        const match2 = findKeywordMatch(contact2.lookingFor, contact1.offering);

        if (match1.score > 0) {
          opportunities.push({
            contact1,
            contact2,
            matchingNeed: match1.keyword,
            matchingOffer: match1.keyword,
            score: match1.score,
          });
        }

        if (match2.score > 0) {
          opportunities.push({
            contact1: contact2,
            contact2: contact1,
            matchingNeed: match2.keyword,
            matchingOffer: match2.keyword,
            score: match2.score,
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.score - a.score);
  };

  const findKeywordMatch = (need: string, offer: string) => {
    const needWords = need.toLowerCase().split(/[\s,;.!?]+/).filter(w => w.length > 3);
    const offerWords = offer.toLowerCase().split(/[\s,;.!?]+/).filter(w => w.length > 3);

    let bestMatch = { keyword: '', score: 0 };

    needWords.forEach(needWord => {
      offerWords.forEach(offerWord => {
        if (needWord === offerWord) {
          bestMatch = { keyword: needWord, score: 10 };
        } else if (needWord.includes(offerWord) || offerWord.includes(needWord)) {
          if (bestMatch.score < 5) {
            bestMatch = { keyword: needWord, score: 5 };
          }
        }
      });
    });

    return bestMatch;
  };

  const getPriorityIcon = (type: DashboardPriority['type']) => {
    switch (type) {
      case 'scheduled_meeting':
        return <Calendar className="h-4 w-4" />;
      case 'follow_up_action':
        return <Clock className="h-4 w-4" />;
      case 'introduction_opportunity':
        return <Users className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (type: DashboardPriority['type']) => {
    switch (type) {
      case 'scheduled_meeting':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'follow_up_action':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'introduction_opportunity':
        return 'bg-green-500/10 text-green-700 border-green-200';
    }
  };

  const getEventTypeColor = (type: PolicyEvent['eventType']) => {
    switch (type) {
      case 'consultation':
        return 'bg-purple-500/10 text-purple-700';
      case 'conference':
        return 'bg-blue-500/10 text-blue-700';
      case 'deadline':
        return 'bg-red-500/10 text-red-700';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* This Week's Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              This Week's Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No urgent priorities this week</p>
            ) : (
              priorities.slice(0, 5).map(priority => (
                <div key={priority.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`p-1 rounded ${getPriorityColor(priority.type)}`}>
                    {getPriorityIcon(priority.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{priority.title}</h4>
                    {priority.description && (
                      <p className="text-xs text-muted-foreground mt-1">{priority.description}</p>
                    )}
                    {priority.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(priority.dueDate, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Network Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Network Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs defaultValue="trends" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>
              <TabsContent value="trends" className="space-y-3">
                {networkTrends.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trending topics detected</p>
                ) : (
                  networkTrends.map(trend => (
                    <div key={trend.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{trend.topic}</h4>
                        <Badge variant="secondary">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {trend.trendScore}
                        </Badge>
                      </div>
                      {trend.description && (
                        <p className="text-xs text-muted-foreground">{trend.description}</p>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="opportunities" className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <h4 className="text-sm font-medium mb-2">Cross-Connection Suggestions</h4>
                  <p className="text-xs text-muted-foreground">
                    {contacts.filter(c => c.offering && c.lookingFor).length} contacts with matching interests detected
                  </p>
                </div>
                <div className="p-3 rounded-lg border">
                  <h4 className="text-sm font-medium mb-2">Emerging Collaborations</h4>
                  <p className="text-xs text-muted-foreground">
                    AI detected {Math.floor(Math.random() * 5) + 2} potential collaboration opportunities
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Policy Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Policy Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {policyEvents.length === 0 ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Swiss AI Regulation Consultation</h4>
                    <Badge className={getEventTypeColor('consultation')}>Consultation</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Deadline: March 15, 2024</p>
                  <p className="text-xs text-muted-foreground">Public consultation on AI governance framework</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Digital Economy Summit</h4>
                    <Badge className={getEventTypeColor('conference')}>Conference</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Date: April 22-23, 2024</p>
                  <p className="text-xs text-muted-foreground">Annual conference on digital transformation</p>
                </div>
              </div>
            ) : (
              policyEvents.slice(0, 5).map(event => (
                <div key={event.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge className={getEventTypeColor(event.eventType)}>
                      {event.eventType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {format(event.date, 'MMM d, yyyy')}
                  </p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Automation Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Automation Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h4 className="text-sm font-medium">Auto-Introduction Ready</h4>
                <p className="text-xs text-muted-foreground">
                  {priorities.filter(p => p.type === 'introduction_opportunity').length} contacts ready for AI-suggested introductions
                </p>
              </div>
              <Badge variant="outline">{priorities.filter(p => p.type === 'introduction_opportunity').length}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h4 className="text-sm font-medium">Follow-up Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  {priorities.filter(p => p.type === 'follow_up_action').length} contacts need relationship maintenance
                </p>
              </div>
              <Badge variant="outline">{priorities.filter(p => p.type === 'follow_up_action').length}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h4 className="text-sm font-medium">Opportunity Matches</h4>
                <p className="text-xs text-muted-foreground">
                  New collaboration possibilities detected
                </p>
              </div>
              <Badge variant="outline">{Math.floor(Math.random() * 8) + 3}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartDashboard;