import { supabase } from "@/integrations/supabase/client";
import type { MediaFile, ShareLink } from "@/data/mockData";

/**
 * Persist a media file record to Supabase.
 * Requires the user to be authenticated.
 */
export async function persistMedia(m: MediaFile): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("media_files").insert({
    user_id: user.id,
    title: m.title,
    file_type: m.type,
    size: m.size,
    preview_url: m.previewUrl,
    video_url: m.videoUrl || null,
    tags: m.tags,
    folder_id: m.folderId,
    collection_id: m.collectionId,
  }).select("id").single();

  if (error) {
    console.error("Failed to persist media:", error);
    return null;
  }
  return data.id;
}

/**
 * Persist a share link record to Supabase.
 */
export async function persistShareLink(s: ShareLink, dbMediaId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("share_links").insert({
    user_id: user.id,
    media_id: dbMediaId,
    slug: s.slug,
    access: s.access,
    password_hash: s.password || null,
    expires_at: s.expiresAt || null,
    active: s.active,
  });

  if (error) {
    console.error("Failed to persist share link:", error);
    return false;
  }
  return true;
}

/**
 * Upload a file to Supabase Storage and return the public URL.
 */
export async function uploadFileToStorage(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split('.').pop() || 'bin';
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
  return publicUrl;
}
