import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileWarning, Lock, Image, Video } from "lucide-react";
import { formatBytes, formatDate } from "@/data/mockData";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const { shareLinks, media } = useApp();
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);

  const link = shareLinks.find((s) => s.slug === id);

  if (!link) {
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
              <h1 className="text-lg font-semibold text-foreground">Password required</h1>
              <p className="text-sm text-muted-foreground">Enter the password to access this file.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordInput === link.password) {
                  setPasswordUnlocked(true);
                } else {
                  setPasswordInput("");
                }
              }}
              className="space-y-3"
            >
              <Input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const file = media.find((m) => m.id === link.mediaId);

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
    const url = file.type === "video" && file.videoUrl ? file.videoUrl : file.previewUrl;
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
            {file.type === "video" && file.videoUrl ? (
              <video
                src={file.videoUrl}
                controls
                className="w-full max-h-[60vh] object-contain"
                poster={file.previewUrl}
              />
            ) : (
              <img
                src={file.previewUrl}
                alt={file.title}
                className="w-full max-h-[60vh] object-contain"
              />
            )}
          </div>

          {/* File info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {file.type === "image" ? (
                <Image className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Video className="h-4 w-4 text-muted-foreground" />
              )}
              <h1 className="text-lg font-semibold text-foreground">{file.title}</h1>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatBytes(file.size)}</span>
              <span>·</span>
              <span>{formatDate(file.uploadedAt)}</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {file.type}
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
