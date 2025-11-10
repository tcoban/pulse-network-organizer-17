import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/integrations/supabase/client';

const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  callback();
};

describe('useGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch goals on mount', async () => {
    const mockGoals = [
      {
        id: 'goal-1',
        title: 'Complete Project X',
        description: 'Finish the project by end of month',
        category: 'project',
        status: 'active',
        progress_percentage: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignments: []
      }
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: mockGoals, 
          error: null 
        }))
      }))
    } as any);

    const { result } = renderHook(() => useGoals());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].title).toBe('Complete Project X');
  });

  it('should create a new goal with team member assignments', async () => {
    const mockNewGoal = {
      id: 'new-goal-id',
      title: 'New Goal',
      description: 'Goal description',
      category: 'referral',
      status: 'active',
      progress_percentage: 0
    };

    const mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: mockNewGoal, 
          error: null 
        }))
      }))
    }));

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'goals') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          insert: mockInsert
        } as any;
      }
      if (table === 'goal_assignments') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null }))
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newGoal = await result.current.createGoal(
      {
        title: 'New Goal',
        description: 'Goal description',
        category: 'referral'
      },
      ['team-member-1', 'team-member-2']
    );

    expect(newGoal).not.toBeNull();
    expect(mockInsert).toHaveBeenCalled();
  });

  it('should assign team member to goal', async () => {
    const mockAssignInsert = vi.fn(() => Promise.resolve({ error: null }));

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'goal_assignments') {
        return {
          insert: mockAssignInsert
        } as any;
      }
      return {
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      } as any;
    });

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const success = await result.current.assignTeamMember('goal-1', 'team-member-1');

    expect(success).toBe(true);
    expect(mockAssignInsert).toHaveBeenCalledWith({
      goal_id: 'goal-1',
      team_member_id: 'team-member-1'
    });
  });

  it('should update goal progress', async () => {
    const mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }));

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'goals') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          update: mockUpdate
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const success = await result.current.updateGoal('goal-1', {
      progress_percentage: 75,
      status: 'in_progress'
    });

    expect(success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      progress_percentage: 75,
      status: 'in_progress'
    });
  });

  it('should delete a goal', async () => {
    const mockDelete = vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }));

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'goals') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          delete: mockDelete
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const success = await result.current.deleteGoal('goal-1');

    expect(success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });
});
