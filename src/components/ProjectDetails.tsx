import { useState } from 'react';
import { useTargets } from '@/hooks/useTargets';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, Target as TargetIcon, ChevronDown, ChevronRight, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import TargetForm from './TargetForm';

interface ProjectDetailsProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetails({ project, isOpen, onClose }: ProjectDetailsProps) {
  const { targets, loading: targetsLoading } = useTargets(project?.id);
  const [isTargetFormOpen, setIsTargetFormOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set());

  const toggleTarget = (targetId: string) => {
    const newExpanded = new Set(expandedTargets);
    if (newExpanded.has(targetId)) {
      newExpanded.delete(targetId);
    } else {
      newExpanded.add(targetId);
    }
    setExpandedTargets(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'paused': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (!project) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl">{project.title}</DialogTitle>
                {project.description && (
                  <p className="text-muted-foreground mt-2">{project.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Project Info */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{project.current_value || 0}%</div>
                  <Progress value={project.current_value || 0} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{targets.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {targets.filter(t => t.status === 'completed').length} completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {project.assignments?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">members assigned</p>
                </CardContent>
              </Card>
            </div>

            {/* Targets Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TargetIcon className="h-5 w-5" />
                  Targets
                </h3>
                <Button onClick={() => {
                  setSelectedTarget(null);
                  setIsTargetFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Target
                </Button>
              </div>

              {targetsLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading targets...</p>
              ) : targets.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <TargetIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No targets yet</p>
                    <Button onClick={() => setIsTargetFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Target
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {targets.map(target => (
                    <TargetCard
                      key={target.id}
                      target={target}
                      isExpanded={expandedTargets.has(target.id)}
                      onToggle={() => toggleTarget(target.id)}
                      onEdit={() => {
                        setSelectedTarget(target);
                        setIsTargetFormOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TargetForm
        projectId={project.id}
        target={selectedTarget}
        isOpen={isTargetFormOpen}
        onClose={() => {
          setIsTargetFormOpen(false);
          setSelectedTarget(null);
        }}
      />
    </>
  );
}

function TargetCard({ target, isExpanded, onToggle, onEdit }: any) {
  const { goals, loading: goalsLoading } = useGoals(target.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'paused': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CollapsibleTrigger className="flex items-start gap-2 flex-1 text-left">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{target.title}</h4>
                  <Badge className={getStatusColor(target.status)} variant="secondary">
                    {target.status}
                  </Badge>
                </div>
                {target.description && (
                  <p className="text-sm text-muted-foreground">{target.description}</p>
                )}
              </div>
            </CollapsibleTrigger>
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>{target.progress_percentage || 0}% complete</span>
            </div>
            {target.target_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Due {format(new Date(target.target_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {target.assignments && target.assignments.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{target.assignments.length} assigned</span>
              </div>
            )}
          </div>
          <Progress value={target.progress_percentage || 0} className="mt-2" />
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {goalsLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading goals...</p>
            ) : goals.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No goals linked to this target yet
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Goals ({goals.length}):</p>
                {goals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">{goal.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{goal.progress_percentage || 0}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
