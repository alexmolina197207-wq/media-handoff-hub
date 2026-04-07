import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { generateShareId } from '@/lib/utils';
import { uploadFileToStorage } from '@/lib/supabaseHelpers';
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  Image,
  Video,
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Trash2,
  Ban,
  FolderOpen,
  Layers,
  Tag,
  Plus,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { formatBytes } from "@/data/mockData";

// --- Config ---
const ACCEPTED_TYPES: Record<string, "image" | "video"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/webm": "video",
};
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPT_STRING = Object.keys(ACCEPTED_TYPES).join(",");

type FileStatus = "queued" | "uploading" | "complete" | "error" | "cancelled" | "duplicate";

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  mediaType: "image" | "video";
  status: FileStatus;
  progress: number;
  error?: string;
  previewUrl?: string;
  tags: string[];
  folderId: string | null;
  collectionId: string | null;
}

const normalizeTags = (tags: string[]) => [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
const resolveSelectionValue = (value: string) => (value !== "none" ? value : null);

function fileId(file: File) {
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  return `${file.name}-${file.size}-${file.lastModified}`;
}

const ANON_UPLOAD_LIMIT = 2;

function getAnonUploadCount(): number {
  try { return Number(localStorage.getItem("uploadCount") || 0); } catch { return 0; }
}

function incrementAnonUploadCount() {
  try {
    const count = getAnonUploadCount() + 1;
    localStorage.setItem("uploadCount", count.toString());
  } catch {}
}

export default function UploadPage() {
  const { media, folders, collections, addMedia, addShareLink, shareLinks, tagPresets, hasUploaded, isAuthenticated } = useApp();
  const [anonUploadCount, setAnonUploadCount] = useState(getAnonUploadCount);
  const isUploadBlocked = !isAuthenticated && anonUploadCount >= ANON_UPLOAD_LIMIT;
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("none");
  const [selectedCollection, setSelectedCollection] = useState<string>("none");
  const abortRefs = useRef<Map<string, () => void>>(new Map());
  const dragCounter = useRef(0);

  // Bulk tag state — these are "pending" tags the user builds, applied explicitly
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const prevBulkTagsRef = useRef<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [applyToAll, setApplyToAll] = useState(true);

  // --- Validation ---
  const validateFile = useCallback((file: File): { ok: boolean; error?: string } => {
    if (!ACCEPTED_TYPES[file.type]) return { ok: false, error: `Unsupported type: ${file.type || "unknown"}` };
    if (file.size > MAX_FILE_SIZE) return { ok: false, error: `File too large (max ${formatBytes(MAX_FILE_SIZE)})` };
    return { ok: true };
  }, []);

  const isDuplicate = useCallback(
    (file: File): boolean => {
      return media.some((m) => m.title === file.name && Math.abs(m.size - file.size) < 1024);
    },
    [media],
  );

  // --- Add files to queue (new files start with NO tags) ---
  const enqueueFiles = useCallback(
    (files: FileList | File[]) => {
      const newItems: QueuedFile[] = [];
      for (const file of Array.from(files)) {
        const id = fileId(file);
        const validation = validateFile(file);
        const duplicate = isDuplicate(file);
        let previewUrl: string | undefined;
        if (ACCEPTED_TYPES[file.type] === "image") {
          previewUrl = URL.createObjectURL(file);
          new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.readAsDataURL(file); }).then((dataUrl) => {
            setQueue((prevQueue) => prevQueue.map((q) => (q.id === id ? { ...q, previewUrl: dataUrl } : q)));
            if (previewUrl) URL.revokeObjectURL(previewUrl);
          });
        }

        newItems.push({
          id,
          file,
          name: file.name,
          size: file.size,
          mediaType: ACCEPTED_TYPES[file.type] || "image",
          status: !validation.ok ? "error" : duplicate ? "duplicate" : "queued",
          progress: 0,
          error: validation.ok ? undefined : validation.error,
          previewUrl,
          tags: applyToAll ? normalizeTags(bulkTags) : [],
          folderId: resolveSelectionValue(selectedFolder),
          collectionId: resolveSelectionValue(selectedCollection),
        });
      }

      setQueue((prev) => {
        const existingIds = new Set(
          prev.filter((q) => q.status !== "cancelled" && q.status !== "error").map((q) => q.id),
        );
        const deduped = newItems.filter((n) => !existingIds.has(n.id));
        const seen = new Set<string>();
        const filtered: QueuedFile[] = [];
        for (const item of deduped) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);
          filtered.push(item);
        }
        return [...prev, ...filtered];
      });
    },
    [validateFile, isDuplicate, applyToAll, bulkTags, selectedFolder, selectedCollection],
  );

  useEffect(() => {
    const folderId = resolveSelectionValue(selectedFolder);
    const collectionId = resolveSelectionValue(selectedCollection);

    setQueue((prev) =>
      prev.map((q) => {
        if (q.status === "complete" || q.status === "error" || q.status === "cancelled") return q;
        if (q.folderId === folderId && q.collectionId === collectionId) return q;
        return { ...q, folderId, collectionId };
      }),
    );
  }, [selectedFolder, selectedCollection]);

  // --- Apply bulk tags to all queued/duplicate files ---
  const applyBulkTagsToAll = useCallback(() => {
    if (bulkTags.length === 0) return;
    setQueue((prev) =>
      prev.map((q) => {
        if (q.status === "complete" || q.status === "error" || q.status === "cancelled") return q;
        return { ...q, tags: [...new Set([...q.tags, ...bulkTags])] };
      }),
    );
    toast.success(`Applied ${bulkTags.length} tag${bulkTags.length > 1 ? "s" : ""} to all files`);
  }, [bulkTags]);

  // When applyToAll is on, sync bulk tag changes (additions AND removals) to pending files
  useEffect(() => {
    if (!applyToAll) {
      prevBulkTagsRef.current = bulkTags;
      return;
    }
    const prevTags = prevBulkTagsRef.current;
    const added = bulkTags.filter((t) => !prevTags.includes(t));
    const removed = prevTags.filter((t) => !bulkTags.includes(t));
    prevBulkTagsRef.current = bulkTags;

    if (added.length === 0 && removed.length === 0) return;

    setQueue((prev) =>
      prev.map((q) => {
        if (q.status === "complete" || q.status === "error" || q.status === "cancelled") return q;
        let newTags = [...q.tags];
        // Add new bulk tags (deduplicated)
        for (const t of added) {
          if (!newTags.includes(t)) newTags.push(t);
        }
        // Remove bulk tags that were removed
        if (removed.length > 0) {
          newTags = newTags.filter((t) => !removed.includes(t));
        }
        if (newTags.length === q.tags.length && newTags.every((t, i) => q.tags[i] === t)) return q;
        return { ...q, tags: newTags };
      }),
    );
  }, [bulkTags, applyToAll]);

  // --- Per-file tag management ---
  const addTagToFile = (fileId: string, tag: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === fileId && !q.tags.includes(tag) ? { ...q, tags: [...q.tags, tag] } : q)),
    );
  };

  const removeTagFromFile = (fileId: string, tag: string) => {
    setQueue((prev) => prev.map((q) => (q.id === fileId ? { ...q, tags: q.tags.filter((t) => t !== tag) } : q)));
  };

  // --- Upload file to Supabase Storage ---
  const uploadFile = useCallback(
    (id: string) => {
      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "uploading", progress: 0, error: undefined } : q)),
      );

      let cancelled = false;
      const queuedFile = queue.find((q) => q.id === id);
      if (!queuedFile) return;

      // Simulate progress while uploading
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (cancelled) { clearInterval(progressInterval); return; }
        progress = Math.min(progress + Math.random() * 10 + 2, 90);
        setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, progress } : q)));
      }, 300);

      const doUpload = async () => {
        try {
          const publicUrl = await uploadFileToStorage(queuedFile.file);
          
          if (cancelled) return;
          clearInterval(progressInterval);

          if (!publicUrl) {
            setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: "error", error: "Upload failed — please try again" } : q)));
            abortRefs.current.delete(id);
            return;
          }

          setQueue((prev) =>
            prev.map((q) => (q.id === id ? { ...q, status: "complete", progress: 100 } : q)),
          );

          // Track anonymous upload count
          if (!isAuthenticated) {
            incrementAnonUploadCount();
            setAnonUploadCount(getAnonUploadCount());
          }

          const mediaId = `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const slug = generateShareId();
          const isVideo = queuedFile.mediaType === "video";

          addMedia({
            id: mediaId,
            title: queuedFile.name,
            type: queuedFile.mediaType,
            tags: normalizeTags(queuedFile.tags),
            size: queuedFile.size,
            folderId: queuedFile.folderId,
            collectionId: queuedFile.collectionId,
            previewUrl: isVideo
              ? (queuedFile.previewUrl || `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop`)
              : publicUrl,
            videoUrl: isVideo ? publicUrl : undefined,
            notes: "",
            uploadedAt: new Date().toISOString(),
            source: "Upload",
          });

          addShareLink({
            id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            mediaId,
            slug,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            access: 'public',
            clicks: 0,
            active: true,
          });

          abortRefs.current.delete(id);
        } catch (err) {
          if (cancelled) return;
          clearInterval(progressInterval);
          setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: "error", error: "Upload failed" } : q)));
          abortRefs.current.delete(id);
        }
      };

      doUpload();

      abortRefs.current.set(id, () => {
        cancelled = true;
        clearInterval(progressInterval);
        setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: "cancelled", progress: 0 } : q)));
      });
    },
    [addMedia, addShareLink, queue],
  );

  // --- Auto-start queued files ---
  useEffect(() => {
    const uploading = queue.filter((q) => q.status === "uploading");
    if (uploading.length >= 2) return;
    const next = queue.find((q) => q.status === "queued");
    if (next) uploadFile(next.id);
  }, [queue, uploadFile]);

  // --- Actions ---
  const cancelFile = (id: string) => {
    const abort = abortRefs.current.get(id);
    if (abort) abort();
    else setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: "cancelled" } : q)));
  };

  const retryFile = (id: string) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: "queued", progress: 0, error: undefined } : q)));
  };

  const forceUploadDuplicate = (id: string) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: "queued" } : q)));
  };

  const removeFile = (id: string) => {
    cancelFile(id);
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  };

  const clearCompleted = () => {
    setQueue((prev) => {
      prev.filter((q) => q.status === "complete" && q.previewUrl).forEach((q) => URL.revokeObjectURL(q.previewUrl!));
      return prev.filter((q) => q.status !== "complete");
    });
  };

  // --- Drag & Drop ---
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    if (isUploadBlocked) {
      toast.error("Upload limit reached — create a free account to continue");
      return;
    }
    if (e.dataTransfer.files.length) enqueueFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploadBlocked) {
      toast.error("Upload limit reached — create a free account to continue");
      e.target.value = "";
      return;
    }
    if (e.target.files?.length) enqueueFiles(e.target.files);
    e.target.value = "";
  };

  // --- Stats ---
  const completedCount = queue.filter((q) => q.status === "complete").length;
  const totalCount = queue.length;
  const hasActive = queue.some((q) => q.status === "uploading" || q.status === "queued");
  const pendingFiles = queue.filter((q) => q.status === "queued" || q.status === "duplicate");
  const allDone = totalCount > 0 && completedCount === totalCount && !hasActive;
  const [linkCopied, setLinkCopied] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Get the share link for the most recently uploaded file
  const generatedShareLink = useMemo(() => {
    if (!allDone || shareLinks.length === 0) return "";
    const latestLink = shareLinks[0]; // shareLinks are prepended, so first is latest
    return `https://anyrelay.net/s/${latestLink.slug}`;
  }, [allDone, shareLinks]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedShareLink);
      setLinkCopied(true);
      toast.success("Copied! Send it to anyone");
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Helper to add a bulk tag
  const addBulkTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !bulkTags.includes(t)) setBulkTags((prev) => [...prev, t]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* First-time user guidance — disappears after first upload */}
      {!hasUploaded && queue.length === 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Upload your first file</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Drop a file below to instantly generate a secure share link — no signup required.
          </p>
        </div>
      )}

      {/* Upload limit gate for anonymous users */}
      {isUploadBlocked && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center animate-fade-in space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-1">
            <Ban className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Free upload limit reached</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Create a free account to keep sharing files — unlimited uploads, password-protected links, and more.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Button onClick={() => navigate("/login")} size="sm">
              Sign Up
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              Log In
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Media</h1>
          <p className="text-muted-foreground text-sm">Drag & drop or browse to upload files.</p>
        </div>
        {completedCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => navigate("/app/library")}>
            View Library
          </Button>
        )}
      </div>

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed cursor-pointer transition-all duration-300 ease-out ${
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/10 ring-2 ring-primary/20"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="py-12 text-center">
          <div className={`transition-transform duration-300 ease-out ${isDragging ? "-translate-y-2" : ""}`}>
            <Upload
              className={`h-10 w-10 mx-auto mb-3 transition-all duration-300 ${
                isDragging ? "text-primary scale-125" : "text-muted-foreground"
              }`}
            />
            <p className="text-foreground font-medium mb-1">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className={`text-sm mb-3 transition-colors duration-200 ${isDragging ? "text-primary/70" : "text-muted-foreground"}`}>
              {isDragging ? "Release to add files" : "or click to browse"}
            </p>
          </div>
          <div className={`flex items-center justify-center gap-2 text-xs text-muted-foreground transition-opacity duration-200 ${isDragging ? "opacity-0" : "opacity-100"}`}>
            <Image className="h-3.5 w-3.5" /> JPEG, PNG, WebP, GIF
            <span className="mx-1.5 text-border">|</span>
            <Video className="h-3.5 w-3.5" /> MP4, MOV, WebM
          </div>
          <p className={`text-xs text-muted-foreground mt-2 transition-opacity duration-200 ${isDragging ? "opacity-0" : "opacity-100"}`}>Max {formatBytes(MAX_FILE_SIZE)} per file</p>
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Folder & Collection picker */}
      {queue.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <FolderOpen className="h-3.5 w-3.5" /> Upload to folder
                </Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="No folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No folder</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.icon} {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" /> Collection
                </Label>
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="No collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No collection</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(selectedFolder !== "none" || selectedCollection !== "none") && (
              <p className="text-xs text-muted-foreground mt-2">
                All uploaded files will be added to{" "}
                {selectedFolder !== "none" && (
                  <Badge variant="secondary" className="text-[10px] mx-0.5">
                    {folders.find((f) => f.id === selectedFolder)?.icon}{" "}
                    {folders.find((f) => f.id === selectedFolder)?.name}
                  </Badge>
                )}
                {selectedFolder !== "none" && selectedCollection !== "none" && " and "}
                {selectedCollection !== "none" && (
                  <Badge variant="secondary" className="text-[10px] mx-0.5">
                    {collections.find((c) => c.id === selectedCollection)?.name}
                  </Badge>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk tagging section */}
      {queue.length > 0 && (
        <Card className="border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                <Tag className="h-3.5 w-3.5" /> Bulk Tags
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="apply-all-toggle" className="text-[10px] text-muted-foreground cursor-pointer">
                  Apply to all files
                </Label>
                <Switch
                  id="apply-all-toggle"
                  checked={applyToAll}
                  onCheckedChange={setApplyToAll}
                  className="scale-75"
                />
              </div>
            </div>

            {/* Tag input */}
            <div className="flex gap-1.5">
              <Input
                placeholder="Add a tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBulkTag(tagInput);
                    setTagInput("");
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                className="h-8"
                disabled={!tagInput.trim()}
                onClick={() => {
                  addBulkTag(tagInput);
                  setTagInput("");
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Bulk tag chips */}
            {bulkTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bulkTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setBulkTags((prev) => prev.filter((t) => t !== tag))}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Preset quick-apply */}
            {tagPresets.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-medium">Quick add from presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {tagPresets.map((preset) => {
                    const allApplied = preset.tags.every((t) => bulkTags.includes(t));
                    return (
                      <Button
                        key={preset.id}
                        size="sm"
                        variant={allApplied ? "default" : "outline"}
                        className="h-7 text-xs px-2.5"
                        onClick={() => {
                          if (allApplied) {
                            setBulkTags((prev) => prev.filter((t) => !preset.tags.includes(t)));
                          } else {
                            setBulkTags((prev) => [...new Set([...prev, ...preset.tags])]);
                          }
                        }}
                      >
                        {preset.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual apply button when toggle is off */}
            {!applyToAll && bulkTags.length > 0 && pendingFiles.length > 0 && (
              <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={applyBulkTagsToAll}>
                Apply {bulkTags.length} tag{bulkTags.length > 1 ? "s" : ""} to {pendingFiles.length} pending file
                {pendingFiles.length > 1 ? "s" : ""}
              </Button>
            )}

            <p className="text-[10px] text-muted-foreground">
              {applyToAll
                ? `Tags are auto-applied to all pending files. Edit per-file tags below.`
                : `Add tags here, then apply to all or edit tags on individual files.`}
            </p>
          </CardContent>
        </Card>
      )}

      {queue.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {completedCount}/{totalCount} uploaded
          </p>
          <div className="flex gap-2">
            {completedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
            {hasActive && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() =>
                  queue
                    .filter((q) => q.status === "uploading" || q.status === "queued")
                    .forEach((q) => cancelFile(q.id))
                }
              >
                Cancel all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* File queue */}
      <div className="space-y-2">
        {queue.map((item) => (
          <FileQueueItem
            key={item.id}
            item={item}
            onCancel={() => cancelFile(item.id)}
            onRetry={() => retryFile(item.id)}
            onRemove={() => removeFile(item.id)}
            onForceUpload={() => forceUploadDuplicate(item.id)}
            onAddTag={(tag) => addTagToFile(item.id, tag)}
            onRemoveTag={(tag) => removeTagFromFile(item.id, tag)}
          />
        ))}
      </div>

      {/* Post-upload success state */}
      {allDone && (
        <Card className="border-primary/30 bg-primary/5 animate-fade-in">
          <CardContent className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Upload complete</h2>
              <p className="text-sm text-muted-foreground">Your file is ready to share</p>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={handleCopyLink}
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">Send this link to anyone to give access</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// --- File queue item component ---
function FileQueueItem({
  item,
  onCancel,
  onRetry,
  onRemove,
  onForceUpload,
  onAddTag,
  onRemoveTag,
}: {
  item: QueuedFile;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
  onForceUpload: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [showTags, setShowTags] = useState(false);
  const [localTagInput, setLocalTagInput] = useState("");
  const canEditTags = item.status !== "complete" && item.status !== "cancelled" && item.status !== "error";

  const statusConfig: Record<FileStatus, { icon: React.ReactNode; label: string; color: string }> = {
    queued: { icon: null, label: "Waiting…", color: "text-muted-foreground" },
    uploading: { icon: null, label: `${Math.round(item.progress)}%`, color: "text-primary" },
    complete: { icon: <CheckCircle2 className="h-4 w-4 text-accent" />, label: "Done", color: "text-accent" },
    error: {
      icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
      label: item.error || "Failed",
      color: "text-destructive",
    },
    cancelled: {
      icon: <Ban className="h-4 w-4 text-muted-foreground" />,
      label: "Cancelled",
      color: "text-muted-foreground",
    },
    duplicate: {
      icon: <FileWarning className="h-4 w-4 text-yellow-500" />,
      label: "Duplicate",
      color: "text-yellow-500",
    },
  };

  const { icon, label, color } = statusConfig[item.status];

  return (
    <Card
      className={`border-border transition-all ${
        item.status === "duplicate" ? "border-yellow-500/30 bg-yellow-500/5" : ""
      } ${item.status === "error" ? "border-destructive/30 bg-destructive/5" : ""}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
            {item.previewUrl ? (
              <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
            ) : item.mediaType === "video" ? (
              <Video className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Image className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{formatBytes(item.size)}</span>
              <span className={`flex items-center gap-1 ${color}`}>
                {icon} {label}
              </span>
              {item.tags.length > 0 && (
                <span className="text-muted-foreground">
                  · {item.tags.length} tag{item.tags.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {canEditTags && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowTags(!showTags)}>
                {showTags ? <ChevronUp className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />}
              </Button>
            )}
            {item.status === "uploading" && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            {(item.status === "error" || item.status === "cancelled") && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRetry}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            {item.status === "duplicate" && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onForceUpload}>
                Upload anyway
              </Button>
            )}
            {item.status !== "uploading" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Per-file tag chips — always visible */}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.length > 0 ? (
            item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] gap-0.5 pr-1 h-5">
                {tag}
                {canEditTags && (
                  <X className="h-2.5 w-2.5 cursor-pointer hover:text-destructive" onClick={() => onRemoveTag(tag)} />
                )}
              </Badge>
            ))
          ) : (
            <span className="text-[10px] text-muted-foreground italic">No tags</span>
          )}
        </div>

        {/* Expanded per-file tag editor */}
        {showTags && canEditTags && (
          <div className="mt-2 space-y-2 pt-2 border-t border-border">
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-0.5 pr-1 h-5">
                  {tag}
                  <X className="h-2.5 w-2.5 cursor-pointer hover:text-destructive" onClick={() => onRemoveTag(tag)} />
                </Badge>
              ))}
              {item.tags.length === 0 && <span className="text-[10px] text-muted-foreground">No tags yet</span>}
            </div>
            <div className="flex gap-1">
              <Input
                placeholder="Add tag…"
                value={localTagInput}
                onChange={(e) => setLocalTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const t = localTagInput.trim().toLowerCase();
                    if (t) {
                      onAddTag(t);
                      setLocalTagInput("");
                    }
                  }
                }}
                className="h-7 text-xs"
              />
              <Button
                size="sm"
                className="h-7 px-2"
                disabled={!localTagInput.trim()}
                onClick={() => {
                  const t = localTagInput.trim().toLowerCase();
                  if (t) {
                    onAddTag(t);
                    setLocalTagInput("");
                  }
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {(item.status === "uploading" || item.status === "queued") && (
          <Progress value={item.progress} className="h-1.5 mt-2" />
        )}

        {/* Duplicate warning */}
        {item.status === "duplicate" && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
            <FileWarning className="h-3 w-3 flex-shrink-0" />A file with this name already exists in your library.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
