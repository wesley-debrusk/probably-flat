# Condition Card Spartan Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the custom hand-rolled card styles in `ConditionCardComponent` with Spartan NG's `hlm-card` component family.

**Architecture:** The host element of `ConditionCardComponent` becomes a transparent pass-through (only ARIA attributes remain). A `<div hlmCard size="sm">` wrapper inside the template takes over as the visible card, with label/icon inside `hlmCardHeader`/`hlmCardTitle` and value/unit inside `hlmCardContent`. Category-specific left border color is preserved via class bindings on the card wrapper.

**Tech Stack:** Angular 20+, Spartan NG (`@spartan-ng/helm/card` via tsconfig path alias at `libs/ui/card/src/index.ts`), Tailwind CSS v4.

---

### Task 1: Update `condition-card.ts`

**Files:**
- Modify: `src/app/condition-card/condition-card.ts`

**Context:**
The `host` object currently holds all card visual styles (background, border, padding, flex layout, hover, transition, category border-left bindings, and an inline `style`). These move to the template. Keep only the semantic host attributes.

The component currently has no `imports` array — you need to add one with `HlmCardImports`.

**Step 1: Replace the file content**

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

export type CardCategory = 'wave' | 'wind' | 'temp';

export interface ConditionCard {
  label: string;
  value: string;
  unit: string;
  icon: string;
  category: CardCategory;
}

@Component({
  selector: 'app-condition-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-label]': 'card().label + ": " + card().value + " " + card().unit',
    role: 'listitem',
  },
  imports: [HlmCardImports],
  templateUrl: './condition-card.html',
})
export class ConditionCardComponent {
  card = input.required<ConditionCard>();
}
```

**Step 2: Verify TypeScript compiles**

Run from `probably-flat-frontend/`:
```bash
npx ng build --configuration development 2>&1 | head -30
```
Expected: No errors (warnings about unused imports are fine, build output is not required to be error-free at this step since the template hasn't been updated yet — type errors relating to `hlmCard` directives not being found in the template will resolve in Task 2).

> Note: If you see `Cannot find module '@spartan-ng/helm/card'` errors, check that `tsconfig.json` has the path mapping `"@spartan-ng/helm/card": ["./libs/ui/card/src/index.ts"]` — it should already be there.

---

### Task 2: Update `condition-card.html`

**Files:**
- Modify: `src/app/condition-card/condition-card.html`

**Context:**
The template currently has two `<p>` elements as direct children:
1. The label/icon paragraph
2. The value/unit paragraph

These need to be wrapped in a `<div hlmCard>` card shell, with the label/icon going into a `hlmCardHeader` → `hlmCardTitle` section, and the value/unit going into a `hlmCardContent` section.

The category-specific left border (previously on the host) moves to the `hlmCard` wrapper as class bindings.

**Step 1: Replace the file content**

```html
<div hlmCard size="sm"
  style="border-left-width: 2px"
  [class.border-l-teal-500]="card().category === 'wave'"
  [class.border-l-orange-500]="card().category === 'wind'"
  [class.border-l-indigo-500]="card().category === 'temp'">
  <div hlmCardHeader>
    <p hlmCardTitle class="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
      <span aria-hidden="true">{{ card().icon }}</span>
      {{ card().label }}
    </p>
  </div>
  <div hlmCardContent>
    <p class="flex items-baseline gap-1.5">
      <span class="text-3xl font-bold tabular-nums">{{ card().value }}</span>
      @if (card().value !== 'N/A' && card().unit) {
        <span class="text-sm text-muted-foreground">{{ card().unit }}</span>
      }
    </p>
  </div>
</div>
```

**Step 2: Build to verify no template errors**

```bash
npx ng build --configuration development 2>&1 | head -40
```
Expected: Clean build, no template compilation errors.

**Step 3: Commit the condition-card changes**

```bash
git add src/app/condition-card/condition-card.ts src/app/condition-card/condition-card.html
git commit -m "refactor: use spartan hlm-card in ConditionCardComponent"
```

---

### Task 3: Clean up `home.ts` and `home.html`

**Files:**
- Modify: `src/app/home/home.ts`
- Modify: `src/app/home/home.html`

**Context:**
`home.ts` imports `HlmCardImports` for a temporary test card block in `home.html` (lines 52–63). Now that `ConditionCardComponent` handles the card internally, this import and block are no longer needed in the home component.

**Step 1: Remove `HlmCardImports` from `home.ts`**

In `src/app/home/home.ts`, remove the import line:
```typescript
import { HlmCardImports } from '@spartan-ng/helm/card';
```

And remove `HlmCardImports` from the `imports` array in `@Component`:
```typescript
// Before
imports: [ConditionCardComponent, HlmCardImports],

// After
imports: [ConditionCardComponent],
```

**Step 2: Remove the test card block from `home.html`**

Remove the entire `<hlm-card>` block (currently between the conditions grid and the footer):

```html
  <hlm-card size="sm" class="mx-auto w-full max-w-sm">
		<hlm-card-header>
			<h3 hlmCardTitle>Small Card</h3>
			<p hlmCardDescription>This card uses the small size variant.</p>
		</hlm-card-header>
		<div hlmCardContent>
			<p>The card component supports a size prop that can be set to "sm" for a more compact appearance.</p>
		</div>
		<hlm-card-footer>
			<button hlmBtn variant="outline" size="sm" class="w-full">Action</button>
		</hlm-card-footer>
	</hlm-card>
```

**Step 3: Build to verify clean compile**

```bash
npx ng build --configuration development 2>&1 | head -40
```
Expected: Clean build, no errors about unused imports or missing directives.

**Step 4: Commit**

```bash
git add src/app/home/home.ts src/app/home/home.html
git commit -m "chore: remove test hlm-card block and unused import from home"
```

---

### Task 4: Visual verification

**Step 1: Run the dev server**

```bash
npx ng serve
```

Open `http://localhost:4200` in a browser.

**Step 2: Check the condition cards**

Verify:
- [ ] Cards render with the Spartan card styling (rounded corners, shadow, ring border)
- [ ] Wave cards have a teal left border
- [ ] Wind cards have an orange left border
- [ ] Temp cards have an indigo left border
- [ ] Each card shows the icon + label at the top
- [ ] Each card shows the large value and (if applicable) small unit below
- [ ] The test "Small Card" block is gone from the page
- [ ] Loading skeleton still appears before data loads

**Step 3: Stop the server** (`Ctrl+C`)
