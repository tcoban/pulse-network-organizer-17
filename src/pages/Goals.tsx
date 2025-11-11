import { useState, useEffect } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Target, Filter, Calendar, Users, ChevronDown, ChevronUp, X, Building2, UserCircle, Briefcase } from 'lucide-react';
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
  const { goals, loading, fetchGoals, updateGoal, assignTeamMember, removeTeamMember } = useGoals();
  const { teamMembers } = useTeamMembers();
  const { isAdmin } = useUserRole();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [teamMemberFilter, setTeamMemberFilter] = useState<string>('all');
  const [filterProject, setFilterProject] = useState('all');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [goalsWithOpportunities, setGoalsWithOpportunities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchGoalsWithOpportunities();
    fetchProjectsAndTargets();
  }, [goals]);

  const fetchProjectsAndTargets = async () => {
    const { data: projectsData } = await supabase.from('projects').select('id, title');
    setProjects(projectsData || []);
  };

  const fetchGoalsWithOpportunities = async () => {
    // Fetch related opportunities and contacts for each goal
    const enrichedGoals = await Promise.all(
      goals.map(async (goal) => {
        // Fetch related opportunities/meetings
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

        // Fetch linked contacts
        const { data: linkedContacts } = await supabase
          .from('contact_goals')
          .select(`
            id,
            contact_id,
            relevance_note,
            contacts (
              id,
              name,
              company
            )
          `)
          .eq('goal_id', goal.id);

        // Fetch project information
        let projectInfo = null;
        if (goal.project_id) {
          const { data: project } = await supabase
            .from('projects')
            .select('id, title, status')
            .eq('id', goal.project_id)
            .single();
          projectInfo = project;
        }

        return {
          ...goal,
          relatedOpportunities: Array.from(opportunitiesMap.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          linkedContacts: linkedContacts?.map(lc => ({
            id: lc.id,
            contact_id: lc.contact_id,
            name: lc.contacts?.name || 'Unknown',
            company: lc.contacts?.company,
            relevance_note: lc.relevance_note,
          })) || [],
          project: projectInfo,
        };
      })
    );

    setGoalsWithOpportunities(enrichedGoals);
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
    await updateGoal(goalId, {
      progress_percentage: newProgress,
      status: newProgress === 100 ? 'completed' : 'active'
    });
  };

  const categories = Array.from(new Set(goals.map(g => g.category)));
  
  const filteredGoals = goalsWithOpportunities.filter(goal => {
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
    const matchesTeamMember = teamMemberFilter === 'all' || 
      goal.assigned_to === teamMemberFilter ||
      goal.assignments?.some((a: any) => a.team_member_id === teamMemberFilter);
    const matchesProject = filterProject === 'all' || goal.project_id === filterProject;
    const matchesTarget = true; // Removed target filter
    return matchesStatus && matchesCategory && matchesTeamMember && matchesProject && matchesTarget;
  });

  const getTeamMemberName = (teamMemberId: string) => {
    const member = teamMembers.find(m => m.id === teamMemberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  };

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

      <div className="flex gap-4 mb-6 flex-wrap">
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
        {isAdmin && (
          <Select value={teamMemberFilter} onValueChange={setTeamMemberFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Team Member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
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
                {goal.target && (
                  <div className="text-xs text-muted-foreground mb-2">
                    {goal.target.project?.title} → {goal.target.title}
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{goal.category}</Badge>
                </div>
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

                {goal.project && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Project:</div>
                    <Badge variant="outline" className="text-xs">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {goal.project.title}
                    </Badge>
                  </div>
                )}

                {goal.linkedContacts && goal.linkedContacts.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Linked Contacts:</div>
                    <div className="flex flex-wrap gap-1">
                      {goal.linkedContacts.map((linkedContact: any) => (
                        <Badge key={linkedContact.id} variant="secondary" className="text-xs">
                          <UserCircle className="h-3 w-3 mr-1" />
                          {linkedContact.name}
                          {linkedContact.company && ` (${linkedContact.company})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {goal.assignments && goal.assignments.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Assigned Team Members:</div>
                    <div className="flex flex-wrap gap-1">
                      {goal.assignments.map((assignment: any) => (
                        <Badge key={assignment.id} variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {assignment.team_member?.first_name} {assignment.team_member?.last_name}
                          {isAdmin && (
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                              onClick={() => removeTeamMember(assignment.id)}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-2">
                    <Select onValueChange={(memberId) => assignTeamMember(goal.id, memberId)}>
                      <SelectTrigger className="w-full text-xs h-8">
                        <SelectValue placeholder="+ Assign team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers
                          .filter(m => !goal.assignments?.some((a: any) => a.team_member_id === m.id))
                          .map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.firstName} {m.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
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

                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Progress updates automatically when meeting goals are achieved
                  </p>
                </div>
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
