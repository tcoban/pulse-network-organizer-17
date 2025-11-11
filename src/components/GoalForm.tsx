import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X, Calendar as CalendarMeetingIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useGoals } from '@/hooks/useGoals';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useOpportunities } from '@/hooks/useOpportunities';
import { cn } from '@/lib/utils';

interface GoalFormProps {
  projectId: string;
  goal?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalForm({ projectId, goal, isOpen, onClose }: GoalFormProps) {
  const { createGoal, updateGoal } = useGoals();
  const { teamMembers } = useTeamMembers();
  const { opportunities } = useOpportunities();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'strategic',
    status: 'active',
    target_date: undefined as Date | undefined,
    linked_opportunity_id: undefined as string | undefined,
  });
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'strategic',
        status: goal.status || 'active',
        target_date: goal.target_date ? new Date(goal.target_date) : undefined,
        linked_opportunity_id: goal.linked_opportunity_id || undefined,
      });
      setSelectedMembers(goal.assignments?.map((a: any) => a.team_member_id) || []);
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: 'strategic',
        status: 'active',
        target_date: undefined,
        linked_opportunity_id: undefined,
      });
      setSelectedMembers([]);
    }
  }, [goal, isOpen]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const goalData = {
        ...formData,
        project_id: projectId,
        target_date: formData.target_date?.toISOString().split('T')[0],
      };

      if (goal) {
        await updateGoal(goal.id, goalData);
      } else {
        await createGoal(goalData, selectedMembers);
      }

      onClose();
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = (memberId: string) => {
    if (!selectedMembers.includes(memberId)) {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== memberId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter goal title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter goal description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.target_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_date ? format(formData.target_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.target_date}
                  onSelect={(date) => setFormData({ ...formData, target_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="linked_opportunity">Link to Meeting/Opportunity (Optional)</Label>
            <Select 
              value={formData.linked_opportunity_id} 
              onValueChange={(value) => setFormData({ ...formData, linked_opportunity_id: value === 'none' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a meeting or opportunity">
                  {formData.linked_opportunity_id ? (
                    <div className="flex items-center gap-2">
                      <CalendarMeetingIcon className="h-4 w-4" />
                      {opportunities.find(o => o.id === formData.linked_opportunity_id)?.title}
                    </div>
                  ) : (
                    "Select a meeting or opportunity"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {opportunities
                  .filter(o => new Date(o.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(opp => (
                    <SelectItem key={opp.id} value={opp.id}>
                      <div className="flex items-center gap-2">
                        <CalendarMeetingIcon className="h-4 w-4" />
                        <span>{opp.title}</span>
                        <span className="text-xs text-muted-foreground">
                          ({format(new Date(opp.date), 'MMM d, yyyy')})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Link this goal to a specific meeting where you plan to work on it
            </p>
          </div>

          <div>
            <Label>Assign Team Members</Label>
            <Select onValueChange={addTeamMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers
                  .filter(member => !selectedMembers.includes(member.id))
                  .map(member => (
                    <SelectItem key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMembers.map(memberId => {
                const member = teamMembers.find(m => m.id === memberId);
                return member ? (
                  <Badge key={memberId} variant="secondary" className="gap-1">
                    {member.firstName} {member.lastName}
                    <button
                      onClick={() => removeMember(memberId)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.title.trim()}
          >
            {loading ? 'Saving...' : goal ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
