import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Target, Filter, Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { AddGoalDialog } from '@/components/AddGoalDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  target_date: string | null;
  progress_percentage: number;
  status: string;
  created_at: string;
  relatedOpportunities?: Array<{
    id: string;
    title: string;
    date: string;
    contact_name: string;
    contact_id: string;
    achieved_goals_count: number;
    total_goals_count: number;
  }>;
}

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('target_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      // Fetch related opportunities for each goal
      const goalsWithOpportunities = await Promise.all(
        (data || []).map(async (goal) => {
          const { data: meetingGoals } = await supabase
            .from('meeting_goals')
            .select(`
              id,
              achieved,
              opportunity_id,
              opportunities (
                id,
                title,
                date,
                contact_id,
                contacts (
                  name
                )
              )
            `)
            .eq('user_goal_id', goal.id);

          const opportunitiesMap = new Map();
          meetingGoals?.forEach((mg: any) => {
            if (mg.opportunities) {
              const oppId = mg.opportunities.id;
              if (!opportunitiesMap.has(oppId)) {
                opportunitiesMap.set(oppId, {
                  id: mg.opportunities.id,
                  title: mg.opportunities.title,
                  date: mg.opportunities.date,
                  contact_id: mg.opportunities.contact_id,
                  contact_name: mg.opportunities.contacts?.name || 'Unknown',
                  achieved_goals_count: 0,
                  total_goals_count: 0,
                });
              }
              const opp = opportunitiesMap.get(oppId);
              opp.total_goals_count++;
              if (mg.achieved) opp.achieved_goals_count++;
            }
          });

          return {
            ...goal,
            relatedOpportunities: Array.from(opportunitiesMap.values()).sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
        })
      );

      setGoals(goalsWithOpportunities);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalExpanded = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ 
          progress_percentage: newProgress,
          status: newProgress === 100 ? 'completed' : 'active'
        })
        .eq('id', goalId);

      if (error) throw error;
      
      await fetchGoals();
      toast.success('Progress updated');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const categories = Array.from(new Set(goals.map(g => g.category)));
  
  const filteredGoals = goals.filter(goal => {
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'missed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Goals
          </h1>
          <p className="text-muted-foreground">Track and manage your personal and team goals</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map(goal => {
          const isExpanded = expandedGoals.has(goal.id);
          const hasOpportunities = (goal.relatedOpportunities?.length || 0) > 0;
          
          return (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
                <Badge variant="outline" className="w-fit">{goal.category}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {goal.description && (
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{goal.progress_percentage}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} />
                </div>

                {goal.target_date && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-medium">
                      {format(new Date(goal.target_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}

                {hasOpportunities && (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleGoalExpanded(goal.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {goal.relatedOpportunities?.length} Related Meeting{goal.relatedOpportunities?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {goal.relatedOpportunities?.map(opp => (
                        <div key={opp.id} className="p-2 bg-muted/50 rounded text-xs space-y-1">
                          <div className="font-medium">{opp.title}</div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(opp.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {opp.contact_name}
                          </div>
                          <div className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {opp.achieved_goals_count}/{opp.total_goals_count} goals achieved
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {goal.status === 'active' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(goal.id, Math.min(goal.progress_percentage + 25, 100))}
                    >
                      +25%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(goal.id, 100)}
                    >
                      Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No goals found</h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start tracking your progress by creating your first goal'}
          </p>
        </div>
      )}

      <AddGoalDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onGoalAdded={fetchGoals}
      />
    </div>
  );
}
