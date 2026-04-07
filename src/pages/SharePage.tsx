import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileWarning, Lock, Image, Video, Loader2 } from "lucide-react";
import { formatBytes, formatDate } from "@/data/mockData";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface ShareLinkRow {
  id: string;
  slug: string;
  access: string;
  password_hash: string | null;
  active: boolean;
  expires_at: string | null;
  media_id: string;
}

interface MediaFileRow {
  id: string;
  title: string;
  file_type: string;
  size: number;
  preview_url: string | null;
  video_url: string | null;
  created_at: string;
}

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<ShareLinkRow | null>(null);
  const [file, setFile] = useState<MediaFileRow | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    async function fetchShareData() {
      if (!id) { setNotFound(true); setLoading(false); return; }

      const { data: linkData, error: linkError } = await supabase
        .from("share_links")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (linkError || !linkData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLink(linkData as ShareLinkRow);

      if (!linkData.active) {
        setLoading(false);
        return;
      }

      const { data: mediaData } = await supabase
        .from("media_files")
        .select("*")
        .eq("id", linkData.media_id)
        .maybeSingle();

      setFile(mediaData as MediaFileRow | null);
      setLoading(false);
    }

    fetchShareData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <FileWarning className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">Link not found</h1>
            <p className="text-sm text-muted-foreground">
              This share link doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!link.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <FileWarning className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">Link expired</h1>
            <p className="text-sm text-muted-foreground">
              This share link is no longer active.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (link.access === "password" && !passwordUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="py-8 space-y-4">
            <div className="text-center space-y-2">
              <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
              <h1 className="text-lg font-semibold text-foreground">This file is password protected</h1>
              <p className="text-sm text-muted-foreground">Enter the password to access this file.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // For now, compare plain text. In production, use server-side hash comparison.
                if (passwordInput === link.password_hash) {
                  setPasswordUnlocked(true);
                  setPasswordError(false);
                } else {
                  setPasswordInput("");
                  setPasswordError(true);
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Input
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                  className={passwordError ? "border-destructive" : ""}
                />
                {passwordError && (
                  <p className="text-xs text-destructive">Incorrect password. Please try again.</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <FileWarning className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">File not found</h1>
            <p className="text-sm text-muted-foreground">
              The file associated with this link could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownload = () => {
    const url = file.file_type === "video" && file.video_url ? file.video_url : file.preview_url;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = file.title;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="py-8 space-y-6">
          {/* File preview */}
          <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-[60vh]">
            {file.file_type === "video" && file.video_url ? (
              <video
                src={file.video_url}
                controls
                className="w-full max-h-[60vh] object-contain"
                poster={file.preview_url || undefined}
              />
            ) : file.preview_url ? (
              <img
                src={file.preview_url}
                alt={file.title}
                className="w-full max-h-[60vh] object-contain"
              />
            ) : (
              <div className="py-12 text-muted-foreground text-sm">No preview available</div>
            )}
          </div>

          {/* File info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {file.file_type === "image" ? (
                <Image className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Video className="h-4 w-4 text-muted-foreground" />
              )}
              <h1 className="text-lg font-semibold text-foreground">{file.title}</h1>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatBytes(file.size)}</span>
              <span>·</span>
              <span>{formatDate(file.created_at)}</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {file.file_type}
              </Badge>
            </div>
          </div>

          {/* Download button */}
          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Shared via AnyRelay
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
