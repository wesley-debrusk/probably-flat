import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Home, formatRelativeTime } from './home';
import { BuoyService } from '../services/buoy-service';

const NOW = 1_700_000_000_000;

describe('formatRelativeTime', () => {
  it('returns "just now" for < 60 seconds', () => {
    expect(formatRelativeTime(new Date(NOW - 30_000), NOW)).toBe('just now');
  });

  it('returns "just now" for 59 seconds', () => {
    expect(formatRelativeTime(new Date(NOW - 59_000), NOW)).toBe('just now');
  });

  it('returns "1 minute ago" for exactly 1 minute', () => {
    expect(formatRelativeTime(new Date(NOW - 60_000), NOW)).toBe('1 minute ago');
  });

  it('returns "X minutes ago" for 2–59 minutes', () => {
    expect(formatRelativeTime(new Date(NOW - 5 * 60_000), NOW)).toBe('5 minutes ago');
  });

  it('returns "59 minutes ago" for 59 min 59 sec', () => {
    expect(formatRelativeTime(new Date(NOW - (59 * 60_000 + 59_000)), NOW)).toBe('59 minutes ago');
  });

  it('returns "1 hour ago" for exactly 1 hour', () => {
    expect(formatRelativeTime(new Date(NOW - 3_600_000), NOW)).toBe('1 hour ago');
  });

  it('returns "X hours ago" for 2–23 hours', () => {
    expect(formatRelativeTime(new Date(NOW - 3 * 3_600_000), NOW)).toBe('3 hours ago');
  });

  it('returns "1 day ago" for exactly 24 hours', () => {
    expect(formatRelativeTime(new Date(NOW - 24 * 3_600_000), NOW)).toBe('1 day ago');
  });

  it('returns "X days ago" for > 24 hours', () => {
    expect(formatRelativeTime(new Date(NOW - 3 * 24 * 3_600_000), NOW)).toBe('3 days ago');
  });
});

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: BuoyService, useValue: { getCurrentConditions: () => of([]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
