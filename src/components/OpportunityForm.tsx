import { useState } from 'react';
import { ContactOpportunity, MeetingGoal } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OpportunityFormProps {
  opportunity?: ContactOpportunity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: ContactOpportunity) => void;
  isEditing?: boolean;
}

const OpportunityForm = ({ opportunity, isOpen, onClose, onSave, isEditing = false }: OpportunityFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<ContactOpportunity>>(() => {
    if (opportunity) return { ...opportunity };
    
    return {
      title: '',
      type: 'meeting',
      date: new Date(),
      location: '',
      description: '',
      registrationStatus: 'considering',
      meetingGoals: []
    };
  });

  const [newGoal, setNewGoal] = useState('');

  const handleInputChange = (field: keyof ContactOpportunity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const goal: MeetingGoal = {
        id: `goal-${Date.now()}`,
        description: newGoal.trim(),
        achieved: false
      };
      
      setFormData(prev => ({
        ...prev,
        meetingGoals: [...(prev.meetingGoals || []), goal]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      meetingGoals: prev.meetingGoals?.filter(goal => goal.id !== goalId) || []
    }));
  };

  const toggleGoalAchieved = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      meetingGoals: prev.meetingGoals?.map(goal =>
        goal.id === goalId ? { ...goal, achieved: !goal.achieved } : goal
      ) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for this opportunity.",
        variant: "destructive"
      });
      return;
    }

    const opportunityData: ContactOpportunity = {
      id: opportunity?.id || `opportunity-${Date.now()}`,
      title: formData.title!,
      type: formData.type || 'meeting',
      date: formData.date || new Date(),
      location: formData.location || undefined,
      description: formData.description || undefined,
      registrationStatus: formData.registrationStatus || 'considering',
      meetingGoals: formData.meetingGoals || []
    };

    onSave(opportunityData);
    onClose();
    
    toast({
      title: isEditing ? "Opportunity updated" : "Opportunity created",
      description: `${opportunityData.title} has been ${isEditing ? 'updated' : 'added'} successfully.`
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'appointment': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'considering': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Opportunity' : 'Add New Opportunity'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. KOF Conference 2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date ? new Date(formData.date.getTime() - formData.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('date', new Date(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationStatus">Status</Label>
              <Select
                value={formData.registrationStatus}
                onValueChange={(value) => handleInputChange('registrationStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="considering">Considering</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Zurich, Switzerland or Online"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about this opportunity"
              rows={3}
            />
          </div>

          {/* Meeting Goals Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Meeting Goals</h3>
            </div>
            
            {formData.meetingGoals && formData.meetingGoals.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-2">
                  {formData.meetingGoals.filter(g => g.achieved).length} of {formData.meetingGoals.length} goals achieved
                </div>
                {formData.meetingGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <input
                      type="checkbox"
                      checked={goal.achieved}
                      onChange={() => toggleGoalAchieved(goal.id)}
                      className="rounded"
                    />
                    <span className={`flex-1 ${goal.achieved ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.description}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No goals set for this opportunity yet.</p>
            )}

            <div className="flex gap-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a meeting goal"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              />
              <Button type="button" onClick={addGoal} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Opportunity' : 'Create Opportunity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;