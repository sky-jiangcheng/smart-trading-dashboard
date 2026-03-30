# Investment Dashboard Implementation Plan

This checklist turns the design system into concrete work items.

## Phase 1. Board polish

- [ ] Keep the hero area editorial and calm.
- [ ] Keep the market state pill visible and consistent across languages.
- [ ] Keep the dimension map as the main filter entry point.
- [ ] Keep the right rail compact, premium, and readable at a glance.
- [ ] Ensure top news and top signal always summarize the current dimension filter.
- [ ] Avoid emoji-heavy titles or decorative noise in the reading surface.
- [ ] Keep report briefs short, semantic, and scannable.

## Phase 2. Admin cockpit consistency

- [ ] Keep workspace names and descriptions short, state-driven, and non-repetitive.
- [ ] Keep `SectionHeader`, `StatCard`, and panel surfaces visually consistent.
- [ ] Keep the top status bar stable across workspaces.
- [ ] Keep Thresholds as the most advanced control surface in the admin.
- [ ] Keep Sources, Rules, Activity, and Settings aligned to the same cockpit language.
- [ ] Avoid mixed visual density between overview tiles and deep-edit workspaces.

## Phase 3. Backend semantics

- [ ] Keep `/board` as the semantic payload for the board.
- [ ] Keep `marketState`, `marketStateLabel`, `marketStateSummary`, and tone fields available from `/board`.
- [ ] Keep news payloads carrying `dimensions`, `whyItMatters`, and `relatedAssets`.
- [ ] Keep signal payloads carrying `dimension`, `confidence`, `relatedNewsIds`, and `whyItMatters`.
- [ ] Keep threshold metadata available for helper chips and quick presets.

## Phase 4. Future quality gates

- [ ] Review the board on a real display before release.
- [ ] Review the admin workspaces one by one for spacing and hierarchy.
- [ ] Check mobile wrapping for the board hero and admin overview chips.
- [ ] Re-run build checks after every visual or semantic adjustment.

