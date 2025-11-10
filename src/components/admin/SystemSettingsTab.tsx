import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SystemSettingsTab() {
  const [kofOffering, setKofOffering] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKofOffering();
  }, []);

  const fetchKofOffering = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'kof_offering')
        .single();

      if (error) throw error;
      
      if (data?.setting_value && typeof data.setting_value === 'object') {
        const value = data.setting_value as { description?: string };
        if (value.description) {
          setKofOffering(value.description);
        }
      }
    } catch (error) {
      console.error('Error fetching KOF offering:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: { 
            title: 'KOF Institute Offering',
            description: kofOffering 
          },
          updated_by: user?.id
        })
        .eq('setting_key', 'kof_offering');

      if (error) throw error;
      
      toast.success('KOF offering updated successfully');
    } catch (error) {
      console.error('Error saving KOF offering:', error);
      toast.error('Failed to save KOF offering');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          System-wide configuration and organization information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5" />
            KOF Institute Offering
          </div>
          <p className="text-sm text-muted-foreground">
            This defines what KOF Institute offers. This information is used internally 
            and is not displayed elsewhere in the application.
          </p>
          <div className="space-y-2">
            <Label htmlFor="kof-offering">Organization Offering</Label>
            <Textarea
              id="kof-offering"
              value={kofOffering}
              onChange={(e) => setKofOffering(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Enter what KOF Institute offers..."
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
