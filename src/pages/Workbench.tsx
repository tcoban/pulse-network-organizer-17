import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkbench } from '@/hooks/useWorkbench';
import { NotificationCenter } from '@/components/NotificationCenter';
import { AchievementShowcase } from '@/components/AchievementShowcase';
import { RelationshipDecayAlerts } from '@/components/RelationshipDecayAlerts';
import { QuickActionDialog } from '@/components/QuickActionDialog';
import OpportunityFormEnhanced from '@/components/OpportunityFormEnhanced';
import { 
  Flame, Trophy, Target, TrendingUp, Users, Calendar,
  CheckCircle2, AlertCircle, Star, Zap, Award,
  ArrowRight, Phone, Mail, Coffee, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';

export default function Workbench() {
  const { 
    dailyTasks, 
    achievements, 
    streak, 
    relationshipHealth,
    smartSuggestions,
    weeklyGoals,
    loading,
    userLevel,
    completeTask,
    dismissSuggestion
  } = useWorkbench();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedContact, setSelectedContact] = useState<{ 
    id: string; 
    name: string;
    taskId?: string;
    taskType?: string;
  } | null>(null);
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [opportunityContactId, setOpportunityContactId] = useState<string | null>(null);

  // Handle URL parameters for direct actions
  useEffect(() => {
    const contactId = searchParams.get('contactId');
    const action = searchParams.get('action');
    
    if (contactId && action === 'opportunity') {
      setOpportunityContactId(contactId);
      setOpportunityFormOpen(true);
      // Clear URL params after opening dialog
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Coffee;
      case 'referral': return UserPlus;
      default: return Target;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Gamification */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">My Workbench</h1>
          <p className="text-muted-foreground mt-1">Your command center for relationship excellence</p>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationCenter />
          
          <div className="flex gap-4">
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Flame className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold text-foreground">{streak.current} days</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Level {userLevel}</p>
                <p className="text-2xl font-bold text-foreground">{achievements.totalPoints} XP</p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Weekly Goals Progress</h3>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              {weeklyGoals.completed}/{weeklyGoals.total} completed
            </Badge>
          </div>
          <Progress value={(weeklyGoals.completed / weeklyGoals.total) * 100} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{Math.round((weeklyGoals.completed / weeklyGoals.total) * 100)}% Complete</span>
            <span>{weeklyGoals.total - weeklyGoals.completed} remaining</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
          <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="health">Relationship Health</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Daily Tasks */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={selectedPriority === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPriority('all')}
            >
              All Tasks
            </Button>
            <Button 
              variant={selectedPriority === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPriority('high')}
            >
              High Priority
            </Button>
            <Button 
              variant={selectedPriority === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPriority('medium')}
            >
              Medium Priority
            </Button>
            <Button 
              variant={selectedPriority === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPriority('low')}
            >
              Low Priority
            </Button>
          </div>

          <div className="grid gap-4">
            {dailyTasks
              .filter(task => selectedPriority === 'all' || task.priority === selectedPriority)
              .map(task => {
                const ActionIcon = getActionIcon(task.actionType);
                return (
                  <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${task.completed ? 'bg-success/10' : 'bg-primary/10'}`}>
                          {task.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-success" />
                          ) : (
                            <ActionIcon className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{task.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            </div>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>

                          {task.contact && (
                            <div className="flex items-center gap-2 mt-3 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">{task.contact.name}</span>
                              {task.contact.company && (
                                <span className="text-muted-foreground">• {task.contact.company}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning" />
                                +{task.xpReward} XP
                              </span>
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(task.dueDate), 'MMM dd')}
                                </span>
                              )}
                            </div>

                            {!task.completed && (
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  if (task.contact) {
                                    setSelectedContact({
                                      id: task.contact.id,
                                      name: task.contact.name,
                                      taskId: task.id,
                                      taskType: task.actionType
                                    });
                                  }
                                }}
                                disabled={!task.contact}
                              >
                                Take Action
                                <CheckCircle2 className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            {dailyTasks.filter(task => selectedPriority === 'all' || task.priority === selectedPriority).length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    You've completed all your tasks for today. Great work!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Smart Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4">
            {smartSuggestions.map(suggestion => (
              <Card key={suggestion.id} className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <Zap className="h-6 w-6 text-accent" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            {suggestion.title}
                            {suggestion.confidence > 80 && (
                              <Badge variant="outline" className="text-success border-success">
                                High Match
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
                        </div>
                        <Badge variant="secondary">{suggestion.type}</Badge>
                      </div>

                      {suggestion.relatedContacts && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {suggestion.relatedContacts.map(contact => (
                            <Badge key={contact.id} variant="outline" className="text-foreground">
                              {contact.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-4">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => {
                            if (suggestion.relatedContacts && suggestion.relatedContacts.length > 0) {
                              setSelectedContact({
                                id: suggestion.relatedContacts[0].id,
                                name: suggestion.relatedContacts[0].name
                              });
                            }
                          }}
                        >
                          Take Action
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => dismissSuggestion(suggestion.id)}
                        >
                          Dismiss
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {suggestion.confidence}% match confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Relationship Health */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4">
            {relationshipHealth.map(contact => (
              <Card key={contact.contactId}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      contact.healthScore >= 80 ? 'bg-success/10' :
                      contact.healthScore >= 50 ? 'bg-warning/10' :
                      'bg-destructive/10'
                    }`}>
                      {contact.healthScore >= 80 ? (
                        <TrendingUp className="h-6 w-6 text-success" />
                      ) : contact.healthScore >= 50 ? (
                        <AlertCircle className="h-6 w-6 text-warning" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{contact.contactName}</h4>
                          {contact.company && (
                            <p className="text-sm text-muted-foreground">{contact.company}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{contact.healthScore}%</div>
                          <p className="text-xs text-muted-foreground">Health Score</p>
                        </div>
                      </div>

                      <Progress value={contact.healthScore} className="h-2 mb-4" />

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Last Contact</p>
                          <p className="text-sm font-medium text-foreground">
                            {contact.lastContactDays} days ago
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Interactions</p>
                          <p className="text-sm font-medium text-foreground">
                            {contact.totalInteractions}
                          </p>
                        </div>
                      </div>

                      {contact.suggestions.length > 0 && (
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium text-foreground mb-2">Recommended Actions:</p>
                          <ul className="space-y-1">
                            {contact.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <ArrowRight className="h-3 w-3" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-4">
          <AchievementShowcase 
            achievements={achievements.recent}
            totalPoints={achievements.totalPoints}
          />
        </TabsContent>
      </Tabs>

      {selectedContact && (
        <QuickActionDialog
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          contactId={selectedContact.id}
          contactName={selectedContact.name}
          taskId={selectedContact.taskId}
          taskType={selectedContact.taskType}
          onActionCompleted={(actionTaken) => {
            if (selectedContact.taskId) {
              completeTask(selectedContact.taskId, actionTaken);
            }
          }}
        />
      )}

      <OpportunityFormEnhanced
        contactId={opportunityContactId || ''}
        isOpen={opportunityFormOpen}
        onClose={() => {
          setOpportunityFormOpen(false);
          setOpportunityContactId(null);
        }}
      />
    </div>
  );
}
