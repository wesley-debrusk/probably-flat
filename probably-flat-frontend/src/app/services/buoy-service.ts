import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface BuoyData {
  timestamp: string;
  waveHeight: string;      // ft
  dominantPeriod: string;  // sec
  avgPeriod: string;       // sec
  waveDirection: string;   // degrees
  waterTemp: string;       // °F
  airTemp: string;         // °F
  windSpeed: string;       // knots
  windDirection: string;   // degrees
  windGust: string;        // knots
}

@Injectable({ providedIn: 'root' })
export class BuoyService {

  private workerUrl: string = 'https://probably-flat.wesley-debrusk.workers.dev';

  constructor(
    private http: HttpClient
  ) { }

  public getCurrentConditions(station: string = '44098', file: string = 'txt') {
    const url = `${this.workerUrl}?station=${station}&file=${file}`;
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(raw => this.parseAll(raw)),
      catchError(err => {
        console.error('Failed to fetch buoy data:', err);
        return of(null);
      })
    );
  }

  private parseAll(raw: string): BuoyData[] {
    const lines = raw.trim().split('\n').filter(l => l.trim());
    if (lines.length < 3) return [];

    const headers = lines[0].replace(/#/g, '').trim().split(/\s+/);
    const dataLines = lines.filter(l => !l.startsWith('#'));

    return dataLines
      .map(line => this.parseRow(headers, line.trim().split(/\s+/)))
      .filter((d): d is BuoyData => d !== null);
  }

  private parseRow(headers: string[], values: string[]): BuoyData | null {
    if (values.length < headers.length) return null;

    const get = (col: string) => {
      const i = headers.indexOf(col);
      return i >= 0 ? values[i] : 'MM';
    };

    const fmt = (val: string) => val === 'MM' ? 'N/A' : val;

    const year = get('YY');
    const month = get('MM');
    const day = get('DD');
    const hour = get('hh');
    const min = get('mm');
    const timestamp = `${month}/${day}/20${year} ${hour}:${min} UTC`;

    return {
      timestamp,
      waveHeight: fmt(get('WVHT')),
      dominantPeriod: fmt(get('DPD')),
      avgPeriod: fmt(get('APD')),
      waveDirection: fmt(get('MWD')),
      waterTemp: fmt(get('WTMP')),
      airTemp: fmt(get('ATMP')),
      windSpeed: fmt(get('WSPD')),
      windDirection: fmt(get('WDIR')),
      windGust: fmt(get('GST')),
    };
  }
}