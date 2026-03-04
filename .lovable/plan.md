

## Quality Check: Dark/Light Theme Toggle

### Current State

The theme toggle implementation is mostly correct:

- **ThemeProvider** is properly configured in `App.tsx` with `attribute="class"`, `defaultTheme="dark"`, and `enableSystem`
- **ThemeToggle** component correctly uses `useTheme()` from `next-themes`, handles hydration mismatch with a `mounted` state guard, and renders Sun/Moon icons
- **AppHeader** renders the toggle on all pages except `/` (landing) and `/call/*` routes
- **Landing page** has its own Navbar but does **not** include a ThemeToggle — this is a gap
- **Sonner** correctly reads the theme for toast styling
- All pages use semantic Tailwind tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, etc.) — no hardcoded colors found in page components
- CSS variables are properly defined for both `:root` (light) and `.dark` (dark) themes

### Issues Found

1. **No theme toggle on the landing page** — The `AppHeader` explicitly hides on `/`, and the landing `Navbar` does not include a `ThemeToggle`. Users on the landing page have no way to switch themes.

2. **Console warning: "Function components cannot be given refs"** — `VerityLogo` is a plain function component but is used inside a `Link` (which may attempt to pass a ref). The `Footer` component triggers this warning. While not theme-specific, it's a real console error on the landing page.

3. **`App.css` contains unused legacy styles** — The file has leftover Vite starter styles (`#root { max-width: 1280px }`, logo spin animations) that constrain the root element and conflict with the full-width layout. This can cause subtle layout issues.

### Plan

**1. Add ThemeToggle to the landing Navbar**
- Import and render `ThemeToggle` in `src/components/landing/Navbar.tsx`, placed between the nav links and the CTA button in the desktop layout, and at the bottom of the mobile menu.

**2. Fix VerityLogo ref warning**
- Wrap `VerityLogo` with `React.forwardRef` so that `Link` can pass refs without triggering the console warning.

**3. Remove legacy App.css**
- Delete `src/App.css` (it is not imported anywhere in the current `App.tsx` or `main.tsx`). If it is imported somewhere, remove the import instead.

