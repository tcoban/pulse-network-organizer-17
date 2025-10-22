import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, AlertTriangle, Calendar as CalendarIcon, Loader2, Plus, X, Target, Sparkles } from 'lucide-react';
import { useOpportunities, type Opportunity, type MeetingGoal } from '@/hooks/useOpportunities';
import { inferOpportunityType, getTypeColor } from '@/utils/opportunityHelpers';
import { DuplicateWarningDialog } from './DuplicateWarningDialog';
import { supabase } from '@/integrations/supabase/client';
import { useUserGoals } from '@/hooks/useUserGoals';

interface OpportunityFormEnhancedProps {
  contactId: string;
  opportunity?: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
}

function OpportunityFormEnhanced({
  contactId,
  opportunity, 
  isOpen, 
  onClose, 
  isEditing = false 
}: OpportunityFormEnhancedProps) {
  const { createOpportunity, updateOpportunity } = useOpportunities(contactId);
  const { goals: userGoals } = useUserGoals();
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting' as 'event' | 'meeting' | 'appointment' | 'conference' | 'other',
    date: '',
    location: '',
    description: '',
    registration_status: 'considering' as 'considering' | 'registered' | 'confirmed',
  });
  
  const [meetingGoals, setMeetingGoals] = useState<Array<{ id: string; description: string; achieved: boolean; related_project?: string; user_goal_id?: string }>>([]);
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalProject, setNewGoalProject] = useState('');
  const [newGoalUserGoalId, setNewGoalUserGoalId] = useState<string>('');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (opportunity) {
        setFormData({
          title: opportunity.title,
          type: opportunity.type,
          date: opportunity.date,
          location: opportunity.location || '',
          description: opportunity.description || '',
          registration_status: opportunity.registration_status || 'considering',
        });
        setAddToCalendar(opportunity.synced_to_calendar);
        
        // Load existing meeting goals
        if (opportunity.id) {
          loadMeetingGoals(opportunity.id);
        } else {
          setMeetingGoals(opportunity.meeting_goals || []);
        }
      } else {
        setFormData({
          title: '',
          type: 'meeting',
          date: '',
          location: '',
          description: '',
          registration_status: 'considering',
        });
        setAddToCalendar(false);
        setMeetingGoals([]);
      }
      setDuplicates([]);
      setNewGoalDescription('');
      setNewGoalProject('');
    }
  }, [opportunity, isOpen]);

  const loadMeetingGoals = async (opportunityId: string) => {
    try {
      const { data, error } = await supabase
        .from('meeting_goals')
        .select('*')
        .eq('opportunity_id', opportunityId);
      
      if (error) throw error;
      setMeetingGoals(data || []);
    } catch (error) {
      console.error('Error loading meeting goals:', error);
    }
  };

  const addGoal = () => {
    if (!newGoalDescription.trim()) return;
    
    const newGoal = {
      id: `temp-${Date.now()}`,
      description: newGoalDescription,
      achieved: false,
      related_project: newGoalProject || undefined,
      user_goal_id: newGoalUserGoalId || undefined,
    };
    
    setMeetingGoals([...meetingGoals, newGoal]);
    setNewGoalDescription('');
    setNewGoalProject('');
    setNewGoalUserGoalId('');
  };

  const updateGoalUserGoal = (goalId: string, userGoalId: string) => {
    setMeetingGoals(meetingGoals.map(g => 
      g.id === goalId ? { ...g, user_goal_id: userGoalId || undefined } : g
    ));
  };

  const removeGoal = (goalId: string) => {
    setMeetingGoals(meetingGoals.filter(g => g.id !== goalId));
  };

  const toggleGoalAchieved = (goalId: string) => {
    setMeetingGoals(meetingGoals.map(g => 
      g.id === goalId ? { ...g, achieved: !g.achieved } : g
    ));
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-infer type from title
      type: title.length > 3 ? inferOpportunityType(title) : prev.type
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date) {
      return;
    }

    setSaving(true);
    
    try {
      const opportunityData = {
        ...formData,
        contact_id: contactId,
      };

      let opportunityId: string | null = null;

      if (isEditing && opportunity) {
        await updateOpportunity(opportunity.id, opportunityData);
        opportunityId = opportunity.id;
        
        // Update meeting goals
        // First delete existing goals
        const { error: deleteError } = await supabase
          .from('meeting_goals')
          .delete()
          .eq('opportunity_id', opportunity.id);
        
        if (deleteError) throw deleteError;
      } else {
        const result = await createOpportunity(opportunityData, addToCalendar);
        
        // If duplicates were detected, show warning
        if (result === null && duplicates.length > 0) {
          setShowDuplicateWarning(true);
          setSaving(false);
          return;
        }
        
        opportunityId = result?.id || null;
      }
      
      // Insert meeting goals if we have an opportunity ID
      if (opportunityId && meetingGoals.length > 0) {
        const goalsToInsert = meetingGoals.map(goal => ({
          opportunity_id: opportunityId,
          description: goal.description,
          achieved: goal.achieved,
          related_project: goal.related_project,
          user_goal_id: goal.user_goal_id || null,
        }));
        
        const { error: goalsError } = await supabase
          .from('meeting_goals')
          .insert(goalsToInsert);
        
        if (goalsError) throw goalsError;
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDuplicate = async () => {
    setShowDuplicateWarning(false);
    // Force create even with duplicates
    setSaving(true);
    try {
      await createOpportunity({
        ...formData,
        contact_id: contactId,
      }, addToCalendar);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Opportunity' : 'Add New Opportunity'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the opportunity details below.' 
                : 'Create a new opportunity and optionally sync it to your calendar.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. KOF Conference 2025"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
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
                  <Badge className={getTypeColor(formData.type)} variant="outline">
                    {formData.type}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date & Time *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date ? formData.date.slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationStatus">Status</Label>
                <Select
                  value={formData.registration_status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, registration_status: value }))}
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
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Zurich, Switzerland or Online"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this opportunity"
                rows={3}
              />
            </div>

            {/* Meeting Goals Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Meeting Goals</Label>
              </div>
              
              {/* Display existing goals */}
              {meetingGoals.length > 0 && (
                <div className="space-y-2">
                  {meetingGoals.map((goal) => {
                    const linkedGoal = userGoals.find(ug => ug.id === goal.user_goal_id);
                    return (
                      <div key={goal.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <Checkbox
                          checked={goal.achieved}
                          onCheckedChange={() => toggleGoalAchieved(goal.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <p className={`text-sm ${goal.achieved ? 'line-through text-muted-foreground' : ''}`}>
                            {goal.description}
                          </p>
                          {goal.related_project && (
                            <p className="text-xs text-muted-foreground">
                              Project: {goal.related_project}
                            </p>
                          )}
                          <Select
                            value={goal.user_goal_id || 'none'}
                            onValueChange={(value) => updateGoalUserGoal(goal.id, value === 'none' ? '' : value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Link to strategic goal..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">No strategic goal</span>
                              </SelectItem>
                              {userGoals.map(ug => (
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGoal(goal.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Add new goal */}
              <div className="space-y-2">
                <Input
                  placeholder="Add a goal for this meeting..."
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addGoal();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Related project (optional)"
                    value={newGoalProject}
                    onChange={(e) => setNewGoalProject(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newGoalUserGoalId} onValueChange={setNewGoalUserGoalId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Link to goal..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        <span className="text-muted-foreground">No strategic goal</span>
                      </SelectItem>
                      {userGoals.filter(g => g.status === 'active').map(ug => (
                        <SelectItem key={ug.id} value={ug.id}>
                          🎯 {ug.title} ({ug.progress_percentage}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGoal}
                    disabled={!newGoalDescription.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Checkbox 
                  id="addToCalendar" 
                  checked={addToCalendar}
                  onCheckedChange={(checked) => setAddToCalendar(checked as boolean)}
                />
                <Label htmlFor="addToCalendar" className="text-sm cursor-pointer flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Add to my calendar (sync with Outlook)
                </Label>
              </div>
            )}

            {opportunity?.synced_to_calendar && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Synced to calendar
              </div>
            )}

            {duplicates.length > 0 && !showDuplicateWarning && (
              <Alert variant="default" className="border-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Potential Duplicate Detected</AlertTitle>
                <AlertDescription>
                  Similar opportunity exists: "{duplicates[0].title}" on {new Date(duplicates[0].date).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Opportunity' : 'Create Opportunity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DuplicateWarningDialog
        open={showDuplicateWarning}
        duplicates={duplicates}
        onConfirm={handleConfirmDuplicate}
        onCancel={() => setShowDuplicateWarning(false)}
      />
    </>
  );
}

export default OpportunityFormEnhanced;
