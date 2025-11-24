import { useMemo, useState } from 'react';
import { NetworkGraph, NetworkNode } from './useNetworkGraph';
import { Contact } from '@/types/contact';

export interface Community {
  id: string;
  type: 'company' | 'affiliation' | 'tag' | 'network_cluster';
  members: string[];
  size: number;
  density: number;
  label: string;
  commonCharacteristics: {
    companies?: string[];
    affiliations?: string[];
    industries?: string[];
    tags?: string[];
  };
}

export interface ContactCommunityMembership {
  contactId: string;
  contactName: string;
  communities: Array<{
    communityId: string;
    communityLabel: string;
    communityType: string;
  }>;
}

/**
 * Multi-dimensional community detection supporting overlapping memberships
 * Identifies communities based on: company, affiliation, tags, and network clusters
 */
export const useNetworkCommunities = (graph: NetworkGraph, contacts: Contact[]) => {
  const [loading, setLoading] = useState(false);
  
  const { communities, memberships } = useMemo(() => {
    setLoading(true);
    const result = detectMultiCommunities(graph, contacts);
    setLoading(false);
    return result;
  }, [graph, contacts]);

  return { communities, memberships, loading };
};

function detectMultiCommunities(
  graph: NetworkGraph, 
  contacts: Contact[]
): { communities: Community[]; memberships: ContactCommunityMembership[] } {
  const communities: Community[] = [];
  const contactIdToContact = new Map<string, Contact>();
  
  // Build contact lookup
  contacts.forEach(c => contactIdToContact.set(c.id, c));
  
  // 1. Company-based communities
  const companyCommunities = buildCompanyCommunities(graph, contactIdToContact);
  communities.push(...companyCommunities);
  
  // 2. Affiliation-based communities
  const affiliationCommunities = buildAffiliationCommunities(graph, contactIdToContact);
  communities.push(...affiliationCommunities);
  
  // 3. Tag-based communities (normalized)
  const tagCommunities = buildTagCommunities(graph, contactIdToContact);
  communities.push(...tagCommunities);
  
  // 4. Network cluster communities (only if not covered by explicit attributes)
  const existingLabels = new Set(
    communities.map(c => c.label.toLowerCase().trim())
  );
  const clusterCommunities = buildNetworkClusters(graph, contactIdToContact, existingLabels);
  communities.push(...clusterCommunities);
  
  // Deduplicate similar communities
  const deduplicated = deduplicateCommunities(communities);
  
  // Build membership map
  const memberships = buildMembershipMap(deduplicated, graph);
  
  return { communities: deduplicated, memberships };
}

function buildCompanyCommunities(
  graph: NetworkGraph,
  contactMap: Map<string, Contact>
): Community[] {
  const companyGroups = new Map<string, Set<string>>();
  
  graph.nodes.forEach((node) => {
    const contact = contactMap.get(node.id);
    if (contact?.company) {
      if (!companyGroups.has(contact.company)) {
        companyGroups.set(contact.company, new Set());
      }
      companyGroups.get(contact.company)!.add(node.id);
    }
  });
  
  const communities: Community[] = [];
  companyGroups.forEach((members, company) => {
    if (members.size >= 2) { // At least 2 people from same company
      const density = calculateDensity(members, graph);
      communities.push({
        id: `company_${company.toLowerCase().replace(/\s+/g, '_')}`,
        type: 'company',
        label: company,
        members: Array.from(members),
        size: members.size,
        density,
        commonCharacteristics: { companies: [company] },
      });
    }
  });
  
  return communities;
}

function buildAffiliationCommunities(
  graph: NetworkGraph,
  contactMap: Map<string, Contact>
): Community[] {
  const affiliationGroups = new Map<string, Set<string>>();
  
  graph.nodes.forEach((node) => {
    const contact = contactMap.get(node.id);
    if (contact?.affiliation) {
      if (!affiliationGroups.has(contact.affiliation)) {
        affiliationGroups.set(contact.affiliation, new Set());
      }
      affiliationGroups.get(contact.affiliation)!.add(node.id);
    }
  });
  
  const communities: Community[] = [];
  affiliationGroups.forEach((members, affiliation) => {
    if (members.size >= 2) {
      const density = calculateDensity(members, graph);
      communities.push({
        id: `affiliation_${affiliation.toLowerCase().replace(/\s+/g, '_')}`,
        type: 'affiliation',
        label: affiliation,
        members: Array.from(members),
        size: members.size,
        density,
        commonCharacteristics: { affiliations: [affiliation] },
      });
    }
  });
  
  return communities;
}

function buildTagCommunities(
  graph: NetworkGraph,
  contactMap: Map<string, Contact>
): Community[] {
  const tagGroups = new Map<string, Set<string>>();
  
  graph.nodes.forEach((node) => {
    const contact = contactMap.get(node.id);
    if (contact?.tags && contact.tags.length > 0) {
      contact.tags.forEach(tag => {
        // Normalize tag to lowercase for grouping
        const normalizedTag = tag.trim().toLowerCase();
        if (!tagGroups.has(normalizedTag)) {
          tagGroups.set(normalizedTag, new Set());
        }
        tagGroups.get(normalizedTag)!.add(node.id);
      });
    }
  });
  
  const communities: Community[] = [];
  tagGroups.forEach((members, normalizedTag) => {
    if (members.size >= 3) { // At least 3 people with same tag
      const density = calculateDensity(members, graph);
      // Capitalize first letter for display
      const displayLabel = normalizedTag.charAt(0).toUpperCase() + normalizedTag.slice(1);
      communities.push({
        id: `tag_${normalizedTag.replace(/\s+/g, '_')}`,
        type: 'tag',
        label: displayLabel,
        members: Array.from(members),
        size: members.size,
        density,
        commonCharacteristics: { tags: [displayLabel] },
      });
    }
  });
  
  return communities;
}

function calculateDensity(members: Set<string>, graph: NetworkGraph): number {
  let internalEdges = 0;
  
  members.forEach(id => {
    const neighbors = graph.adjacencyList.get(id) || new Set();
    neighbors.forEach(neighbor => {
      if (members.has(neighbor)) {
        internalEdges++;
      }
    });
  });
  
  internalEdges = internalEdges / 2; // Each edge counted twice
  const maxPossibleEdges = (members.size * (members.size - 1)) / 2;
  return maxPossibleEdges > 0 ? internalEdges / maxPossibleEdges : 0;
}

function buildNetworkClusters(
  graph: NetworkGraph,
  contactMap: Map<string, Contact>,
  existingLabels: Set<string>
): Community[] {
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
      const companyName = sortedCompanies[0][0];
      // Check if this company already has a community
      if (!existingLabels.has(companyName.toLowerCase())) {
        label = companyName;
        commonCharacteristics.companies = sortedCompanies.slice(0, 3).map(([name]) => name);
      } else {
        // Skip this cluster, already covered
        return;
      }
    }
    // Otherwise find dominant affiliation
    else {
      const sortedAffiliations = Array.from(affiliations.entries())
        .sort((a, b) => b[1] - a[1]);
      if (sortedAffiliations.length > 0 && sortedAffiliations[0][1] / members.length > 0.3) {
        const affiliationName = sortedAffiliations[0][0];
        // Check if this affiliation already has a community
        if (!existingLabels.has(affiliationName.toLowerCase())) {
          label = affiliationName;
          commonCharacteristics.affiliations = sortedAffiliations.slice(0, 3).map(([name]) => name);
        } else {
          // Skip this cluster, already covered
          return;
        }
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
      id: `cluster_${commIndex++}`,
      type: 'network_cluster',
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

function buildMembershipMap(
  communities: Community[],
  graph: NetworkGraph
): ContactCommunityMembership[] {
  const membershipMap = new Map<string, ContactCommunityMembership>();
  
  // Build membership for each contact
  graph.nodes.forEach((node) => {
    membershipMap.set(node.id, {
      contactId: node.id,
      contactName: node.name,
      communities: [],
    });
  });
  
  // Add community memberships
  communities.forEach((community) => {
    community.members.forEach(contactId => {
      const membership = membershipMap.get(contactId);
      if (membership) {
        membership.communities.push({
          communityId: community.id,
          communityLabel: community.label,
          communityType: community.type,
        });
      }
    });
  });
  
  return Array.from(membershipMap.values())
    .filter(m => m.communities.length > 0)
    .sort((a, b) => b.communities.length - a.communities.length);
}

/**
 * Deduplicate communities with very similar labels
 */
function deduplicateCommunities(communities: Community[]): Community[] {
  const labelMap = new Map<string, Community>();
  
  communities.forEach(community => {
    const normalizedLabel = community.label.toLowerCase().trim();
    
    // Check if we already have a similar community
    const existing = labelMap.get(normalizedLabel);
    
    if (existing) {
      // Merge members if same normalized label
      const mergedMembers = new Set([...existing.members, ...community.members]);
      existing.members = Array.from(mergedMembers);
      existing.size = mergedMembers.size;
      
      // Recalculate density if needed
      // Keep the more specific type if different
      if (community.type !== 'network_cluster' && existing.type === 'network_cluster') {
        existing.type = community.type;
        existing.id = community.id;
      }
      
      // Merge common characteristics
      if (community.commonCharacteristics.companies) {
        existing.commonCharacteristics.companies = [
          ...(existing.commonCharacteristics.companies || []),
          ...community.commonCharacteristics.companies
        ];
      }
      if (community.commonCharacteristics.affiliations) {
        existing.commonCharacteristics.affiliations = [
          ...(existing.commonCharacteristics.affiliations || []),
          ...community.commonCharacteristics.affiliations
        ];
      }
      if (community.commonCharacteristics.tags) {
        existing.commonCharacteristics.tags = [
          ...(existing.commonCharacteristics.tags || []),
          ...community.commonCharacteristics.tags
        ];
      }
    } else {
      labelMap.set(normalizedLabel, { ...community });
    }
  });
  
  return Array.from(labelMap.values())
    .sort((a, b) => b.size - a.size);
}
