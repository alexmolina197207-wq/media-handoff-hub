import { supabase } from "@/integrations/supabase/client";
import type { MediaFile, ShareLink } from "@/data/mockData";

/**
 * Persist a media file record to Supabase.
 * Works for both authenticated and anonymous users.
 */
export async function persistMedia(m: MediaFile): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const dbId = crypto.randomUUID();

  // Derive the storage path from the URL if it's a Supabase storage URL
  const extractPath = (url: string | undefined): string | null => {
    if (!url) return null;
    const marker = '/storage/v1/object/public/media/';
    const idx = url.indexOf(marker);
    if (idx !== -1) return url.substring(idx + marker.length);
    // If it's already a path (no protocol), return as-is
    if (!url.startsWith('http')) return url;
    return null;
  };

  const { error } = await supabase.from("media_files").insert({
    id: dbId,
    user_id: user?.id ?? null,
    title: m.title,
    file_type: m.type,
    size: m.size,
    preview_url: m.previewUrl,
    video_url: m.videoUrl || null,
    preview_path: extractPath(m.previewUrl),
    video_path: extractPath(m.videoUrl),
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
 * Upload a file to Supabase Storage and return the storage path (not public URL).
 * Works for both authenticated and anonymous users.
 */
export async function uploadFileToStorage(file: File): Promise<{ publicUrl: string; storagePath: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const folder = user?.id ?? 'anonymous';
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  // For authenticated users, generate a signed URL for immediate display
  // For anonymous users, the signed URL will come via the edge function on the share page
  if (user) {
    const { data: signedData } = await supabase.storage.from("media").createSignedUrl(path, 3600);
    return { publicUrl: signedData?.signedUrl || '', storagePath: path };
  }

  // For anonymous uploads, return a placeholder — the share page will use the edge function
  return { publicUrl: '', storagePath: path };
}
