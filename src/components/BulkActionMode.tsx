import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, MessageSquare, Calendar, Users, Target, Send, ChevronRight } from 'lucide-react';
import { Contact } from '@/types/contact';
import { useToast } from '@/hooks/use-toast';

interface BulkActionModeProps {
  selectedContacts: Contact[];
  onBack: () => void;
  onActionComplete: () => void;
}

type ActionType = 'email' | 'sms' | 'linkedin' | 'meeting' | 'tag' | 'assign' | 'follow-up';

const BulkActionMode: React.FC<BulkActionModeProps> = ({
  selectedContacts,
  onBack,
  onActionComplete
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [newTag, setNewTag] = useState('');
  const [assignToTeamMember, setAssignToTeamMember] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const { toast } = useToast();

  const actionTypes = [
    {
      id: 'email' as ActionType,
      title: 'Send Bulk Email',
      description: 'Compose and send personalized emails to selected contacts',
      icon: Mail,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    {
      id: 'linkedin' as ActionType,
      title: 'LinkedIn Outreach',
      description: 'Generate LinkedIn connection requests or messages',
      icon: Users,
      color: 'bg-blue-600/10 text-blue-700 border-blue-300'
    },
    {
      id: 'meeting' as ActionType,
      title: 'Schedule Meetings',
      description: 'Create meeting invitations for multiple contacts',
      icon: Calendar,
      color: 'bg-green-500/10 text-green-600 border-green-200'
    },
    {
      id: 'sms' as ActionType,
      title: 'SMS Campaign',
      description: 'Send targeted SMS messages to contacts with phone numbers',
      icon: MessageSquare,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    },
    {
      id: 'tag' as ActionType,
      title: 'Apply Tags',
      description: 'Add organizational tags to selected contacts',
      icon: Target,
      color: 'bg-orange-500/10 text-orange-600 border-orange-200'
    },
    {
      id: 'follow-up' as ActionType,
      title: 'Schedule Follow-ups',
      description: 'Set reminders for future contact follow-ups',
      icon: Calendar,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
    }
  ];

  const handleExecuteAction = () => {
    if (!selectedAction) return;

    // Simulate action execution
    toast({
      title: "Action Executed",
      description: `Successfully executed ${selectedAction} for ${selectedContacts.length} contacts`,
    });

    onActionComplete();
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>
            <div>
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Compose your email message..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {`{{name}}`}, {`{{company}}`}, and {`{{position}}`} for personalization
              </p>
            </div>
          </div>
        );

      case 'meeting':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input
                id="meeting-title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Academic Collaboration Discussion"
              />
            </div>
            <div>
              <Label htmlFor="meeting-date">Proposed Date & Time</Label>
              <Input
                id="meeting-date"
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
          </div>
        );

      case 'tag':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-tag">Tag to Apply</Label>
              <Input
                id="new-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g., Q1-2024-Outreach"
              />
            </div>
          </div>
        );

      case 'follow-up':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="follow-up-date">Follow-up Date</Label>
              <Input
                id="follow-up-date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="follow-up-note">Follow-up Note</Label>
              <Textarea
                id="follow-up-note"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="Add context for the follow-up..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'linkedin':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">LinkedIn Integration</h4>
              <p className="text-sm text-blue-700">
                This will generate personalized LinkedIn connection requests for each contact.
                Review and send manually through LinkedIn.
              </p>
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">SMS Campaign</h4>
              <p className="text-sm text-purple-700">
                Only contacts with phone numbers will receive messages.
                {selectedContacts.filter(c => c.phone).length} of {selectedContacts.length} contacts have phone numbers.
              </p>
            </div>
            <div>
              <Label htmlFor="sms-content">SMS Message</Label>
              <Textarea
                id="sms-content"
                placeholder="Keep it brief and professional..."
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">160 characters max</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Operations</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold">Campaign Manager</h1>
              <p className="text-muted-foreground">
                Execute bulk actions on {selectedContacts.length} selected contacts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Contacts Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Selected Contacts</span>
                <Badge variant="secondary">{selectedContacts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Selection & Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedAction ? (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actionTypes.map(action => {
                      const Icon = action.icon;
                      return (
                        <Card
                          key={action.id}
                          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${action.color} border-2`}
                          onClick={() => setSelectedAction(action.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 rounded-lg bg-white/50">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{action.title}</h3>
                                <p className="text-xs opacity-80">{action.description}</p>
                                <div className="flex items-center mt-2 text-xs font-medium">
                                  <span>Get Started</span>
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {React.createElement(actionTypes.find(a => a.id === selectedAction)?.icon || Mail, { className: "h-5 w-5" })}
                      <span>{actionTypes.find(a => a.id === selectedAction)?.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAction(null)}
                    >
                      Change Action
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderActionForm()}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      This action will affect {selectedContacts.length} contacts
                    </div>
                    <Button
                      onClick={handleExecuteAction}
                      className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-lg transition-all"
                    >
                      <Send className="h-4 w-4" />
                      <span>Execute Action</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionMode;