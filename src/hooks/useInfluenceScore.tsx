import { useMemo } from 'react';
import { NetworkGraph, NetworkNode } from './useNetworkGraph';

export interface InfluenceScore {
  nodeId: string;
  score: number;
  rank: number;
  factors: {
    degree: number;
    betweenness: number;
    clustering: number;
    eigenvector: number;
  };
}

/**
 * Calculate influence scores for network nodes
 * Combines multiple centrality measures for comprehensive influence ranking
 */
export const useInfluenceScore = (graph: NetworkGraph) => {
  const scores = useMemo(() => {
    const scoresList = calculateInfluenceScores(graph);
    const scoresMap = new Map<string, number>();
    scoresList.forEach(s => scoresMap.set(s.nodeId, s.score * 100)); // Scale to 0-100
    return scoresMap;
  }, [graph]);

  return { scores };
};

function calculateInfluenceScores(graph: NetworkGraph): InfluenceScore[] {
  const scores: InfluenceScore[] = [];

  // Calculate various centrality measures
  const betweenness = calculateBetweennessCentrality(graph);
  const clustering = calculateClustering(graph);
  const eigenvector = calculateEigenvectorCentrality(graph);

  graph.nodes.forEach((node) => {
    const degree = (graph.adjacencyList.get(node.id)?.size || 0) / graph.nodes.size;
    const between = betweenness[node.id] || 0;
    const cluster = clustering[node.id] || 0;
    const eigen = eigenvector[node.id] || 0;

    // Weighted combination of factors
    const score = 
      degree * 0.3 +        // Direct connections
      between * 0.4 +       // Bridge position
      cluster * 0.15 +      // Network cohesion
      eigen * 0.15;         // Connected to influential nodes

    scores.push({
      nodeId: node.id,
      score,
      rank: 0, // Will be set after sorting
      factors: {
        degree,
        betweenness: between,
        clustering: cluster,
        eigenvector: eigen,
      },
    });
  });

  // Sort by score and assign ranks
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((item, index) => {
    item.rank = index + 1;
  });

  return scores;
}

function calculateBetweennessCentrality(graph: NetworkGraph): Record<string, number> {
  const betweenness: Record<string, number> = {};
  
  graph.nodes.forEach((node) => {
    betweenness[node.id] = 0;
  });

  // For each pair of nodes, find shortest paths
  graph.nodes.forEach((source) => {
    const stack: string[] = [];
    const paths: Record<string, string[][]> = {};
    const distance: Record<string, number> = {};
    const sigma: Record<string, number> = {};
    const delta: Record<string, number> = {};

    graph.nodes.forEach((node) => {
      paths[node.id] = [];
      distance[node.id] = -1;
      sigma[node.id] = 0;
      delta[node.id] = 0;
    });

    distance[source.id] = 0;
    sigma[source.id] = 1;
    const queue: string[] = [source.id];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      const neighbors = graph.adjacencyList.get(v) || new Set();

      neighbors.forEach((w) => {
        if (distance[w] < 0) {
          queue.push(w);
          distance[w] = distance[v] + 1;
        }

        if (distance[w] === distance[v] + 1) {
          sigma[w] += sigma[v];
          if (!paths[w]) paths[w] = [];
          paths[w].push([v]);
        }
      });
    }

    // Accumulation
    while (stack.length > 0) {
      const w = stack.pop()!;
      (paths[w] || []).forEach((pathArr) => {
        const v = pathArr[0];
        if (v !== source.id) {
          delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
        }
      });
      if (w !== source.id) {
        betweenness[w] += delta[w];
      }
    }
  });

  // Normalize
  const n = graph.nodes.size;
  const normFactor = n > 2 ? 2 / ((n - 1) * (n - 2)) : 1;
  
  Object.keys(betweenness).forEach((key) => {
    betweenness[key] *= normFactor;
  });

  return betweenness;
}

function calculateClustering(graph: NetworkGraph): Record<string, number> {
  const clustering: Record<string, number> = {};

  graph.nodes.forEach((node) => {
    const neighbors = Array.from(graph.adjacencyList.get(node.id) || []);
    const k = neighbors.length;

    if (k < 2) {
      clustering[node.id] = 0;
      return;
    }

    let triangles = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const neighborI = neighbors[i];
        const neighborJ = neighbors[j];
        const neighborsOfI = graph.adjacencyList.get(neighborI) || new Set();
        if (neighborsOfI.has(neighborJ)) {
          triangles++;
        }
      }
    }

    clustering[node.id] = (2 * triangles) / (k * (k - 1));
  });

  return clustering;
}

function calculateEigenvectorCentrality(graph: NetworkGraph): Record<string, number> {
  const centrality: Record<string, number> = {};
  const nodeIds = Array.from(graph.nodes.keys());
  
  // Initialize
  nodeIds.forEach(id => {
    centrality[id] = 1 / Math.sqrt(nodeIds.length);
  });

  // Power iteration
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let iter = 0; iter < maxIterations; iter++) {
    const newCentrality: Record<string, number> = {};
    let norm = 0;

    nodeIds.forEach(id => {
      const neighbors = graph.adjacencyList.get(id) || new Set();
      let sum = 0;
      neighbors.forEach(neighbor => {
        sum += centrality[neighbor];
      });
      newCentrality[id] = sum;
      norm += sum * sum;
    });

    // Normalize
    norm = Math.sqrt(norm);
    if (norm > 0) {
      nodeIds.forEach(id => {
        newCentrality[id] /= norm;
      });
    }

    // Check convergence
    let maxDiff = 0;
    nodeIds.forEach(id => {
      maxDiff = Math.max(maxDiff, Math.abs(newCentrality[id] - centrality[id]));
    });

    nodeIds.forEach(id => {
      centrality[id] = newCentrality[id];
    });

    if (maxDiff < tolerance) break;
  }

  return centrality;
}
