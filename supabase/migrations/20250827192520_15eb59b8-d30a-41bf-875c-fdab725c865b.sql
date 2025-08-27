-- Create candidates table
CREATE TABLE public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  profile_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Create policies for candidates
CREATE POLICY "Users can view all candidates" 
ON public.candidates 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create candidates" 
ON public.candidates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update candidates" 
ON public.candidates 
FOR UPDATE 
USING (true);

-- Create candidate_tags table for many-to-many relationship
CREATE TABLE public.candidate_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.candidate_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for candidate_tags
CREATE POLICY "Users can view all candidate tags" 
ON public.candidate_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create candidate tags" 
ON public.candidate_tags 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete candidate tags they created" 
ON public.candidate_tags 
FOR DELETE 
USING (auth.uid() = created_by);

-- Add triggers for updated_at
CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_candidate_tags_candidate_id ON public.candidate_tags(candidate_id);
CREATE INDEX idx_candidate_tags_tag_id ON public.candidate_tags(tag_id);
CREATE INDEX idx_candidate_tags_created_by ON public.candidate_tags(created_by);

-- Insert seed data for testing
-- Insert candidates
INSERT INTO public.candidates (name, email, profile_text) VALUES
('John Smith', 'john.smith@email.com', 'Experienced software engineer with 5 years in React and Node.js'),
('Sarah Johnson', 'sarah.johnson@email.com', 'Senior UX designer specializing in mobile applications'),
('Mike Chen', 'mike.chen@email.com', 'Full-stack developer with expertise in Python and Django'),
('Emily Davis', 'emily.davis@email.com', 'Data scientist with background in machine learning'),
('Alex Rodriguez', 'alex.rodriguez@email.com', 'DevOps engineer experienced with AWS and Kubernetes'),
('Lisa Park', 'lisa.park@email.com', 'Product manager with 8 years in fintech industry'),
('David Wilson', 'david.wilson@email.com', 'Frontend developer passionate about Vue.js and TypeScript'),
('Anna Thompson', 'anna.thompson@email.com', 'Backend engineer specializing in microservices architecture'),
('Chris Lee', 'chris.lee@email.com', 'QA engineer with automation testing expertise'),
('Maria Garcia', 'maria.garcia@email.com', 'Mobile app developer with iOS and Android experience');

-- Insert sample tags (if they don't exist)
INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'JavaScript', 'global', 15, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'JavaScript');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'React', 'global', 12, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'React');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'Python', 'global', 10, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Python');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'Senior Level', 'team', 8, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Senior Level');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'Frontend', 'team', 7, (SELECT id FROM auth.users LIMIT 1)  
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Frontend');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'Backend', 'team', 6, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Backend');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'Full Stack', 'team', 5, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Full Stack');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'Node.js', 'global', 9, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Node.js');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'UX Design', 'global', 6, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'UX Design');

INSERT INTO public.tags (name, type, usage_count, created_by) 
SELECT 'Machine Learning', 'global', 4, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Machine Learning');