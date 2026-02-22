import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { BuoyService, BuoyData } from '../services/buoy-service';
import { ConditionCardComponent, ConditionCard } from '../condition-card/condition-card';
import { WaveHeightChartComponent } from '../wave-height-chart/wave-height-chart';

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

function degreesToCompass(deg: string): string {
  const n = parseFloat(deg);
  if (isNaN(n)) return deg;
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(n / 22.5) % 16];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConditionCardComponent, WaveHeightChartComponent],
})
export class Home {
  private buoyService = inject(BuoyService);

  conditions = signal<BuoyData[] | null>(null);
  loading = signal(true);
  error = signal(false);

  cards = computed<ConditionCard[]>(() => {
    const d = this.conditions()?.[0];
    if (!d) return [];
    return [
      { label: 'Wave Height',     value: d.waveHeight,      unit: 'ft',  icon: '🌊', category: 'wave' },
      { label: 'Dom. Period',     value: d.dominantPeriod,  unit: 'sec', icon: '⏱',  category: 'wave' },
      { label: 'Wave Direction',  value: d.waveDirection === 'N/A' ? 'N/A' : degreesToCompass(d.waveDirection), unit: d.waveDirection === 'N/A' ? '' : `${d.waveDirection}°`, icon: '🧭', category: 'wave' },
      { label: 'Water Temp',      value: d.waterTemp,       unit: '°F',  icon: '🌡', category: 'temp' },
      { label: 'Wind Speed',      value: d.windSpeed,       unit: 'kts', icon: '💨', category: 'wind' },
      { label: 'Wind Gust',       value: d.windGust,        unit: 'kts', icon: '⚡', category: 'wind' },
      { label: 'Avg Period',      value: d.avgPeriod,       unit: 'sec', icon: '📊', category: 'wave' },
      { label: 'Wind Direction',  value: d.windDirection === 'N/A' ? 'N/A' : degreesToCompass(d.windDirection), unit: d.windDirection === 'N/A' ? '' : `${d.windDirection}°`, icon: '🧭', category: 'wind' },
      { label: 'Air Temp',        value: d.airTemp,         unit: '°F',  icon: '☁️', category: 'temp' },
    ];
  });

  constructor() {
    this.buoyService.getCurrentConditions().subscribe(data => {
      this.conditions.set(data);
      this.loading.set(false);
      if (!data || data.length === 0) this.error.set(true);
    });
  }
}
