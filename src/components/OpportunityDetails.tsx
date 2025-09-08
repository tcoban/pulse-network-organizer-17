import React, { useState } from 'react';
import { ContactOpportunity, MeetingGoal } from '@/types/contact';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

interface OpportunityDetailsProps {
  opportunity: ContactOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: ContactOpportunity) => void;
}

export const OpportunityDetails = ({ 
  opportunity, 
  isOpen, 
  onClose, 
  onSave 
}: OpportunityDetailsProps) => {
  const [editedOpportunity, setEditedOpportunity] = useState<ContactOpportunity | null>(null);
  const [newGoalText, setNewGoalText] = useState('');

  // Initialize edited opportunity when opening
  React.useEffect(() => {
    if (opportunity && isOpen) {
      setEditedOpportunity({
        ...opportunity,
        meetingGoals: opportunity.meetingGoals || []
      });
    }
  }, [opportunity, isOpen]);

  if (!opportunity || !editedOpportunity) return null;

  const addGoal = () => {
    if (!newGoalText.trim()) return;
    
    const newGoal: MeetingGoal = {
      id: Date.now().toString(),
      description: newGoalText,
      achieved: false
    };

    setEditedOpportunity({
      ...editedOpportunity,
      meetingGoals: [...(editedOpportunity.meetingGoals || []), newGoal]
    });
    setNewGoalText('');
  };

  const removeGoal = (goalId: string) => {
    setEditedOpportunity({
      ...editedOpportunity,
      meetingGoals: editedOpportunity.meetingGoals?.filter(g => g.id !== goalId) || []
    });
  };

  const toggleGoalAchieved = (goalId: string) => {
    setEditedOpportunity({
      ...editedOpportunity,
      meetingGoals: editedOpportunity.meetingGoals?.map(g => 
        g.id === goalId ? { ...g, achieved: !g.achieved } : g
      ) || []
    });
  };

  const handleSave = () => {
    onSave(editedOpportunity);
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

  const achievedGoals = editedOpportunity.meetingGoals?.filter(g => g.achieved).length || 0;
  const totalGoals = editedOpportunity.meetingGoals?.length || 0;

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
              {opportunity.registrationStatus && (
                <Badge className={getStatusColor(opportunity.registrationStatus)}>
                  {opportunity.registrationStatus}
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
            <div className="flex space-x-2">
              <Input
                placeholder="Add a meeting goal..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              />
              <Button onClick={addGoal} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Goals List */}
            <div className="space-y-2">
              {editedOpportunity.meetingGoals?.map((goal) => (
                <div 
                  key={goal.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    goal.achieved 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-background border-border'
                  }`}
                >
                  <Checkbox
                    checked={goal.achieved}
                    onCheckedChange={() => toggleGoalAchieved(goal.id)}
                  />
                  <span 
                    className={`flex-1 ${
                      goal.achieved 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    }`}
                  >
                    {goal.description}
                  </span>
                  {goal.achieved && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(goal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(!editedOpportunity.meetingGoals || editedOpportunity.meetingGoals.length === 0) && (
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