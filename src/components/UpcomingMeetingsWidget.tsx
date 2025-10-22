import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Users, CheckCircle2, FileText, Edit, Cloud, User as UserIcon } from "lucide-react";
import { format, isToday, addDays } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { MeetingOutcomeDialog } from "./MeetingOutcomeDialog";
import { getTypeColor } from "@/utils/opportunityHelpers";
import type { Contact } from "@/types/contact";

interface CalendarEvent {
  id: string;
  outlook_event_id: string;
  event_title: string;
  event_start: string;
  event_end: string;
  location?: string;
  contact_ids: string[];
  meeting_prep_sent: boolean;
  outcome_captured: boolean;
  opportunity_type?: string;
  source?: string;
  contacts?: Contact[];
}

interface UpcomingMeetingsWidgetProps {
  contacts: Contact[];
}

export function UpcomingMeetingsWidget({ contacts }: UpcomingMeetingsWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);

  const fetchUpcomingMeetings = async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const sevenDaysLater = addDays(new Date(), 7).toISOString();

      const { data, error: fetchError } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("event_start", now)
        .lte("event_start", sevenDaysLater)
        .order("event_start", { ascending: true })
        .limit(5);

      if (fetchError) throw fetchError;

      // Enrich with contact data
      const enrichedEvents = (data || []).map((event) => ({
        ...event,
        contacts: contacts.filter((c) => event.contact_ids?.includes(c.id)),
      }));

      setEvents(enrichedEvents);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError("Failed to load meetings");
      toast({
        title: "Error",
        description: "Failed to load upcoming meetings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingMeetings();
  }, [contacts]);

  const handleCaptureOutcome = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setOutcomeDialogOpen(true);
  };

  const handleOutcomeSaved = () => {
    setOutcomeDialogOpen(false);
    setSelectedEvent(null);
    fetchUpcomingMeetings();
  };

  const formatMeetingTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today ${format(date, "h:mm a")}`;
    }
    return format(date, "EEE, MMM d 'at' h:mm a");
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUpcomingMeetings} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">📅</p>
            <p className="text-muted-foreground">
              No meetings scheduled in the next 7 days.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
          <CardDescription>Your next {events.length} meetings this week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => {
            const isTodayMeeting = isToday(new Date(event.event_start));
            
            return (
              <div
                key={event.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isTodayMeeting
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold truncate">{event.event_title}</h4>
                      {event.opportunity_type && (
                        <Badge className={getTypeColor(event.opportunity_type as any)} variant="outline">
                          {event.opportunity_type}
                        </Badge>
                      )}
                      {event.outcome_captured && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Captured
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatMeetingTime(event.event_start)}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          {event.source === 'm365_sync' || !event.source ? (
                            <>
                              <Cloud className="h-3 w-3 mr-1" />
                              Outlook
                            </>
                          ) : (
                            <>
                              <UserIcon className="h-3 w-3 mr-1" />
                              Manual
                            </>
                          )}
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {event.contacts && event.contacts.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      {event.contacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="text-xs">
                              {contact.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{contact.name}</span>
                        </div>
                      ))}
                      {event.contacts.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{event.contacts.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!event.meeting_prep_sent}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    View Prep Brief
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCaptureOutcome(event)}
                    disabled={event.outcome_captured}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    {event.outcome_captured ? "Outcome Captured" : "Capture Outcome"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedEvent && (
        <MeetingOutcomeDialog
          open={outcomeDialogOpen}
          onOpenChange={setOutcomeDialogOpen}
          event={selectedEvent}
          onSaved={handleOutcomeSaved}
        />
      )}
    </>
  );
}
