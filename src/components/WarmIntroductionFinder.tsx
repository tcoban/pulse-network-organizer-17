import { useState, useMemo } from 'react';
import { NetworkGraph, IntroductionPath, NetworkNode } from '@/hooks/useNetworkGraph';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, TrendingUp, Link2, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface WarmIntroductionFinderProps {
  graph: NetworkGraph;
  contacts: Contact[];
  onRequestIntroduction?: (path: IntroductionPath, targetContact: NetworkNode) => void;
  onPathSelect?: (path: string[]) => void;
}

export const WarmIntroductionFinder = ({
  graph,
  contacts,
  onRequestIntroduction,
  onPathSelect,
}: WarmIntroductionFinderProps) => {
  const [targetContactId, setTargetContactId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<IntroductionPath | null>(null);

  // Filter contacts for search
  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  // Find all paths to target contact
  const introductionPaths = useMemo(() => {
    if (!targetContactId) return [];

    // Find paths from all contacts the user has access to
    const paths: IntroductionPath[] = [];
    const userContactIds = contacts.map((c) => c.id);

    userContactIds.forEach((fromId) => {
      if (fromId === targetContactId) return;
      
      const foundPaths = graph.nodes.has(fromId) && graph.nodes.has(targetContactId)
        ? findAllIntroductionPaths(graph, fromId, targetContactId, 4, 3)
        : [];
      
      paths.push(...foundPaths);
    });

    // Sort by warmth score
    return paths.sort((a, b) => b.warmthScore - a.warmthScore);
  }, [targetContactId, contacts, graph]);

  const targetContact = useMemo(() => {
    return graph.nodes.get(targetContactId);
  }, [targetContactId, graph]);

  const handlePathClick = (path: IntroductionPath) => {
    setSelectedPath(path);
    const pathIds = path.contacts.map((c) => c.id);
    onPathSelect?.(pathIds);
  };

  const handleRequestIntroduction = async (path: IntroductionPath) => {
    if (!targetContact) return;
    
    if (onRequestIntroduction) {
      await onRequestIntroduction(path, targetContact);
    } else {
      toast.success('Introduction request created', {
        description: `Path via ${path.intermediaries.map((i) => i.name).join(' → ')}`,
      });
    }
  };

  const getWarmthColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getWarmthLabel = (score: number) => {
    if (score >= 70) return 'Warm';
    if (score >= 40) return 'Moderate';
    return 'Cold';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Target Selection */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find Introduction Path
          </CardTitle>
          <CardDescription>
            Select who you want to be introduced to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <Button
                    key={contact.id}
                    variant={targetContactId === contact.id ? 'default' : 'outline'}
                    className="w-full justify-start h-auto py-3"
                    onClick={() => setTargetContactId(contact.id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium truncate">{contact.name}</div>
                        {contact.company && (
                          <div className="text-xs text-muted-foreground truncate">
                            {contact.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Introduction Paths */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Introduction Paths
              </CardTitle>
              <CardDescription>
                {targetContact
                  ? `${introductionPaths.length} possible path${introductionPaths.length !== 1 ? 's' : ''} to ${targetContact.name}`
                  : 'Select a contact to see introduction paths'}
              </CardDescription>
            </div>
            {targetContact && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={targetContact.avatar} />
                <AvatarFallback>{targetContact.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {introductionPaths.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {targetContact
                  ? 'No introduction paths found. This contact is not in your network.'
                  : 'Select a contact to find warm introduction paths'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {introductionPaths.map((path, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPath === path ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePathClick(path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getWarmthColor(path.warmthScore)}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {path.warmthScore}% {getWarmthLabel(path.warmthScore)}
                          </Badge>
                          <Badge variant="secondary">
                            {path.length} hop{path.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {path.lastInteractionInPath && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(path.lastInteractionInPath, {
                              addSuffix: true,
                            })}
                          </div>
                        )}
                      </div>

                      {/* Path Visualization */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {path.contacts.map((contact, idx) => (
                          <div key={contact.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback className="text-xs">
                                  {contact.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{contact.name}</span>
                            </div>
                            {idx < path.contacts.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Intermediaries Info */}
                      {path.intermediaries.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Key Connectors:
                            </div>
                            {path.intermediaries.map((intermediary) => (
                              <div
                                key={intermediary.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={intermediary.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {intermediary.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{intermediary.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {intermediary.degree} connections
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <div className="mt-4">
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestIntroduction(path);
                          }}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Request Introduction
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function (copied from hook for component use)
function findAllIntroductionPaths(
  graph: NetworkGraph,
  fromId: string,
  toId: string,
  maxDepth: number = 4,
  maxPaths: number = 5
): IntroductionPath[] {
  if (fromId === toId) return [];
  if (!graph.nodes.has(fromId) || !graph.nodes.has(toId)) return [];

  const allPaths: string[][] = [];
  const visited = new Set<string>();

  function dfs(nodeId: string, path: string[], depth: number) {
    if (depth >= maxDepth || allPaths.length >= maxPaths) return;
    
    if (nodeId === toId) {
      allPaths.push([...path, toId]);
      return;
    }

    visited.add(nodeId);
    const neighbors = graph.adjacencyList.get(nodeId) || new Set();

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        dfs(neighborId, [...path, neighborId], depth + 1);
      }
    }

    visited.delete(nodeId);
  }

  dfs(fromId, [fromId], 0);

  return allPaths
    .map(path => constructIntroductionPath(graph, path))
    .sort((a, b) => b.warmthScore - a.warmthScore);
}

function constructIntroductionPath(
  graph: NetworkGraph,
  nodeIds: string[]
): IntroductionPath {
  const contacts = nodeIds.map(id => graph.nodes.get(id)!);
  const intermediaries = contacts.slice(1, -1);
  
  let totalWeight = 0;
  for (let i = 0; i < nodeIds.length - 1; i++) {
    const edge = graph.edges.find(
      e => (e.source === nodeIds[i] && e.target === nodeIds[i + 1]) ||
           (e.source === nodeIds[i + 1] && e.target === nodeIds[i])
    );
    totalWeight += edge?.weight || 0.3;
  }

  const avgWeight = totalWeight / (nodeIds.length - 1);
  const lengthPenalty = Math.max(0, 1 - (nodeIds.length - 2) * 0.2);
  const warmthScore = Math.round(avgWeight * lengthPenalty * 100);

  const lastInteractionInPath = graph.edges
    .filter(e => 
      nodeIds.includes(e.source) && 
      nodeIds.includes(e.target) &&
      e.lastInteraction
    )
    .reduce((latest, edge) => {
      if (!edge.lastInteraction) return latest;
      if (!latest) return edge.lastInteraction;
      return edge.lastInteraction > latest ? edge.lastInteraction : latest;
    }, undefined as Date | undefined);

  return {
    contacts,
    length: nodeIds.length - 1,
    warmthScore,
    intermediaries,
    lastInteractionInPath,
  };
}
