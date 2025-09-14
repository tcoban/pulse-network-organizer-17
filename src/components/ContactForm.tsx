import { useState } from 'react';
import { Contact, ContactPreferences } from '@/types/contact';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactFormProps {
  contact?: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  isEditing?: boolean;
}

const ContactForm = ({ contact, isOpen, onClose, onSave, isEditing = false }: ContactFormProps) => {
  const { toast } = useToast();
  const { teamMembers } = useTeamMembers();
  const [formData, setFormData] = useState<Partial<Contact>>(() => {
    if (contact) return { ...contact };
    
    return {
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      notes: '',
      tags: [],
      referredBy: '',
      currentProjects: '',
      mutualBenefit: '',
      offering: '',
      lookingFor: '',
      affiliation: '',
      cooperationRating: 3,
      potentialScore: 3,
      assignedTo: teamMembers[0]?.id || '',
      socialLinks: { linkedin: '', twitter: '', github: '' },
      preferences: {
        language: 'English',
        preferredChannel: 'email',
        availableTimes: '',
        meetingLocation: ''
      },
      upcomingOpportunities: []
    };
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof Contact, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: keyof ContactPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.email?.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in at least the name and email fields.",
        variant: "destructive"
      });
      return;
    }

    const contactData: Contact = {
      id: contact?.id || `contact-${Date.now()}`,
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      position: formData.position || undefined,
      notes: formData.notes || '',
      tags: formData.tags || [],
      addedDate: contact?.addedDate || new Date(),
      lastContact: contact?.lastContact,
      referredBy: formData.referredBy || undefined,
      currentProjects: formData.currentProjects || undefined,
      mutualBenefit: formData.mutualBenefit || undefined,
      offering: formData.offering || undefined,
      lookingFor: formData.lookingFor || undefined,
      affiliation: formData.affiliation || undefined,
      cooperationRating: formData.cooperationRating || 3,
      potentialScore: formData.potentialScore || 3,
      assignedTo: formData.assignedTo || teamMembers[0]?.id || '',
      createdBy: contact?.createdBy || teamMembers[0]?.id || '',
      socialLinks: formData.socialLinks,
      preferences: formData.preferences,
      interactionHistory: contact?.interactionHistory || [],
      eventParticipationHistory: contact?.eventParticipationHistory || [],
      pastCollaborations: contact?.pastCollaborations || [],
      upcomingOpportunities: contact?.upcomingOpportunities || [],
      linkedinConnections: contact?.linkedinConnections
    };

    onSave(contactData);
    onClose();
    
    toast({
      title: isEditing ? "Contact updated" : "Contact created",
      description: `${contactData.name} has been ${isEditing ? 'updated' : 'added'} successfully.`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliation">Affiliation</Label>
              <Input
                id="affiliation"
                value={formData.affiliation || ''}
                onChange={(e) => handleInputChange('affiliation', e.target.value)}
                placeholder="e.g. KOF Alumni, Customer"
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleInputChange('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referredBy">Referred By</Label>
              <Input
                id="referredBy"
                value={formData.referredBy || ''}
                onChange={(e) => handleInputChange('referredBy', e.target.value)}
                placeholder="Who referred this contact?"
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Communication Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={formData.preferences?.language}
                  onValueChange={(value) => handlePreferenceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredChannel">Preferred Channel</Label>
                <Select
                  value={formData.preferences?.preferredChannel}
                  onValueChange={(value) => handlePreferenceChange('preferredChannel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="video-call">Video Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="availableTimes">Available Times</Label>
                <Input
                  id="availableTimes"
                  value={formData.preferences?.availableTimes || ''}
                  onChange={(e) => handlePreferenceChange('availableTimes', e.target.value)}
                  placeholder="e.g. Weekday mornings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingLocation">Preferred Meeting Location</Label>
                <Input
                  id="meetingLocation"
                  value={formData.preferences?.meetingLocation || ''}
                  onChange={(e) => handlePreferenceChange('meetingLocation', e.target.value)}
                  placeholder="e.g. Coffee shops, Office"
                />
              </div>
            </div>
          </div>

          {/* Business Intelligence */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Business Intelligence</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentProjects">Current Focus</Label>
                <Textarea
                  id="currentProjects"
                  value={formData.currentProjects || ''}
                  onChange={(e) => handleInputChange('currentProjects', e.target.value)}
                  placeholder="What are they currently working on?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offering">What They Offer</Label>
                  <Textarea
                    id="offering"
                    value={formData.offering || ''}
                    onChange={(e) => handleInputChange('offering', e.target.value)}
                    placeholder="Services, expertise, connections they can offer"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lookingFor">What They're Looking For</Label>
                  <Textarea
                    id="lookingFor"
                    value={formData.lookingFor || ''}
                    onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                    placeholder="What they need help with"
                    rows={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mutualBenefit">Mutual Benefit Potential</Label>
                <Textarea
                  id="mutualBenefit"
                  value={formData.mutualBenefit || ''}
                  onChange={(e) => handleInputChange('mutualBenefit', e.target.value)}
                  placeholder="How can we help each other?"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cooperationRating">Cooperation Rating (1-5)</Label>
              <Select
                value={formData.cooperationRating?.toString()}
                onValueChange={(value) => handleInputChange('cooperationRating', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} - {rating === 1 ? 'Low' : rating === 3 ? 'Medium' : rating === 5 ? 'High' : 'Good'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="potentialScore">Potential Score (1-5)</Label>
              <Select
                value={formData.potentialScore?.toString()}
                onValueChange={(value) => handleInputChange('potentialScore', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(score => (
                    <SelectItem key={score} value={score.toString()}>
                      {score} - {score === 1 ? 'Low' : score === 3 ? 'Medium' : score === 5 ? 'High' : 'Good'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="LinkedIn profile URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="Twitter profile URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={formData.socialLinks?.github || ''}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  placeholder="GitHub profile URL"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this contact"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Contact' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;