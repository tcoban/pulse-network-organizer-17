import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Users, 
  UserPlus, 
  TrendingUp, 
  Building2,
  Link as LinkIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowUpRight,
  Handshake,
  Calendar,
  Zap
} from 'lucide-react';
import { useGoals, Goal } from '@/hooks/useGoals';
import { useContactGoals } from '@/hooks/useContactGoals';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ProgressTrendsChart } from './ProgressTrendsChart';

interface GoalWithContacts extends Goal {
  linkedContacts?: Contact[];
  suggestedContacts?: Contact[];
  matchingContactsCount?: number;
}

interface GoalCentricDashboardProps {
  allContacts: Contact[];
  onLinkContactToGoal: (goalId: string) => void;
  onViewGoal: (goalId: string) => void;
  onCreateGoal: () => void;
}

export function GoalCentricDashboard({ 
  allContacts, 
  onLinkContactToGoal,
  onViewGoal,
  onCreateGoal 
}: GoalCentricDashboardProps) {
  const { goals, loading: goalsLoading } = useGoals();
  const { contactGoals } = useContactGoals();
  const { user } = useAuth();
  const [goalsWithData, setGoalsWithData] = useState<GoalWithContacts[]>([]);
  const [kofOffering, setKofOffering] = useState<string>('');
  const [teamMemberEmail, setTeamMemberEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchUserEmail();
    fetchKofOffering();
  }, [user]);

  useEffect(() => {
    if (goals.length > 0 && teamMemberEmail) {
      enrichGoalsWithContacts();
    }
  }, [goals, allContacts, contactGoals, teamMemberEmail, kofOffering]);

  const fetchUserEmail = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setTeamMemberEmail(data.email);
    }
  };

  const fetchKofOffering = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'kof_offering')
        .single();

      if (data?.setting_value) {
        setKofOffering(data.setting_value as string);
      }
    } catch (error) {
      console.error('Error fetching KOF offering:', error);
    }
  };

  const enrichGoalsWithContacts = async () => {
    const enriched = await Promise.all(goals.map(async (goal) => {
      // Check if this goal is assigned to current user
      const isAssignedToMe = goal.assignments?.some(
        assignment => assignment.team_member?.email === teamMemberEmail
      );

      if (!isAssignedToMe && goal.assigned_to !== user?.id) {
        return null; // Skip goals not assigned to current user
      }

      // Get linked contacts
      const linkedContactIds = contactGoals
        .filter(cg => cg.goal_id === goal.id)
        .map(cg => cg.contact_id);
      
      const linkedContacts = allContacts.filter(c => 
        linkedContactIds.includes(c.id)
      );

      // Find suggested contacts based on goal category and description
      const suggestedContacts = findSuggestedContacts(goal, linkedContactIds);

      return {
        ...goal,
        linkedContacts,
        suggestedContacts: suggestedContacts.slice(0, 3),
        matchingContactsCount: suggestedContacts.length
      };
    }));

    setGoalsWithData(enriched.filter(Boolean) as GoalWithContacts[]);
  };

  const findSuggestedContacts = (goal: Goal, excludeIds: string[]): Contact[] => {
    const goalKeywords = `${goal.title} ${goal.description || ''} ${goal.category}`.toLowerCase();
    const keywords = goalKeywords.split(/\s+/).filter(w => w.length > 3);

    // First priority: Match with KOF offering
    const kofMatches = allContacts.filter(contact => {
      if (excludeIds.includes(contact.id)) return false;
      if (!contact.lookingFor) return false;

      const contactNeeds = contact.lookingFor.toLowerCase();
      const kofKeywords = kofOffering.toLowerCase().split(/\s+/).filter(w => w.length > 3);

      return kofKeywords.some(kofWord =>
        contactNeeds.includes(kofWord)
      );
    });

    // Second priority: Match contacts' offerings with goal keywords
    const matches = allContacts.filter(contact => {
      if (excludeIds.includes(contact.id)) return false;
      if (!contact.offering) return false;

      const offeringLower = contact.offering.toLowerCase();
      return keywords.some(keyword => 
        offeringLower.includes(keyword)
      );
    });

    return [...kofMatches, ...matches].slice(0, 10);
  };

  const getGoalStatusColor = (goal: Goal) => {
    if (goal.status === 'completed') return 'text-green-600 bg-green-50';
    if (goal.progress_percentage > 70) return 'text-blue-600 bg-blue-50';
    if (goal.progress_percentage > 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getNextAction = (goal: GoalWithContacts): string => {
    if (!goal.linkedContacts || goal.linkedContacts.length === 0) {
      return 'Link your first contact to start';
    }
    if (goal.suggestedContacts && goal.suggestedContacts.length > 0) {
      return `${goal.suggestedContacts.length} potential contacts found`;
    }
    if (goal.progress_percentage < 50) {
      return 'Follow up with linked contacts';
    }
    return 'Track progress and outcomes';
  };

  if (goalsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading your goals...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (goalsWithData.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            Your Goals Dashboard
          </CardTitle>
          <CardDescription>
            Goals define what you're looking for. Start by creating your first goal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Goals Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Goals help you track what you're looking for. Once created, you'll link contacts 
              who can help achieve these goals, and we'll suggest potential matches.
            </p>
            <Button onClick={onCreateGoal}>
              <Target className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalContacts = allContacts.length;
  const totalLinkedContacts = goalsWithData.reduce((sum, g) => sum + (g.linkedContacts?.length || 0), 0);
  const totalPotentialMatches = goalsWithData.reduce((sum, g) => sum + (g.matchingContactsCount || 0), 0);
  const activeGoals = goalsWithData.filter(g => g.status === 'active').length;
  const avgProgress = goalsWithData.length > 0 
    ? Math.round(goalsWithData.reduce((sum, g) => sum + g.progress_percentage, 0) / goalsWithData.length)
    : 0;

  // Priority items
  const goalsNeedingAttention = goalsWithData.filter(g => 
    g.status === 'active' && (!g.linkedContacts || g.linkedContacts.length === 0)
  );
  const goalsWithSuggestions = goalsWithData.filter(g => 
    g.suggestedContacts && g.suggestedContacts.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Your Network Dashboard</CardTitle>
          <CardDescription>Track your goals, connections, and opportunities at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Active Goals</span>
              </div>
              <div className="text-4xl font-bold text-primary">{activeGoals}</div>
              <Progress value={avgProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{avgProgress}% avg completion</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Total Contacts</span>
              </div>
              <div className="text-4xl font-bold">{totalContacts}</div>
              <p className="text-xs text-muted-foreground">
                {totalLinkedContacts} linked to goals
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm font-medium">Opportunities</span>
              </div>
              <div className="text-4xl font-bold text-yellow-600">{totalPotentialMatches}</div>
              <p className="text-xs text-muted-foreground">Suggested matches</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <div className="text-4xl font-bold text-green-600">{avgProgress}%</div>
              <p className="text-xs text-muted-foreground">Average completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <CardTitle>Priority Actions</CardTitle>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              {goalsNeedingAttention.length + goalsWithSuggestions.length} items
            </Badge>
          </div>
          <CardDescription>Take these actions to move your goals forward</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {goalsNeedingAttention.length > 0 && (
            <div className="bg-background p-4 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    {goalsNeedingAttention.length} goal{goalsNeedingAttention.length !== 1 ? 's' : ''} need{goalsNeedingAttention.length === 1 ? 's' : ''} contacts
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Link contacts to these goals to start tracking progress and finding opportunities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {goalsNeedingAttention.slice(0, 3).map(goal => (
                      <Button
                        key={goal.id}
                        variant="outline"
                        size="sm"
                        onClick={() => onLinkContactToGoal(goal.id)}
                        className="text-xs"
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Link to "{goal.title}"
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {goalsWithSuggestions.length > 0 && (
            <div className="bg-background p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    {totalPotentialMatches} potential contact match{totalPotentialMatches !== 1 ? 'es' : ''} found
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Review these AI-suggested contacts that could help with your goals
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {goalsWithSuggestions.slice(0, 3).map(goal => (
                      <Button
                        key={goal.id}
                        variant="outline"
                        size="sm"
                        onClick={() => onViewGoal(goal.id)}
                        className="text-xs"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        View {goal.matchingContactsCount} for "{goal.title}"
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {goalsNeedingAttention.length === 0 && goalsWithSuggestions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No urgent actions needed right now</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Trends Chart */}
      <ProgressTrendsChart goals={goalsWithData} />

      {/* Active Goals Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Active Goals</h2>
            <p className="text-sm text-muted-foreground">Monitor progress and link contacts to achieve your objectives</p>
          </div>
          <Button onClick={onCreateGoal}>
            <Target className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </div>

        {goalsWithData.map((goal) => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge variant="outline" className={getGoalStatusColor(goal)}>
                      {goal.status}
                    </Badge>
                    <Badge variant="secondary">{goal.category}</Badge>
                  </div>
                  {goal.description && (
                    <CardDescription className="text-sm">
                      {goal.description}
                    </CardDescription>
                  )}
                  {goal.project && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      Project: {goal.project.title}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewGoal(goal.id)}
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{goal.progress_percentage}%</span>
                </div>
                <Progress value={goal.progress_percentage} />
              </div>

              {/* Linked Contacts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Linked Contacts ({goal.linkedContacts?.length || 0})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLinkContactToGoal(goal.id)}
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Link Contact
                  </Button>
                </div>
                
                {goal.linkedContacts && goal.linkedContacts.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {goal.linkedContacts.map(contact => (
                      <Badge key={contact.id} variant="secondary">
                        {contact.name}
                        {contact.company && ` - ${contact.company}`}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    No contacts linked yet. Link contacts who can help with this goal.
                  </div>
                )}
              </div>

              {/* Suggested Contacts */}
              {goal.suggestedContacts && goal.suggestedContacts.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Suggested Contacts ({goal.matchingContactsCount})
                  </h4>
                  <div className="space-y-2">
                    {goal.suggestedContacts.map(contact => (
                      <div 
                        key={contact.id}
                        className="flex items-center justify-between p-2 bg-accent/20 rounded-md text-sm"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {contact.offering ? `Offers: ${contact.offering.substring(0, 60)}...` : contact.company}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLinkContactToGoal(goal.id)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Link
                        </Button>
                      </div>
                    ))}
                  </div>
                  {goal.matchingContactsCount! > 3 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="w-full"
                      onClick={() => onViewGoal(goal.id)}
                    >
                      View all {goal.matchingContactsCount} suggestions
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              )}

              {/* Next Action - More prominent */}
              <div className="flex items-center justify-between bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">NEXT ACTION</p>
                    <p className="font-semibold">{getNextAction(goal)}</p>
                  </div>
                </div>
                {(!goal.linkedContacts || goal.linkedContacts.length === 0) && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onLinkContactToGoal(goal.id)}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Start Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Guide */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            Workflow Guide
          </CardTitle>
          <CardDescription>Follow this process to maximize your network value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
              <h4 className="font-semibold text-sm">Set Goals</h4>
              <p className="text-xs text-muted-foreground">Define what you're looking to achieve or find</p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
              <h4 className="font-semibold text-sm">Link Contacts</h4>
              <p className="text-xs text-muted-foreground">Connect people who can help with your goals</p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
              <h4 className="font-semibold text-sm">Review Matches</h4>
              <p className="text-xs text-muted-foreground">Check AI-suggested contacts and connections</p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
              <h4 className="font-semibold text-sm">Make Introductions</h4>
              <p className="text-xs text-muted-foreground">Connect contacts and track outcomes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
