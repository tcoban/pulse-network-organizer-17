import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReferrals } from '@/hooks/useReferrals';
import { useGoals } from '@/hooks/useGoals';
import { useProjects } from '@/hooks/useProjects';
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

describe('BNI Complete Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full referral creation workflow', async () => {
    // Mock the complete workflow
    const mockProject = {
      id: 'connect-people-project',
      title: 'Connect People',
      type: 'networking',
      status: 'active'
    };

    const mockReferral = {
      id: 'new-referral-id',
      given_by: 'test-user-id',
      contact_id: 'contact-1',
      referred_to_name: 'John Doe',
      service_description: 'Web Development',
      estimated_value: 5000,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const mockGoal = {
      id: 'new-goal-id',
      title: 'Connect: John Doe',
      category: 'referral',
      status: 'active',
      progress_percentage: 0
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ 
                  data: mockProject, 
                  error: null 
                }))
              }))
            }))
          }))
        } as any;
      }
      if (table === 'referrals_given') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: mockReferral, 
                error: null 
              }))
            }))
          }))
        } as any;
      }
      if (table === 'goals') {
        return {
          insert: vi.fn(() => Promise.resolve({ 
            data: [mockGoal], 
            error: null 
          })),
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        } as any;
      }
      if (table === 'referrals_received') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        } as any;
      }
      return {} as any;
    });

    // Step 1: Create referral
    const { result: referralResult } = renderHook(() => useReferrals());
    
    await waitFor(() => {
      expect(referralResult.current.loading).toBe(false);
    });

    const referralSuccess = await referralResult.current.giveReferral({
      contactId: 'contact-1',
      referredToName: 'John Doe',
      referredToCompany: 'Doe Corp',
      serviceDescription: 'Web Development',
      estimatedValue: 5000
    });

    expect(referralSuccess).toBe(true);

    // Step 2: Verify goal was created
    const { result: goalsResult } = renderHook(() => useGoals());
    
    await waitFor(() => {
      expect(goalsResult.current.loading).toBe(false);
    });

    // The workflow should have automatically created a goal
    expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('goals');
  });

  it('should handle goal assignment to team members', async () => {
    const mockGoal = {
      id: 'goal-1',
      title: 'Test Goal',
      category: 'referral',
      status: 'active',
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'goals') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ 
              data: [mockGoal], 
              error: null 
            }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ 
                data: mockGoal, 
                error: null 
              }))
            }))
          }))
        } as any;
      }
      if (table === 'goal_assignments') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
          }))
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Create goal with team member assignments
    const newGoal = await result.current.createGoal(
      {
        title: 'Test Goal',
        category: 'referral'
      },
      ['team-member-1', 'team-member-2']
    );

    expect(newGoal).not.toBeNull();

    // Assign additional team member
    const assignSuccess = await result.current.assignTeamMember('goal-1', 'team-member-3');
    expect(assignSuccess).toBe(true);

    // Remove team member
    const removeSuccess = await result.current.removeTeamMember('assignment-1');
    expect(removeSuccess).toBe(true);
  });

  it('should calculate network ROI metrics correctly', async () => {
    const mockReferralsGiven = [
      {
        id: '1',
        given_by: 'test-user-id',
        contact_id: 'contact-1',
        service_description: 'Service 1',
        estimated_value: 5000,
        status: 'completed',
        closed_value: 4800,
        created_at: new Date().toISOString(),
        contact: {}
      },
      {
        id: '2',
        given_by: 'test-user-id',
        contact_id: 'contact-2',
        service_description: 'Service 2',
        estimated_value: 3000,
        status: 'pending',
        closed_value: 0,
        created_at: new Date().toISOString(),
        contact: {}
      }
    ];

    const mockReferralsReceived = [
      {
        id: '3',
        received_by: 'test-user-id',
        from_contact_id: 'contact-3',
        client_name: 'Client 1',
        service_description: 'Service 3',
        estimated_value: 6000,
        status: 'completed',
        closed_value: 6200,
        created_at: new Date().toISOString(),
        fromContact: {}
      }
    ];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'referrals_given') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockReferralsGiven, 
                error: null 
              }))
            }))
          }))
        } as any;
      }
      if (table === 'referrals_received') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockReferralsReceived, 
                error: null 
              }))
            }))
          }))
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useReferrals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Calculate metrics
    const totalGenerated = result.current.getTotalBusinessGenerated();
    const totalReceived = result.current.getTotalBusinessReceived();
    const giversGainRatio = result.current.calculateGiversGainRatio();

    expect(totalGenerated).toBe(4800); // Only completed referral
    expect(totalReceived).toBe(6200);
    expect(giversGainRatio).toBe(2); // 2 given / 1 received
  });
});
