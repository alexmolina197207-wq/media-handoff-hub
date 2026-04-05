
## Implementation Plan (in order)

### 1. Library Sorting Options
- Add a sort dropdown (Newest, Oldest, Name A-Z, Name Z-A, Size ↑, Size ↓)
- Replace or enhance the existing "Date" sort button
- Mobile-friendly trigger

### 2. Inline Media Editing
- Add rename, tag editing, and notes editing to the MediaDetailSheet
- Editable fields with save/cancel inline UX
- Wire updates through AppContext

### 3. Share Link Controls
- Add expiry date picker (1 day, 7 days, 30 days, custom, never)
- Public/private toggle and optional password field
- Show link status badge (active/expired/password-protected)
- Update SharedLinks page and detail views

### 4. Analytics Detail Views
- Make shared links and files tappable in Analytics
- Show mock engagement detail: views over time, unique visitors, referrers, device breakdown
- Keep it demo/mock data driven

### 5. Notification Polish
- Clean up notification copy for clarity
- Add distinct icons/colors per notification type (upload, share, system)
- Improve empty state with illustration and message

### 6. Bulk Actions Polish
- Clearer multi-select mode indicator
- Sticky/improved action bar on mobile
- Confirmation dialogs for delete and other destructive actions

### 7. Final Cleanup Pass
- Review spacing, responsive layouts, tap targets across all pages
- Add loading skeletons where missing
- Consistency check on typography, colors, empty states
