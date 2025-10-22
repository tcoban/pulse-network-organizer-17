import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Contact } from "@/types/contact";

interface MeetingOutcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    event_title: string;
    event_start: string;
    contacts?: Contact[];
  };
  onSaved: () => void;
}

export function MeetingOutcomeDialog({
  open,
  onOpenChange,
  event,
  onSaved,
}: MeetingOutcomeDialogProps) {
  const [saving, setSaving] = useState(false);
  const [outcomeRating, setOutcomeRating] = useState<string>("neutral");
  const [notes, setNotes] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter meeting notes",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Update calendar event
      const { error: updateError } = await supabase
        .from("calendar_events")
        .update({ outcome_captured: true })
        .eq("id", event.id);

      if (updateError) throw updateError;

      // Create interactions for each contact
      if (event.contacts && event.contacts.length > 0) {
        const interactions = event.contacts.map((contact) => ({
          contact_id: contact.id,
          type: "meeting" as const,
          date: event.event_start,
          description: notes,
          outcome: outcomeRating,
          evaluation: nextSteps || null,
          channel: "in-person",
        }));

        const { error: interactionError } = await supabase
          .from("interactions")
          .insert(interactions);

        if (interactionError) throw interactionError;
      }

      // Create follow-up priority if needed
      if (followUpRequired && event.contacts && event.contacts.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          const { error: priorityError } = await supabase
            .from("dashboard_priorities")
            .insert({
              user_id: userData.user.id,
              contact_id: event.contacts[0].id,
              priority_type: "follow-up",
              title: `Follow up: ${event.event_title}`,
              description: nextSteps,
              completed: false,
            });

          if (priorityError) throw priorityError;
        }
      }

      toast({
        title: "Success",
        description: "Meeting outcome captured successfully",
      });

      // Reset form
      setNotes("");
      setNextSteps("");
      setOutcomeRating("neutral");
      setFollowUpRequired(false);

      onSaved();
    } catch (error) {
      console.error("Error saving meeting outcome:", error);
      toast({
        title: "Error",
        description: "Failed to save meeting outcome. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Capture Meeting Outcome</DialogTitle>
            <DialogDescription>
              Record notes and outcomes from your meeting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Meeting</Label>
              <p className="text-sm font-medium">{event.event_title}</p>
            </div>

            {event.contacts && event.contacts.length > 0 && (
              <div className="space-y-2">
                <Label>Attendees</Label>
                <p className="text-sm text-muted-foreground">
                  {event.contacts.map((c) => c.name).join(", ")}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="outcome-rating">Outcome Rating</Label>
              <RadioGroup
                id="outcome-rating"
                value={outcomeRating}
                onValueChange={setOutcomeRating}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="poor" />
                  <Label htmlFor="poor" className="font-normal cursor-pointer">
                    Poor
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral" className="font-normal cursor-pointer">
                    Neutral
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="success" id="success" />
                  <Label htmlFor="success" className="font-normal cursor-pointer">
                    Success
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Meeting Notes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="What was discussed? Key points, decisions made, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next-steps">Next Steps (Optional)</Label>
              <Textarea
                id="next-steps"
                placeholder="Action items, follow-ups needed, etc."
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow-up"
                checked={followUpRequired}
                onCheckedChange={(checked) => setFollowUpRequired(checked === true)}
              />
              <Label htmlFor="follow-up" className="font-normal cursor-pointer">
                Follow-up required
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Outcome
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
