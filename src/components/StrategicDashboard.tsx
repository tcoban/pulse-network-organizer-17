import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  Brain, 
  Zap, 
  MapPin, 
  Clock,
  DollarSign,
  Network,
  Settings,
  ChevronRight,
  Star,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact';
import { format, isThisWeek, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'partnership' | 'networking' | 'policy';
  targetValue?: number;
  currentValue: number;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  relatedContacts: string[];
}

interface ActionableInsight {
  id: string;
  type: 'urgent' | 'opportunity' | 'followup' | 'introduction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  dueDate?: Date;
  relatedContacts: Contact[];
  actionUrl?: string;
}

interface NetworkMetrics {
  connectionVelocity: number; // New meaningful connections per week
  engagementRate: number; // % of contacts engaged recently
  introductionSuccess: number; // Successful introductions made
  pipelineValue: number; // Estimated value of opportunities
  influenceScore: number; // Network reach and influence
}

interface StrategicDashboardProps {
  contacts: Contact[];
  onNavigate: (destination: string, context?: any) => void;
  onDrillDown: (type: string, filters?: any) => void;
}

const StrategicDashboard = ({ contacts, onNavigate, onDrillDown }: StrategicDashboardProps) => {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [insights, setInsights] = useState<ActionableInsight[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    connectionVelocity: 0,
    engagementRate: 0,
    introductionSuccess: 0,
    pipelineValue: 0,
    influenceScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateStrategicInsights();
  }, [contacts]);

  const generateStrategicInsights = async () => {
    try {
      setLoading(true);

      // Calculate network metrics
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      
      const recentContacts = contacts.filter(c => 
        c.addedDate >= weekStart && c.addedDate <= weekEnd
      );
      
      const recentlyEngaged = contacts.filter(c => 
        c.lastContact && c.lastContact >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      const highValueContacts = contacts.filter(c => 
        c.potentialScore >= 4 || c.cooperationRating >= 4
      );

      const calculatedMetrics: NetworkMetrics = {
        connectionVelocity: recentContacts.length,
        engagementRate: Math.round((recentlyEngaged.length / Math.max(contacts.length, 1)) * 100),
        introductionSuccess: Math.floor(Math.random() * 8) + 2, // Mock data for now
        pipelineValue: highValueContacts.length * 50000, // Estimated value
        influenceScore: Math.min(100, contacts.length * 2 + highValueContacts.length * 5)
      };

      setMetrics(calculatedMetrics);

      // Generate strategic goals
      const strategicGoals: StrategicGoal[] = [
        {
          id: 'fundraising-q1',
          title: 'Q1 Fundraising Target',
          description: 'Secure CHF 2M in research funding through strategic partnerships',
          type: 'fundraising',
          targetValue: 2000000,
          currentValue: 750000,
          deadline: new Date(2024, 2, 31), // March 31, 2024
          priority: 'high',
          relatedContacts: highValueContacts.map(c => c.id).slice(0, 5)
        },
        {
          id: 'partnership-expansion',
          title: 'Industry Partnership Program',
          description: 'Establish 12 new strategic industry partnerships',
          type: 'partnership',
          targetValue: 12,
          currentValue: 4,
          deadline: new Date(2024, 5, 30), // June 30, 2024
          priority: 'medium',
          relatedContacts: contacts.filter(c => c.company).map(c => c.id).slice(0, 8)
        },
        {
          id: 'policy-influence',
          title: 'Swiss AI Policy Influence',
          description: 'Active participation in 5 key policy consultations',
          type: 'policy',
          targetValue: 5,
          currentValue: 2,
          deadline: new Date(2024, 11, 31), // Dec 31, 2024
          priority: 'high',
          relatedContacts: contacts.filter(c => 
            c.tags.some(tag => tag.toLowerCase().includes('policy') || tag.toLowerCase().includes('government'))
          ).map(c => c.id)
        }
      ];

      setGoals(strategicGoals);

      // Generate actionable insights
      const actionableInsights = generateActionableInsights(contacts);
      setInsights(actionableInsights);

    } catch (error) {
      console.error('Error generating strategic insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateActionableInsights = (contacts: Contact[]): ActionableInsight[] => {
    const insights: ActionableInsight[] = [];

    // Find urgent follow-ups
    const urgentFollowups = contacts.filter(contact => {
      if (!contact.lastContact) return true;
      const daysSince = (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 90 && (contact.potentialScore >= 4 || contact.cooperationRating >= 4);
    });

    if (urgentFollowups.length > 0) {
      insights.push({
        id: 'urgent-followups',
        type: 'urgent',
        title: `${urgentFollowups.length} High-Value Contacts Need Attention`,
        description: 'Key contacts with high potential scores haven\'t been contacted in 90+ days',
        impact: 'high',
        effort: 'low',
        dueDate: addDays(new Date(), 3),
        relatedContacts: urgentFollowups.slice(0, 3),
        actionUrl: 'followup-alerts'
      });
    }

    // Find strategic introduction opportunities
    const introOpportunities = findStrategicIntroductions(contacts);
    if (introOpportunities.length > 0) {
      insights.push({
        id: 'strategic-intros',
        type: 'opportunity',
        title: `${introOpportunities.length} Strategic Introduction Opportunities`,
        description: 'High-value contacts with complementary needs and offerings identified',
        impact: 'high',
        effort: 'medium',
        relatedContacts: introOpportunities.slice(0, 4),
        actionUrl: 'opportunity-matches'
      });
    }

    // Find upcoming meeting prep needed
    const upcomingMeetings = contacts.filter(contact => 
      contact.upcomingOpportunities?.some(opp => 
        opp.date >= new Date() && opp.date <= addDays(new Date(), 7)
      )
    );

    if (upcomingMeetings.length > 0) {
      insights.push({
        id: 'meeting-prep',
        type: 'followup',
        title: `${upcomingMeetings.length} Meetings Need Preparation`,
        description: 'Upcoming meetings this week require strategic preparation',
        impact: 'medium',
        effort: 'medium',
        dueDate: addDays(new Date(), 2),
        relatedContacts: upcomingMeetings,
        actionUrl: 'team-opportunities'
      });
    }

    // Find relationship building opportunities
    const newContacts = contacts.filter(contact => 
      !contact.lastContact && 
      contact.addedDate >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    );

    if (newContacts.length > 0) {
      insights.push({
        id: 'relationship-building',
        type: 'opportunity',
        title: `${newContacts.length} New Contacts Need Initial Engagement`,
        description: 'Recent contacts haven\'t been engaged yet - perfect for relationship building',
        impact: 'medium',
        effort: 'low',
        relatedContacts: newContacts.slice(0, 5),
        actionUrl: 'recent-interactions'
      });
    }

    return insights.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { low: 3, medium: 2, high: 1 }; // Lower effort = higher score
      
      const scoreA = impactScore[a.impact] * effortScore[a.effort];
      const scoreB = impactScore[b.impact] * effortScore[b.effort];
      
      return scoreB - scoreA;
    });
  };

  const findStrategicIntroductions = (contacts: Contact[]): Contact[] => {
    const opportunities: Contact[] = [];
    const analyzed = new Set<string>();

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const contact1 = contacts[i];
        const contact2 = contacts[j];
        
        if (!contact1.offering || !contact2.lookingFor || 
            !contact1.lookingFor || !contact2.offering) continue;

        const pairKey = [contact1.id, contact2.id].sort().join('-');
        if (analyzed.has(pairKey)) continue;
        analyzed.add(pairKey);

        // Strategic matching with higher standards
        const hasStrategicMatch = (
          (contact1.potentialScore >= 4 || contact2.potentialScore >= 4) &&
          isKeywordMatch(contact1.offering, contact2.lookingFor) ||
          isKeywordMatch(contact2.offering, contact1.lookingFor)
        );

        if (hasStrategicMatch) {
          if (!opportunities.some(c => c.id === contact1.id)) {
            opportunities.push(contact1);
          }
          if (!opportunities.some(c => c.id === contact2.id)) {
            opportunities.push(contact2);
          }
        }
      }
    }

    return opportunities.slice(0, 6);
  };

  const isKeywordMatch = (text1: string, text2: string): boolean => {
    const words1 = text1.toLowerCase().split(/[\s,;.!?]+/).filter(w => w.length > 4);
    const words2 = text2.toLowerCase().split(/[\s,;.!?]+/).filter(w => w.length > 4);
    
    return words1.some(w1 => words2.some(w2 => 
      w1 === w2 || w1.includes(w2) || w2.includes(w1)
    ));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'opportunity': return <Zap className="h-4 w-4" />;
      case 'followup': return <Clock className="h-4 w-4" />;
      case 'introduction': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
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
      {/* Network Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Network Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.connectionVelocity}</div>
              <div className="text-xs text-muted-foreground">New Connections/Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.engagementRate}%</div>
              <div className="text-xs text-muted-foreground">Engagement Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.introductionSuccess}</div>
              <div className="text-xs text-muted-foreground">Introductions Made</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Intl.NumberFormat('en-CH', { 
                  style: 'currency', 
                  currency: 'CHF',
                  minimumFractionDigits: 0 
                }).format(metrics.pipelineValue)}
              </div>
              <div className="text-xs text-muted-foreground">Pipeline Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{metrics.influenceScore}/100</div>
              <div className="text-xs text-muted-foreground">Influence Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Goals & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Strategic Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{goal.title}</h4>
                  <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                    {goal.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{goal.description}</p>
                {goal.targetValue && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{((goal.currentValue / goal.targetValue) * 100).toFixed(0)}% Complete</span>
                      <span>
                        {goal.type === 'fundraising' 
                          ? `${new Intl.NumberFormat('en-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(goal.currentValue)} / ${new Intl.NumberFormat('en-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(goal.targetValue)}`
                          : `${goal.currentValue} / ${goal.targetValue}`
                        }
                      </span>
                    </div>
                    <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                  </div>
                )}
                {goal.deadline && (
                  <p className="text-xs text-muted-foreground">
                    Due: {format(goal.deadline, 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Priority Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.slice(0, 4).map(insight => (
              <div 
                key={insight.id} 
                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getImpactColor(insight.impact)}`}
                onClick={() => insight.actionUrl && onDrillDown(insight.actionUrl)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded">
                    {getTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.effort} effort
                      </Badge>
                    </div>
                    {insight.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(insight.dueDate, 'MMM d')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Strategic Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('strategic-planning')}
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Strategic Planning</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('relationship-mapping')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Relationship Map</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('campaign-management')}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Campaign Manager</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('analytics-insights')}
            >
              <Brain className="h-6 w-6" />
              <span className="text-sm">AI Insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategicDashboard;