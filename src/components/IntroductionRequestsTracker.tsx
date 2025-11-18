import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const IntroductionRequestsTracker = () => {
  const { data: introductions, isLoading, refetch } = useQuery({
    queryKey: ['introduction-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('introduction_outcomes')
        .select(`
          *,
          contact_a:contacts!introduction_outcomes_contact_a_id_fkey(id, name, company),
          contact_b:contacts!introduction_outcomes_contact_b_id_fkey(id, name, company)
        `)
        .eq('introduced_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleUpdateStatus = async (id: string, outcome: string) => {
    try {
      const { error } = await supabase
        .from('introduction_outcomes')
        .update({ outcome, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Status updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <GitBranch className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'successful':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'declined':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: introductions?.length || 0,
    pending: introductions?.filter(i => i.outcome === 'pending').length || 0,
    successful: introductions?.filter(i => i.outcome === 'successful').length || 0,
    declined: introductions?.filter(i => i.outcome === 'declined').length || 0,
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.successful}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.declined}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Introduction Requests
          </CardTitle>
          <CardDescription>
            Track and manage your warm introduction requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!introductions || introductions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No introduction requests yet</p>
              <p className="text-sm">Start by finding warm introduction paths in the "Warm Intros" tab</p>
            </div>
          ) : (
            <div className="space-y-4">
              {introductions.map((intro: any) => (
                <div
                  key={intro.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{intro.contact_a?.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold">{intro.contact_b?.name}</span>
                        {intro.match_confidence && (
                          <Badge variant="outline" className="ml-2">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {intro.match_confidence}% match
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {intro.introduction_reason}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Requested {format(new Date(intro.created_at), 'MMM d, yyyy')}</span>
                        {intro.business_value && (
                          <>
                            <span>•</span>
                            <span>Value: CHF {intro.business_value.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(intro.outcome || 'pending')} className="flex items-center gap-1">
                        {getStatusIcon(intro.outcome || 'pending')}
                        {intro.outcome || 'pending'}
                      </Badge>
                      
                      {intro.outcome === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(intro.id, 'successful')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(intro.id, 'declined')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {(intro.feedback_a || intro.feedback_b) && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {intro.feedback_a && (
                        <p className="text-sm">
                          <span className="font-medium">{intro.contact_a?.name}:</span> {intro.feedback_a}
                        </p>
                      )}
                      {intro.feedback_b && (
                        <p className="text-sm">
                          <span className="font-medium">{intro.contact_b?.name}:</span> {intro.feedback_b}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
