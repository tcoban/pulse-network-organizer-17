import { useMemo } from 'react';
import { NetworkGraph, NetworkNode } from './useNetworkGraph';

interface Community {
  id: string;
  members: NetworkNode[];
  density: number;
  avgDegree: number;
}

/**
 * Advanced community detection using Louvain-like algorithm
 * Identifies clusters of closely connected contacts
 */
export const useNetworkCommunities = (graph: NetworkGraph) => {
  const communities = useMemo(() => {
    return detectCommunities(graph);
  }, [graph]);

  return communities;
};

function detectCommunities(graph: NetworkGraph): Community[] {
  const communities: Map<string, Set<string>> = new Map();
  const nodeToComm: Map<string, string> = new Map();
  
  // Initialize each node in its own community
  graph.nodes.forEach((node) => {
    communities.set(node.id, new Set([node.id]));
    nodeToComm.set(node.id, node.id);
  });

  // Simple community detection based on modularity
  let improved = true;
  let iterations = 0;
  const maxIterations = 10;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (const [nodeId] of graph.nodes) {
      const currentComm = nodeToComm.get(nodeId)!;
      const neighbors = graph.adjacencyList.get(nodeId) || new Set();
      
      // Count connections to each neighbor's community
      const commConnections: Map<string, number> = new Map();
      
      neighbors.forEach((neighborId) => {
        const neighborComm = nodeToComm.get(neighborId)!;
        commConnections.set(
          neighborComm,
          (commConnections.get(neighborComm) || 0) + 1
        );
      });

      // Find best community (most connections)
      let bestComm = currentComm;
      let maxConnections = commConnections.get(currentComm) || 0;

      commConnections.forEach((count, comm) => {
        if (count > maxConnections) {
          maxConnections = count;
          bestComm = comm;
        }
      });

      // Move node if beneficial
      if (bestComm !== currentComm) {
        communities.get(currentComm)!.delete(nodeId);
        if (!communities.has(bestComm)) {
          communities.set(bestComm, new Set());
        }
        communities.get(bestComm)!.add(nodeId);
        nodeToComm.set(nodeId, bestComm);
        improved = true;
      }
    }
  }

  // Convert to Community objects
  const result: Community[] = [];
  communities.forEach((memberIds, commId) => {
    if (memberIds.size === 0) return;

    const members = Array.from(memberIds)
      .map(id => graph.nodes.get(id))
      .filter((n): n is NetworkNode => n !== undefined);

    // Calculate community metrics
    let internalEdges = 0;
    let totalDegree = 0;

    memberIds.forEach(id => {
      const neighbors = graph.adjacencyList.get(id) || new Set();
      totalDegree += neighbors.size;
      neighbors.forEach(neighbor => {
        if (memberIds.has(neighbor)) {
          internalEdges++;
        }
      });
    });

    internalEdges = internalEdges / 2; // Each edge counted twice
    const maxPossibleEdges = (memberIds.size * (memberIds.size - 1)) / 2;
    const density = maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;
    const avgDegree = memberIds.size > 0 ? totalDegree / memberIds.size : 0;

    result.push({
      id: commId,
      members,
      density,
      avgDegree,
    });
  });

  // Sort by size (largest first)
  return result.sort((a, b) => b.members.length - a.members.length);
}
