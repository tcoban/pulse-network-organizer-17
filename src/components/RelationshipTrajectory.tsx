import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RelationshipTrajectory as TrajectoryType } from '@/hooks/useRelationshipAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RelationshipTrajectoryProps {
  trajectories: TrajectoryType[];
}

export const RelationshipTrajectory = ({ trajectories }: RelationshipTrajectoryProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'declining':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const topTrajectories = trajectories.slice(0, 6);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Relationship Trajectory</h3>
        <p className="text-sm text-muted-foreground">
          Track how your key relationships are evolving over time
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topTrajectories.map((trajectory) => (
          <Card key={trajectory.contactId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{trajectory.contactName}</CardTitle>
                <Badge variant="outline" className={getTrendColor(trajectory.trend)}>
                  <span className="flex items-center gap-1">
                    {getTrendIcon(trajectory.trend)}
                    {trajectory.trend}
                  </span>
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {trajectory.currentStrength}
                <span className="text-sm font-normal text-muted-foreground">/100</span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={trajectory.dataPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="strength" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
