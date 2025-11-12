import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Calendar, Eye, TrendingUp } from 'lucide-react';

interface QuickActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
}

export function QuickActionDialog({ isOpen, onClose, contactId, contactName }: QuickActionDialogProps) {
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionNotes, setInteractionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogInteraction = async () => {
    if (!interactionNotes.trim()) {
      toast({
        title: 'Notes required',
        description: 'Please enter some notes about the interaction.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('interactions').insert({
        contact_id: contactId,
        contacted_by: user?.id,
        description: interactionNotes,
        date: new Date().toISOString(),
        type: 'other',
      });

      if (error) throw error;

      // Update last contact date
      await supabase
        .from('contacts')
        .update({ last_contact: new Date().toISOString() })
        .eq('id', contactId);

      toast({
        title: 'Interaction logged',
        description: `Follow-up with ${contactName} has been recorded.`,
      });

      setInteractionNotes('');
      setShowInteractionForm(false);
      onClose();
    } catch (error) {
      console.error('Error logging interaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to log interaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewContact = () => {
    navigate(`/contacts?id=${contactId}`);
    onClose();
  };

  const handleScheduleMeeting = () => {
    navigate(`/contacts?id=${contactId}&action=schedule`);
    onClose();
  };

  const handleCreateOpportunity = () => {
    navigate(`/workbench?contactId=${contactId}&action=opportunity`);
    onClose();
  };

  if (showInteractionForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Interaction with {contactName}</DialogTitle>
            <DialogDescription>
              Record your follow-up activity to reset the decay timer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Interaction Notes</Label>
              <Textarea
                id="notes"
                placeholder="What did you discuss? What are the next steps?"
                value={interactionNotes}
                onChange={(e) => setInteractionNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowInteractionForm(false)}>
                Back
              </Button>
              <Button onClick={handleLogInteraction} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Log Interaction'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Take Action for {contactName}</DialogTitle>
          <DialogDescription>
            Choose an action to strengthen this relationship and prevent decay.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setShowInteractionForm(true)}
          >
            <MessageSquare className="h-5 w-5 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Log Quick Follow-up</div>
              <div className="text-xs text-muted-foreground">
                Record a call, email, or message
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={handleScheduleMeeting}
          >
            <Calendar className="h-5 w-5 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Schedule a Meeting</div>
              <div className="text-xs text-muted-foreground">
                Set up a time to connect
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={handleCreateOpportunity}
          >
            <TrendingUp className="h-5 w-5 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Create Opportunity</div>
              <div className="text-xs text-muted-foreground">
                Track a new business opportunity
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={handleViewContact}
          >
            <Eye className="h-5 w-5 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">View Contact Details</div>
              <div className="text-xs text-muted-foreground">
                See full contact information
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
