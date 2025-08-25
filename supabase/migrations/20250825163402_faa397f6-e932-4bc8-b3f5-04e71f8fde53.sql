-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'team', 'global')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duplicates TEXT[], -- Array of potential duplicate tag names
  UNIQUE(name, type, created_by) -- Prevent exact duplicates per user/type
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  permissions JSONB NOT NULL DEFAULT '{
    "canCreateTags": false,
    "canEditTags": false,
    "canDeleteTags": false,
    "canManageTeam": false,
    "canViewAnalytics": false
  }',
  tag_stats JSONB NOT NULL DEFAULT '{
    "created": 0,
    "used": 0,
    "shared": 0
  }',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create team_settings table
CREATE TABLE public.team_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  require_approval BOOLEAN NOT NULL DEFAULT true,
  allow_public_tags BOOLEAN NOT NULL DEFAULT false,
  auto_suggest_similar BOOLEAN NOT NULL DEFAULT true,
  enforce_naming_convention BOOLEAN NOT NULL DEFAULT false,
  max_tags_per_user INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_rules table
CREATE TABLE public.workflow_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  conditions JSONB NOT NULL DEFAULT '[]',
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_executed TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bulk_operations table
CREATE TABLE public.bulk_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  targets TEXT[] NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0,
  results JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create tag_relationships table
CREATE TABLE public.tag_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  target_tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  strength DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_tag_id, target_tag_id, relationship_type)
);

-- Create analytics_data table
CREATE TABLE public.analytics_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create workflow_executions table
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.workflow_rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB,
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags and team/global tags" ON public.tags
  FOR SELECT USING (
    auth.uid() = created_by OR 
    type = 'team' OR 
    type = 'global'
  );

CREATE POLICY "Users can create their own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tags" ON public.tags
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for team_members
CREATE POLICY "Team members can view all team members" ON public.team_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
  );

-- Create RLS policies for team_settings
CREATE POLICY "Team members can view team settings" ON public.team_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage team settings" ON public.team_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
  );

-- Create RLS policies for workflow_rules
CREATE POLICY "Users can view workflow rules" ON public.workflow_rules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create workflow rules" ON public.workflow_rules
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workflow rules" ON public.workflow_rules
  FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for bulk_operations
CREATE POLICY "Users can view their own bulk operations" ON public.bulk_operations
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create bulk operations" ON public.bulk_operations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create RLS policies for other tables
CREATE POLICY "Users can view tag relationships" ON public.tag_relationships
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view analytics data" ON public.analytics_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view workflow executions" ON public.workflow_executions
  FOR SELECT TO authenticated USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_settings_updated_at
  BEFORE UPDATE ON public.team_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_rules_updated_at
  BEFORE UPDATE ON public.workflow_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  
  -- Insert team member record with default viewer role
  INSERT INTO public.team_members (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default team settings
INSERT INTO public.team_settings (id) VALUES (gen_random_uuid());

-- Create indexes for better performance
CREATE INDEX idx_tags_created_by ON public.tags(created_by);
CREATE INDEX idx_tags_type ON public.tags(type);
CREATE INDEX idx_tags_usage_count ON public.tags(usage_count DESC);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_workflow_rules_enabled ON public.workflow_rules(enabled);
CREATE INDEX idx_bulk_operations_status ON public.bulk_operations(status);
CREATE INDEX idx_analytics_metric_name ON public.analytics_data(metric_name);
CREATE INDEX idx_analytics_recorded_at ON public.analytics_data(recorded_at);