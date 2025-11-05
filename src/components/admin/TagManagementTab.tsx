import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tag, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TagDefinition {
  id: string;
  name: string;
  category: string;
  color: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export function TagManagementTab() {
  const [tags, setTags] = useState<TagDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagDefinition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tag_definitions')
        .select('*')
        .order('category')
        .order('display_order');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tags"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!confirm('Delete this tag? This will remove it from all contacts.')) return;

    try {
      const { error } = await supabase
        .from('tag_definitions')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast({
        title: "Tag deleted",
        description: "Tag has been removed successfully"
      });

      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete tag"
      });
    }
  };

  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, TagDefinition[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tag Management</h2>
          <p className="text-muted-foreground">Organize and categorize your tags</p>
        </div>
        <Button onClick={() => { setSelectedTag(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTags).map(([category, categoryTags]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
              <CardDescription>{categoryTags.length} tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryTags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div>
                        <p className="font-medium">{tag.name}</p>
                        {tag.description && (
                          <p className="text-sm text-muted-foreground">{tag.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tag.is_active ? 'default' : 'outline'}>
                        {tag.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedTag(tag); setIsDialogOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(groupedTags).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No tags defined</h3>
              <p className="text-muted-foreground mb-4">
                Create your first tag to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
