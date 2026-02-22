# Local Time Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert all time displays from raw UTC strings to browser-local time — relative "X minutes ago" for the "Updated" line, local-hour labels on the chart x-axis.

**Architecture:** Extract a pure `formatRelativeTime(date: Date, now: number): string` function in `home.ts` so it can be unit-tested in isolation. Add an `updatedAt` computed signal that calls it. Change one line in `wave-height-chart.ts` for local-hour labels.

**Tech Stack:** Angular 20+, Vitest (via `@angular/build:unit-test`), no new dependencies.

---

### Task 1: Fix chart x-axis to use local hours

**Files:**
- Modify: `src/app/wave-height-chart/wave-height-chart.ts`

**Step 1: Make the one-line change**

In `formatHour`, change `date.getUTCHours()` to `date.getHours()`:

```typescript
function formatHour(date: Date): string {
  const h = date.getHours();
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
}
```

**Step 2: Build to verify no errors**

```bash
npm run build
```
Expected: `Application bundle generation complete.`

**Step 3: Commit**

```bash
git add src/app/wave-height-chart/wave-height-chart.ts
git commit -m "fix: use local hours for chart x-axis labels"
```

---

### Task 2: Add `formatRelativeTime` and unit tests

**Files:**
- Modify: `src/app/home/home.ts` — add the exported function
- Modify: `src/app/home/home.spec.ts` — add unit tests for it

**Step 1: Write the failing tests first**

Replace the contents of `src/app/home/home.spec.ts` with:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home, formatRelativeTime } from './home';

describe('formatRelativeTime', () => {
  const now = Date.now();

  it('returns "just now" for < 60 seconds', () => {
    const date = new Date(now - 30_000);
    expect(formatRelativeTime(date, now)).toBe('just now');
  });

  it('returns "1 minute ago" for exactly 1 minute', () => {
    const date = new Date(now - 60_000);
    expect(formatRelativeTime(date, now)).toBe('1 minute ago');
  });

  it('returns "X minutes ago" for 2–59 minutes', () => {
    const date = new Date(now - 5 * 60_000);
    expect(formatRelativeTime(date, now)).toBe('5 minutes ago');
  });

  it('returns "1 hour ago" for exactly 1 hour', () => {
    const date = new Date(now - 3_600_000);
    expect(formatRelativeTime(date, now)).toBe('1 hour ago');
  });

  it('returns "X hours ago" for 2–23 hours', () => {
    const date = new Date(now - 3 * 3_600_000);
    expect(formatRelativeTime(date, now)).toBe('3 hours ago');
  });

  it('returns "1 day ago" for exactly 24 hours', () => {
    const date = new Date(now - 24 * 3_600_000);
    expect(formatRelativeTime(date, now)).toBe('1 day ago');
  });

  it('returns "X days ago" for > 24 hours', () => {
    const date = new Date(now - 3 * 24 * 3_600_000);
    expect(formatRelativeTime(date, now)).toBe('3 days ago');
  });
});

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

**Step 2: Run tests — verify they fail**

```bash
npm test -- --watch=false
```
Expected: `formatRelativeTime` tests fail with `formatRelativeTime is not exported`.

**Step 3: Add `formatRelativeTime` to `home.ts`**

Add this exported function near the top of `src/app/home/home.ts`, after the imports:

```typescript
export function formatRelativeTime(date: Date, now: number): string {
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`;
  return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
}
```

**Step 4: Run tests — verify they pass**

```bash
npm test -- --watch=false
```
Expected: all `formatRelativeTime` tests pass. The pre-existing 2 Home/app failures remain (RouterLink provider issue, unrelated).

**Step 5: Commit**

```bash
git add src/app/home/home.ts src/app/home/home.spec.ts
git commit -m "feat: add formatRelativeTime utility with unit tests"
```

---

### Task 3: Wire `updatedAt` computed into the template

**Files:**
- Modify: `src/app/home/home.ts` — add `updatedAt` computed
- Modify: `src/app/home/home.html` — use `updatedAt()`

**Step 1: Add a timestamp parser and `updatedAt` computed to `home.ts`**

Add this private helper function in `home.ts` (below `formatRelativeTime`, above `@Component`):

```typescript
function parseConditionTimestamp(ts: string): Date | null {
  const match = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{2}):(\d{2}) UTC$/);
  if (!match) return null;
  const [, mm, dd, yyyy, hh, min] = match;
  return new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${hh}:${min}:00Z`);
}
```

Then add this computed signal inside the `Home` class, after `error`:

```typescript
updatedAt = computed<string | null>(() => {
  const ts = this.conditions()?.[0]?.timestamp;
  if (!ts) return null;
  const date = parseConditionTimestamp(ts);
  if (!date) return null;
  return formatRelativeTime(date, Date.now());
});
```

**Step 2: Update `home.html`**

Replace lines 7–13:

```html
@if (!loading() && conditions()?.[0]) {
  <span aria-hidden="true">·</span>
  <span class="text-slate-300">
    Updated
    <time [attr.datetime]="conditions()![0].timestamp">{{ conditions()![0].timestamp }}</time>
  </span>
}
```

With:

```html
@if (!loading() && updatedAt()) {
  <span aria-hidden="true">·</span>
  <span class="text-slate-300">Updated {{ updatedAt() }}</span>
}
```

**Step 3: Build to verify no errors**

```bash
npm run build
```
Expected: `Application bundle generation complete.`

**Step 4: Commit**

```bash
git add src/app/home/home.ts src/app/home/home.html
git commit -m "feat: show relative 'updated X minutes ago' timestamp"
```

---

## Verification

1. `npm run build` — zero errors
2. `npm test -- --watch=false` — all `formatRelativeTime` tests pass, same pre-existing failures as before
3. `npm start` → open `http://localhost:4200`:
   - "Updated 3 minutes ago" appears below the page title
   - Chart x-axis shows local hours (e.g. `3p` not `8p` if you're UTC-5)
