# UI Design System

> Visual language, component principles, and design philosophy.

**→ [Home](Home) · [Folder Structure](Folder-Structure) · [Contributing](Contributing)**

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Typography](#typography)
- [Color System](#color-system)
- [Spacing](#spacing)
- [Components](#components)
- [Animation Principles](#animation-principles)
- [Icons](#icons)
- [Responsive Rules](#responsive-rules)
- [Accessibility](#accessibility)
- [Dark Mode Strategy](#dark-mode-strategy)

---

## Design Philosophy

Semua's visual design follows four principles:

1. **Clarity over decoration.** Every element must earn its place. If removing it doesn't hurt comprehension, remove it.
2. **Data density without clutter.** Four trackers in one app requires thoughtful information hierarchy. Cards, not tables.
3. **Calm, not sterile.** The pastel gradient background and soft shadows create warmth without distraction.
4. **Interactivity that feels natural.** Hover states, transitions, and confirmations should feel like responses, not features.

---

## Typography

**Font:** Satoshi (custom, loaded via `@font-face`)

Satoshi is a modern geometric sans-serif that balances friendliness with professionalism — appropriate for a productivity tool used daily.

```css
font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-feature-settings: 'ss01' on, 'cv01' on;
```

### Type Scale

| Role | Class | Size | Weight |
|------|-------|------|--------|
| Page title | `text-2xl font-bold` | 24px | 700 |
| Section heading | `text-lg font-semibold` | 18px | 600 |
| Card title | `text-base font-semibold` | 16px | 600 |
| Body | `text-sm` | 14px | 400 |
| Caption / label | `text-xs` | 12px | 400–500 |
| Sidebar nav | `text-sm font-medium` | 14px | 500 |

---

## Color System

Colors are defined as CSS custom properties in `globals.css`. Light mode values:

### Base

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `oklch(1 0 0)` (white) | Page background |
| `--foreground` | `oklch(0.145 0 0)` (near-black) | Body text |
| `--border` | `oklch(0.922 0 0)` (light grey) | Card borders |
| `--muted-foreground` | `oklch(0.556 0 0)` (medium grey) | Secondary text |

### Semantic Colors (Tailwind)

| Color | Hex approx | Usage |
|-------|-----------|-------|
| `gray-900` | `#111827` | Primary text, headings |
| `gray-500` | `#6B7280` | Secondary text, labels |
| `gray-400` | `#9CA3AF` | Placeholder, captions |
| `gray-100` | `#F3F4F6` | Hover backgrounds |
| `black` | `#000000` | Active nav, primary buttons |
| `white` | `#FFFFFF` | Cards, panels |
| `amber-500` | `#F59E0B` | Warnings, insights |
| `emerald-500` | `#10B981` | Success, completed states |
| `red-500` | `#EF4444` | Errors, overdue, destructive |
| `violet-500` | `#8B5CF6` | AI Agent accent |

### Background

The dashboard uses a **soft pastel gradient** (`public/bg.jpg`) as the content area background. Card surfaces use `bg-white` with `shadow-sm` to float above it.

```css
/* Dashboard layout */
background-image: url(/bg.jpg);
background-size: cover;
background-position: center;
```

---

## Spacing

Tailwind's default spacing scale. Common values used:

| Usage | Class | Value |
|-------|-------|-------|
| Card padding | `p-5` or `p-6` | 20–24px |
| Section gap | `gap-4` or `gap-6` | 16–24px |
| Inline gap | `gap-2` or `gap-3` | 8–12px |
| Border radius (cards) | `rounded-2xl` | 16px |
| Border radius (buttons) | `rounded-xl` | 12px |
| Border radius (pills) | `rounded-full` | 9999px |

---

## Components

### Cards

All content surfaces use this pattern:

```tsx
<div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
  {/* content */}
</div>
```

### Primary Button

```tsx
<Button className="rounded-xl bg-black hover:bg-gray-800 text-white gap-2 h-9 px-4 text-sm">
  <Plus size={16} />
  Add Task
</Button>
```

### Stat Card

```tsx
<div className="bg-white rounded-2xl border border-gray-100 p-5">
  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
    <Icon className={color} size={20} />
  </div>
  <p className="text-2xl font-bold text-gray-900">{value}</p>
  <p className="text-sm text-gray-500 mt-0.5">{label}</p>
</div>
```

### Badge / Priority Label

```tsx
const priorityStyles = {
  low:    'bg-gray-100 text-gray-500',
  medium: 'bg-amber-50 text-amber-600',
  high:   'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-600',
}
```

### Active Sidebar Nav

```tsx
<div className={cn(
  'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
  active
    ? 'bg-black text-white'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
)}>
```

> Uses pure CSS `:hover` — **not** Framer Motion `whileHover` — to avoid inline style conflicts during navigation transitions.

### Frosted Glass Header

```tsx
<header className="bg-white/70 backdrop-blur-md border-b border-gray-100/60">
```

---

## Animation Principles

**Library:** Framer Motion

### Rules

1. **Entry animations only.** Elements fade/slide in on mount. They do not animate on exit unless it meaningfully communicates something (e.g., a modal closing).
2. **Short durations.** `0.2s–0.3s`. Productivity apps should not make users wait for animations.
3. **No layout animations.** Avoid `layout` prop which causes jarring reflows.
4. **Don't animate color via Framer Motion on nav items.** Use Tailwind `transition-colors` and CSS `:hover` instead.

### Standard Entry

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

### Staggered List

```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
  />
))}
```

### Progress Bar

```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${pct}%` }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
/>
```

---

## Icons

**Library:** Lucide React (`lucide-react`)

Standard size: `size={18}` for nav, `size={16}` for inline, `size={20}` for stat cards.

```tsx
import { CheckSquare, DollarSign, Target, Repeat } from 'lucide-react'
```

---

## Responsive Rules

| Breakpoint | Behavior |
|------------|----------|
| `sm` (640px+) | Full button labels shown; some CTAs hidden below |
| `md` (768px+) | Two-column layouts in dashboard |
| Below `sm` | Floating action button (FAB) for create actions |

Sidebar collapses to icon-only on user toggle (not automatically responsive yet — planned v1.0).

```tsx
{/* Show on desktop, hide on mobile */}
<Button className="hidden sm:flex">Add Task</Button>

{/* Mobile FAB */}
<button className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-black text-white">
  <Plus size={20} />
</button>
```

---

## Accessibility

Current state and targets:

| Concern | Current | Target |
|---------|---------|--------|
| Keyboard navigation | Partial | Full tab order |
| Screen reader labels | Partial | All interactive elements |
| Color contrast | WCAG AA | WCAG AA |
| Focus indicators | Default browser | Custom visible ring |
| Form labels | Present | Always explicit |

---

## Dark Mode Strategy

Dark mode is **planned for v1.0** but not yet active.

The CSS custom properties in `globals.css` already include a `.dark` variant:

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

Implementation plan:
1. Add a `ThemeProvider` context
2. Persist preference in `localStorage`
3. Toggle `.dark` class on `<html>`
4. Audit all hardcoded `bg-white`, `text-gray-900` → replace with semantic tokens

---

*See also: [Folder Structure](Folder-Structure) · [Contributing](Contributing)*
