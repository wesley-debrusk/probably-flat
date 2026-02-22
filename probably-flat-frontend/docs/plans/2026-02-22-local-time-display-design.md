# Local Time Display Design

**Date:** 2026-02-22

## Goal

Convert all time displays from raw UTC strings to browser-local time.

## Scope

Two places show time:

1. **"Updated" line** (`home.html`) — currently shows raw UTC string, e.g. `02/22/2026 20:00 UTC`
2. **Chart x-axis** (`wave-height-chart.ts`) — hour labels via `formatHour`, uses `getUTCHours()`

## Approach

**One-shot computed signal (Approach A)** — compute relative time once when data loads, never re-evaluate. Correct for this use case since data only refreshes on page load.

## Changes

### `src/app/home/home.ts`

- Add a private `parseConditionTimestamp(ts: string): Date | null` helper (mirrors logic in `wave-height-chart.ts`)
- Add `updatedAt = computed<string | null>(() => ...)` that:
  - Parses `conditions()?.[0].timestamp` into a `Date`
  - Returns `null` if parse fails or no data
  - Otherwise computes age from `Date.now()` and formats as:
    - `< 1 min` → `"just now"`
    - `1–59 min` → `"X minutes ago"`
    - `1–23 h` → `"X hours ago"`
    - `≥ 24 h` → `"X days ago"`

### `src/app/home/home.html`

- Replace `{{ conditions()![0].timestamp }}` with `{{ updatedAt() }}`
- Remove the `<time [attr.datetime]="...">` wrapper (raw UTC string is no longer available as ISO)

### `src/app/wave-height-chart/wave-height-chart.ts`

- `formatHour`: change `date.getUTCHours()` → `date.getHours()`

## Out of Scope

- Live-updating relative time (interval-based)
- External date libraries
