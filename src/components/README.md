# components/

Shared, reusable UI components — the product component set. Currently empty by design: build these as
the hi-fi screens land, so each is derived from real design tokens (`src/styles/tokens.css` /
`DESIGN.md`) rather than guessed.

Intended set (from the design plan — build when needed, don't pre-build blindly):

- **Button** — all states (default, pressed, disabled, loading), using semantic color roles.
- **Card** — surface container.
- **AvatarStack** — overlapping participant avatars.
- **PollOptionRow** — a poll choice with live vote count / leading indicator.
- **ExpenseRow** — a logged expense with payer + split summary.
- **BalanceChip** — a per-person balance, colored by `settled` vs `owed` roles.

Rules (see CLAUDE.md → Contracts):
- Consume tokens by role; never hardcode raw hex/px/radius.
- Copy comes from `BRAND.md`; names/amounts from `CONTENT.md`.

> Note: `src/screens/_ScreenScaffold.tsx` is dev scaffolding for unbuilt screens, not a product
> component — it lives with the screens, not here.
