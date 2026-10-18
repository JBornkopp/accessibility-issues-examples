import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { Dropdown, type DropdownOption } from './dropdown';

@Component({
  standalone: true,
  imports: [Dropdown],
  template: `
    <app-dropdown
      navLabel="Sprache auswählen"
      prefix="Sprache:"
      [options]="options"
      [value]="value()"
      (selected)="picked.set($event)"
    />
  `,
})
class Host {
  readonly options: readonly DropdownOption[] = [
    { value: 'de', label: 'Deutsch', lang: 'de' },
    { value: 'en', label: 'English', lang: 'en' },
  ];
  readonly value = signal('de');
  readonly picked = signal<string | undefined>(undefined);
}

describe('Dropdown', () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  const toggle = (): HTMLButtonElement =>
    el.querySelector('.dropdown__toggle') as HTMLButtonElement;
  const list = (): HTMLUListElement => el.querySelector('ul') as HTMLUListElement;
  const options = (): HTMLButtonElement[] =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('.dropdown__option'));
  const text = (node: Element): string => node.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  async function keydown(target: HTMLElement, key: string): Promise<void> {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await fixture.whenStable();
  }

  it('renders a labelled nav with a collapsed toggle showing the current option', () => {
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Sprache auswählen');
    expect(toggle().getAttribute('type')).toBe('button');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().getAttribute('aria-controls')).toBe(list().id);
    expect(text(toggle())).toBe('Sprache: Deutsch');
    expect(list().hidden).toBe(true);
  });

  it('opens on click, focuses the current option and marks it with aria-current', async () => {
    toggle().click();
    await fixture.whenStable();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(list().hidden).toBe(false);
    expect(options().map(text)).toEqual(['✓ Deutsch', 'English']);
    expect(options().map((o) => o.getAttribute('lang'))).toEqual(['de', 'en']);
    expect(options().map((o) => o.getAttribute('aria-current'))).toEqual(['true', null]);
    expect(document.activeElement).toBe(options()[0]);
  });

  it('supports arrow navigation and closes on Escape returning focus to the toggle', async () => {
    await keydown(toggle(), 'ArrowDown');
    expect(document.activeElement).toBe(options()[0]);
    await keydown(options()[0], 'ArrowDown');
    expect(document.activeElement).toBe(options()[1]);
    await keydown(options()[1], 'ArrowDown');
    expect(document.activeElement).toBe(options()[0]);
    await keydown(options()[0], 'End');
    expect(document.activeElement).toBe(options()[1]);
    await keydown(options()[1], 'Escape');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle());
  });

  it('emits only on explicit activation of a different option', async () => {
    toggle().click();
    await fixture.whenStable();
    await keydown(options()[0], 'ArrowDown');
    expect(fixture.componentInstance.picked()).toBeUndefined();
    options()[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.picked()).toBe('en');
    expect(document.activeElement).toBe(toggle());
  });

  it('closes when clicking outside', async () => {
    toggle().click();
    await fixture.whenStable();
    document.body.click();
    await fixture.whenStable();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });
});
