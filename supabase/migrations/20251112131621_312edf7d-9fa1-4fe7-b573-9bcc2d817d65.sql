-- Create user_points table to track gamification scores
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task_completions table to track completed tasks
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  contact_id UUID,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_points
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Enable RLS on task_completions
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_points
CREATE POLICY "Users can view their own points"
  ON public.user_points
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON public.user_points
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.user_points
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to all points"
  ON public.user_points
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for task_completions
CREATE POLICY "Users can view their own task completions"
  ON public.task_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task completions"
  ON public.task_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to all task completions"
  ON public.task_completions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_task_completions_user_id ON public.task_completions(user_id);
CREATE INDEX idx_task_completions_contact_id ON public.task_completions(contact_id);
CREATE INDEX idx_task_completions_completed_at ON public.task_completions(completed_at);
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);

-- Trigger to update updated_at on user_points
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();