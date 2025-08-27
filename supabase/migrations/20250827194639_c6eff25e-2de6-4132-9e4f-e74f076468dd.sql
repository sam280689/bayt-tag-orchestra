-- Insert additional unique mock candidates with existing user ID
INSERT INTO public.candidates (id, name, email, profile_text, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Ryan Mitchell', 'ryan.mitchell@techcorp.com', 'Senior Full-Stack Developer with 9 years of experience in React, Node.js, and GraphQL. Led development of scalable microservices architecture serving 5M+ users. Passionate about clean code and mentoring.', now() - interval '5 days', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440012', 'Sophie Turner', 'sophie.turner@aitech.com', 'AI/ML Engineer with PhD in Computer Science. Specialized in deep learning and computer vision. Built production ML models with 95%+ accuracy. Experience with PyTorch, TensorFlow, and cloud platforms.', now() - interval '3 days', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440013', 'Marcus Anderson', 'marcus.anderson@startuptech.io', 'Product Manager with 7 years in fintech startups. Successfully launched 3 products from 0 to $5M ARR. Expert in user research, data analytics, and agile product development methodologies.', now() - interval '8 days', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440014', 'Jessica Kim', 'jessica.kim@cloudnative.com', 'Senior DevOps Engineer with expertise in Kubernetes, Terraform, and AWS. Reduced infrastructure costs by 40% while improving system reliability to 99.99% uptime. CNCF Ambassador.', now() - interval '12 days', now() - interval '7 days'),
('550e8400-e29b-41d4-a716-446655440015', 'Antonio Silva', 'antonio.silva@designstudio.com', 'Senior UX Designer with 8 years in enterprise SaaS. Led design for products used by Fortune 500 companies. Expert in design systems, accessibility, and user research methodologies.', now() - interval '6 days', now() - interval '3 days');

-- Insert comprehensive mock tags with proper user ID
INSERT INTO public.tags (id, name, type, created_by, usage_count, last_used, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440016', 'Expert Level', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 12, now() - interval '1 day', now() - interval '35 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440017', 'Node.js', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 6, now() - interval '2 days', now() - interval '30 days', now() - interval '2 days'),
('650e8400-e29b-41d4-a716-446655440018', 'GraphQL', 'personal', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 3, now() - interval '1 day', now() - interval '25 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440019', 'Microservices', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 4, now() - interval '3 days', now() - interval '20 days', now() - interval '3 days'),
('650e8400-e29b-41d4-a716-446655440020', 'AI/ML', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 3, now() - interval '2 days', now() - interval '28 days', now() - interval '2 days'),
('650e8400-e29b-41d4-a716-446655440021', 'Deep Learning', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 2, now() - interval '4 days', now() - interval '22 days', now() - interval '4 days'),
('650e8400-e29b-41d4-a716-446655440022', 'Computer Vision', 'personal', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 2, now() - interval '3 days', now() - interval '18 days', now() - interval '3 days'),
('650e8400-e29b-41d4-a716-446655440023', 'PyTorch', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 3, now() - interval '2 days', now() - interval '26 days', now() - interval '2 days'),
('650e8400-e29b-41d4-a716-446655440024', 'Fintech', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 2, now() - interval '5 days', now() - interval '15 days', now() - interval '5 days'),
('650e8400-e29b-41d4-a716-446655440025', 'Startup Experience', 'personal', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 4, now() - interval '1 day', now() - interval '12 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440026', 'Kubernetes', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 5, now() - interval '1 day', now() - interval '19 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440027', 'Terraform', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 3, now() - interval '2 days', now() - interval '17 days', now() - interval '2 days'),
('650e8400-e29b-41d4-a716-446655440028', 'Cloud Architecture', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 7, now() - interval '1 day', now() - interval '21 days', now() - interval '1 day'),
('650e8400-e29b-41d4-a716-446655440029', 'Design Systems', 'team', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 2, now() - interval '3 days', now() - interval '14 days', now() - interval '3 days'),
('650e8400-e29b-41d4-a716-446655440030', 'Enterprise UX', 'personal', 'b1d5f92a-166f-49da-8692-b4ed5a323631', 1, now() - interval '4 days', now() - interval '11 days', now() - interval '4 days');

-- Insert workflow rules with proper user ID
INSERT INTO public.workflow_rules (id, name, description, trigger_type, trigger_config, conditions, actions, enabled, created_by, execution_count, last_executed, created_at, updated_at) VALUES
('850e8400-e29b-41d4-a716-446655440006', 'Auto-detect AI/ML Candidates', 'Automatically tag candidates mentioning AI, ML, or data science skills', 'candidate_added', '{"keywords": ["machine learning", "deep learning", "AI", "artificial intelligence", "neural networks", "PyTorch", "TensorFlow"]}', '[{"field": "profile_text", "operator": "contains_any", "value": "machine learning,deep learning,AI,artificial intelligence,neural networks,PyTorch,TensorFlow"}]', '[{"type": "add_tag", "tag_name": "AI/ML"}]', true, 'b1d5f92a-166f-49da-8692-b4ed5a323631', 12, now() - interval '6 hours', now() - interval '15 days', now() - interval '6 hours'),
('850e8400-e29b-41d4-a716-446655440007', 'Flag Cloud Experts', 'Tag candidates with cloud platform experience', 'candidate_added', '{"platforms": ["AWS", "Azure", "GCP", "Kubernetes", "Docker"]}', '[{"field": "profile_text", "operator": "contains_any", "value": "AWS,Azure,GCP,Kubernetes,Docker,cloud"}]', '[{"type": "add_tag", "tag_name": "Cloud Architecture"}]', true, 'b1d5f92a-166f-49da-8692-b4ed5a323631', 18, now() - interval '3 hours', now() - interval '12 days', now() - interval '3 hours'),
('850e8400-e29b-41d4-a716-446655440008', 'Startup Background Detection', 'Identify candidates with startup experience', 'candidate_added', '{"keywords": ["startup", "founder", "early-stage", "scale-up", "seed", "Series A"]}', '[{"field": "profile_text", "operator": "contains_any", "value": "startup,founder,early-stage,scale-up,seed,Series A"}]', '[{"type": "add_tag", "tag_name": "Startup Experience"}]', true, 'b1d5f92a-166f-49da-8692-b4ed5a323631', 7, now() - interval '12 hours', now() - interval '8 days', now() - interval '12 hours');

-- Insert bulk operations with proper user ID
INSERT INTO public.bulk_operations (id, type, targets, parameters, status, progress, results, created_by, created_at, completed_at) VALUES
('950e8400-e29b-41d4-a716-446655440006', 'update_candidate_profiles', '["550e8400-e29b-41d4-a716-446655440011", "550e8400-e29b-41d4-a716-446655440012"]', '{"field": "status", "value": "reviewed"}', 'completed', 100, '{"updated_count": 2}', 'b1d5f92a-166f-49da-8692-b4ed5a323631', now() - interval '6 hours', now() - interval '6 hours'),
('950e8400-e29b-41d4-a716-446655440007', 'tag_cleanup_duplicates', '["React", "ReactJS", "React.js"]', '{"keep_primary": "React", "merge_duplicates": true}', 'in_progress', 80, null, 'b1d5f92a-166f-49da-8692-b4ed5a323631', now() - interval '1 hour', null),
('950e8400-e29b-41d4-a716-446655440008', 'bulk_export_filtered', '["AI/ML", "Cloud Architecture", "Startup Experience"]', '{"format": "xlsx", "include_metadata": true, "filter_by_tags": true}', 'pending', 0, null, 'b1d5f92a-166f-49da-8692-b4ed5a323631', now() - interval '15 minutes', null);

-- Insert analytics data
INSERT INTO public.analytics_data (id, metric_name, metric_value, dimensions, period_start, period_end, recorded_at) VALUES
('c50e8400-e29b-41d4-a716-446655440010', 'new_candidates_added', 15, '{"source": "direct_upload"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440011', 'tags_applied_per_candidate', 3.2, '{"average": true}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440012', 'workflow_success_rate', 94.5, '{"percentage": true}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440013', 'most_used_tag_type', 8, '{"type": "team"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440014', 'most_used_tag_type', 5, '{"type": "personal"}', now() - interval '7 days', now(), now()),
('c50e8400-e29b-41d4-a716-446655440015', 'user_activity_score', 87, '{"user_id": "current_user"}', now() - interval '1 day', now(), now());