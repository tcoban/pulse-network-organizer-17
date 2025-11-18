import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNetworkGraph } from '@/hooks/useNetworkGraph';
import { Contact } from '@/types/contact';

describe('useNetworkGraph', () => {
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'Alice',
      email: 'alice@test.com',
      linkedinConnections: ['2', '3'],
      company: 'Tech Corp',
      position: 'CEO',
    },
    {
      id: '2',
      name: 'Bob',
      email: 'bob@test.com',
      linkedinConnections: ['1', '3', '4'],
      company: 'Dev Inc',
      position: 'CTO',
    },
    {
      id: '3',
      name: 'Carol',
      email: 'carol@test.com',
      linkedinConnections: ['1', '2'],
      company: 'Design Studio',
      position: 'Designer',
    },
    {
      id: '4',
      name: 'Dave',
      email: 'dave@test.com',
      linkedinConnections: ['2'],
      company: 'Marketing Co',
      position: 'CMO',
    },
  ] as Contact[];

  it('should build network graph from contacts', () => {
    const { result } = renderHook(() => useNetworkGraph(mockContacts));

    expect(result.current.graph.nodes.size).toBe(4);
    expect(result.current.graph.edges.length).toBeGreaterThan(0);
  });

  it('should calculate network metrics correctly', () => {
    const { result } = renderHook(() => useNetworkGraph(mockContacts));

    expect(result.current.metrics.totalNodes).toBe(4);
    expect(result.current.metrics.totalEdges).toBeGreaterThan(0);
    expect(result.current.metrics.avgDegree).toBeGreaterThan(0);
    expect(result.current.metrics.networkDensity).toBeGreaterThan(0);
  });

  it('should find mutual connections', () => {
    const { result } = renderHook(() => useNetworkGraph(mockContacts));

    const mutuals = result.current.getMutualConnections('2');
    expect(mutuals.length).toBeGreaterThan(0);
  });

  it('should find introduction paths', () => {
    const { result } = renderHook(() => useNetworkGraph(mockContacts));

    const path = result.current.findPath('1', '4');
    expect(path).toBeDefined();
    if (path) {
      expect(path.contacts[0].id).toBe('1');
      expect(path.contacts[path.contacts.length - 1].id).toBe('4');
    }
  });

  it('should identify key connectors', () => {
    const { result } = renderHook(() => useNetworkGraph(mockContacts));

    const connectors = result.current.getConnectors(1);
    expect(connectors.length).toBeGreaterThan(0);
    expect(connectors[0].betweennessCentrality).toBeGreaterThanOrEqual(0);
  });

  it('should calculate warmth scores', () => {
    const { result } = renderHook(() => useNetworkGraph(mockContacts));

    const path = result.current.findPath('1', '4');
    if (path) {
      expect(path.warmthScore).toBeGreaterThan(0);
      expect(path.warmthScore).toBeLessThanOrEqual(100);
    }
  });

  it('should handle disconnected networks', () => {
    const disconnectedContacts: Contact[] = [
      {
        id: '1',
        name: 'Alice',
        email: 'alice@test.com',
        linkedinConnections: [],
      },
      {
        id: '2',
        name: 'Bob',
        email: 'bob@test.com',
        linkedinConnections: [],
      },
    ] as Contact[];

    const { result } = renderHook(() => useNetworkGraph(disconnectedContacts));

    const path = result.current.findPath('1', '2');
    expect(path).toBeNull();
  });

  it('should find multiple introduction paths', () => {
    const { result } = renderHook(() => useNetworkGraph(mockContacts));

    const paths = result.current.findAllPaths('1', '4', 4, 3);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0].warmthScore).toBeDefined();
  });
});
