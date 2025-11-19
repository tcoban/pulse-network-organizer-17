import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useNetworkGraph, NetworkNode, IntroductionPath } from '@/hooks/useNetworkGraph';
import { useNetworkCommunities } from '@/hooks/useNetworkCommunities';
import { useInfluenceScore } from '@/hooks/useInfluenceScore';
import { useIntroductionRequests } from '@/hooks/useIntroductionRequests';
import { NetworkGraph } from '@/components/NetworkGraph';
import { WarmIntroductionFinder } from '@/components/WarmIntroductionFinder';
import { IntroductionRequestsTracker } from '@/components/IntroductionRequestsTracker';
import { NetworkAnalyticsDashboard } from '@/components/NetworkAnalyticsDashboard';
import { NetworkDiagnosticsPanel } from '@/components/NetworkDiagnosticsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Network, Users, TrendingUp, Link2, Award, Activity, BarChart3, GitBranch, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkMap() {
  const { contacts, loading: contactsLoading } = useContacts();
  const { graph, metrics, diagnostics, loading: graphLoading, getConnectors } = useNetworkGraph(contacts);
  const { communities, loading: communitiesLoading } = useNetworkCommunities(graph);
  const { scores: influenceScores } = useInfluenceScore(graph);
  const { createIntroduction, isCreating } = useIntroductionRequests();
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const loading = contactsLoading || graphLoading;
  const keyConnectors = getConnectors(3, 10).map(connector => ({
    ...connector,
    influenceScore: influenceScores.get(connector.id) || 0,
  }));

  const handleNodeClick = (node: NetworkNode) => {
    toast.info('Contact Details', {
      description: `${node.name} - ${node.degree} connections`,
    });
  };

  const handleRequestIntroduction = async (path: IntroductionPath, targetContact: NetworkNode) => {
    const intermediaryNames = path.intermediaries.map(i => i.name).join(' → ');
    const reason = `Warm introduction via ${intermediaryNames || 'direct connection'}. Path strength: ${path.warmthScore}%`;
    const sourceContact = path.contacts[0];
    
    createIntroduction({
      contact_a_id: sourceContact.id,
      contact_b_id: targetContact.id,
      introduced_by: '', // Will be set in the hook
      introduction_reason: reason,
      intermediary_ids: path.intermediaries.map(i => i.id),
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            Network Map
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize your network and discover warm introduction paths
          </p>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              In your network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEdges}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgDegree.toFixed(1)} avg per contact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Density</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.networkDensity * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              How interconnected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Path Length</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgPathLength > 0 ? metrics.avgPathLength.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Degrees of separation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="graph" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="graph">
            <Network className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Network Graph</span>
            <span className="sm:hidden">Graph</span>
          </TabsTrigger>
          <TabsTrigger value="intros">
            <Link2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Warm Intros</span>
            <span className="sm:hidden">Intros</span>
          </TabsTrigger>
          <TabsTrigger value="requests">
            <GitBranch className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Requests</span>
            <span className="sm:hidden">Req</span>
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Award className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Key Connectors</span>
            <span className="sm:hidden">Top</span>
          </TabsTrigger>
          <TabsTrigger value="communities">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Communities</span>
            <span className="sm:hidden">Comm</span>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics">
            <Stethoscope className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Diagnostics</span>
            <span className="sm:hidden">Diag</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="space-y-4">
          <NetworkGraph
            graph={graph}
            onNodeClick={handleNodeClick}
            selectedPath={selectedPath}
            keyConnectorIds={keyConnectors.map((c) => c.id)}
            communities={communities}
          />
        </TabsContent>

        <TabsContent value="intros" className="space-y-4">
          <WarmIntroductionFinder
            graph={graph}
            contacts={contacts}
            onRequestIntroduction={handleRequestIntroduction}
            onPathSelect={setSelectedPath}
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <IntroductionRequestsTracker />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Key Connectors
              </CardTitle>
              <CardDescription>
                Top connectors in your network based on betweenness centrality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keyConnectors.map((connector, index) => (
                  <div
                    key={connector.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg font-bold">
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-semibold">{connector.name}</div>
                        {connector.company && (
                          <div className="text-sm text-muted-foreground">
                            {connector.company}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right flex-1">
                        <div className="text-sm font-medium">
                          {connector.degree} connections
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Centrality: {(connector.betweennessCentrality * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Influence: {connector.influenceScore.toFixed(1)}
                        </div>
                      </div>
                      <Badge variant="default">
                        Key Connector
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Network Communities
              </CardTitle>
              <CardDescription>
                Detected clusters and groups within your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {communitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {communities.map((community, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">Community {index + 1}</h3>
                          <p className="text-sm text-muted-foreground">
                            {community.size} members
                          </p>
                        </div>
                        <Badge variant="outline">
                          Density: {(community.density * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {community.members.slice(0, 10).map((memberId) => {
                          const member = graph.nodes.get(memberId);
                          return member ? (
                            <Badge key={memberId} variant="secondary">
                              {member.name}
                            </Badge>
                          ) : null;
                        })}
                        {community.size > 10 && (
                          <Badge variant="outline">
                            +{community.size - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <NetworkAnalyticsDashboard
            graph={graph}
            metrics={metrics}
            communities={communities}
            influenceScores={influenceScores}
          />
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <NetworkDiagnosticsPanel diagnostics={diagnostics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
