import { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Target, ChevronUp, ChevronDown, Users, Calendar } from 'lucide-react';
import { GoalForm } from './GoalForm';

interface ProjectDetailsProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetails({ project, isOpen, onClose }: ProjectDetailsProps) {
  const { goals, loading: goalsLoading, updateGoal } = useGoals(project?.id);
  const { goals: allGoals } = useGoals(); // Fetch all goals for linking
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isLinkGoalOpen, setIsLinkGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  const toggleGoalExpanded = (goalId: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  const handleLinkGoal = async (goalId: string) => {
    await updateGoal(goalId, { project_id: project.id });
    setIsLinkGoalOpen(false);
  };

  // Filter out goals that are already linked to this project
  const availableGoals = allGoals.filter(g => g.project_id !== project?.id);

  if (!project) return null;

  if (goalsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <p className="text-center py-8">Loading project details...</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{project.title}</DialogTitle>
            {project.description && (
              <p className="text-muted-foreground mt-2">{project.description}</p>
            )}
          </DialogHeader>

          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.current_value || 0}% complete
                  </p>
                </div>
                <Badge variant="secondary">{goals.length} Goals</Badge>
              </div>
              <Progress value={project.current_value || 0} className="mt-4" />

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>{project.status}</Badge>
                </div>
                {project.deadline && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="text-sm">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                )}
                {project.assignments && project.assignments.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="text-sm">{project.assignments.length} members</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Goals Section */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Goals</h3>
              <div className="flex gap-2">
                <Button onClick={() => setIsLinkGoalOpen(true)} size="sm" variant="outline">
                  Link Existing Goal
                </Button>
                <Button onClick={() => setIsAddGoalOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Goal
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  projectId={project.id}
                  isExpanded={expandedGoals.has(goal.id)}
                  onToggleExpand={() => toggleGoalExpanded(goal.id)}
                  onEdit={() => setEditingGoal(goal)}
                />
              ))}
              {goals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No goals yet. Add one to get started.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <GoalForm
        projectId={project.id}
        goal={editingGoal}
        isOpen={isAddGoalOpen || !!editingGoal}
        onClose={() => {
          setIsAddGoalOpen(false);
          setEditingGoal(null);
        }}
      />

      {/* Link Existing Goal Dialog */}
      <Dialog open={isLinkGoalOpen} onOpenChange={setIsLinkGoalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link Existing Goal to {project?.title}</DialogTitle>
          </DialogHeader>
          
          {availableGoals.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No unlinked goals available. All goals are already linked to projects.
              </p>
              <Button onClick={() => {
                setIsLinkGoalOpen(false);
                setIsAddGoalOpen(true);
              }}>
                Create New Goal Instead
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select a goal to link to this project ({availableGoals.length} available)
              </p>
              {availableGoals.map(goal => (
                <Card key={goal.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleLinkGoal(goal.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <Badge variant="secondary">{goal.category}</Badge>
                          <Badge variant={
                            goal.status === 'completed' ? 'default' :
                            goal.status === 'active' ? 'secondary' :
                            'outline'
                          }>
                            {goal.status}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {goal.target_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(goal.target_date).toLocaleDateString()}
                            </div>
                          )}
                          {goal.assignments && goal.assignments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {goal.assignments.length} assigned
                            </div>
                          )}
                          <div>Progress: {goal.progress_percentage}%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// GoalCard component
interface GoalCardProps {
  goal: any;
  projectId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}

function GoalCard({ goal, projectId, isExpanded, onToggleExpand, onEdit }: GoalCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold">{goal.title}</h4>
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">{goal.category}</Badge>
            <Badge variant={
              goal.status === 'completed' ? 'default' :
              goal.status === 'active' ? 'secondary' :
              'outline'
            }>
              {goal.status}
            </Badge>
            {goal.target_date && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(goal.target_date).toLocaleDateString()}
              </div>
            )}
            {goal.assignments && goal.assignments.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{goal.assignments.length} assigned</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{goal.progress_percentage}%</span>
            </div>
            <Progress value={goal.progress_percentage} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
