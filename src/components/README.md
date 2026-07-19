# components/

Shared, reusable UI components — the product component set, derived from real design tokens
(`src/styles/tokens.css` / `DESIGN.md`) as the hi-fi screens landed.

Built so far (`ui.tsx` + `ui.module.css`, `Screen.tsx`):

- **StatusBar / NavHeader** — device chrome. `NavHeader` optionally hosts a popover
  (`menu` prop, anchored to its right icon button via `rightRef`) — see `Menu` below.
- **TabBar** — the global Trips/Activity/Profile glass tab bar.
- **Menu** — glass popover anchored to a trigger (`MenuItemDef[]`, `tone: 'default' | 'destructive'`),
  dismiss-on-outside-click, Escape-to-close + refocus, autofocuses the first item. Shared by `Fab`'s
  quick-action menu and `NavHeader`'s ellipsis action menu — reuse it rather than building a new
  popover.
- **Fab** — round glass floating action button; opens a `Menu` above itself.
- **Avatar / AvatarGroup** — participant chip; renders a photo (`avatarUrl`) when a participant has
  one, falling back to initials otherwise. Overlapping-group layout via `AvatarGroup`.
- **Pill** — status label, toned by semantic role (`settled` / `owed` / `neutral`).
- **Eyebrow** — uppercase section label.
- **Button** — primary/neutral variants, all native button states.
- **`glassClass`** — the frosted "liquid glass" chrome treatment, tokenized via `--blur-glass`.

Still not built (add when a screen needs one, don't pre-build blindly):

- **Card** — generic surface container (screens currently compose their own via CSS Modules).
- **PollOptionRow** — a poll choice with live vote count / leading indicator.
- **ExpenseRow** — a logged expense with payer + split summary.
- **BalanceChip** — a per-person balance, colored by `settled` vs `owed` roles.

Rules (see CLAUDE.md → Contracts):
- Consume tokens by role; never hardcode raw hex/px/radius.
- Copy comes from `BRAND.md`; names/amounts from `CONTENT.md`.

> Note: `src/screens/_ScreenScaffold.tsx` is dev scaffolding for unbuilt screens, not a product
> component — it lives with the screens, not here.
