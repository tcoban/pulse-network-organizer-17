import { useRelationshipAnalytics } from '@/hooks/useRelationshipAnalytics';
import { NetworkHealthMonitor } from '@/components/NetworkHealthMonitor';
import { RelationshipTrajectory } from '@/components/RelationshipTrajectory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ArrowRight, TrendingUp, AlertTriangle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RelationshipAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const {
    trajectories,
    networkHealth,
    reciprocityInsights,
    recommendations,
    loading,
    refresh,
  } = useRelationshipAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Relationship Analytics</h2>
          <p className="text-muted-foreground">
            Deep insights into your network's health, patterns, and opportunities
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {networkHealth && <NetworkHealthMonitor health={networkHealth} />}

      <Tabs defaultValue="trajectory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trajectory">Relationship Trajectory</TabsTrigger>
          <TabsTrigger value="reciprocity">Reciprocity Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="trajectory">
          <RelationshipTrajectory trajectories={trajectories} />
        </TabsContent>

        <TabsContent value="reciprocity">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Reciprocity Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Understand the balance of give and take in your relationships
              </p>
            </div>

            <div className="grid gap-4">
              {reciprocityInsights.slice(0, 10).map((insight) => (
                <Card key={insight.contactId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{insight.contactName}</CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          insight.balance === 'balanced'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : insight.balance === 'giver'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                        }
                      >
                        {insight.balance === 'balanced' && '⚖️ Balanced'}
                        {insight.balance === 'giver' && '🎁 You Give More'}
                        {insight.balance === 'taker' && '📥 They Give More'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Given:</span>
                        <span className="font-semibold">{insight.given}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Received:</span>
                        <span className="font-semibold">{insight.received}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Ratio:</span>
                        <span className="font-semibold">{insight.ratio.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Predictive Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                AI-driven suggestions to optimize your networking efforts
              </p>
            </div>

            <div className="grid gap-4">
              {recommendations.map((rec, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            rec.priority === 'high'
                              ? 'destructive'
                              : rec.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {rec.priority}
                        </Badge>
                        <CardTitle className="text-base">{rec.contactName}</CardTitle>
                      </div>
                      <Badge variant="outline" className="bg-background">
                        {(rec.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                      {rec.potentialValue > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Potential value: </span>
                          <span className="font-semibold text-green-500">
                            {rec.potentialValue.toLocaleString()} CHF
                          </span>
                        </div>
                      )}
                      <Button
                        onClick={() => navigate(`/contacts`)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Take Action <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {recommendations.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No urgent recommendations at the moment. Your network is healthy!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
