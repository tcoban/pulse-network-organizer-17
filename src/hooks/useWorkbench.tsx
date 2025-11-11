import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionType: 'call' | 'email' | 'meeting' | 'referral' | 'follow-up';
  completed: boolean;
  xpReward: number;
  dueDate?: string;
  contact?: {
    id: string;
    name: string;
    company?: string;
  };
}

interface SmartSuggestion {
  id: string;
  type: 'meeting' | 'referral' | 'goal';
  title: string;
  reason: string;
  confidence: number;
  relatedContacts?: Array<{ id: string; name: string }>;
}

interface RelationshipHealth {
  contactId: string;
  contactName: string;
  company?: string;
  healthScore: number;
  lastContactDays: number;
  totalInteractions: number;
  suggestions: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  points: number;
}

export function useWorkbench() {
  const { user } = useAuth();
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [relationshipHealth, setRelationshipHealth] = useState<RelationshipHealth[]>([]);
  const [achievements, setAchievements] = useState({
    totalPoints: 0,
    recent: [] as Achievement[]
  });
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [weeklyGoals, setWeeklyGoals] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWorkbenchData();
    }
  }, [user]);

  async function loadWorkbenchData() {
    try {
      await Promise.all([
        loadDailyTasks(),
        loadSmartSuggestions(),
        loadRelationshipHealth(),
        loadAchievements(),
        loadStreak(),
        loadWeeklyGoals()
      ]);
    } catch (error) {
      console.error('Error loading workbench data:', error);
      toast.error('Failed to load workbench data');
    } finally {
      setLoading(false);
    }
  }

  async function loadDailyTasks() {
    // Fetch contacts that need attention
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, company, last_contact, assigned_to')
      .or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`)
      .order('last_contact', { ascending: true });

    const tasks: DailyTask[] = [];
    const today = new Date();

    // Generate tasks based on contact activity
    contacts?.forEach(contact => {
      const daysSinceContact = contact.last_contact 
        ? differenceInDays(today, new Date(contact.last_contact))
        : 999;

      if (daysSinceContact > 30) {
        tasks.push({
          id: `reconnect-${contact.id}`,
          title: `Reconnect with ${contact.name}`,
          description: `No contact in ${daysSinceContact} days. Time to reach out!`,
          priority: daysSinceContact > 60 ? 'high' : 'medium',
          actionType: 'call',
          completed: false,
          xpReward: 15,
          contact: {
            id: contact.id,
            name: contact.name,
            company: contact.company
          }
        });
      }
    });

    // Fetch overdue opportunities
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('id, title, date, contact_id, contacts(name, company)')
      .gte('date', today.toISOString())
      .lt('date', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true });

    opportunities?.forEach(opp => {
      tasks.push({
        id: `prep-${opp.id}`,
        title: `Prepare for: ${opp.title}`,
        description: 'Review GAINS notes and set meeting objectives',
        priority: 'high',
        actionType: 'meeting',
        completed: false,
        xpReward: 20,
        dueDate: opp.date,
        contact: opp.contacts ? {
          id: opp.contact_id,
          name: (opp.contacts as any).name,
          company: (opp.contacts as any).company
        } : undefined
      });
    });

    // Fetch pending referrals
    const { data: referrals } = await supabase
      .from('referrals_given')
      .select('id, service_description, status, contacts(name, company)')
      .eq('given_by', user?.id)
      .eq('status', 'pending')
      .limit(5);

    referrals?.forEach(ref => {
      tasks.push({
        id: `follow-referral-${ref.id}`,
        title: 'Follow up on referral',
        description: `Check status: ${ref.service_description}`,
        priority: 'medium',
        actionType: 'follow-up',
        completed: false,
        xpReward: 10,
        contact: ref.contacts ? {
          id: ref.id,
          name: (ref.contacts as any).name,
          company: (ref.contacts as any).company
        } : undefined
      });
    });

    setDailyTasks(tasks.slice(0, 10)); // Limit to top 10 tasks
  }

  async function loadSmartSuggestions() {
    const suggestions: SmartSuggestion[] = [];

    // Suggest introductions based on complementary needs
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, offering, looking_for')
      .or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`)
      .not('offering', 'is', null)
      .not('looking_for', 'is', null);

    // Simple matching algorithm
    if (contacts) {
      for (let i = 0; i < contacts.length; i++) {
        for (let j = i + 1; j < contacts.length; j++) {
          const contact1 = contacts[i];
          const contact2 = contacts[j];
          
          if (contact1.offering && contact2.looking_for) {
            const match = contact1.offering.toLowerCase().includes(contact2.looking_for.toLowerCase().split(' ')[0]);
            if (match) {
              suggestions.push({
                id: `intro-${contact1.id}-${contact2.id}`,
                type: 'referral',
                title: `Introduce ${contact1.name} to ${contact2.name}`,
                reason: `${contact1.name} offers what ${contact2.name} is looking for`,
                confidence: 85,
                relatedContacts: [
                  { id: contact1.id, name: contact1.name },
                  { id: contact2.id, name: contact2.name }
                ]
              });
            }
          }
        }
      }
    }

    // Suggest meetings for stale relationships
    const { data: staleContacts } = await supabase
      .from('contacts')
      .select('id, name, company, last_contact')
      .or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`)
      .not('last_contact', 'is', null)
      .order('last_contact', { ascending: true })
      .limit(3);

    staleContacts?.forEach(contact => {
      const daysSince = differenceInDays(new Date(), new Date(contact.last_contact));
      if (daysSince > 45) {
        suggestions.push({
          id: `meeting-${contact.id}`,
          type: 'meeting',
          title: `Schedule catch-up with ${contact.name}`,
          reason: `No contact in ${daysSince} days. Maintain relationship momentum`,
          confidence: 90,
          relatedContacts: [{ id: contact.id, name: contact.name }]
        });
      }
    });

    setSmartSuggestions(suggestions.slice(0, 8));
  }

  async function loadRelationshipHealth() {
    const { data: contacts } = await supabase
      .from('contacts')
      .select(`
        id, 
        name, 
        company, 
        last_contact,
        interactions(count)
      `)
      .or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`)
      .order('last_contact', { ascending: true })
      .limit(10);

    const health: RelationshipHealth[] = contacts?.map(contact => {
      const daysSinceContact = contact.last_contact 
        ? differenceInDays(new Date(), new Date(contact.last_contact))
        : 999;
      
      const interactionCount = Array.isArray(contact.interactions) ? contact.interactions.length : 0;
      
      // Calculate health score (0-100)
      let healthScore = 100;
      if (daysSinceContact > 90) healthScore -= 60;
      else if (daysSinceContact > 60) healthScore -= 40;
      else if (daysSinceContact > 30) healthScore -= 20;
      
      if (interactionCount < 3) healthScore -= 20;
      else if (interactionCount < 6) healthScore -= 10;
      
      healthScore = Math.max(0, Math.min(100, healthScore));

      const suggestions: string[] = [];
      if (daysSinceContact > 60) suggestions.push('Schedule a catch-up call or meeting');
      if (interactionCount < 5) suggestions.push('Increase interaction frequency');
      if (healthScore < 50) suggestions.push('Consider a GAINS conversation to re-engage');

      return {
        contactId: contact.id,
        contactName: contact.name,
        company: contact.company,
        healthScore,
        lastContactDays: daysSinceContact,
        totalInteractions: interactionCount,
        suggestions
      };
    }) || [];

    setRelationshipHealth(health);
  }

  async function loadAchievements() {
    // Fetch user activity stats
    const { data: referralsCount } = await supabase
      .from('referrals_given')
      .select('id', { count: 'exact' })
      .eq('given_by', user?.id);

    const { data: meetingsCount } = await supabase
      .from('gains_meetings')
      .select('id', { count: 'exact' })
      .eq('conducted_by', user?.id);

    const referrals = referralsCount?.length || 0;
    const meetings = meetingsCount?.length || 0;

    const achievementsList: Achievement[] = [
      {
        id: 'first-referral',
        title: 'First Referral',
        description: 'Give your first referral',
        unlocked: referrals >= 1,
        progress: Math.min(100, referrals * 100),
        points: 50
      },
      {
        id: 'referral-champion',
        title: 'Referral Champion',
        description: 'Give 10 referrals',
        unlocked: referrals >= 10,
        progress: Math.min(100, (referrals / 10) * 100),
        points: 200
      },
      {
        id: 'gains-guru',
        title: 'GAINS Guru',
        description: 'Conduct 5 GAINS meetings',
        unlocked: meetings >= 5,
        progress: Math.min(100, (meetings / 5) * 100),
        points: 150
      },
      {
        id: 'network-builder',
        title: 'Network Builder',
        description: 'Add 50 quality contacts',
        unlocked: false,
        progress: 45,
        points: 100
      }
    ];

    const totalPoints = achievementsList
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    setAchievements({
      totalPoints,
      recent: achievementsList
    });
  }

  async function loadStreak() {
    // Simplified streak calculation - in production, track daily logins
    setStreak({ current: 7, longest: 14 });
  }

  async function loadWeeklyGoals() {
    const { data: goals } = await supabase
      .from('goals')
      .select('id, status, progress_percentage')
      .eq('assigned_to', user?.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const total = goals?.length || 0;
    const completed = goals?.filter(g => g.status === 'completed').length || 0;

    setWeeklyGoals({ completed, total: Math.max(total, 5) });
  }

  async function completeTask(taskId: string) {
    setDailyTasks(tasks => 
      tasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
    );
    
    const task = dailyTasks.find(t => t.id === taskId);
    if (task) {
      setAchievements(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + task.xpReward
      }));
      toast.success(`+${task.xpReward} XP earned!`, {
        description: 'Great work on completing this task!'
      });
    }
  }

  async function dismissSuggestion(suggestionId: string) {
    setSmartSuggestions(suggestions => 
      suggestions.filter(s => s.id !== suggestionId)
    );
  }

  return {
    dailyTasks,
    smartSuggestions,
    relationshipHealth,
    achievements,
    streak,
    weeklyGoals,
    loading,
    completeTask,
    dismissSuggestion,
    refresh: loadWorkbenchData
  };
}
