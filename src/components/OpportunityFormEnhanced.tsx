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
import { CheckCircle2, AlertTriangle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useOpportunities, type Opportunity } from '@/hooks/useOpportunities';
import { inferOpportunityType, getTypeColor } from '@/utils/opportunityHelpers';
import { DuplicateWarningDialog } from './DuplicateWarningDialog';

interface OpportunityFormEnhancedProps {
  contactId: string;
  opportunity?: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
}

export const OpportunityFormEnhanced = ({ 
  contactId,
  opportunity, 
  isOpen, 
  onClose, 
  isEditing = false 
}: OpportunityFormEnhancedProps) => {
  const { createOpportunity, updateOpportunity } = useOpportunities(contactId);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting' as 'event' | 'meeting' | 'appointment' | 'conference' | 'other',
    date: '',
    location: '',
    description: '',
    registration_status: 'considering' as 'considering' | 'registered' | 'confirmed',
  });
  
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
      }
      setDuplicates([]);
    }
  }, [opportunity, isOpen]);

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

      if (isEditing && opportunity) {
        await updateOpportunity(opportunity.id, opportunityData);
      } else {
        const result = await createOpportunity(opportunityData, addToCalendar);
        
        // If duplicates were detected, show warning
        if (result === null && duplicates.length > 0) {
          setShowDuplicateWarning(true);
          setSaving(false);
          return;
        }
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
};
