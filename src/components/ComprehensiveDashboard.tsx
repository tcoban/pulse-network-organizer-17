import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Handshake, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { useReferrals } from '@/hooks/useReferrals';
import { useNavigate } from 'react-router-dom';

interface ComprehensiveDashboardProps {
  onCreateGoal?: () => void;
}

export const ComprehensiveDashboard = ({ onCreateGoal }: ComprehensiveDashboardProps) => {
  const { projects, loading: projectsLoading } = useProjects();
  const { goals, loading: goalsLoading } = useGoals();
  const { 
    referralsGiven, 
    referralsReceived, 
    loading: referralsLoading,
    getTotalBusinessGenerated,
    getTotalBusinessReceived,
    calculateGiversGainRatio
  } = useReferrals();
  const navigate = useNavigate();

  // Project statistics
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalProjects = projects.length;

  // Goal statistics
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / goals.length)
    : 0;

  // Referral statistics
  const pendingReferralsGiven = referralsGiven.filter(r => r.status === 'pending').length;
  const completedReferralsGiven = referralsGiven.filter(r => r.status === 'completed').length;
  const pendingReferralsReceived = referralsReceived.filter(r => r.status === 'pending').length;
  const completedReferralsReceived = referralsReceived.filter(r => r.status === 'completed').length;
  const giversGainRatio = calculateGiversGainRatio();
  const businessGenerated = getTotalBusinessGenerated();
  const businessReceived = getTotalBusinessReceived();

  const loading = projectsLoading || goalsLoading || referralsLoading;

  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} completed of {totalProjects} total
            </p>
            <Button 
              variant="link" 
              className="h-auto p-0 mt-2 text-primary"
              onClick={() => navigate('/projects')}
            >
              View all projects <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGoalProgress}%</div>
            <p className="text-xs text-muted-foreground">
              {activeGoals} active, {completedGoals} completed
            </p>
            <Button 
              variant="link" 
              className="h-auto p-0 mt-2 text-primary"
              onClick={() => navigate('/goals')}
            >
              View all goals <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Givers Gain Ratio</CardTitle>
            <Handshake className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {giversGainRatio === Infinity ? '∞' : giversGainRatio.toFixed(1)}:1
            </div>
            <p className="text-xs text-muted-foreground">
              {referralsGiven.length} given / {referralsReceived.length} received
            </p>
            <Button 
              variant="link" 
              className="h-auto p-0 mt-2 text-primary"
              onClick={() => navigate('/team')}
            >
              View referrals <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Projects Overview
              </CardTitle>
              <CardDescription>Track your strategic initiatives</CardDescription>
            </div>
            <Button onClick={() => navigate('/projects')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No projects yet. Start by creating your first project.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{activeProjects}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{projects.filter(p => p.status === 'planning').length}</p>
                    <p className="text-xs text-muted-foreground">Planning</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{projects.filter(p => p.status === 'on_hold').length}</p>
                    <p className="text-xs text-muted-foreground">On Hold</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {projects.slice(0, 3).map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/projects')}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{project.title}</h4>
                        <Badge variant={
                          project.status === 'active' ? 'default' : 
                          project.status === 'completed' ? 'secondary' : 
                          'outline'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Goals Overview
              </CardTitle>
              <CardDescription>Monitor your progress towards objectives</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/goals')}>
                View All
              </Button>
              <Button onClick={onCreateGoal}>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No goals yet. Create your first goal to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{activeGoals}</p>
                    <p className="text-xs text-muted-foreground">Active Goals</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{completedGoals}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{avgGoalProgress}%</p>
                    <p className="text-xs text-muted-foreground">Avg Progress</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {goals.slice(0, 4).map(goal => (
                  <div key={goal.id} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/goals')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progress_percentage || 0} className="flex-1" />
                      <span className="text-sm font-medium">{goal.progress_percentage || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referrals Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                Referrals Overview
              </CardTitle>
              <CardDescription>Track referrals given and received</CardDescription>
            </div>
            <Button onClick={() => navigate('/team')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                    <span className="text-xs text-muted-foreground">Given</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{referralsGiven.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingReferralsGiven} pending, {completedReferralsGiven} completed
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <ArrowDownRight className="h-5 w-5 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Received</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{referralsReceived.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingReferralsReceived} pending, {completedReferralsReceived} completed
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-xs text-muted-foreground">Generated</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">${businessGenerated.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Business generated</p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Received</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">${businessReceived.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Business received</p>
                </div>
              </div>

              {(referralsGiven.length > 0 || referralsReceived.length > 0) && (
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Your Givers Gain ratio is <span className="font-bold text-foreground">
                      {giversGainRatio === Infinity ? '∞' : giversGainRatio.toFixed(1)}:1
                    </span>
                    {giversGainRatio >= 1 ? ' - Keep up the great work!' : ' - Focus on giving more referrals!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
