import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useReferrals } from '@/hooks/useReferrals';

interface ReferralTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
}

export const ReferralTrackerDialog = ({ open, onOpenChange, contactId, contactName }: ReferralTrackerDialogProps) => {
  const { giveReferral } = useReferrals();
  const [referredToName, setReferredToName] = useState('');
  const [referredToCompany, setReferredToCompany] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const success = await giveReferral({
      contactId,
      referredToName,
      referredToCompany,
      serviceDescription,
      estimatedValue: parseFloat(estimatedValue) || 0
    });

    if (success) {
      setReferredToName('');
      setReferredToCompany('');
      setServiceDescription('');
      setEstimatedValue('');
      onOpenChange(false);
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Give Referral from {contactName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="referredToName">Referred To (Name) *</Label>
              <Input
                id="referredToName"
                value={referredToName}
                onChange={(e) => setReferredToName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <Label htmlFor="referredToCompany">Their Company</Label>
              <Input
                id="referredToCompany"
                value={referredToCompany}
                onChange={(e) => setReferredToCompany(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <Label htmlFor="serviceDescription">Service/Product Description *</Label>
              <Textarea
                id="serviceDescription"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Describe what you're referring them for..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="estimatedValue">Estimated Value (CHF)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="5000"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Give Referral'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};