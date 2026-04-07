import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { slug, password } = await req.json();

    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid slug" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS — we do our own validation
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Look up the share link
    const { data: link, error: linkErr } = await supabaseAdmin
      .from("share_links")
      .select("id, media_id, active, expires_at, password_hash, access")
      .eq("slug", slug)
      .single();

    if (linkErr || !link) {
      return new Response(
        JSON.stringify({ error: "Share link not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check active
    if (!link.active) {
      return new Response(
        JSON.stringify({ error: "This share link is no longer active" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check expiry
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This share link has expired" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Check password if protected
    if (link.password_hash) {
      if (!password || typeof password !== "string") {
        return new Response(
          JSON.stringify({ error: "Password required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (link.password_hash !== password) {
        return new Response(
          JSON.stringify({ error: "Incorrect password" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 5. Look up the media file for storage paths
    const { data: media, error: mediaErr } = await supabaseAdmin
      .from("media_files")
      .select("id, user_id, preview_path, video_path")
      .eq("id", link.media_id)
      .single();

    if (mediaErr || !media) {
      return new Response(
        JSON.stringify({ error: "Media file not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5b. Path-injection guard: anonymous media must use the anonymous/ prefix
    if (media.user_id === null) {
      if (media.preview_path && !media.preview_path.startsWith("anonymous/")) {
        return new Response(
          JSON.stringify({ error: "Invalid media path" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (media.video_path && !media.video_path.startsWith("anonymous/")) {
        return new Response(
          JSON.stringify({ error: "Invalid media path" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const SIGNED_URL_EXPIRY = 300; // 5 minutes

    const result: { preview_url?: string; video_url?: string } = {};

    // 6. Generate signed URLs
    if (media.preview_path) {
      const { data: previewSigned, error: previewErr } = await supabaseAdmin.storage
        .from("media")
        .createSignedUrl(media.preview_path, SIGNED_URL_EXPIRY);

      if (!previewErr && previewSigned) {
        result.preview_url = previewSigned.signedUrl;
      }
    }

    if (media.video_path) {
      const { data: videoSigned, error: videoErr } = await supabaseAdmin.storage
        .from("media")
        .createSignedUrl(media.video_path, SIGNED_URL_EXPIRY);

      if (!videoErr && videoSigned) {
        result.video_url = videoSigned.signedUrl;
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-signed-media-url error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
