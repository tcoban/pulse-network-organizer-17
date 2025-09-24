import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Brain, 
  Zap, 
  Clock,
  DollarSign,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'partnership' | 'networking' | 'policy';
  targetValue?: number;
  currentValue: number;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  relatedContacts: string[];
  status: 'planning' | 'active' | 'completed' | 'paused';
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
  }>;
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
  onCreateProject?: () => void;
  onEditProject?: (project: Project) => void;
}

const StrategicDashboard = ({ contacts, onNavigate, onDrillDown, onCreateProject, onEditProject }: StrategicDashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
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

      // Generate contact-centric projects
      const contactProjects: Project[] = [
        {
          id: 'research-funding',
          title: 'AI Research Funding Initiative',
          description: 'Secure funding through strategic academic partnerships',
          type: 'fundraising',
          targetValue: 2000000,
          currentValue: 750000,
          deadline: new Date(2024, 5, 30),
          priority: 'high',
          relatedContacts: highValueContacts.map(c => c.id).slice(0, 8),
          status: 'active',
          milestones: [
            { id: 'm1', title: 'Identify funding contacts', completed: true },
            { id: 'm2', title: 'Schedule meetings', completed: false },
            { id: 'm3', title: 'Submit proposals', completed: false }
          ]
        },
        {
          id: 'academic-partnerships',
          title: 'Swiss University Collaboration Network',
          description: 'Establish partnerships with key academic institutions',
          type: 'partnership',
          targetValue: 12,
          currentValue: 4,
          deadline: new Date(2024, 8, 30),
          priority: 'medium',
          relatedContacts: contacts.filter(c => c.company && c.company.toLowerCase().includes('university')).map(c => c.id),
          status: 'active',
          milestones: [
            { id: 'm1', title: 'Map university contacts', completed: true },
            { id: 'm2', title: 'Initial outreach', completed: false }
          ]
        }
      ];

      setProjects(contactProjects);

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

    // Find urgent follow-ups based on academic relationship value
    const urgentFollowups = contacts.filter(contact => {
      if (!contact.lastContact) return true;
      const daysSince = (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 90 && (contact.potentialScore >= 4 || contact.cooperationRating >= 4);
    });

    if (urgentFollowups.length > 0) {
      insights.push({
        id: 'urgent-followups',
        type: 'urgent',
        title: `${urgentFollowups.length} Key Academic Contacts Need Follow-up`,
        description: 'High-value academic contacts haven\'t been engaged in 90+ days',
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
        title: `${introOpportunities.length} Academic Collaboration Opportunities`,
        description: 'Contacts with complementary research interests and expertise identified',
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
        title: `${upcomingMeetings.length} Academic Meetings Need Preparation`,
        description: 'Upcoming meetings this week require strategic preparation',
        impact: 'medium',
        effort: 'medium',
        dueDate: addDays(new Date(), 2),
        relatedContacts: upcomingMeetings,
        actionUrl: 'team-opportunities'
      });
    }

    return insights.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { low: 3, medium: 2, high: 1 };
      
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

        // Academic matching with research focus
        const hasAcademicMatch = (
          (contact1.potentialScore >= 4 || contact2.potentialScore >= 4) &&
          isKeywordMatch(contact1.offering, contact2.lookingFor) ||
          isKeywordMatch(contact2.offering, contact1.lookingFor)
        );

        if (hasAcademicMatch) {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map(i => (
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
            Academic Network Performance
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
              <div className="text-xs text-muted-foreground">Academic Influence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions - Consolidated Academic Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Priority Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact-Centric Projects */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Contact-Driven Academic Projects
              </h3>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onCreateProject}
              >
                New Project
              </Button>
            </div>
            {projects.slice(0, 2).map(project => (
              <div 
                key={project.id} 
                className="space-y-2 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow mb-2"
                onClick={() => onEditProject?.(project)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{project.title}</h4>
                  <Badge variant={project.status === 'active' ? 'default' : 'outline'}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{project.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {project.relatedContacts.length} contacts involved
                  </span>
                  {project.deadline && (
                    <span className="text-muted-foreground">
                      Due: {format(project.deadline, 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actionable Insights */}
          {insights.map(insight => (
            <div 
              key={insight.id} 
              className="space-y-2 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => insight.actionUrl && onDrillDown(insight.actionUrl)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${getImpactColor(insight.impact)}`}>
                    {getTypeIcon(insight.type)}
                  </div>
                  <h4 className="text-sm font-medium">{insight.title}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {insight.impact} impact
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {insight.effort} effort
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{insight.description}</p>
              
              {/* Related Contacts Preview */}
              {insight.relatedContacts.length > 0 && (
                <div className="ml-6 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Contacts:</span>
                  <div className="flex -space-x-1">
                    {insight.relatedContacts.slice(0, 3).map((contact, index) => (
                      <div 
                        key={contact.id} 
                        className="w-6 h-6 rounded-full bg-primary/10 border border-background flex items-center justify-center text-xs font-medium"
                        title={contact.name}
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {insight.relatedContacts.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted border border-background flex items-center justify-center text-xs">
                        +{insight.relatedContacts.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {insight.dueDate && (
                <div className="ml-6 text-xs text-muted-foreground">
                  Due: {format(insight.dueDate, 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategicDashboard;