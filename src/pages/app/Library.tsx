import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { formatBytes, formatDate } from '@/data/mockData';
import {
  Search, Grid3X3, List, Image, Video, Link2, FolderOpen, GripVertical,
  CheckSquare, SlidersHorizontal, X, CalendarDays, Tag, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import MediaDetailSheet from '@/components/MediaDetailSheet';
import BulkActionBar from '@/components/BulkActionBar';
import { format } from 'date-fns';

type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';
type SortField = 'date' | 'name' | 'size' | 'type';
type SortDir = 'asc' | 'desc';

export default function Library() {
  const { media, folders, collections, addShareLink, reorderMedia } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('tag') || '');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      setSearch(tag);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Derive all unique tags from media
  const allTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    media.forEach(m => m.tags.forEach(t => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
    return [...tagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [media]);

  // Date filter logic
  const getDateRange = (): { from?: Date; to?: Date } => {
    const now = new Date();
    switch (datePreset) {
      case 'today': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { from: start, to: now };
      }
      case 'week': {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        return { from: start, to: now };
      }
      case 'month': {
        const start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        return { from: start, to: now };
      }
      case 'custom':
        return { from: dateFrom, to: dateTo };
      default:
        return {};
    }
  };

  const hasActiveFilters = typeFilter !== 'all' || folderFilter !== 'all' ||
    collectionFilter !== 'all' || datePreset !== 'all' || activeTags.length > 0;
  const isFiltered = !!(search || hasActiveFilters);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const { from, to } = getDateRange();

    return media.filter(m => {
      const matchSearch = !q || m.title.toLowerCase().includes(q) ||
        m.tags.some(t => t.includes(q)) ||
        m.notes.toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || m.type === typeFilter;
      const matchFolder = folderFilter === 'all' || m.folderId === folderFilter;
      const matchCollection = collectionFilter === 'all' || m.collectionId === collectionFilter;
      const matchTags = activeTags.length === 0 || activeTags.every(at => m.tags.includes(at));

      let matchDate = true;
      if (from || to) {
        const d = new Date(m.uploadedAt);
        if (from && d < from) matchDate = false;
        if (to && d > to) matchDate = false;
      }

      return matchSearch && matchType && matchFolder && matchCollection && matchTags && matchDate;
    });
  }, [media, search, typeFilter, folderFilter, collectionFilter, datePreset, dateFrom, dateTo, activeTags]);

  const sorted = useMemo(() => {
    const mul = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case 'name': return mul * a.title.localeCompare(b.title);
        case 'size': return mul * (a.size - b.size);
        case 'type': return mul * a.type.localeCompare(b.type);
        case 'date':
        default: return mul * (new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
      }
    });
  }, [filtered, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir(field === 'name' ? 'asc' : 'desc'); }
  };

  // Clean up stale selections
  useEffect(() => {
    setSelectedIds(prev => {
      const mediaIds = new Set(media.map(m => m.id));
      const cleaned = new Set([...prev].filter(id => mediaIds.has(id)));
      if (cleaned.size === 0 && selectMode) setSelectMode(false);
      return cleaned.size !== prev.size ? cleaned : prev;
    });
  }, [media]);

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.size === sorted.length ? new Set() : new Set(filtered.map(m => m.id)));
  };

  const clearSelection = () => { setSelectedIds(new Set()); setSelectMode(false); };

  const handleCardClick = (id: string) => {
    if (selectMode) toggleSelect(id); else setSelectedId(id);
  };

  const clearAllFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setFolderFilter('all');
    setCollectionFilter('all');
    setDatePreset('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setActiveTags([]);
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Drag handlers
  const handleDragStart = (id: string) => { if (isFiltered || selectMode) return; setDragId(id); };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); if (dragId && dragId !== id) setDragOverId(id); };
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId || isFiltered) return;
    const fromIdx = media.findIndex(m => m.id === dragId);
    const toIdx = media.findIndex(m => m.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...media];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderMedia(reordered);
    setDragId(null); setDragOverId(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

  const createShareLink = (mediaId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const slug = `share-${Date.now().toString(36)}`;
    addShareLink({
      id: `s-${Date.now()}`, mediaId, slug,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      access: 'public', clicks: 0, active: true,
    });
    toast.success('Share link created!', { description: `droprelay.app/${slug}` });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-muted-foreground text-sm">{sorted.length} files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectMode ? 'default' : 'outline'} size="sm"
            onClick={() => { if (selectMode) clearSelection(); else setSelectMode(true); }}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            {selectMode ? 'Cancel' : 'Select'}
          </Button>
          <Button onClick={() => navigate('/app/upload')}>Upload New</Button>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files, tags, notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('all')}>All</Button>
          <Button variant={typeFilter === 'image' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('image')}>
            <Image className="h-4 w-4 mr-1" />Images
          </Button>
          <Button variant={typeFilter === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('video')}>
            <Video className="h-4 w-4 mr-1" />Videos
          </Button>
          <Button
            variant={showFilters ? 'default' : 'outline'} size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {(folderFilter !== 'all' ? 1 : 0) + (collectionFilter !== 'all' ? 1 : 0) + (datePreset !== 'all' ? 1 : 0) + activeTags.length}
              </span>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {/* Sort */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline capitalize">{sortField}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1.5" align="end">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Sort by</p>
              {([
                ['date', 'Date uploaded'],
                ['name', 'Name'],
                ['size', 'File size'],
                ['type', 'Type'],
              ] as [SortField, string][]).map(([field, label]) => (
                <button
                  key={field}
                  className={`w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                    sortField === field ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => toggleSort(field)}
                >
                  {label}
                  {sortField === field && (
                    sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <Button variant={view === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setView('grid')}><Grid3X3 className="h-4 w-4" /></Button>
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Select all bar */}
      {selectMode && (
        <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/50">
          <Checkbox
            checked={sorted.length > 0 && selectedIds.size === sorted.length}
            onCheckedChange={selectAll}
          />
          <span className="text-sm text-foreground">
            {selectedIds.size === sorted.length ? 'Deselect all' : 'Select all'}
          </span>
          {selectedIds.size > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">{selectedIds.size} selected</Badge>
          )}
        </div>
      )}

      {/* Advanced filter panel */}
      {showFilters && (
        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            {/* Folder + Collection row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" /> Folder
                </label>
                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All folders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All folders</SelectItem>
                    {folders.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.icon} {f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Collection</label>
                <Select value={collectionFilter} onValueChange={setCollectionFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All collections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All collections</SelectItem>
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date range */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Date uploaded
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  ['all', 'Any time'],
                  ['today', 'Today'],
                  ['week', 'This week'],
                  ['month', 'This month'],
                  ['custom', 'Custom'],
                ] as [DatePreset, string][]).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={datePreset === key ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setDatePreset(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              {datePreset === 'custom' && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <CalendarDays className="h-3.5 w-3.5 mr-1" />
                        {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'From date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <span className="text-xs text-muted-foreground">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <CalendarDays className="h-3.5 w-3.5 mr-1" />
                        {dateTo ? format(dateTo, 'MMM d, yyyy') : 'To date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Tag cloud */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map(({ tag, count }) => (
                  <Badge
                    key={tag}
                    variant={activeTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/10 active:scale-95 transition-all text-xs gap-1"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    <span className="text-[10px] opacity-60">{count}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={clearAllFilters}>
                <X className="h-3 w-3 mr-1" /> Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active filter pills (shown even when panel is closed) */}
      {(isFiltered && !showFilters) && (
        <div className="flex flex-wrap items-center gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{search}"
              <button onClick={() => setSearch('')} className="ml-1 hover:text-destructive text-xs">✕</button>
            </Badge>
          )}
          {folderFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {folders.find(f => f.id === folderFilter)?.icon} {folders.find(f => f.id === folderFilter)?.name}
              <button onClick={() => setFolderFilter('all')} className="ml-1 hover:text-destructive text-xs">✕</button>
            </Badge>
          )}
          {collectionFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {collections.find(c => c.id === collectionFilter)?.name}
              <button onClick={() => setCollectionFilter('all')} className="ml-1 hover:text-destructive text-xs">✕</button>
            </Badge>
          )}
          {datePreset !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {datePreset === 'custom' ? 'Custom dates' : datePreset === 'today' ? 'Today' : datePreset === 'week' ? 'This week' : 'This month'}
              <button onClick={() => setDatePreset('all')} className="ml-1 hover:text-destructive text-xs">✕</button>
            </Badge>
          )}
          {activeTags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              #{tag}
              <button onClick={() => toggleTag(tag)} className="ml-1 hover:text-destructive text-xs">✕</button>
            </Badge>
          ))}
          <button className="text-xs text-muted-foreground hover:text-foreground underline" onClick={clearAllFilters}>
            Clear all
          </button>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map(m => {
            const folder = folders.find(f => f.id === m.folderId);
            const isDragging = dragId === m.id;
            const isDragOver = dragOverId === m.id;
            const isSelected = selectedIds.has(m.id);
            return (
              <Card
                key={m.id}
                draggable={!isFiltered && !selectMode}
                onDragStart={() => handleDragStart(m.id)}
                onDragOver={(e) => handleDragOver(e, m.id)}
                onDrop={() => handleDrop(m.id)}
                onDragEnd={handleDragEnd}
                className={`shadow-card border-border overflow-hidden group hover:shadow-elevated transition-all cursor-pointer active:scale-[0.98] ${
                  isDragging ? 'opacity-40 scale-95' : ''
                } ${isDragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                } ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
                onClick={() => handleCardClick(m.id)}
              >
                <div className="relative aspect-video bg-muted">
                  <img src={m.previewUrl} alt={m.title} className="w-full h-full object-cover" />
                  {selectMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(m.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-background/80 border-foreground/30"
                      />
                    </div>
                  )}
                  {!selectMode && (
                    <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                      {m.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                      {m.type}
                    </Badge>
                  )}
                  {!isFiltered && !selectMode && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-foreground/70 drop-shadow" />
                    </div>
                  )}
                  {!selectMode && (
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => createShareLink(m.id, e)}>
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatBytes(m.size)}</span>
                    <span>·</span>
                    <span>{formatDate(m.uploadedAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.tags.slice(0, 2).map(t => (
                      <Badge
                        key={t}
                        variant={activeTags.includes(t) ? 'default' : 'outline'}
                        className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-primary/10 active:scale-95 transition-all"
                        onClick={(e) => { e.stopPropagation(); toggleTag(t); }}
                      >
                        {t}
                      </Badge>
                    ))}
                    {folder && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <FolderOpen className="h-2.5 w-2.5 mr-0.5" />{folder.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(m => {
            const folder = folders.find(f => f.id === m.folderId);
            const isSelected = selectedIds.has(m.id);
            return (
              <div
                key={m.id}
                className={`flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
                onClick={() => handleCardClick(m.id)}
              >
                {selectMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(m.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <img src={m.previewUrl} alt={m.title} className="w-12 h-12 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{m.type}</Badge>
                    <span>{formatBytes(m.size)}</span>
                    <span>{formatDate(m.uploadedAt)}</span>
                    {folder && <span>📁 {folder.name}</span>}
                  </div>
                </div>
                {!selectMode && (
                  <Button size="sm" variant="ghost" onClick={(e) => createShareLink(m.id, e)}>
                    <Link2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-medium">No files found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          {isFiltered && (
            <Button variant="outline" size="sm" className="mt-3" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      <MediaDetailSheet
        mediaId={selectedId}
        onClose={() => setSelectedId(null)}
        onTagClick={(tag) => { setActiveTags(prev => prev.includes(tag) ? prev : [...prev, tag]); }}
      />

      <BulkActionBar selectedIds={selectedIds} onClear={clearSelection} />
    </div>
  );
}
