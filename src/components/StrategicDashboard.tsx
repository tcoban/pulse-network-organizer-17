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
      case 'high': return 'text-metric-high bg-metric-high/10 border-metric-high/20';
      case 'medium': return 'text-metric-medium bg-metric-medium/10 border-metric-medium/20';
      case 'low': return 'text-metric-low bg-metric-low/10 border-metric-low/20';
      default: return 'text-muted-foreground bg-muted border-border';
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
      <Card className="bg-gradient-strategic text-white shadow-strategic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-6 w-6" />
            Academic Network Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{metrics.connectionVelocity}</div>
              <div className="text-sm opacity-90">New Connections</div>
              <div className="text-xs opacity-75">per week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{metrics.engagementRate}%</div>
              <div className="text-sm opacity-90">Engagement Rate</div>
              <div className="text-xs opacity-75">active contacts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{metrics.introductionSuccess}</div>
              <div className="text-sm opacity-90">Introductions</div>
              <div className="text-xs opacity-75">this month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {new Intl.NumberFormat('en-CH', { 
                  style: 'currency', 
                  currency: 'CHF',
                  notation: 'compact',
                  minimumFractionDigits: 0 
                }).format(metrics.pipelineValue)}
              </div>
              <div className="text-sm opacity-90">Pipeline Value</div>
              <div className="text-xs opacity-75">estimated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{metrics.influenceScore}</div>
              <div className="text-sm opacity-90">Influence Score</div>
              <div className="text-xs opacity-75">out of 100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions - Consolidated Academic Dashboard */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-background to-muted/50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Priority Actions & Strategic Impact
            </div>
            <Badge className="bg-gradient-primary text-white border-0">
              {insights.length} Actions Identified
            </Badge>
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
            {projects.slice(0, 2).map(project => {
              const progress = project.targetValue ? Math.round((project.currentValue / project.targetValue) * 100) : 0;
              return (
                <div 
                  key={project.id} 
                  className="group p-4 rounded-xl border-2 border-border hover:border-primary/30 cursor-pointer hover:shadow-strategic transition-all duration-300 mb-3 bg-gradient-to-br from-card to-muted/20"
                  onClick={() => onEditProject?.(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                    </div>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'outline'}
                      className={project.status === 'active' ? 'bg-gradient-success text-white border-0' : ''}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  {project.targetValue && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-success h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {project.relatedContacts.length} contacts
                      </span>
                      {project.type === 'fundraising' && project.targetValue && (
                        <span className="flex items-center gap-1 text-strategic-blue font-medium">
                          <DollarSign className="h-3 w-3" />
                          {new Intl.NumberFormat('en-CH', { 
                            style: 'currency', 
                            currency: 'CHF',
                            notation: 'compact'
                          }).format(project.currentValue)} / {new Intl.NumberFormat('en-CH', { 
                            style: 'currency', 
                            currency: 'CHF',
                            notation: 'compact'
                          }).format(project.targetValue)}
                        </span>
                      )}
                    </div>
                    {project.deadline && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(project.deadline, 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Impact/Effort Matrix Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* High Impact Actions */}
            <div className="bg-gradient-to-br from-metric-high/5 to-metric-high/10 rounded-xl p-4 border border-metric-high/20">
              <h3 className="text-sm font-semibold text-metric-high mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                High Impact Actions ({insights.filter(i => i.impact === 'high').length})
              </h3>
              {insights.filter(i => i.impact === 'high').slice(0, 2).map(insight => (
                <div key={insight.id} className="text-xs text-muted-foreground mb-2">
                  • {insight.title}
                </div>
              ))}
            </div>
            
            {/* Quick Wins */}
            <div className="bg-gradient-to-br from-strategic-green/5 to-strategic-green/10 rounded-xl p-4 border border-strategic-green/20">
              <h3 className="text-sm font-semibold text-strategic-green mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Quick Wins ({insights.filter(i => i.effort === 'low').length})
              </h3>
              {insights.filter(i => i.effort === 'low').slice(0, 2).map(insight => (
                <div key={insight.id} className="text-xs text-muted-foreground mb-2">
                  • {insight.title}
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Actions List */}
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const impactValue = { high: 3, medium: 2, low: 1 }[insight.impact];
              const effortValue = { low: 3, medium: 2, high: 1 }[insight.effort];
              const strategicScore = impactValue * effortValue;
              
              return (
                <div 
                  key={insight.id} 
                  className="group p-4 rounded-xl border-2 border-border hover:border-primary/30 cursor-pointer hover:shadow-strategic transition-all duration-300 bg-gradient-to-r from-card to-muted/10"
                  onClick={() => insight.actionUrl && onDrillDown(insight.actionUrl)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getImpactColor(insight.impact)}`}>
                        {getTypeIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${insight.impact === 'high' ? 'border-metric-high text-metric-high' : insight.impact === 'medium' ? 'border-metric-medium text-metric-medium' : 'border-metric-low text-metric-low'}`}
                        >
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {insight.effort} effort
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(strategicScore)].map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-primary"></div>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">Priority</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Contact Visualization */}
                  {insight.relatedContacts.length > 0 && (
                    <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">Related Contacts:</span>
                        <div className="flex -space-x-2">
                          {insight.relatedContacts.slice(0, 4).map((contact, index) => (
                            <div 
                              key={contact.id} 
                              className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-sm"
                              title={contact.name}
                            >
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {insight.relatedContacts.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                              +{insight.relatedContacts.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {insight.dueDate && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Due {format(insight.dueDate, 'MMM dd')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-end">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-primary hover:text-primary-foreground hover:bg-primary group-hover:shadow-sm transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        insight.actionUrl && onDrillDown(insight.actionUrl);
                      }}
                    >
                      Take Action
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategicDashboard;