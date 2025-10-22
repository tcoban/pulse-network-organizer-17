import React, { useState } from 'react';
import { Opportunity, MeetingGoal, useOpportunities } from '@/hooks/useOpportunities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays, 
  MapPin, 
  Plus, 
  Trash2, 
  Target,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { useUserGoals } from '@/hooks/useUserGoals';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityDetailsProps {
  opportunity: Opportunity | null;
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OpportunityDetails = ({ 
  opportunity, 
  contactId,
  isOpen, 
  onClose
}: OpportunityDetailsProps) => {
  const { updateOpportunity } = useOpportunities(contactId);
  const { goals: userGoals } = useUserGoals();
  const [editedOpportunity, setEditedOpportunity] = useState<Opportunity | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalUserGoalId, setNewGoalUserGoalId] = useState<string>('');

  // Initialize edited opportunity when opening
  React.useEffect(() => {
    if (opportunity && isOpen) {
      setEditedOpportunity({
        ...opportunity,
        meeting_goals: opportunity.meeting_goals || []
      });
    }
  }, [opportunity, isOpen]);

  if (!opportunity || !editedOpportunity) return null;

  const addGoal = async () => {
    if (!editedOpportunity) return;
    
    // If selecting existing goal
    if (newGoalUserGoalId && newGoalUserGoalId !== 'none') {
      try {
        const { data: newGoal, error } = await supabase
          .from('meeting_goals')
          .insert({
            opportunity_id: editedOpportunity.id,
            description: '', // Will be auto-filled from user_goal
            achieved: false,
            user_goal_id: newGoalUserGoalId
          })
          .select()
          .single();

        if (error) throw error;

        setEditedOpportunity({
          ...editedOpportunity,
          meeting_goals: [...(editedOpportunity.meeting_goals || []), newGoal as any]
        });
        setNewGoalUserGoalId('');
      } catch (error) {
        console.error('Error adding goal:', error);
      }
      return;
    }
    
    // If creating new goal
    if (newGoalText.trim()) {
      try {
        const { data: newGoal, error } = await supabase
          .from('meeting_goals')
          .insert({
            opportunity_id: editedOpportunity.id,
            description: newGoalText,
            achieved: false,
            user_goal_id: null // Trigger will auto-create user_goal
          })
          .select()
          .single();

        if (error) throw error;

        setEditedOpportunity({
          ...editedOpportunity,
          meeting_goals: [...(editedOpportunity.meeting_goals || []), newGoal as any]
        });
        setNewGoalText('');
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    }
  };

  const updateGoalUserGoal = async (goalId: string, userGoalId: string) => {
    try {
      const actualUserGoalId = (userGoalId && userGoalId !== 'none') ? userGoalId : null;
      const { error } = await supabase
        .from('meeting_goals')
        .update({ user_goal_id: actualUserGoalId })
        .eq('id', goalId);

      if (error) throw error;

      if (editedOpportunity) {
        setEditedOpportunity({
          ...editedOpportunity,
          meeting_goals: editedOpportunity.meeting_goals?.map(g => 
            g.id === goalId ? { ...g, user_goal_id: actualUserGoalId || undefined } as any : g
          ) || []
        });
      }
    } catch (error) {
      console.error('Error updating goal link:', error);
    }
  };

  const removeGoal = async (goalId: string) => {
    if (!editedOpportunity) return;
    
    try {
      const { error } = await supabase
        .from('meeting_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setEditedOpportunity({
        ...editedOpportunity,
        meeting_goals: editedOpportunity.meeting_goals?.filter(g => g.id !== goalId) || []
      });
    } catch (error) {
      console.error('Error removing goal:', error);
    }
  };

  const toggleGoalAchieved = async (goalId: string) => {
    if (!editedOpportunity) return;
    
    const goal = editedOpportunity.meeting_goals?.find(g => g.id === goalId);
    if (!goal) return;

    try {
      const { error } = await supabase
        .from('meeting_goals')
        .update({ achieved: !goal.achieved })
        .eq('id', goalId);

      if (error) throw error;

      setEditedOpportunity({
        ...editedOpportunity,
        meeting_goals: editedOpportunity.meeting_goals?.map(g => 
          g.id === goalId ? { ...g, achieved: !g.achieved } : g
        ) || []
      });
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  };

  const handleSave = async () => {
    if (editedOpportunity) {
      await updateOpportunity(editedOpportunity.id, editedOpportunity);
    }
    onClose();
  };

  const getTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      conference: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      appointment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string | undefined) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      considering: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return status ? colors[status as keyof typeof colors] || '' : '';
  };

  const achievedGoals = editedOpportunity?.meeting_goals?.filter(g => g.achieved).length || 0;
  const totalGoals = editedOpportunity?.meeting_goals?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>{opportunity.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opportunity Details */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={getTypeColor(opportunity.type)}>
                {opportunity.type}
              </Badge>
              {opportunity.registration_status && (
                <Badge className={getStatusColor(opportunity.registration_status)}>
                  {opportunity.registration_status}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{format(opportunity.date, 'PPP')}</span>
              </div>
              {opportunity.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{opportunity.location}</span>
                </div>
              )}
            </div>

            {opportunity.description && (
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">{opportunity.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Meeting Goals Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Meeting Goals</h3>
                {totalGoals > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {achievedGoals} of {totalGoals} goals achieved
                    {totalGoals > 0 && (
                      <span className="ml-2">
                        ({Math.round((achievedGoals / totalGoals) * 100)}%)
                      </span>
                    )}
                  </p>
                )}
              </div>
              {totalGoals > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(achievedGoals / totalGoals) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Add New Goal */}
            <div className="space-y-2">
              <Select value={newGoalUserGoalId || 'none'} onValueChange={setNewGoalUserGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select existing goal or create new..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Create new goal</SelectItem>
                  {userGoals.filter(g => g.status === 'active').map(ug => (
                    <SelectItem key={ug.id} value={ug.id}>
                      🎯 {ug.title} ({ug.progress_percentage}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(!newGoalUserGoalId || newGoalUserGoalId === 'none') && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter new goal..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <Button onClick={addGoal} size="sm" disabled={!newGoalText.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              )}
              
              {newGoalUserGoalId && newGoalUserGoalId !== 'none' && (
                <Button onClick={addGoal} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Link Goal to This Meeting
                </Button>
              )}
            </div>

            {/* Goals List */}
            <div className="space-y-2">
              {editedOpportunity?.meeting_goals?.map((goal: any) => {
                const linkedGoal = userGoals.find(ug => ug.id === goal.user_goal_id);
                return (
                  <div 
                    key={goal.id} 
                    className={`p-3 rounded-lg border transition-colors ${
                      goal.achieved 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                        : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={goal.achieved}
                        onCheckedChange={() => toggleGoalAchieved(goal.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`flex-1 ${goal.achieved ? 'line-through text-muted-foreground' : ''}`}>
                            {goal.description}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGoal(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Select
                          value={goal.user_goal_id || 'none'}
                          onValueChange={(value) => updateGoalUserGoal(goal.id, value === 'none' ? '' : value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Change linked goal..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">Unlink goal</span>
                            </SelectItem>
                            {userGoals.filter(ug => ug.id !== goal.user_goal_id).map(ug => (
                              <SelectItem key={ug.id} value={ug.id}>
                                🎯 {ug.title} ({ug.progress_percentage}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {linkedGoal && (
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="text-xs">
                              {linkedGoal.category}
                            </Badge>
                            <span className="text-muted-foreground">
                              {linkedGoal.progress_percentage}% complete
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!editedOpportunity?.meeting_goals || editedOpportunity.meeting_goals.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No meeting goals set yet</p>
                  <p className="text-sm">Add goals to track your meeting objectives</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};