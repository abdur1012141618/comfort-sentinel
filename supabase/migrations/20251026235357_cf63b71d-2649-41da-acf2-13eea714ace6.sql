-- Insert sample organization
INSERT INTO public.organizations (id, name, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Comfort Sentinel HQ', now())
ON CONFLICT (id) DO NOTHING;

-- Note: Users are managed by Supabase Auth, so we create a profile instead
-- The user must sign up through the UI with email: test_user@comfortsentinel.com

-- Insert five diverse residents
INSERT INTO public.residents (org_id, name, room, age, gait, notes, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'আমিনা খাতুন', 'A-101', 78, 'slow', 'Requires assistance with mobility', now() - interval '6 months'),
  ('11111111-1111-1111-1111-111111111111', 'রহিম আহমেদ', 'A-102', 82, 'shuffling', 'History of falls, use walker', now() - interval '4 months'),
  ('11111111-1111-1111-1111-111111111111', 'ফাতিমা বেগম', 'B-201', 75, 'normal', 'Independent, no major issues', now() - interval '3 months'),
  ('11111111-1111-1111-1111-111111111111', 'করিম মিয়া', 'B-202', 80, 'unsteady', 'Recent surgery, recovering', now() - interval '2 months'),
  ('11111111-1111-1111-1111-111111111111', 'সালমা সুলতানা', 'C-301', 73, 'normal', 'Active, participates in all activities', now() - interval '1 month')
ON CONFLICT DO NOTHING;

-- Insert three open alerts for two residents
INSERT INTO public.alerts (org_id, resident_id, type, status, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 
   (SELECT id FROM public.residents WHERE name = 'রহিম আহমেদ' AND org_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
   'fall_detected', 'open', now() - interval '30 minutes'),
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM public.residents WHERE name = 'রহিম আহমেদ' AND org_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
   'fall_detected', 'open', now() - interval '2 hours'),
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM public.residents WHERE name = 'করিম মিয়া' AND org_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
   'fall_detected', 'open', now() - interval '1 hour')
ON CONFLICT DO NOTHING;