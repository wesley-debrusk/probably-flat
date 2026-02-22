import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
    class: 'bg-slate-900 rounded-xl border border-slate-700/60 p-4 flex flex-col gap-3 relative overflow-hidden hover:border-slate-600/80 transition-colors duration-200',
    style: 'border-left-width: 2px;',
    role: 'listitem',
    '[class.border-l-teal-500]': 'card().category === "wave"',
    '[class.border-l-orange-500]': 'card().category === "wind"',
    '[class.border-l-indigo-500]': 'card().category === "temp"',
  },
  templateUrl: './condition-card.html',
})
export class ConditionCardComponent {
  card = input.required<ConditionCard>();
}
