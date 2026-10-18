import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  input,
  model,
  signal,
  untracked
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  Tab as TabPattern,
  TabContent,
  TabList,
  TabPanel,
  Tabs as TabsRoot,
} from '@angular/aria/tabs';

import { Tab } from './tab';

/** View-model for a single resolved tab. */
interface ResolvedTab {
  readonly value: string;
  readonly label: string;
  readonly disabled: boolean;
  readonly tab: Tab;
}

/**
 * An accessible, reusable tab group built on the `@angular/aria` tab primitives
 * (`ngTabs` / `ngTabList` / `ngTab` / `ngTabPanel`). It provides full keyboard
 * support, roving `tabindex`, correct `role`/`aria-*` wiring and lazy panel
 * rendering out of the box.
 *
 * Tabs are projected as `<ng-template appTab label="…">` children:
 *
 * ```html
 * <app-tabs [(selectedIndex)]="index" (selectedIndexChange)="…">
 *   <ng-template appTab label="Komponente">…</ng-template>
 *   <ng-template appTab label="Code">…</ng-template>
 * </app-tabs>
 * ```
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [TabsRoot, TabList, TabPattern, TabPanel, TabContent, NgTemplateOutlet],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
  host: {
    class: 'app-tabs',
  },
})
export class Tabs {
  /** Two-way bindable index of the currently selected tab. */
  public readonly selectedIndex = model<number>(0);

  /**
   * Orientation of the tab strip.
   * - `horizontal` (default): tabs sit above the panel, arrow left/right navigate.
   * - `vertical`: tabs sit beside the panel, arrow up/down navigate.
   */
  public readonly orientation = input<
    'horizontal' | 'vertical'
  >('horizontal');

  /** The projected tabs. */
  private readonly tabDirectives = contentChildren(Tab);

  /** Resolved tab view-models with stable, unique values. */
  protected readonly tabs = computed<ResolvedTab[]>(() => {
    const seen: Map<string, number> = new Map<string, number>();
    return this.tabDirectives().map((tab: Tab, index: number): ResolvedTab => {
      const base: string = tab.value() || tab.label() || `tab-${index}`;
      const count: number = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const value: string = count === 0 ? base : `${base}-${count}`;
      return {
        value,
        label: tab.label(),
        disabled: tab.disabled(),
        tab,
      };
    });
  });

  /** The value currently selected in the underlying aria TabList (internal state). */
  protected readonly selectedValue = signal<string | undefined>(
    undefined,
  );

  constructor() {
    // Public `selectedIndex` (or the tab set) changes → update the internal value.
    effect(() => {
      const tabs: ResolvedTab[] = this.tabs();
      const requestedIndex: number = this.selectedIndex();
      if (!tabs.length) {
        return;
      }
      const index: number = Math.min(Math.max(requestedIndex, 0), tabs.length - 1);
      const expected: string | undefined = tabs[index]?.value;
      if (expected && untracked(this.selectedValue) !== expected) {
        this.selectedValue.set(expected);
      }
    });

    // Internal value changes (user clicks / keyboard) → update `selectedIndex`.
    effect(() => {
      const value: string | undefined = this.selectedValue();
      const tabs: ResolvedTab[] = untracked(this.tabs);
      const index: number = tabs.findIndex((tab: ResolvedTab) => tab.value === value);
      if (index !== -1 && index !== untracked(this.selectedIndex)) {
        this.selectedIndex.set(index);
      }
    });
  }
}
