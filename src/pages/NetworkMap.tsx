import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useNetworkGraph, NetworkNode, IntroductionPath } from '@/hooks/useNetworkGraph';
import { NetworkGraph } from '@/components/NetworkGraph';
import { WarmIntroductionFinder } from '@/components/WarmIntroductionFinder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Network, Users, TrendingUp, Link2, Award, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkMap() {
  const { contacts, loading: contactsLoading } = useContacts();
  const { graph, metrics, loading: graphLoading, getConnectors } = useNetworkGraph(contacts);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const loading = contactsLoading || graphLoading;
  const keyConnectors = getConnectors(3, 10);

  const handleNodeClick = (node: NetworkNode) => {
    toast.info('Contact Details', {
      description: `${node.name} - ${node.degree} connections`,
    });
  };

  const handleRequestIntroduction = async (path: IntroductionPath, targetContact: NetworkNode) => {
    try {
      const intermediaryNames = path.intermediaries.map(i => i.name).join(' → ');
      const reason = `Warm introduction via ${intermediaryNames || 'direct connection'}. Path strength: ${path.warmthScore}%`;
      
      // Create introduction record in database
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to request introductions');
        return;
      }

      const sourceContact = path.contacts[0];
      
      await supabase.from('introduction_outcomes').insert({
        contact_a_id: sourceContact.id,
        contact_b_id: targetContact.id,
        introduced_by: user.id,
        introduction_reason: reason,
        outcome: 'pending',
        match_confidence: path.warmthScore,
      });

      toast.success('Introduction Request Created', {
        description: `Request to ${targetContact.name} via ${path.intermediaries.length} hop${path.intermediaries.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Error creating introduction:', error);
      toast.error('Failed to create introduction request');
    }
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
        <TabsList>
          <TabsTrigger value="graph">
            <Network className="h-4 w-4 mr-2" />
            Network Graph
          </TabsTrigger>
          <TabsTrigger value="intros">
            <Link2 className="h-4 w-4 mr-2" />
            Warm Introductions
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Award className="h-4 w-4 mr-2" />
            Key Connectors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="space-y-4">
          <NetworkGraph
            graph={graph}
            onNodeClick={handleNodeClick}
            selectedPath={selectedPath}
            keyConnectorIds={keyConnectors.map((c) => c.id)}
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
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {connector.degree} connections
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Centrality: {(connector.betweennessCentrality * 100).toFixed(1)}%
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
      </Tabs>
    </div>
  );
}
