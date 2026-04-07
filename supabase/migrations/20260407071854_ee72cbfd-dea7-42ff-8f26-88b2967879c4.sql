
-- Create media_files table
CREATE TABLE public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  size BIGINT NOT NULL DEFAULT 0,
  preview_url TEXT,
  video_url TEXT,
  tags TEXT[] DEFAULT '{}',
  folder_id TEXT,
  collection_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Authenticated users manage their own files
CREATE POLICY "Users can view their own media" ON public.media_files FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own media" ON public.media_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media" ON public.media_files FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media" ON public.media_files FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create share_links table
CREATE TABLE public.share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  media_id UUID REFERENCES public.media_files(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  access TEXT NOT NULL DEFAULT 'public',
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Authenticated users manage their own share links
CREATE POLICY "Users can view their own share links" ON public.share_links FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own share links" ON public.share_links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own share links" ON public.share_links FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own share links" ON public.share_links FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Public access: anyone can read a share link by slug (for the /s/:id page)
CREATE POLICY "Anyone can view share links by slug" ON public.share_links FOR SELECT TO anon USING (true);

-- Public access: anyone can read media referenced by a share link
CREATE POLICY "Anyone can view shared media" ON public.media_files FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM public.share_links sl WHERE sl.media_id = media_files.id AND sl.active = true)
);

-- Storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Anyone can view media files" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
