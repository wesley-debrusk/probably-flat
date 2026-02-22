import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { BuoyData } from '../services/buoy-service';
import * as d3 from 'd3';

const VIEW_W = 800;
const VIEW_H = 220;
const MARGIN = { top: 16, right: 16, bottom: 40, left: 44 };
const INNER_W = VIEW_W - MARGIN.left - MARGIN.right;
const INNER_H = VIEW_H - MARGIN.top - MARGIN.bottom;

interface ChartPoint { date: Date; waveHeight: number; }
interface AxisTick { offset: number; label: string; }

function parseTimestamp(ts: string): Date | null {
  const match = ts.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) UTC$/);
  if (!match) return null;
  const [, mm, dd, yyyy, hh, min] = match;
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00Z`);
}

function formatHour(date: Date): string {
  const h = date.getHours();
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

@Component({
  selector: 'app-wave-height-chart',
  templateUrl: './wave-height-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmCardImports],
})
export class WaveHeightChartComponent {
  data = input.required<BuoyData[]>();

  protected readonly chartPoints = computed<ChartPoint[]>(() => {
    const parsed: ChartPoint[] = [];
    for (const row of this.data()) {
      if (row.waveHeight === 'N/A') continue;
      const date = parseTimestamp(row.timestamp);
      if (!date) continue;
      const height = parseFloat(row.waveHeight);
      if (isNaN(height)) continue;
      parsed.push({ date, waveHeight: height });
    }
    if (!parsed.length) return [];
    parsed.sort((a, b) => a.date.getTime() - b.date.getTime());
    const latest = parsed[parsed.length - 1].date.getTime();
    const cutoff = latest - 24 * 60 * 60 * 1000;
    return parsed.filter(p => p.date.getTime() >= cutoff);
  });

  protected readonly xScale = computed(() => {
    const pts = this.chartPoints();
    if (pts.length < 2) return null;
    const [min, max] = d3.extent(pts, p => p.date) as [Date, Date];
    return d3.scaleTime().domain([min, max]).range([0, INNER_W]);
  });

  protected readonly yScale = computed(() => {
    const pts = this.chartPoints();
    if (pts.length < 2) return null;
    const maxH = d3.max(pts, p => p.waveHeight) ?? 0;
    return d3.scaleLinear().domain([0, maxH * 1.2]).range([INNER_H, 0]).nice();
  });

  protected readonly linePath = computed<string | null>(() => {
    const pts = this.chartPoints();
    const xSc = this.xScale();
    const ySc = this.yScale();
    if (!pts.length || !xSc || !ySc) return null;
    return d3.line<ChartPoint>().x(p => xSc(p.date)).y(p => ySc(p.waveHeight)).curve(d3.curveMonotoneX)(pts);
  });

  protected readonly areaPath = computed<string | null>(() => {
    const pts = this.chartPoints();
    const xSc = this.xScale();
    const ySc = this.yScale();
    if (!pts.length || !xSc || !ySc) return null;
    return d3.area<ChartPoint>().x(p => xSc(p.date)).y0(INNER_H).y1(p => ySc(p.waveHeight)).curve(d3.curveMonotoneX)(pts);
  });

  protected readonly xTicks = computed<AxisTick[]>(() => {
    const xSc = this.xScale();
    if (!xSc) return [];
    return xSc.ticks(6).map(t => ({ offset: xSc(t), label: formatHour(t) }));
  });

  protected readonly yTicks = computed<AxisTick[]>(() => {
    const ySc = this.yScale();
    if (!ySc) return [];
    return ySc.ticks(4).map(t => ({ offset: ySc(t), label: `${t}` }));
  });

  protected readonly hasData = computed(() => this.chartPoints().length >= 2);

  protected readonly layout = { viewW: VIEW_W, viewH: VIEW_H, margin: MARGIN, innerW: INNER_W, innerH: INNER_H };
}
