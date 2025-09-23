import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, X, Calendar, DollarSign, Target, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'partnership' | 'networking' | 'policy';
  targetValue?: number;
  currentValue: number;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  relatedContacts: string[];
  status: 'planning' | 'active' | 'completed' | 'paused';
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
  }>;
}

interface ProjectFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
}

const ProjectForm = ({ project, isOpen, onClose, onSave }: ProjectFormProps) => {
  const [formData, setFormData] = useState<Project>(() => ({
    id: project?.id || crypto.randomUUID(),
    title: project?.title || '',
    description: project?.description || '',
    type: project?.type || 'fundraising',
    targetValue: project?.targetValue || 0,
    currentValue: project?.currentValue || 0,
    deadline: project?.deadline || undefined,
    priority: project?.priority || 'medium',
    relatedContacts: project?.relatedContacts || [],
    status: project?.status || 'planning',
    milestones: project?.milestones || []
  }));

  const [newMilestone, setNewMilestone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [
          ...prev.milestones,
          {
            id: crypto.randomUUID(),
            title: newMilestone.trim(),
            completed: false
          }
        ]
      }));
      setNewMilestone('');
    }
  };

  const removeMilestone = (milestoneId: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId)
    }));
  };

  const toggleMilestone = (milestoneId: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      )
    }));
  };

  const progressPercentage = formData.targetValue > 0 
    ? (formData.currentValue / formData.targetValue) * 100 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {project ? 'Edit Project' : 'New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundraising">Fundraising</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project goals and objectives"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline ? format(formData.deadline, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    deadline: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Financial Targets (for fundraising projects) */}
          {formData.type === 'fundraising' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Target className="h-5 w-5" />
                Financial Targets
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Amount (CHF)</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formData.targetValue || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      targetValue: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Amount (CHF)</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={formData.currentValue || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      currentValue: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.targetValue > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {progressPercentage.toFixed(1)}%</span>
                    <span>
                      {new Intl.NumberFormat('en-CH', { 
                        style: 'currency', 
                        currency: 'CHF', 
                        minimumFractionDigits: 0 
                      }).format(formData.currentValue)} / {new Intl.NumberFormat('en-CH', { 
                        style: 'currency', 
                        currency: 'CHF', 
                        minimumFractionDigits: 0 
                      }).format(formData.targetValue)}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </div>
          )}

          {/* Milestones */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Milestones
            </h3>
            
            <div className="flex gap-2">
              <Input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Add new milestone"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
              />
              <Button type="button" onClick={addMilestone} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={() => toggleMilestone(milestone.id)}
                    className="rounded border-gray-300"
                  />
                  <span className={`flex-1 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {milestone.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(milestone.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {formData.milestones.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {formData.milestones.filter(m => m.completed).length} of {formData.milestones.length} milestones completed
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;