-- Insert mock candidates
INSERT INTO public.candidates (id, name, email, profile_text, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah.johnson@email.com', 'Senior Software Engineer with 8 years of experience in full-stack development. Expert in React, Node.js, and cloud technologies. Led multiple high-impact projects and mentored junior developers.', now() - interval '15 days', now() - interval '10 days'),
('550e8400-e29b-41d4-a716-446655440002', 'Michael Chen', 'michael.chen@email.com', 'Data Scientist with PhD in Machine Learning. Specialized in NLP and computer vision. Published 12 research papers and has experience with Python, TensorFlow, and AWS.', now() - interval '12 days', now() - interval '8 days'),
('550e8400-e29b-41d4-a716-446655440003', 'Emily Rodriguez', 'emily.rodriguez@email.com', 'Product Manager with 6 years of experience in B2B SaaS. Successfully launched 5 products with combined ARR of $10M. Strong background in user research and agile methodologies.', now() - interval '20 days', now() - interval '15 days'),
('550e8400-e29b-41d4-a716-446655440004', 'David Kim', 'david.kim@email.com', 'DevOps Engineer with expertise in Kubernetes, Docker, and CI/CD pipelines. Reduced deployment time by 80% and improved system reliability to 99.9% uptime.', now() - interval '8 days', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440005', 'Lisa Thompson', 'lisa.thompson@email.com', 'UX Designer with 7 years of experience in fintech and healthcare. Expert in user research, prototyping, and accessibility. Led design for products serving 2M+ users.', now() - interval '18 days', now() - interval '12 days'),
('550e8400-e29b-41d4-a716-446655440006', 'Alex Petrov', 'alex.petrov@email.com', 'Backend Engineer specializing in distributed systems and microservices. Experience with Go, Rust, and PostgreSQL. Built systems handling 1B+ requests per day.', now() - interval '6 days', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440007', 'Maria Santos', 'maria.santos@email.com', 'Engineering Manager with 10 years of experience. Led teams of 15+ engineers across multiple time zones. Strong advocate for diversity and inclusion in tech.', now() - interval '25 days', now() - interval '20 days'),
('550e8400-e29b-41d4-a716-446655440008', 'James Wilson', 'james.wilson@email.com', 'Mobile Developer with expertise in React Native and Flutter. Published 8 apps with 500K+ downloads combined. Strong focus on performance optimization and user experience.', now() - interval '14 days', now() - interval '9 days'),
('550e8400-e29b-41d4-a716-446655440009', 'Anna Kowalski', 'anna.kowalski@email.com', 'Security Engineer with CISSP certification. Specialized in application security and penetration testing. Prevented security incidents saving companies $2M+ annually.', now() - interval '10 days', now() - interval '6 days'),
('550e8400-e29b-41d4-a716-446655440010', 'Robert Zhang', 'robert.zhang@email.com', 'Frontend Architect with 12 years of experience. Expert in modern JavaScript frameworks and performance optimization. Built scalable frontend systems serving millions of users.', now() - interval '22 days', now() - interval '18 days');

-- Insert mock tags
INSERT INTO public.tags (id, name, type, created_by, usage_count, last_used, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Senior Level', 'team', auth.uid(), 8, now() - interval '1 day', now() - interval '30 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440002', 'React Expert', 'personal', auth.uid(), 3, now() - interval '2 days', now() - interval '28 days', now() - interval '2 days'),
('650e8400-e29b-41d4-a716-446655440003', 'Machine Learning', 'team', auth.uid(), 2, now() - interval '3 days', now() - interval '25 days', now() - interval '3 days'),
('650e8400-e29b-41d4-a716-446655440004', 'Product Management', 'team', auth.uid(), 1, now() - interval '5 days', now() - interval '20 days', now() - interval '5 days'),
('650e8400-e29b-41d4-a716-446655440005', 'DevOps', 'team', auth.uid(), 2, now() - interval '1 day', now() - interval '18 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440006', 'UX Design', 'team', auth.uid(), 1, now() - interval '4 days', now() - interval '15 days', now() - interval '4 days'),
('650e8400-e29b-41d4-a716-446655440007', 'Backend', 'team', auth.uid(), 3, now() - interval '2 days', now() - interval '22 days', now() - interval '2 days'),
('650e8400-e29b-41d4-a716-446655440008', 'Leadership', 'team', auth.uid(), 2, now() - interval '6 days', now() - interval '12 days', now() - interval '6 days'),
('650e8400-e29b-41d4-a716-446655440009', 'Mobile Development', 'personal', auth.uid(), 1, now() - interval '3 days', now() - interval '14 days', now() - interval '3 days'),
('650e8400-e29b-41d4-a716-446655440010', 'Security', 'team', auth.uid(), 1, now() - interval '7 days', now() - interval '10 days', now() - interval '7 days'),
('650e8400-e29b-41d4-a716-446655440011', 'JavaScript', 'team', auth.uid(), 4, now() - interval '1 day', now() - interval '26 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440012', 'Python', 'team', auth.uid(), 2, now() - interval '2 days', now() - interval '24 days', now() - interval '2 days'),
('650e8400-e29b-41d4-a716-446655440013', 'AWS', 'team', auth.uid(), 3, now() - interval '1 day', now() - interval '16 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440014', 'Remote Ready', 'personal', auth.uid(), 6, now() - interval '1 day', now() - interval '8 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440015', 'Fast Learner', 'personal', auth.uid(), 4, now() - interval '3 days', now() - interval '6 days', now() - interval '3 days');

-- Insert candidate-tag relationships
INSERT INTO public.candidate_tags (id, candidate_id, tag_id, created_by, created_at) VALUES
-- Sarah Johnson
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '10 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', auth.uid(), now() - interval '10 days'), -- React Expert
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440011', auth.uid(), now() - interval '10 days'), -- JavaScript
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440008', auth.uid(), now() - interval '10 days'), -- Leadership
-- Michael Chen
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '8 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', auth.uid(), now() - interval '8 days'), -- Machine Learning
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', auth.uid(), now() - interval '8 days'), -- Python
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440013', auth.uid(), now() - interval '8 days'), -- AWS
-- Emily Rodriguez
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '15 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', auth.uid(), now() - interval '15 days'), -- Product Management
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', auth.uid(), now() - interval '15 days'), -- Leadership
-- David Kim
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '5 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440005', auth.uid(), now() - interval '5 days'), -- DevOps
('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440013', auth.uid(), now() - interval '5 days'), -- AWS
-- Lisa Thompson
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '12 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440006', auth.uid(), now() - interval '12 days'), -- UX Design
-- Alex Petrov
('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '3 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440007', auth.uid(), now() - interval '3 days'), -- Backend
-- Maria Santos
('750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '20 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440008', auth.uid(), now() - interval '20 days'), -- Leadership
-- James Wilson
('750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440009', auth.uid(), now() - interval '9 days'), -- Mobile Development
('750e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', auth.uid(), now() - interval '9 days'), -- React Expert
-- Anna Kowalski
('750e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '6 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440010', auth.uid(), now() - interval '6 days'), -- Security
-- Robert Zhang
('750e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001', auth.uid(), now() - interval '18 days'), -- Senior Level
('750e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440002', auth.uid(), now() - interval '18 days'), -- React Expert
('750e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440011', auth.uid(), now() - interval '18 days'), -- JavaScript
('750e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440008', auth.uid(), now() - interval '18 days'); -- Leadership

-- Insert workflow rules
INSERT INTO public.workflow_rules (id, name, description, trigger_type, trigger_config, conditions, actions, enabled, created_by, execution_count, last_executed, created_at, updated_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Auto-tag Senior Developers', 'Automatically tag candidates with "Senior Level" if they have 5+ years experience', 'candidate_added', '{"keywords": ["senior", "lead", "principal", "staff"]}', '[{"field": "profile_text", "operator": "contains", "value": "years"}]', '[{"type": "add_tag", "tag_name": "Senior Level"}]', true, auth.uid(), 15, now() - interval '2 days', now() - interval '25 days', now() - interval '2 days'),
('850e8400-e29b-41d4-a716-446655440002', 'Flag Remote Candidates', 'Add "Remote Ready" tag for candidates mentioning remote work', 'candidate_added', '{"keywords": ["remote", "distributed", "work from home"]}', '[{"field": "profile_text", "operator": "contains", "value": "remote"}]', '[{"type": "add_tag", "tag_name": "Remote Ready"}]', true, auth.uid(), 8, now() - interval '1 day', now() - interval '20 days', now() - interval '1 day'),
('850e8400-e29b-41d4-a716-446655440003', 'Duplicate Email Alert', 'Send alert when duplicate email addresses are detected', 'candidate_added', '{"check_duplicates": true}', '[{"field": "email", "operator": "duplicate_exists", "value": ""}]', '[{"type": "send_alert", "message": "Duplicate email detected"}]', true, auth.uid(), 3, now() - interval '5 days', now() - interval '15 days', now() - interval '5 days'),
('850e8400-e29b-41d4-a716-446655440004', 'Tech Stack Tagging', 'Automatically tag based on technology mentions', 'candidate_added', '{"technologies": ["React", "Python", "JavaScript", "AWS"]}', '[{"field": "profile_text", "operator": "contains_any", "value": "React,Python,JavaScript,AWS"}]', '[{"type": "add_tags_from_keywords", "mapping": {"React": "React Expert", "Python": "Python", "JavaScript": "JavaScript", "AWS": "AWS"}}]', true, auth.uid(), 22, now() - interval '1 day', now() - interval '30 days', now() - interval '1 day'),
('850e8400-e29b-41d4-a716-446655440005', 'Weekly Cleanup', 'Remove unused tags weekly', 'schedule', '{"frequency": "weekly", "day": "sunday", "time": "02:00"}', '[{"field": "tag_usage_count", "operator": "equals", "value": "0"}]', '[{"type": "delete_tag"}]', false, auth.uid(), 4, now() - interval '7 days', now() - interval '10 days', now() - interval '7 days');

-- Insert bulk operations
INSERT INTO public.bulk_operations (id, type, targets, parameters, status, progress, results, created_by, created_at, completed_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'merge_tags', '["React Expert", "ReactJS"]', '{"target_tag": "React Expert", "source_tags": ["ReactJS"]}', 'completed', 100, '{"merged_count": 1, "updated_candidates": 2}', auth.uid(), now() - interval '5 days', now() - interval '5 days'),
('950e8400-e29b-41d4-a716-446655440002', 'bulk_tag_candidates', '["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]', '{"tag_name": "Fast Learner", "action": "add"}', 'completed', 100, '{"tagged_count": 2}', auth.uid(), now() - interval '3 days', now() - interval '3 days'),
('950e8400-e29b-41d4-a716-446655440003', 'export_candidates', '["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440003", "550e8400-e29b-41d4-a716-446655440005"]', '{"format": "csv", "include_tags": true}', 'completed', 100, '{"exported_count": 3, "file_url": "/exports/candidates_2024.csv"}', auth.uid(), now() - interval '1 day', now() - interval '1 day'),
('950e8400-e29b-41d4-a716-446655440004', 'update_tag_types', '["Personal Skills", "Technical Skills"]', '{"old_type": "personal", "new_type": "team"}', 'in_progress', 65, null, auth.uid(), now() - interval '2 hours', null),
('950e8400-e29b-41d4-a716-446655440005', 'clean_duplicate_tags', '["JavaScript", "JS", "Javascript"]', '{"keep_tag": "JavaScript", "merge_others": true}', 'pending', 0, null, auth.uid(), now() - interval '30 minutes', null);

-- Insert team members
INSERT INTO public.team_members (id, user_id, role, permissions, tag_stats, last_active, created_at, updated_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', auth.uid(), 'admin', '{"canEditTags": true, "canCreateTags": true, "canDeleteTags": true, "canManageTeam": true, "canViewAnalytics": true}', '{"used": 45, "shared": 12, "created": 15}', now(), now() - interval '60 days', now());

-- Insert team settings
INSERT INTO public.team_settings (id, require_approval, allow_public_tags, auto_suggest_similar, enforce_naming_convention, max_tags_per_user, created_at, updated_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', false, true, true, false, 100, now() - interval '60 days', now() - interval '5 days');

-- Insert analytics data
INSERT INTO public.analytics_data (id, metric_name, metric_value, dimensions, period_start, period_end, recorded_at) VALUES
('c50e8400-e29b-41d4-a716-446655440001', 'tags_created', 5, '{"type": "team"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440002', 'tags_created', 3, '{"type": "personal"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440003', 'candidates_tagged', 25, '{"period": "weekly"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440004', 'workflow_executions', 48, '{"status": "success"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440005', 'top_tags_usage', 15, '{"tag": "Senior Level"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440006', 'top_tags_usage', 11, '{"tag": "JavaScript"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440007', 'top_tags_usage', 8, '{"tag": "Remote Ready"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440008', 'active_users', 3, '{"period": "daily"}', now() - interval '1 day', now(), now()),
('c50e8400-e29b-41d4-a716-446655440009', 'duplicate_tags_detected', 2, '{"severity": "medium"}', now() - interval '7 days', now(), now());

-- Insert tag relationships
INSERT INTO public.tag_relationships (id, source_tag_id, target_tag_id, relationship_type, strength, created_at) VALUES
('d50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011', 'related', 0.85, now() - interval '10 days'),
('d50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440012', 'related', 0.92, now() - interval '8 days'),
('d50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440013', 'related', 0.78, now() - interval '5 days'),
('d50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440008', 'related', 0.65, now() - interval '15 days');