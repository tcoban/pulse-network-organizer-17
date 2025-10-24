import { useState, useEffect } from 'react';
import { useTargets } from '@/hooks/useTargets';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface TargetFormProps {
  projectId: string;
  target?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TargetForm({ projectId, target, isOpen, onClose }: TargetFormProps) {
  const { createTarget, updateTarget, assignTeamMember, removeTeamMember } = useTargets(projectId);
  const { teamMembers } = useTeamMembers();
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    target_date: undefined as Date | undefined,
  });

  useEffect(() => {
    if (target) {
      setFormData({
        title: target.title || '',
        description: target.description || '',
        status: target.status || 'active',
        target_date: target.target_date ? new Date(target.target_date) : undefined,
      });
      setSelectedMembers(target.assignments?.map((a: any) => a.team_member_id) || []);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'active',
        target_date: undefined,
      });
      setSelectedMembers([]);
    }
  }, [target, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const targetData = {
        ...formData,
        project_id: projectId,
        target_date: formData.target_date?.toISOString().split('T')[0],
      };

      let targetId = target?.id;
      if (target) {
        await updateTarget(target.id, targetData);
      } else {
        const newTarget = await createTarget(targetData);
        targetId = newTarget?.id;
      }

      // Handle team member assignments
      if (targetId) {
        const currentMembers = target?.assignments?.map((a: any) => a.team_member_id) || [];
        const toAdd = selectedMembers.filter(id => !currentMembers.includes(id));
        const toRemove = target?.assignments?.filter((a: any) => !selectedMembers.includes(a.team_member_id)) || [];

        for (const memberId of toAdd) {
          await assignTeamMember(targetId, memberId);
        }

        for (const assignment of toRemove) {
          await removeTeamMember(assignment.id);
        }
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
          <DialogTitle>{target ? 'Edit Target' : 'Create New Target'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Secure €500K in funding"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the target objective..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_date ? format(formData.target_date, 'PPP') : 'Pick a date'}
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
          </div>

          <div>
            <Label>Assign Team Members</Label>
            <Select onValueChange={addTeamMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select team members..." />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMembers.map(memberId => {
                const member = teamMembers.find(m => m.id === memberId);
                return member ? (
                  <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                    {member.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeMember(memberId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.title}>
            {loading ? 'Saving...' : target ? 'Update Target' : 'Create Target'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
