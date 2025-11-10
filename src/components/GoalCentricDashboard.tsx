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
  Lightbulb
} from 'lucide-react';
import { useGoals, Goal } from '@/hooks/useGoals';
import { useContactGoals } from '@/hooks/useContactGoals';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goalsWithData.filter(g => g.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Linked Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goalsWithData.reduce((sum, g) => sum + (g.linkedContacts?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Potential Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goalsWithData.reduce((sum, g) => sum + (g.matchingContactsCount || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                goalsWithData.reduce((sum, g) => sum + g.progress_percentage, 0) / 
                goalsWithData.length
              )}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Goals</h2>
          <Button onClick={onCreateGoal} size="sm">
            <Target className="h-4 w-4 mr-2" />
            New Goal
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

              {/* Next Action */}
              <div className="flex items-center justify-between bg-primary/5 p-3 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">Next Action:</span>
                  <span className="text-muted-foreground">{getNextAction(goal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guidance Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <p><strong>Create Goals:</strong> Define what you're looking for (research partners, data sources, expertise, etc.)</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <p><strong>Link Contacts:</strong> Connect contacts who can help achieve your goals</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <p><strong>Track Progress:</strong> Monitor connections and update goal progress</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <p><strong>Make Introductions:</strong> Help contacts connect with each other and with KOF services</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
