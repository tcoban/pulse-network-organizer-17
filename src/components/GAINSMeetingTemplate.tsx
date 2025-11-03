import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GAINSMeetingTemplateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
  opportunityId?: string;
}

export const GAINSMeetingTemplate = ({ 
  open, 
  onOpenChange, 
  contactId, 
  contactName,
  opportunityId 
}: GAINSMeetingTemplateProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 16));
  
  // GAINS fields
  const [goals, setGoals] = useState('');
  const [accomplishments, setAccomplishments] = useState('');
  const [interests, setInterests] = useState('');
  const [networks, setNetworks] = useState('');
  const [skills, setSkills] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [idealReferral, setIdealReferral] = useState('');
  const [howToHelp, setHowToHelp] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('gains_meetings')
        .insert({
          contact_id: contactId,
          opportunity_id: opportunityId,
          conducted_by: user.id,
          meeting_date: meetingDate,
          goals,
          accomplishments,
          interests,
          networks,
          skills,
          target_market: targetMarket,
          ideal_referral: idealReferral,
          how_to_help: howToHelp,
          preparation_notes: preparationNotes,
          completed: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'GAINS meeting notes saved successfully'
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving GAINS meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save GAINS meeting',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>GAINS 1-2-1 Meeting: {contactName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="meetingDate">Meeting Date & Time</Label>
            <Input
              id="meetingDate"
              type="datetime-local"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>

          <Tabs defaultValue="gains" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gains">GAINS Exchange</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
              <TabsTrigger value="followup">Follow-up</TabsTrigger>
            </TabsList>

            <TabsContent value="gains" className="space-y-4">
              <div>
                <Label htmlFor="goals">Goals - What are their goals?</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What are they trying to achieve this year?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="accomplishments">Accomplishments - Recent wins?</Label>
                <Textarea
                  id="accomplishments"
                  value={accomplishments}
                  onChange={(e) => setAccomplishments(e.target.value)}
                  placeholder="What have they recently achieved?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="interests">Interests - What are they passionate about?</Label>
                <Textarea
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Hobbies, causes, personal interests..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="networks">Networks - Who do they know?</Label>
                <Textarea
                  id="networks"
                  value={networks}
                  onChange={(e) => setNetworks(e.target.value)}
                  placeholder="Industries, groups, connections they have..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="skills">Skills - What are they good at?</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Expertise, capabilities, knowledge areas..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="preparation" className="space-y-4">
              <div>
                <Label htmlFor="targetMarket">Target Market</Label>
                <Textarea
                  id="targetMarket"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder="Who is their ideal client or customer?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="idealReferral">Ideal Referral</Label>
                <Textarea
                  id="idealReferral"
                  value={idealReferral}
                  onChange={(e) => setIdealReferral(e.target.value)}
                  placeholder="Describe the perfect referral for them..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="howToHelp">How Can I Help?</Label>
                <Textarea
                  id="howToHelp"
                  value={howToHelp}
                  onChange={(e) => setHowToHelp(e.target.value)}
                  placeholder="Specific ways I can support them..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="preparationNotes">Preparation Notes</Label>
                <Textarea
                  id="preparationNotes"
                  value={preparationNotes}
                  onChange={(e) => setPreparationNotes(e.target.value)}
                  placeholder="Research, questions to ask, topics to cover..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="followup" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Follow-up Actions</h4>
                <p className="text-sm text-muted-foreground">
                  After the meeting, add specific follow-up actions as interactions or opportunities.
                  Consider:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Introductions to make</li>
                  <li>Resources to send</li>
                  <li>Next meeting to schedule</li>
                  <li>Referrals to provide</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save GAINS Notes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};