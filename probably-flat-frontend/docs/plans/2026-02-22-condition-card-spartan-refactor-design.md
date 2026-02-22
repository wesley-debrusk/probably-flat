# Design: Refactor ConditionCard to Use Spartan `hlm-card`

**Date:** 2026-02-22
**Status:** Approved

## Summary

Refactor `ConditionCardComponent` to replace its custom hand-rolled card styles with Spartan NG's `hlm-card` component family. The host element becomes a transparent wrapper; all card structure and theming moves into the template using Spartan directives.

## Files Changed

| File | Change |
|------|--------|
| `src/app/condition-card/condition-card.ts` | Remove host card styles; add `HlmCardImports` |
| `src/app/condition-card/condition-card.html` | Wrap in `hlmCard`; map sections to Spartan sub-components |
| `src/app/home/home.ts` | Remove `HlmCardImports` (moves into condition-card) |
| `src/app/home/home.html` | Remove test `hlm-card` block (lines 52–63) |

## Component Structure

### Host (`condition-card.ts`)

Remove all card-related `host` bindings:
- `class` (bg, border, padding, flex, hover, transition)
- `style` (border-left-width)
- `[class.border-l-*]` category bindings

Keep only:
- `role="listitem"`
- `[attr.aria-label]`

Add `HlmCardImports` to `imports`.

### Template (`condition-card.html`)

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

## Design Decisions

- **Color strategy:** Use Spartan CSS variables (`bg-card`, `text-card-foreground`, `text-muted-foreground`) instead of hardcoded slate-* colors, for consistency with the design system.
- **Card size:** `size="sm"` for compact data tiles.
- **Category border:** Preserved via custom `[class.border-l-*]` bindings on the `hlmCard` wrapper, with inline `style="border-left-width: 2px"`.
- **Approach A chosen:** Template wraps content in `<div hlmCard>`, host becomes a transparent pass-through. Rejected host-level Spartan binding (fragile) and partial adoption (incomplete).
