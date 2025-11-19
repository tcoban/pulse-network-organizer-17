import { useMemo, useState } from 'react';
import { NetworkGraph, NetworkNode } from './useNetworkGraph';

export interface Community {
  id: number;
  members: string[];
  size: number;
  density: number;
  label: string;
  commonCharacteristics: {
    companies?: string[];
    affiliations?: string[];
    industries?: string[];
  };
}

/**
 * Advanced community detection using Louvain-like algorithm
 * Identifies clusters of closely connected contacts
 */
export const useNetworkCommunities = (graph: NetworkGraph) => {
  const [loading, setLoading] = useState(false);
  
  const communities = useMemo(() => {
    setLoading(true);
    const result = detectCommunities(graph);
    setLoading(false);
    return result;
  }, [graph]);

  return { communities, loading };
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

  // Convert to Community objects with intelligent labeling
  const result: Community[] = [];
  let commIndex = 0;
  
  communities.forEach((memberIds) => {
    if (memberIds.size === 0) return;

    // Calculate community metrics
    let internalEdges = 0;

    memberIds.forEach(id => {
      const neighbors = graph.adjacencyList.get(id) || new Set();
      neighbors.forEach(neighbor => {
        if (memberIds.has(neighbor)) {
          internalEdges++;
        }
      });
    });

    internalEdges = internalEdges / 2; // Each edge counted twice
    const maxPossibleEdges = (memberIds.size * (memberIds.size - 1)) / 2;
    const density = maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;

    // Analyze common characteristics
    const members = Array.from(memberIds);
    const nodes = members.map(id => graph.nodes.get(id)).filter(Boolean) as NetworkNode[];
    
    const companies = new Map<string, number>();
    const affiliations = new Map<string, number>();
    const positions = new Map<string, number>();
    
    nodes.forEach(node => {
      if (node.company) {
        companies.set(node.company, (companies.get(node.company) || 0) + 1);
      }
      if (node.affiliation) {
        affiliations.set(node.affiliation, (affiliations.get(node.affiliation) || 0) + 1);
      }
      if (node.position) {
        // Extract industry/role keywords
        const keywords = node.position.toLowerCase().split(/[\s,]+/);
        keywords.forEach(kw => {
          if (kw.length > 3) { // Only meaningful words
            positions.set(kw, (positions.get(kw) || 0) + 1);
          }
        });
      }
    });

    // Generate label based on most common characteristic
    let label = `Community ${commIndex + 1}`;
    const commonCharacteristics: Community['commonCharacteristics'] = {};

    // Find dominant company (if >30% of members share it)
    const sortedCompanies = Array.from(companies.entries())
      .sort((a, b) => b[1] - a[1]);
    if (sortedCompanies.length > 0 && sortedCompanies[0][1] / members.length > 0.3) {
      label = `${sortedCompanies[0][0]} Network`;
      commonCharacteristics.companies = sortedCompanies.slice(0, 3).map(([name]) => name);
    }
    // Otherwise find dominant affiliation
    else {
      const sortedAffiliations = Array.from(affiliations.entries())
        .sort((a, b) => b[1] - a[1]);
      if (sortedAffiliations.length > 0 && sortedAffiliations[0][1] / members.length > 0.3) {
        label = `${sortedAffiliations[0][0]} Circle`;
        commonCharacteristics.affiliations = sortedAffiliations.slice(0, 3).map(([name]) => name);
      }
      // Otherwise use dominant industry/role
      else {
        const sortedPositions = Array.from(positions.entries())
          .sort((a, b) => b[1] - a[1])
          .filter(([word]) => !['the', 'and', 'for', 'with'].includes(word));
        if (sortedPositions.length > 0 && sortedPositions[0][1] / members.length > 0.25) {
          const industry = sortedPositions[0][0].charAt(0).toUpperCase() + sortedPositions[0][0].slice(1);
          label = `${industry} Professionals`;
          commonCharacteristics.industries = sortedPositions.slice(0, 3).map(([word]) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          );
        }
      }
    }

    result.push({
      id: commIndex++,
      members,
      size: memberIds.size,
      density,
      label,
      commonCharacteristics,
    });
  });

  // Sort by size (largest first)
  return result.sort((a, b) => b.size - a.size);
}
