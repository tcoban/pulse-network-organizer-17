import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGhostMode } from '@/hooks/useGhostMode';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import { QuickActionDialog } from './QuickActionDialog';

interface Notification {
  id: string;
  type: 'urgent' | 'reminder' | 'achievement' | 'suggestion';
  title: string;
  message: string;
  actionUrl?: string;
  contactId?: string;
  contactName?: string;
  createdAt: Date;
  read: boolean;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const { getActiveUserId } = useGhostMode();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [quickActionDialog, setQuickActionDialog] = useState<{
    isOpen: boolean;
    contactId: string;
    contactName: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  async function loadNotifications() {
    const activeUserId = getActiveUserId();
    if (!activeUserId) return;

    const notifs: Notification[] = [];

    // Check for urgent contacts (90+ days no contact)
    const { data: urgentContacts } = await supabase
      .from('contacts')
      .select('id, name, company, last_contact')
      .or(`assigned_to.eq.${activeUserId},created_by.eq.${activeUserId}`)
      .order('last_contact', { ascending: true })
      .limit(5);

    urgentContacts?.forEach(contact => {
      const daysSince = contact.last_contact 
        ? differenceInDays(new Date(), new Date(contact.last_contact))
        : 999;
      
      if (daysSince >= 90) {
        notifs.push({
          id: `urgent-${contact.id}`,
          type: 'urgent',
          title: '🚨 Critical: Contact Needs Attention',
          message: `${contact.name} - No contact in ${daysSince} days!`,
          actionUrl: `/contacts`,
          contactId: contact.id,
          contactName: contact.name,
          createdAt: new Date(),
          read: false
        });
      }
    });

    // Check for upcoming meetings today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: todayMeetings } = await supabase
      .from('opportunities')
      .select('id, title, date, contacts(name)')
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString());

    if (todayMeetings && todayMeetings.length > 0) {
      notifs.push({
        id: 'meetings-today',
        type: 'reminder',
        title: '📅 Meetings Today',
        message: `You have ${todayMeetings.length} meeting(s) scheduled today`,
        actionUrl: '/contacts',
        createdAt: new Date(),
        read: false
      });
    }

    // Check for pending referrals
    const { data: pendingReferrals } = await supabase
      .from('referrals_given')
      .select('id, service_description')
      .eq('given_by', activeUserId)
      .eq('status', 'pending');

    if (pendingReferrals && pendingReferrals.length > 0) {
      notifs.push({
        id: 'pending-referrals',
        type: 'reminder',
        title: '🤝 Pending Referrals',
        message: `${pendingReferrals.length} referral(s) awaiting follow-up`,
        actionUrl: '/bni?tab=referrals',
        createdAt: new Date(),
        read: false
      });
    }

    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  }

  function markAsRead(notifId: string) {
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  }

  function getNotificationIcon(type: Notification['type']) {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'achievement': return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'suggestion': return <Users className="h-5 w-5 text-blue-500" />;
      default: return <CheckCircle2 className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notif.read ? 'bg-background' : 'bg-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{notif.title}</p>
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => markAsRead(notif.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      {notif.actionUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-2"
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.type === 'urgent' && notif.contactId && notif.contactName) {
                              setQuickActionDialog({
                                isOpen: true,
                                contactId: notif.contactId,
                                contactName: notif.contactName
                              });
                            } else {
                              setOpen(false);
                              window.location.href = notif.actionUrl;
                            }
                          }}
                        >
                          Take action →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
      
      {quickActionDialog && (
        <QuickActionDialog
          isOpen={quickActionDialog.isOpen}
          onClose={() => {
            setQuickActionDialog(null);
            setOpen(false);
          }}
          contactId={quickActionDialog.contactId}
          contactName={quickActionDialog.contactName}
          onActionCompleted={(actionTaken) => {
            toast.success(`Action completed: ${actionTaken}`);
            loadNotifications(); // Refresh notifications after action
          }}
        />
      )}
    </Sheet>
  );
}
