import { supabase } from "@/integrations/supabase/client";
import type { MediaFile, ShareLink } from "@/data/mockData";

/**
 * Persist a media file record to Supabase.
 * Works for both authenticated and anonymous users.
 */
export async function persistMedia(m: MediaFile): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  // Generate UUID client-side so we don't need .select() after insert
  // (anon SELECT policies may not allow reading back the row immediately)
  const dbId = crypto.randomUUID();

  const { error } = await supabase.from("media_files").insert({
    id: dbId,
    user_id: user?.id ?? null,
    title: m.title,
    file_type: m.type,
    size: m.size,
    preview_url: m.previewUrl,
    video_url: m.videoUrl || null,
    tags: m.tags,
    folder_id: m.folderId,
    collection_id: m.collectionId,
  });

  if (error) {
    console.error("Failed to persist media:", error);
    return null;
  }
  return dbId;
}

/**
 * Persist a share link record to Supabase.
 * Works for both authenticated and anonymous users.
 */
export async function persistShareLink(s: ShareLink, dbMediaId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("share_links").insert({
    user_id: user?.id ?? null,
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
 * Works for both authenticated and anonymous users.
 */
export async function uploadFileToStorage(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const folder = user?.id ?? 'anonymous';
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
  return publicUrl;
}
