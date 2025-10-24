import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Briefcase, Users, Calendar, Target } from 'lucide-react';
import ProjectForm from '@/components/ProjectForm';
import ProjectDetails from '@/components/ProjectDetails';
import { format } from 'date-fns';

export default function Projects() {
  const { projects, loading } = useProjects();
  const { isAdmin } = useUserRole();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'paused': return 'bg-orange-500';
      case 'planning': return 'bg-purple-500';
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
            <Briefcase className="h-8 w-8" />
            Projects
          </h1>
          <p className="text-muted-foreground">Manage your team projects and targets</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">{project.type}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}

              {project.type === 'fundraising' && project.target_value && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {Math.round((Number(project.current_value) / Number(project.target_value)) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(Number(project.current_value) / Number(project.target_value)) * 100} 
                  />
                  <div className="text-xs text-muted-foreground">
                    CHF {Number(project.current_value).toLocaleString()} / CHF {Number(project.target_value).toLocaleString()}
                  </div>
                </div>
              )}

              {project.assignments && project.assignments.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {project.assignments.slice(0, 3).map((assignment: any) => (
                      <Badge key={assignment.id} variant="secondary" className="text-xs">
                        {assignment.team_member?.first_name} {assignment.team_member?.last_name}
                      </Badge>
                    ))}
                    {project.assignments.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.assignments.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {project.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setSelectedProject(project);
                  setIsDetailsOpen(true);
                }}
              >
                <Target className="h-4 w-4 mr-2" />
                View Targets & Goals
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to start tracking team goals
          </p>
          {isAdmin && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      )}

      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
        }}
      />

      <ProjectDetails
        project={selectedProject}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
}