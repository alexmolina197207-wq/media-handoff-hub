import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileWarning, Lock, Image, Video, Loader2 } from "lucide-react";
import { formatBytes, formatDate } from "@/data/mockData";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface ResolvedMedia {
  id: string;
  title: string;
  file_type: string;
  size: number;
  preview_url: string | null;
  video_url: string | null;
  created_at: string;
}

interface ResolvedLink {
  found: boolean;
  active?: boolean;
  access?: string;
  is_password_protected?: boolean;
  media?: ResolvedMedia | null;
}

export default function SharePage() {
  const { id: slug } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState<ResolvedLink | null>(null);

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchShareData() {
      if (!slug) {
        setLinkData({ found: false });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("resolve_share_link", { _slug: slug });

      if (error || !data) {
        setLinkData({ found: false });
      } else {
        setLinkData(data as ResolvedLink);
      }
      setLoading(false);
    }

    fetchShareData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!linkData?.found) {
    return <StatusCard icon={FileWarning} title="Link not found" message="This share link doesn't exist or has been removed." />;
  }

  if (!linkData.active) {
    return <StatusCard icon={FileWarning} title="Link expired" message="This share link is no longer active." />;
  }

  if (linkData.is_password_protected && !passwordUnlocked) {
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
              onSubmit={async (e) => {
                e.preventDefault();
                if (!slug || verifying) return;
                setVerifying(true);
                const { data, error } = await supabase.rpc("verify_share_password", {
                  _slug: slug,
                  _password: passwordInput,
                });
                setVerifying(false);
                if (error || !data) {
                  setPasswordInput("");
                  setPasswordError(true);
                } else {
                  setPasswordUnlocked(true);
                  setPasswordError(false);
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
              <Button type="submit" className="w-full" disabled={verifying}>
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const file = linkData.media;
  if (!file) {
    return <StatusCard icon={FileWarning} title="File not found" message="The file associated with this link could not be found." />;
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
          <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-[60vh]">
            {file.file_type === "video" && file.video_url ? (
              <video src={file.video_url} controls className="w-full max-h-[60vh] object-contain" poster={file.preview_url || undefined} />
            ) : file.preview_url ? (
              <img src={file.preview_url} alt={file.title} className="w-full max-h-[60vh] object-contain" />
            ) : (
              <div className="py-12 text-muted-foreground text-sm">No preview available</div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {file.file_type === "image" ? <Image className="h-4 w-4 text-muted-foreground" /> : <Video className="h-4 w-4 text-muted-foreground" />}
              <h1 className="text-lg font-semibold text-foreground">{file.title}</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatBytes(file.size)}</span>
              <span>·</span>
              <span>{formatDate(file.created_at)}</span>
              <Badge variant="secondary" className="text-xs capitalize">{file.file_type}</Badge>
            </div>
          </div>

          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>

          <p className="text-xs text-center text-muted-foreground">Shared via AnyRelay</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ icon: Icon, title, message }: { icon: React.ComponentType<{ className?: string }>; title: string; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <Icon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
