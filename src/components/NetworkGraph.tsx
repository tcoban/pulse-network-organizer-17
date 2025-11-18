import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { NetworkGraph as NetworkGraphType, NetworkNode } from '@/hooks/useNetworkGraph';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Network, Maximize2, Minimize2, Filter } from 'lucide-react';

// ============================================================================
// Layout Algorithms
// ============================================================================

type LayoutType = 'hierarchical' | 'force' | 'circular';

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  layout: LayoutType
): { nodes: Node[]; edges: Edge[] } {
  switch (layout) {
    case 'hierarchical':
      return getHierarchicalLayout(nodes, edges);
    case 'circular':
      return getCircularLayout(nodes, edges);
    case 'force':
    default:
      return getForceLayout(nodes, edges);
  }
}

function getHierarchicalLayout(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 30,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function getCircularLayout(nodes: Node[], edges: Edge[]) {
  const radius = Math.max(300, nodes.length * 30);
  const centerX = 400;
  const centerY = 400;

  const layoutedNodes = nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function getForceLayout(nodes: Node[], edges: Edge[]) {
  // Simple force-directed layout simulation
  const layoutedNodes = nodes.map((node, index) => ({
    ...node,
    position: {
      x: Math.random() * 800,
      y: Math.random() * 600,
    },
  }));

  return { nodes: layoutedNodes, edges };
}

// ============================================================================
// Custom Node Components
// ============================================================================

const ContactNode = ({ data }: { data: any }) => {
  const isHighlighted = data.highlighted || false;
  const isKeyConnector = data.isKeyConnector || false;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-card transition-all ${
        isHighlighted
          ? 'border-primary shadow-lg scale-110'
          : isKeyConnector
          ? 'border-accent'
          : 'border-border'
      }`}
      style={{ minWidth: '180px' }}
    >
      <div className="flex items-center gap-2">
        {data.avatar ? (
          <img src={data.avatar} alt={data.label} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
            {data.label?.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate text-foreground">{data.label}</div>
          {data.company && (
            <div className="text-xs text-muted-foreground truncate">{data.company}</div>
          )}
        </div>
      </div>
      {data.degree > 0 && (
        <div className="mt-2 flex gap-1">
          <Badge variant="outline" className="text-xs">
            {data.degree} connections
          </Badge>
          {isKeyConnector && (
            <Badge variant="default" className="text-xs">
              Key Connector
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  contact: ContactNode,
};

// ============================================================================
// Main Component
// ============================================================================

interface NetworkGraphProps {
  graph: NetworkGraphType;
  onNodeClick?: (node: NetworkNode) => void;
  selectedPath?: string[];
  keyConnectorIds?: string[];
  communities?: Array<{ id: number; members: string[]; size: number; density: number }>;
}

export const NetworkGraph = ({
  graph,
  onNodeClick,
  selectedPath = [],
  keyConnectorIds = [],
  communities = [],
}: NetworkGraphProps) => {
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');
  const [searchTerm, setSearchTerm] = useState('');
  const [minConnections, setMinConnections] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Convert NetworkGraph to ReactFlow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const networkNodes = Array.from(graph.nodes.values());
    const filteredNodes = networkNodes.filter(
      (node) =>
        node.degree >= minConnections &&
        (searchTerm === '' ||
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Find community for each node
    const nodeCommunityMap = new Map<string, number>();
    communities.forEach((community, index) => {
      community.members.forEach(memberId => {
        nodeCommunityMap.set(memberId, index);
      });
    });

    const nodes: Node[] = filteredNodes.map((node) => ({
      id: node.id,
      type: 'contact',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        label: node.name,
        company: node.company,
        avatar: node.avatar,
        degree: node.degree,
        highlighted: selectedPath.includes(node.id),
        isKeyConnector: keyConnectorIds.includes(node.id),
        communityId: nodeCommunityMap.get(node.id),
      },
    }));

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const edges: Edge[] = graph.edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: 'default',
        animated: selectedPath.includes(edge.source) && selectedPath.includes(edge.target),
        style: {
          stroke: selectedPath.includes(edge.source) && selectedPath.includes(edge.target)
            ? 'hsl(var(--primary))'
            : 'hsl(var(--border))',
          strokeWidth: selectedPath.includes(edge.source) && selectedPath.includes(edge.target)
            ? 3
            : 1.5,
        },
        data: {
          weight: edge.weight,
        },
      }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [graph, minConnections, searchTerm, selectedPath, keyConnectorIds, communities]);

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges, layoutType);
  }, [initialNodes, initialEdges, layoutType]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes/edges when layout or filters change with debounce for large graphs
  useEffect(() => {
    const timer = setTimeout(() => {
      const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        layoutType
      );
      setNodes(newNodes);
      setEdges(newEdges);
    }, initialNodes.length > 100 ? 300 : 0);

    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, layoutType, setNodes, setEdges]);

  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const networkNode = graph.nodes.get(node.id);
      if (networkNode && onNodeClick) {
        onNodeClick(networkNode);
      }
    },
    [graph, onNodeClick]
  );

  const handleRelayout = (newLayout: LayoutType) => {
    setLayoutType(newLayout);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-[600px]'} rounded-lg border border-border`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Background className="bg-muted" />
        <Controls className="bg-card border-border" />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.highlighted) return 'hsl(var(--primary))';
            if (node.data.isKeyConnector) return 'hsl(var(--accent))';
            return 'hsl(var(--muted-foreground))';
          }}
          className="bg-card border-border"
        />

        {/* Top Panel - Controls */}
        <Panel position="top-left" className="flex flex-col gap-2">
          <Card className="p-3 shadow-lg">
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Layout Selection */}
              <Select value={layoutType} onValueChange={(value) => handleRelayout(value as LayoutType)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="force">Force-Directed</SelectItem>
                  <SelectItem value="circular">Circular</SelectItem>
                </SelectContent>
              </Select>

              {/* Min Connections Filter */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  value={minConnections}
                  onChange={(e) => setMinConnections(Number(e.target.value))}
                  className="w-16 h-8"
                  placeholder="Min"
                />
                <span className="text-xs text-muted-foreground">connections</span>
              </div>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </Panel>

        {/* Bottom Panel - Stats */}
        <Panel position="bottom-right">
          <Card className="p-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <Network className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {nodes.length} nodes • {edges.length} edges
              </span>
              {selectedPath.length > 0 && (
                <Badge variant="default" className="ml-2">
                  Path: {selectedPath.length - 1} hops
                </Badge>
              )}
            </div>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
};
