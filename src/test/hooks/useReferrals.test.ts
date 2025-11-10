import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReferrals } from '@/hooks/useReferrals';
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

describe('useReferrals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch referrals given and received on mount', async () => {
    const mockReferralsGiven = [
      {
        id: '1',
        given_by: 'test-user-id',
        contact_id: 'contact-1',
        service_description: 'Web Development',
        estimated_value: 5000,
        status: 'pending',
        closed_value: 0,
        created_at: new Date().toISOString(),
        contact: { id: 'contact-1', name: 'John Doe' }
      }
    ];

    const mockReferralsReceived = [
      {
        id: '2',
        received_by: 'test-user-id',
        from_contact_id: 'contact-2',
        client_name: 'Jane Smith',
        service_description: 'Consulting',
        estimated_value: 3000,
        status: 'in_progress',
        closed_value: 0,
        created_at: new Date().toISOString(),
        fromContact: { id: 'contact-2', name: 'Bob Johnson' }
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

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.referralsGiven).toHaveLength(1);
    expect(result.current.referralsReceived).toHaveLength(1);
    expect(result.current.referralsGiven[0].serviceDescription).toBe('Web Development');
    expect(result.current.referralsReceived[0].clientName).toBe('Jane Smith');
  });

  it('should calculate Givers Gain ratio correctly', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    } as any));

    const { result } = renderHook(() => useReferrals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const ratio = result.current.calculateGiversGainRatio();
    expect(ratio).toBe(0); // 0 given / 0 received = 0
  });

  it('should create a new referral successfully', async () => {
    const mockNewReferral = {
      id: 'new-referral-id',
      given_by: 'test-user-id',
      contact_id: 'contact-1',
      service_description: 'Marketing Services',
      estimated_value: 10000,
      status: 'pending'
    };

    const mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: mockNewReferral, 
          error: null 
        }))
      }))
    }));

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'referrals_given' || table === 'referrals_received') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          insert: mockInsert
        } as any;
      }
      if (table === 'projects') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ 
                  data: { id: 'project-id' }, 
                  error: null 
                }))
              }))
            }))
          }))
        } as any;
      }
      if (table === 'goals') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null }))
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useReferrals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const success = await result.current.giveReferral({
      contactId: 'contact-1',
      referredToName: 'Test Company',
      referredToCompany: 'Test Corp',
      serviceDescription: 'Marketing Services',
      estimatedValue: 10000
    });

    expect(success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('should calculate total business generated correctly', async () => {
    const mockCompletedReferrals = [
      {
        id: '1',
        given_by: 'test-user-id',
        contact_id: 'contact-1',
        service_description: 'Service 1',
        estimated_value: 5000,
        status: 'completed',
        closed_value: 4500,
        created_at: new Date().toISOString(),
        contact: {}
      },
      {
        id: '2',
        given_by: 'test-user-id',
        contact_id: 'contact-2',
        service_description: 'Service 2',
        estimated_value: 3000,
        status: 'completed',
        closed_value: 3200,
        created_at: new Date().toISOString(),
        contact: {}
      }
    ];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'referrals_given') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockCompletedReferrals, 
                error: null 
              }))
            }))
          }))
        } as any;
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any;
    });

    const { result } = renderHook(() => useReferrals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const totalBusiness = result.current.getTotalBusinessGenerated();
    expect(totalBusiness).toBe(7700); // 4500 + 3200
  });
});
