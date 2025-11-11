import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBNIIntegration } from '@/hooks/useBNIIntegration';
import { Target, Users, Award, TrendingUp, Lightbulb } from 'lucide-react';

interface GAINSMeetingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
}

export const GAINSMeetingForm = ({ open, onOpenChange, contactId, contactName }: GAINSMeetingFormProps) => {
  const { toast } = useToast();
  const { createGAINSFollowUpGoals } = useBNIIntegration();
  
  const [formData, setFormData] = useState({
    goals: '',
    accomplishments: '',
    interests: '',
    networks: '',
    skills: '',
    idealReferral: '',
    howToHelp: '',
    targetMarket: '',
    preparationNotes: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create GAINS meeting record
      const { data: gainsMeeting, error } = await supabase
        .from('gains_meetings')
        .insert({
          contact_id: contactId,
          conducted_by: user.id,
          meeting_date: new Date().toISOString(),
          goals: formData.goals,
          accomplishments: formData.accomplishments,
          interests: formData.interests,
          networks: formData.networks,
          skills: formData.skills,
          ideal_referral: formData.idealReferral,
          how_to_help: formData.howToHelp,
          target_market: formData.targetMarket,
          preparation_notes: formData.preparationNotes,
          completed: true
        })
        .select()
        .single();

      if (error) throw error;

      // Create follow-up goals based on GAINS data
      await createGAINSFollowUpGoals({
        contactId,
        contactName,
        idealReferral: formData.idealReferral,
        howToHelp: formData.howToHelp
      });

      toast({
        title: 'GAINS Meeting Recorded',
        description: `Successfully recorded GAINS meeting with ${contactName}. Follow-up goals have been created.`,
      });

      onOpenChange(false);
      
      // Reset form
      setFormData({
        goals: '',
        accomplishments: '',
        interests: '',
        networks: '',
        skills: '',
        idealReferral: '',
        howToHelp: '',
        targetMarket: '',
        preparationNotes: ''
      });
    } catch (error) {
      console.error('Error saving GAINS meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save GAINS meeting. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            GAINS Meeting with {contactName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Goals • Accomplishments • Interests • Networks • Skills
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </Label>
            <Textarea
              id="goals"
              placeholder="What are their business and personal goals?"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accomplishments" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Accomplishments
            </Label>
            <Textarea
              id="accomplishments"
              placeholder="What have they achieved recently?"
              value={formData.accomplishments}
              onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Interests
            </Label>
            <Textarea
              id="interests"
              placeholder="What are their hobbies and interests?"
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="networks" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Networks
            </Label>
            <Textarea
              id="networks"
              placeholder="What networks and associations are they part of?"
              value={formData.networks}
              onChange={(e) => setFormData({ ...formData, networks: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Skills
            </Label>
            <Textarea
              id="skills"
              placeholder="What are their key skills and expertise?"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              rows={2}
            />
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
            <h3 className="font-semibold text-primary">Referral Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="idealReferral">Ideal Referral</Label>
              <Input
                id="idealReferral"
                placeholder="e.g., CFOs at tech companies with 50+ employees"
                value={formData.idealReferral}
                onChange={(e) => setFormData({ ...formData, idealReferral: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="howToHelp">How to Help Them</Label>
              <Textarea
                id="howToHelp"
                placeholder="Specific ways you can help this contact"
                value={formData.howToHelp}
                onChange={(e) => setFormData({ ...formData, howToHelp: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Market</Label>
              <Input
                id="targetMarket"
                placeholder="Who are their ideal clients?"
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparationNotes">Additional Notes</Label>
            <Textarea
              id="preparationNotes"
              placeholder="Any other important information from the meeting"
              value={formData.preparationNotes}
              onChange={(e) => setFormData({ ...formData, preparationNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save GAINS Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
