

## Phase 5 Polish: Skeleton Loading States

### Changes

**1. Create `src/components/lobby/DropCardSkeleton.tsx`**
- Skeleton mimicking DropCard layout: header bar, description lines, meta row, capacity bar, action button

**2. Create `src/components/sparks/SparkCardSkeleton.tsx`**
- Skeleton mimicking SparkCard layout: avatar circle, name line, subtitle line, timestamp

**3. Edit `src/pages/Lobby.tsx`**
- Destructure `isLoading` from the drops `useQuery`
- When `isLoading`, render 3 `DropCardSkeleton` components instead of the drop list

**4. Edit `src/pages/SparkHistory.tsx`**
- Destructure `isLoading` from the sparks `useQuery`
- When `isLoading`, render 4 `SparkCardSkeleton` components instead of the spark list / empty state

Both skeletons use the existing `Skeleton` component from `src/components/ui/skeleton.tsx`.

### Files
- **Create**: `src/components/lobby/DropCardSkeleton.tsx`, `src/components/sparks/SparkCardSkeleton.tsx`
- **Edit**: `src/pages/Lobby.tsx` (add loading guard), `src/pages/SparkHistory.tsx` (add loading guard)

### Testing note
The typing indicator and data export/deletion testing require two authenticated users or live session interaction — these cannot be verified via code changes alone. The skeleton states can be visually confirmed by navigating to `/lobby` and `/sparks` while data is loading.

