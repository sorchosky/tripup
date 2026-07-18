# docs/issue-conventions.md — Ticketing & Delivery

Lightweight rules so the tickets stay consistent and the branches stay clean. Not a process manual —
just enough to keep data hygiene tight for a quick turnaround.

> Acceptance for any issue is `docs/brief.md`. Copy comes from `BRAND.md`, data from `CONTENT.md`.

## Delivery model

**No dev/staging env — `main` is production.** One issue → one branch → one PR → merge to `main` =
release.

- Branch off `main`, PR back into `main`. Never commit to `main` directly.
- Each branch must build on its own: `npm run build` + `npm run typecheck` pass before merge (that's
  the only gate).
- Don't merge a branch before its dependencies are already in `main`.

## Priority

One per issue, by leverage (not effort). Encoded as a `[P#]` title prefix + a `**Priority:**` body line.

- **P0** — foundational/blocking. Others can't be done right until it lands.
- **P1** — core experience on the primary flow.
- **P2** — refinement; the flow survives without it for a beat.

Do P0s before the P1s that depend on them.

## Type & branch name

Type sets the branch prefix: `feat` (new/changed behavior), `fix` (bug), `refactor`, `chore`, `docs`.

**Branch = `<type>/<issue#>-<kebab-slug>`** — e.g. `feat/9-home-hero-tripcard`. The issue number in the
branch name is what links the branch to its issue. Put the branch name in the issue so nobody invents
their own.

## PR → issue linking and auto-close

Every PR must link back to the issue its branch was cut from, using a GitHub closing keyword
(`Closes #n`, `Fixes #n`, or `Resolves #n`) in the PR description — not just the branch name, since
GitHub only auto-closes on the keyword. This lets merging to `main` close the issue automatically
instead of requiring a manual close step.

- Add the `Closes #n` line to the PR description as soon as the PR is opened, referencing the issue
  the branch was cut from.
- Only merge once the issue's **Acceptance** criteria are actually met — scope checked off, build +
  typecheck green, the change driven on-screen, doc edits included. The auto-close on merge is a
  mechanical consequence of that, not a substitute for it: don't add `Closes #n` to a PR that doesn't
  yet satisfy the issue's acceptance criteria.
- If a PR only partially addresses an issue, don't use a closing keyword — reference it as `Refs #n`
  instead so the issue stays open.

## Issue template

Title: `[P#] <short imperative summary>`. Body:

```markdown
**Priority:** P0|P1|P2 — one line on why.
**Type / Branch:** feat — `feat/<#>-<slug>`

## Context
The gap and the intended outcome, in a couple of lines. Flag any repo principle it overrides.

## Scope
- [ ] Verifiable changes, one per line.

## Files
Where the work lands.

## Dependencies
Blocked by / blocks (#n), or None.

## Acceptance
Observable end state. Always: build + typecheck pass; the change driven on-screen (no dev env, so
"builds" ≠ "works"); any doc updates in the same PR.
```

Add a `Docs to update` or `Reusable-component note` line only when it applies.

## Done means

Scope checked off, build + typecheck green, change actually run on-screen, doc edits in the same PR,
PR merged to `main` with `Closes #n` (squash-merge, delete the branch).
