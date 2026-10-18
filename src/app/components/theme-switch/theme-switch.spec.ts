import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeSwitch } from './theme-switch';

describe('ThemeSwitch', () => {
  let fixture: ComponentFixture<ThemeSwitch>;
  let el: HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('app-theme');
    document.documentElement.removeAttribute('data-theme');
    await TestBed.configureTestingModule({ imports: [ThemeSwitch] }).compileComponents();
    fixture = TestBed.createComponent(ThemeSwitch);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => localStorage.removeItem('app-theme'));

  const toggle = (): HTMLButtonElement =>
    el.querySelector('.dropdown__toggle') as HTMLButtonElement;
  const options = (): HTMLButtonElement[] =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('.dropdown__option'));
  const text = (node: Element): string => node.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  it('defaults to the system preference and applies a data-theme', () => {
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Farbschema auswählen');
    expect(text(toggle())).toBe('Farbschema: System');
    expect(['light', 'dark']).toContain(document.documentElement.getAttribute('data-theme'));
  });

  it('switches to dark immediately, persists it and keeps focus on the toggle', async () => {
    toggle().click();
    await fixture.whenStable();
    expect(options().map(text)).toEqual(['Hell', 'Dunkel', '✓ System']);
    options()[1].click();
    await fixture.whenStable();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('app-theme')).toBe('dark');
    expect(text(toggle())).toBe('Farbschema: Dunkel');
    expect(document.activeElement).toBe(toggle());
  });
});
