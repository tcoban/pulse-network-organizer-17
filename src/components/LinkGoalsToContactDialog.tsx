import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Link2, X, Plus } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { useContactGoals } from '@/hooks/useContactGoals';

interface LinkGoalsToContactDialogProps {
  contactId: string;
  contactName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LinkGoalsToContactDialog({
  contactId,
  contactName,
  isOpen,
  onClose,
}: LinkGoalsToContactDialogProps) {
  const { goals } = useGoals();
  const { contactGoals, linkGoal, unlinkGoal, loading } = useContactGoals(contactId);
  const [relevanceNote, setRelevanceNote] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get IDs of already linked goals
  const linkedGoalIds = new Set(contactGoals.map(cg => cg.goal_id));

  // Filter available goals (not yet linked)
  const availableGoals = goals.filter(g => !linkedGoalIds.has(g.id) && g.status === 'active');

  // Filter by search query
  const filteredGoals = availableGoals.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkGoal = async () => {
    if (!selectedGoalId) return;
    
    const success = await linkGoal(selectedGoalId, relevanceNote || undefined);
    if (success) {
      setSelectedGoalId(null);
      setRelevanceNote('');
    }
  };

  const handleUnlinkGoal = async (contactGoalId: string) => {
    await unlinkGoal(contactGoalId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Link Goals to {contactName}
          </DialogTitle>
          <DialogDescription>
            Link this contact to goals they can help achieve. Goals represent what your team is looking for.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Currently Linked Goals */}
          {contactGoals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Currently Linked Goals</h3>
              <div className="space-y-2">
                {contactGoals.map(cg => (
                  <Card key={cg.id}>
                    <CardContent className="p-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {cg.goal?.category}
                          </Badge>
                          <span className="font-medium">{cg.goal?.title}</span>
                        </div>
                        {cg.relevance_note && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {cg.relevance_note}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnlinkGoal(cg.id)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Link New Goal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Link New Goal</h3>
            
            <div className="space-y-2">
              <Label htmlFor="search-goals">Search Available Goals</Label>
              <Input
                id="search-goals"
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {selectedGoalId && (
              <div className="space-y-2">
                <Label htmlFor="relevance-note">
                  Why can this contact help? (optional)
                </Label>
                <Input
                  id="relevance-note"
                  placeholder="e.g., Expert in this field, Has connections..."
                  value={relevanceNote}
                  onChange={(e) => setRelevanceNote(e.target.value)}
                />
              </div>
            )}

            {selectedGoalId && (
              <div className="flex gap-2">
                <Button onClick={handleLinkGoal} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Link Goal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedGoalId(null);
                    setRelevanceNote('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {availableGoals.length === 0
                    ? 'All active goals are already linked to this contact.'
                    : 'No goals match your search.'}
                </p>
              ) : (
                filteredGoals.map(goal => (
                  <Card
                    key={goal.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedGoalId === goal.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedGoalId(goal.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-primary" />
                            <Badge variant="outline" className="text-xs">
                              {goal.category}
                            </Badge>
                            <span className="font-medium">{goal.title}</span>
                          </div>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
