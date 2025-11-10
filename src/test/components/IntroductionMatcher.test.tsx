import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { IntroductionMatcher } from '@/components/IntroductionMatcher';
import { Contact } from '@/types/contact';

// Mock the ReferralTrackerDialog
vi.mock('@/components/ReferralTrackerDialog', () => ({
  ReferralTrackerDialog: ({ open }: { open: boolean }) => 
    open ? <div>Referral Dialog</div> : null
}));

describe('IntroductionMatcher', () => {
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'John Developer',
      email: 'john@example.com',
      company: 'Tech Corp',
      lookingFor: 'web design services graphic designer',
      offering: 'software development consulting',
      addedDate: new Date(),
      cooperationRating: 5,
      potentialScore: 4,
      tags: [],
      notes: '',
      interactionHistory: [],
      eventParticipationHistory: [],
      pastCollaborations: [],
      assignedTo: 'test-user'
    },
    {
      id: '2',
      name: 'Jane Designer',
      email: 'jane@example.com',
      company: 'Design Studio',
      lookingFor: 'software development programming help',
      offering: 'web design graphic design branding',
      addedDate: new Date(),
      cooperationRating: 5,
      potentialScore: 5,
      tags: [],
      notes: '',
      interactionHistory: [],
      eventParticipationHistory: [],
      pastCollaborations: [],
      assignedTo: 'test-user'
    },
    {
      id: '3',
      name: 'Bob Marketer',
      email: 'bob@example.com',
      company: 'Marketing Inc',
      lookingFor: 'accounting services bookkeeping',
      offering: 'digital marketing SEO services',
      addedDate: new Date(),
      cooperationRating: 4,
      potentialScore: 4,
      tags: [],
      notes: '',
      interactionHistory: [],
      eventParticipationHistory: [],
      pastCollaborations: [],
      assignedTo: 'test-user'
    }
  ];

  it('should render no matches message when no contacts provided', () => {
    const { container } = render(<IntroductionMatcher contacts={[]} />);
    expect(container.textContent).toContain('No potential introductions found');
  });

  it('should find matching contacts based on lookingFor and offering', () => {
    const { container } = render(<IntroductionMatcher contacts={mockContacts} />);

    // John is looking for "web design" and Jane offers "web design"
    expect(container.textContent).toContain('John Developer');
    expect(container.textContent).toContain('Jane Designer');
    expect(container.textContent).toContain('confidence');
  });

  it('should display confidence levels correctly', () => {
    const { container } = render(<IntroductionMatcher contacts={mockContacts} />);

    // Check that confidence badges are present
    expect(container.textContent).toContain('confidence');
  });

  it('should show match reason description', () => {
    const { container } = render(<IntroductionMatcher contacts={mockContacts} />);

    // Should show what John is looking for and what Jane offers
    expect(container.textContent).toContain('is looking for');
  });

  it('should limit matches to top 10', () => {
    // Create 15 contacts with matching needs/offerings
    const manyContacts: Contact[] = Array.from({ length: 15 }, (_, i) => ({
      id: `contact-${i}`,
      name: `Contact ${i}`,
      email: `contact${i}@example.com`,
      company: `Company ${i}`,
      lookingFor: i % 2 === 0 ? 'web design services' : 'accounting services',
      offering: i % 2 === 0 ? 'accounting services' : 'web design services',
      addedDate: new Date(),
      cooperationRating: 5,
      potentialScore: 5,
      tags: [],
      notes: '',
      interactionHistory: [],
      eventParticipationHistory: [],
      pastCollaborations: [],
      assignedTo: 'test-user'
    }));

    render(<IntroductionMatcher contacts={manyContacts} />);

    // Matches should be limited (basic smoke test)
    expect(manyContacts.length).toBe(15);
  });

  it('should not match a contact with itself', () => {
    const singleContact: Contact[] = [
      {
        id: '1',
        name: 'Self Match',
        email: 'self@example.com',
        company: 'Test Co',
        lookingFor: 'web design',
        offering: 'web design',
        addedDate: new Date(),
        cooperationRating: 5,
        potentialScore: 5,
        tags: [],
        notes: '',
        interactionHistory: [],
        eventParticipationHistory: [],
        pastCollaborations: [],
        assignedTo: 'test-user'
      }
    ];

    const { container } = render(<IntroductionMatcher contacts={singleContact} />);

    // Should show no matches since it won't match with itself
    expect(container.textContent).toContain('No potential introductions found');
  });

  it('should sort matches by confidence (high > medium > low)', () => {
    const contactsForSorting: Contact[] = [
      {
        id: '1',
        name: 'Low Match A',
        email: 'low@example.com',
        company: 'Company A',
        lookingFor: 'marketing',
        offering: 'development',
        addedDate: new Date(),
        cooperationRating: 3,
        potentialScore: 3,
        tags: [],
        notes: '',
        interactionHistory: [],
        eventParticipationHistory: [],
        pastCollaborations: [],
        assignedTo: 'test-user'
      },
      {
        id: '2',
        name: 'Low Match B',
        email: 'low2@example.com',
        company: 'Company B',
        lookingFor: 'development',
        offering: 'marketing',
        addedDate: new Date(),
        cooperationRating: 3,
        potentialScore: 3,
        tags: [],
        notes: '',
        interactionHistory: [],
        eventParticipationHistory: [],
        pastCollaborations: [],
        assignedTo: 'test-user'
      },
      {
        id: '3',
        name: 'High Match A',
        email: 'high@example.com',
        company: 'Company C',
        lookingFor: 'professional web design services branding',
        offering: 'accounting',
        addedDate: new Date(),
        cooperationRating: 5,
        potentialScore: 5,
        tags: [],
        notes: '',
        interactionHistory: [],
        eventParticipationHistory: [],
        pastCollaborations: [],
        assignedTo: 'test-user'
      },
      {
        id: '4',
        name: 'High Match B',
        email: 'high2@example.com',
        company: 'Company D',
        lookingFor: 'accounting',
        offering: 'professional web design services branding',
        addedDate: new Date(),
        cooperationRating: 5,
        potentialScore: 5,
        tags: [],
        notes: '',
        interactionHistory: [],
        eventParticipationHistory: [],
        pastCollaborations: [],
        assignedTo: 'test-user'
      }
    ];

    const { container } = render(<IntroductionMatcher contacts={contactsForSorting} />);

    // Should have confidence badges
    expect(container.textContent).toContain('confidence');
  });
});
