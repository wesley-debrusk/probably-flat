import { ChangeDetectionStrategy, Component } from '@angular/core';

interface GlossaryEntry {
  icon: string;
  iconClass: string;
  short: string;
  term: string;
  definition: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  glossary: GlossaryEntry[] = [
    {
      icon: '🌊', iconClass: 'text-teal-400', short: 'Wave Ht.',
      term: 'Wave Height (ft)',
      definition: 'Significant wave height — the average of the highest one-third of waves measured by the buoy. Useful for estimating what you\'ll actually paddle out into.',
    },
    {
      icon: '⏱', iconClass: 'text-teal-400', short: 'Dom. Per.',
      term: 'Dominant Period (sec)',
      definition: 'The period of the most energetic waves. Longer periods (12s+) indicate groundswell and cleaner, more powerful waves. Short periods (under 8s) mean choppy wind swell.',
    },
    {
      icon: '📊', iconClass: 'text-teal-400', short: 'Avg. Per.',
      term: 'Avg Period (sec)',
      definition: 'Average period across all wave energy. A secondary indicator of overall sea state.',
    },
    {
      icon: '🧭', iconClass: 'text-teal-400', short: 'Wave Dir.',
      term: 'Wave Direction (°)',
      definition: 'The compass direction waves are coming FROM. 180° means waves arriving from the south.',
    },
    {
      icon: '🌡', iconClass: 'text-indigo-400', short: 'Water °F',
      term: 'Water Temp (°F)',
      definition: 'Surface water temperature at the buoy. Useful for wetsuit selection.',
    },
    {
      icon: '☁️', iconClass: 'text-indigo-400', short: 'Air °F',
      term: 'Air Temp (°F)',
      definition: 'Air temperature at the buoy. Note: offshore temps can differ from shore.',
    },
    {
      icon: '💨', iconClass: 'text-orange-400', short: 'Wind',
      term: 'Wind Speed (kts)',
      definition: 'Average sustained wind speed at the buoy. Onshore wind (toward shore) roughens surf; offshore wind (away from shore) grooms it.',
    },
    {
      icon: '⚡', iconClass: 'text-orange-400', short: 'Gust',
      term: 'Wind Gust (kts)',
      definition: 'Peak wind speed recorded during the observation period.',
    },
    {
      icon: '🧭', iconClass: 'text-orange-400', short: 'Wind Dir.',
      term: 'Wind Direction (°)',
      definition: 'The compass direction the wind is coming FROM.',
    },
  ];
}
