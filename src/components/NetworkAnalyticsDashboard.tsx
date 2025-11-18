import { useMemo } from 'react';
import { NetworkGraph, NetworkMetrics } from '@/hooks/useNetworkGraph';
import { Community } from '@/hooks/useNetworkCommunities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, Network, Zap, GitBranch } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface NetworkAnalyticsDashboardProps {
  graph: NetworkGraph;
  metrics: NetworkMetrics;
  communities: Community[];
  influenceScores: Map<string, number>;
}

export const NetworkAnalyticsDashboard = ({
  graph,
  metrics,
  communities,
  influenceScores,
}: NetworkAnalyticsDashboardProps) => {
  // Degree distribution for bar chart
  const degreeDistribution = useMemo(() => {
    const distribution = new Map<number, number>();
    graph.nodes.forEach((node) => {
      const count = distribution.get(node.degree) || 0;
      distribution.set(node.degree, count + 1);
    });
    
    return Array.from(distribution.entries())
      .map(([degree, count]) => ({
        degree: `${degree} connections`,
        count,
      }))
      .sort((a, b) => parseInt(a.degree) - parseInt(b.degree))
      .slice(0, 10);
  }, [graph]);

  // Community size distribution
  const communityData = useMemo(() => {
    return communities.map((community, index) => ({
      name: `Community ${index + 1}`,
      size: community.size,
      density: Math.round(community.density * 100),
    }));
  }, [communities]);

  // Top influencers
  const topInfluencers = useMemo(() => {
    return Array.from(influenceScores.entries())
      .map(([id, score]) => ({
        id,
        node: graph.nodes.get(id),
        score,
      }))
      .filter(item => item.node)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [influenceScores, graph]);

  // Network health score (0-100)
  const healthScore = useMemo(() => {
    const densityScore = Math.min(metrics.networkDensity * 200, 30); // Max 30 points
    const avgPathScore = metrics.avgPathLength > 0 
      ? Math.max(30 - metrics.avgPathLength * 5, 0) 
      : 0; // Max 30 points
    const connectivityScore = (metrics.totalEdges / Math.max(metrics.totalNodes, 1)) * 10; // Max 40 points
    
    return Math.min(Math.round(densityScore + avgPathScore + connectivityScore), 100);
  }, [metrics]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Network Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Network Health Score
          </CardTitle>
          <CardDescription>
            Overall health and connectivity of your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">{healthScore}/100</span>
              <Badge variant={healthScore >= 70 ? 'default' : healthScore >= 40 ? 'secondary' : 'destructive'}>
                {healthScore >= 70 ? 'Excellent' : healthScore >= 40 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress value={healthScore} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Density</p>
                <p className="font-semibold">{(metrics.networkDensity * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Path</p>
                <p className="font-semibold">
                  {metrics.avgPathLength > 0 ? metrics.avgPathLength.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Communities</p>
                <p className="font-semibold">{communities.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Degree Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Connection Distribution
            </CardTitle>
            <CardDescription>
              How connections are distributed across your network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={degreeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="degree" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Community Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Community Distribution
            </CardTitle>
            <CardDescription>
              Size distribution of detected communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={communityData}
                  dataKey="size"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.size}`}
                >
                  {communityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Influencers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Network Influencers
          </CardTitle>
          <CardDescription>
            Most influential contacts based on network position and reach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topInfluencers.map((influencer, index) => (
              <div
                key={influencer.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-bold">
                    #{index + 1}
                  </Badge>
                  <div>
                    <div className="font-semibold">{influencer.node?.name}</div>
                    {influencer.node?.company && (
                      <div className="text-sm text-muted-foreground">
                        {influencer.node.company}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Score: {influencer.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {influencer.node?.degree} connections
                    </div>
                  </div>
                  <Progress value={influencer.score} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Network Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Network Reach</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                With {metrics.totalNodes} contacts and {metrics.totalEdges} connections, 
                you have a {metrics.networkDensity > 0.1 ? 'well-connected' : 'growing'} network 
                with an average of {metrics.avgDegree.toFixed(1)} connections per contact.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Community Structure</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Your network has {communities.length} distinct communities, 
                suggesting {communities.length > 5 ? 'diverse' : 'focused'} professional circles 
                with varied connection patterns.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Growth Opportunities</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Focus on connecting isolated groups to improve network density 
                and reduce the average path length of {metrics.avgPathLength > 0 ? metrics.avgPathLength.toFixed(1) : 'N/A'} degrees.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Strategic Recommendations</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Leverage your top {topInfluencers.length} influencers for warm introductions 
                and focus on strengthening connections in smaller communities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
