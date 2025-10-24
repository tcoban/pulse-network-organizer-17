import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGoals } from "@/hooks/useGoals";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddGoalDialog({ open, onOpenChange, onGoalAdded }: any) {
  const { createGoal } = useGoals();
  const { projects } = useProjects();
  const [targets, setTargets] = useState<any[]>([]);
  const [project, setProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("meeting");
  const [targetDate, setTargetDate] = useState<Date>();
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      supabase.from('targets').select('*').eq('project_id', project).then(({ data }) => setTargets(data || []));
    } else {
      setTargets([]);
    }
    setTarget("");
  }, [project]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createGoal({ title, description, category, target_date: targetDate?.toISOString().split('T')[0], status: "active", progress_percentage: 0, target_id: target || null });
      setTitle(""); setDescription(""); setCategory("meeting"); setTargetDate(undefined); setProject(""); setTarget("");
      onGoalAdded(); onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Create Goal</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="meeting">Meeting</SelectItem><SelectItem value="fundraising">Fundraising</SelectItem></SelectContent></Select></div>
            <div><Label>Target Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{targetDate ? format(targetDate, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={targetDate} onSelect={setTargetDate} /></PopoverContent></Popover></div>
          </div>
          <div><Label>Link to Project (Optional)</Label><Select value={project} onValueChange={setProject}><SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent></Select></div>
          {project && targets.length > 0 && <div><Label>Link to Target (Optional)</Label><Select value={target} onValueChange={setTarget}><SelectTrigger><SelectValue placeholder="Select target..." /></SelectTrigger><SelectContent>{targets.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent></Select></div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || loading}>{loading ? "Creating..." : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddGoalDialog;
