import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkHealth } from '@/hooks/useRelationshipAnalytics';
import { Progress } from '@/components/ui/progress';
import { Activity, Users, TrendingUp, AlertCircle, Heart, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NetworkHealthMonitorProps {
  health: NetworkHealth;
}

export const NetworkHealthMonitor = ({ health }: NetworkHealthMonitorProps) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Network Health Monitor</h3>
        <p className="text-sm text-muted-foreground">
          Real-time insights into your network's overall health and engagement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Overall Network Health
              </span>
              <Badge variant="outline" className={getHealthColor(health.overallScore)}>
                {getHealthStatus(health.overallScore)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-4xl font-bold ${getHealthColor(health.overallScore)}`}>
                  {health.overallScore}
                </span>
                <span className="text-sm text-muted-foreground">out of 100</span>
              </div>
              <Progress value={health.overallScore} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Engagement Momentum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{health.engagementMomentum}</div>
              <Progress value={health.engagementMomentum} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Recent activity level across your network
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Reciprocity Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{health.reciprocityBalance}</div>
              <Progress value={health.reciprocityBalance} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Give and take balance in relationships
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Interaction Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{health.interactionQuality}</div>
              <Progress value={health.interactionQuality} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Depth and quality of your connections
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Active Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{health.activeContacts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Engaged in last 90 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{health.atRiskContacts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Growing Strong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{health.growingRelationships}</div>
            <p className="text-xs text-muted-foreground mt-1">
              High-strength relationships
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
