import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

  protected readonly categoryBorderClass = computed(() => {
    const cat = this.card().category;
    if (cat === 'wave') return 'border-l-teal-500';
    if (cat === 'wind') return 'border-l-orange-500';
    return 'border-l-indigo-500';
  });

  protected readonly showUnit = computed(
    () => this.card().value !== 'N/A' && !!this.card().unit,
  );
}
