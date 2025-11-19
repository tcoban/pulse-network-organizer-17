import { useState, useEffect, useMemo } from 'react';
import { Contact } from '@/types/contact';

// ============================================================================
// TypeScript Types
// ============================================================================

export interface NetworkNode {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  avatar?: string;
  degree: number; // Number of connections
  betweennessCentrality: number;
  clusteringCoefficient: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number; // Relationship strength (0-1)
  lastInteraction?: Date;
}

export interface NetworkGraph {
  nodes: Map<string, NetworkNode>;
  adjacencyList: Map<string, Set<string>>;
  edges: NetworkEdge[];
}

export interface IntroductionPath {
  contacts: NetworkNode[];
  length: number;
  warmthScore: number; // 0-100, higher is warmer
  intermediaries: NetworkNode[];
  lastInteractionInPath?: Date;
}

export interface NetworkMetrics {
  totalNodes: number;
  totalEdges: number;
  avgDegree: number;
  networkDensity: number;
  largestComponentSize: number;
  avgPathLength: number;
  keyConnectors: NetworkNode[]; // Top 5 by betweenness
}

export interface ConnectionDiagnostics {
  totalConnectionReferences: number;
  matchedConnections: number;
  unmatchedConnections: string[];
  isolatedContacts: NetworkNode[];
  matchRate: number; // 0-100
}

export interface MutualConnection {
  contact: NetworkNode;
  mutualWith: string[]; // Contact IDs they're both connected to
  mutualCount: number;
}

// ============================================================================
// Graph Building & Name Matching
// ============================================================================

// Normalize name for matching
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.)\s+/i, '') // Remove titles
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize spaces
}

// Fuzzy match names (simple Levenshtein-like approach)
function calculateNameSimilarity(name1: string, name2: string): number {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  
  if (n1 === n2) return 1.0;
  
  // Check if one name contains the other (handles "John Smith" vs "John")
  if (n1.includes(n2) || n2.includes(n1)) {
    return 0.8;
  }
  
  // Split into words and check for partial matches
  const words1 = n1.split(' ');
  const words2 = n2.split(' ');
  const matchingWords = words1.filter(w => words2.includes(w)).length;
  const totalWords = Math.max(words1.length, words2.length);
  
  return matchingWords / totalWords;
}

// Build name-to-ID lookup with fuzzy matching
function buildNameToIdMap(contacts: Contact[]): Map<string, string> {
  const map = new Map<string, string>();
  
  contacts.forEach(contact => {
    const normalized = normalizeName(contact.name);
    map.set(normalized, contact.id);
  });
  
  return map;
}

// Find best matching contact ID for a connection name
function findMatchingContactId(
  connectionName: string, 
  nameToIdMap: Map<string, string>,
  allContacts: Contact[]
): string | null {
  const normalized = normalizeName(connectionName);
  
  // Direct match
  if (nameToIdMap.has(normalized)) {
    return nameToIdMap.get(normalized)!;
  }
  
  // Fuzzy match - find best match above threshold
  let bestMatch: { id: string; score: number } | null = null;
  const threshold = 0.7;
  
  allContacts.forEach(contact => {
    const similarity = calculateNameSimilarity(connectionName, contact.name);
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.score)) {
      bestMatch = { id: contact.id, score: similarity };
    }
  });
  
  return bestMatch?.id || null;
}

function buildNetworkGraph(contacts: Contact[]): { graph: NetworkGraph; diagnostics: ConnectionDiagnostics } {
  const nodes = new Map<string, NetworkNode>();
  const adjacencyList = new Map<string, Set<string>>();
  const edges: NetworkEdge[] = [];
  
  // Diagnostics tracking
  let totalConnectionReferences = 0;
  let matchedConnections = 0;
  const unmatchedConnections = new Set<string>();

  // Initialize nodes and adjacency list
  contacts.forEach(contact => {
    const node: NetworkNode = {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      company: contact.company,
      position: contact.position,
      avatar: contact.avatar,
      degree: 0,
      betweennessCentrality: 0,
      clusteringCoefficient: 0,
    };
    nodes.set(contact.id, node);
    adjacencyList.set(contact.id, new Set());
  });

  // Build name-to-ID lookup map
  const nameToIdMap = buildNameToIdMap(contacts);

  // Build edges from linkedin_connections (which are names, not IDs)
  contacts.forEach(contact => {
    if (contact.linkedinConnections && contact.linkedinConnections.length > 0) {
      contact.linkedinConnections.forEach(connectionName => {
        totalConnectionReferences++;
        
        // Find matching contact ID
        const connectionId = findMatchingContactId(connectionName, nameToIdMap, contacts);
        
        if (connectionId && nodes.has(connectionId)) {
          matchedConnections++;
          adjacencyList.get(contact.id)?.add(connectionId);
          adjacencyList.get(connectionId)?.add(contact.id); // Bidirectional

          // Add edge (avoid duplicates)
          const edgeExists = edges.some(
            e => (e.source === contact.id && e.target === connectionId) ||
                 (e.source === connectionId && e.target === contact.id)
          );

          if (!edgeExists) {
            // Calculate weight based on interaction recency
            const weight = calculateEdgeWeight(contact, connectionId);
            edges.push({
              source: contact.id,
              target: connectionId,
              weight,
              lastInteraction: contact.lastContact || undefined,
            });
          }
        } else {
          unmatchedConnections.add(connectionName);
        }
      });
    }
  });

  // Update node degrees
  adjacencyList.forEach((neighbors, nodeId) => {
    const node = nodes.get(nodeId);
    if (node) {
      node.degree = neighbors.size;
    }
  });

  // Find isolated contacts (no connections)
  const isolatedContacts: NetworkNode[] = [];
  nodes.forEach(node => {
    if (node.degree === 0) {
      isolatedContacts.push(node);
    }
  });

  const diagnostics: ConnectionDiagnostics = {
    totalConnectionReferences,
    matchedConnections,
    unmatchedConnections: Array.from(unmatchedConnections),
    isolatedContacts,
    matchRate: totalConnectionReferences > 0 
      ? Math.round((matchedConnections / totalConnectionReferences) * 100)
      : 0,
  };

  return { graph: { nodes, adjacencyList, edges }, diagnostics };
}

function calculateEdgeWeight(contact: Contact, connectionId: string): number {
  // Weight based on interaction recency (0-1, 1 = most recent)
  if (!contact.lastContact) return 0.3; // Default weight for no interaction data

  const daysSinceContact = Math.floor(
    (Date.now() - new Date(contact.lastContact).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Exponential decay: 1.0 at 0 days, 0.5 at 30 days, 0.3 at 90 days
  return Math.max(0.1, Math.exp(-daysSinceContact / 50));
}

// ============================================================================
// Pathfinding (BFS - Breadth-First Search)
// ============================================================================

export function findIntroductionPath(
  graph: NetworkGraph,
  fromId: string,
  toId: string,
  maxDepth: number = 4
): IntroductionPath | null {
  if (fromId === toId) return null;
  if (!graph.nodes.has(fromId) || !graph.nodes.has(toId)) return null;

  const queue: Array<{ nodeId: string; path: string[]; depth: number }> = [
    { nodeId: fromId, path: [fromId], depth: 0 }
  ];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const { nodeId, path, depth } = queue.shift()!;

    if (depth >= maxDepth) continue;

    const neighbors = graph.adjacencyList.get(nodeId) || new Set();

    for (const neighborId of neighbors) {
      if (neighborId === toId) {
        // Found path!
        const fullPath = [...path, toId];
        return constructIntroductionPath(graph, fullPath);
      }

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({
          nodeId: neighborId,
          path: [...path, neighborId],
          depth: depth + 1
        });
      }
    }
  }

  return null; // No path found
}

export function findAllIntroductionPaths(
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
  const intermediaries = contacts.slice(1, -1); // Exclude start and end
  
  // Calculate warmth score based on path length and edge weights
  let totalWeight = 0;
  for (let i = 0; i < nodeIds.length - 1; i++) {
    const edge = graph.edges.find(
      e => (e.source === nodeIds[i] && e.target === nodeIds[i + 1]) ||
           (e.source === nodeIds[i + 1] && e.target === nodeIds[i])
    );
    totalWeight += edge?.weight || 0.3;
  }

  const avgWeight = totalWeight / (nodeIds.length - 1);
  const lengthPenalty = Math.max(0, 1 - (nodeIds.length - 2) * 0.2); // Penalty for longer paths
  const warmthScore = Math.round(avgWeight * lengthPenalty * 100);

  // Find most recent interaction in path
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
    length: nodeIds.length - 1, // Number of hops
    warmthScore,
    intermediaries,
    lastInteractionInPath,
  };
}

// ============================================================================
// Mutual Connections
// ============================================================================

export function findMutualConnections(
  graph: NetworkGraph,
  contactId: string
): MutualConnection[] {
  const contactNeighbors = graph.adjacencyList.get(contactId);
  if (!contactNeighbors) return [];

  const mutuals: MutualConnection[] = [];

  graph.adjacencyList.forEach((neighbors, otherContactId) => {
    if (otherContactId === contactId) return;

    const mutualConnectionIds: string[] = [];
    neighbors.forEach(neighborId => {
      if (contactNeighbors.has(neighborId) && neighborId !== otherContactId) {
        mutualConnectionIds.push(neighborId);
      }
    });

    if (mutualConnectionIds.length > 0) {
      const contact = graph.nodes.get(otherContactId)!;
      mutuals.push({
        contact,
        mutualWith: mutualConnectionIds,
        mutualCount: mutualConnectionIds.length,
      });
    }
  });

  return mutuals.sort((a, b) => b.mutualCount - a.mutualCount);
}

// ============================================================================
// Network Metrics
// ============================================================================

export function calculateNetworkMetrics(graph: NetworkGraph): NetworkMetrics {
  const nodes = Array.from(graph.nodes.values());
  const totalNodes = nodes.length;
  const totalEdges = graph.edges.length;

  // Average degree
  const totalDegree = nodes.reduce((sum, node) => sum + node.degree, 0);
  const avgDegree = totalNodes > 0 ? totalDegree / totalNodes : 0;

  // Network density: actual edges / possible edges
  const possibleEdges = (totalNodes * (totalNodes - 1)) / 2;
  const networkDensity = possibleEdges > 0 ? totalEdges / possibleEdges : 0;

  // Calculate betweenness centrality
  calculateBetweennessCentrality(graph);

  // Calculate clustering coefficient
  calculateClusteringCoefficients(graph);

  // Find largest connected component using BFS
  const largestComponentSize = findLargestComponent(graph);

  // Average path length (sample-based for large graphs)
  const avgPathLength = calculateAveragePathLength(graph);

  // Key connectors (top 5 by betweenness centrality)
  const keyConnectors = nodes
    .sort((a, b) => b.betweennessCentrality - a.betweennessCentrality)
    .slice(0, 5);

  return {
    totalNodes,
    totalEdges,
    avgDegree,
    networkDensity,
    largestComponentSize,
    avgPathLength,
    keyConnectors,
  };
}

function calculateBetweennessCentrality(graph: NetworkGraph) {
  const nodes = Array.from(graph.nodes.keys());
  const betweenness = new Map<string, number>();

  nodes.forEach(node => betweenness.set(node, 0));

  // For each node as source
  nodes.forEach(source => {
    const stack: string[] = [];
    const paths = new Map<string, string[][]>();
    const dist = new Map<string, number>();
    const sigma = new Map<string, number>();
    const delta = new Map<string, number>();

    nodes.forEach(node => {
      paths.set(node, []);
      dist.set(node, -1);
      sigma.set(node, 0);
      delta.set(node, 0);
    });

    dist.set(source, 0);
    sigma.set(source, 1);
    const queue: string[] = [source];

    // BFS
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      const neighbors = graph.adjacencyList.get(v) || new Set();

      neighbors.forEach(w => {
        // w found for first time?
        if (dist.get(w)! < 0) {
          queue.push(w);
          dist.set(w, dist.get(v)! + 1);
        }
        // Shortest path to w via v?
        if (dist.get(w)! === dist.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          paths.get(w)!.push([v]);
        }
      });
    }

    // Accumulation
    while (stack.length > 0) {
      const w = stack.pop()!;
      paths.get(w)!.forEach(([v]) => {
        const c = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
        delta.set(v, delta.get(v)! + c);
      });
      if (w !== source) {
        betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
      }
    }
  });

  // Normalize and update nodes
  const n = nodes.length;
  const normFactor = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;

  betweenness.forEach((value, nodeId) => {
    const node = graph.nodes.get(nodeId);
    if (node) {
      node.betweennessCentrality = value * normFactor;
    }
  });
}

function calculateClusteringCoefficients(graph: NetworkGraph) {
  graph.nodes.forEach((node, nodeId) => {
    const neighbors = graph.adjacencyList.get(nodeId);
    if (!neighbors || neighbors.size < 2) {
      node.clusteringCoefficient = 0;
      return;
    }

    const neighborArray = Array.from(neighbors);
    let triangles = 0;
    const possibleTriangles = (neighborArray.length * (neighborArray.length - 1)) / 2;

    for (let i = 0; i < neighborArray.length; i++) {
      for (let j = i + 1; j < neighborArray.length; j++) {
        const neighbor1 = neighborArray[i];
        const neighbor2 = neighborArray[j];
        if (graph.adjacencyList.get(neighbor1)?.has(neighbor2)) {
          triangles++;
        }
      }
    }

    node.clusteringCoefficient = possibleTriangles > 0 ? triangles / possibleTriangles : 0;
  });
}

function findLargestComponent(graph: NetworkGraph): number {
  const visited = new Set<string>();
  let largestSize = 0;

  graph.nodes.forEach((_, nodeId) => {
    if (visited.has(nodeId)) return;

    // BFS to find component size
    const queue = [nodeId];
    const component = new Set<string>();
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      component.add(current);

      const neighbors = graph.adjacencyList.get(current) || new Set();
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      });
    }

    largestSize = Math.max(largestSize, component.size);
  });

  return largestSize;
}

function calculateAveragePathLength(graph: NetworkGraph): number {
  const nodes = Array.from(graph.nodes.keys());
  if (nodes.length < 2) return 0;

  // Sample-based calculation for large graphs (use all pairs for small graphs)
  const sampleSize = Math.min(50, nodes.length);
  const sampledNodes = nodes.slice(0, sampleSize);
  
  let totalPathLength = 0;
  let pathCount = 0;

  for (let i = 0; i < sampledNodes.length; i++) {
    for (let j = i + 1; j < sampledNodes.length; j++) {
      const path = findIntroductionPath(graph, sampledNodes[i], sampledNodes[j], 6);
      if (path) {
        totalPathLength += path.length;
        pathCount++;
      }
    }
  }

  return pathCount > 0 ? totalPathLength / pathCount : 0;
}

// ============================================================================
// Key Connectors
// ============================================================================

export function getKeyConnectors(
  graph: NetworkGraph,
  minDegree: number = 3,
  limit: number = 10
): NetworkNode[] {
  return Array.from(graph.nodes.values())
    .filter(node => node.degree >= minDegree)
    .sort((a, b) => b.betweennessCentrality - a.betweennessCentrality)
    .slice(0, limit);
}

// ============================================================================
// React Hook
// ============================================================================

export const useNetworkGraph = (contacts: Contact[]) => {
  const [loading, setLoading] = useState(true);

  // Build graph with diagnostics (memoized to avoid rebuilding on every render)
  const { graph, diagnostics } = useMemo(() => {
    if (!contacts || contacts.length === 0) {
      return {
        graph: {
          nodes: new Map(),
          adjacencyList: new Map(),
          edges: [],
        },
        diagnostics: {
          totalConnectionReferences: 0,
          matchedConnections: 0,
          unmatchedConnections: [],
          isolatedContacts: [],
          matchRate: 0,
        },
      };
    }
    return buildNetworkGraph(contacts);
  }, [contacts]);

  // Calculate metrics (memoized)
  const metrics = useMemo(() => {
    if (graph.nodes.size === 0) {
      return {
        totalNodes: 0,
        totalEdges: 0,
        avgDegree: 0,
        networkDensity: 0,
        largestComponentSize: 0,
        avgPathLength: 0,
        keyConnectors: [],
      };
    }
    return calculateNetworkMetrics(graph);
  }, [graph]);

  useEffect(() => {
    setLoading(false);
  }, [graph]);

  // Exposed functions
  const findPath = (fromId: string, toId: string, maxDepth?: number) => {
    return findIntroductionPath(graph, fromId, toId, maxDepth);
  };

  const findAllPaths = (fromId: string, toId: string, maxDepth?: number, maxPaths?: number) => {
    return findAllIntroductionPaths(graph, fromId, toId, maxDepth, maxPaths);
  };

  const getMutualConnections = (contactId: string) => {
    return findMutualConnections(graph, contactId);
  };

  const getConnectors = (minDegree?: number, limit?: number) => {
    return getKeyConnectors(graph, minDegree, limit);
  };

  const getClusteringCoefficients = (): Record<string, number> => {
    const result: Record<string, number> = {};
    graph.nodes.forEach((node, id) => {
      result[id] = node.clusteringCoefficient;
    });
    return result;
  };

  return {
    graph,
    metrics,
    diagnostics,
    loading,
    findPath,
    findAllPaths,
    getMutualConnections,
    getConnectors,
    getClusteringCoefficients,
  };
};
