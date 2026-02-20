
-- Feature 1: Custom Charts
CREATE TABLE public.custom_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  chart_type TEXT NOT NULL DEFAULT 'bar',
  data_source TEXT NOT NULL,
  metric_field TEXT NOT NULL,
  group_by TEXT,
  aggregate TEXT NOT NULL DEFAULT 'count',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage custom_charts" ON public.custom_charts FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "All authenticated can view custom_charts" ON public.custom_charts FOR SELECT USING (true);

-- Feature 4: Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()));

-- Avatar storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Feature 7: Comments
CREATE TABLE public.record_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.record_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view comments" ON public.record_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert comments" ON public.record_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.record_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any comment" ON public.record_comments FOR DELETE USING (is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_custom_charts_updated_at BEFORE UPDATE ON public.custom_charts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_record_comments_updated_at BEFORE UPDATE ON public.record_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
