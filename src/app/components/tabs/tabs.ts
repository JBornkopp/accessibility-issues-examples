import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  model,
  untracked,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-tabs',
  },
})
export class Tabs {
  /** Two-way bindable index of the currently selected tab. */
  readonly selectedIndex = model<number>(0);

  /**
   * Orientation of the tab strip.
   * - `horizontal` (default): tabs sit above the panel, arrow left/right navigate.
   * - `vertical`: tabs sit beside the panel, arrow up/down navigate.
   */
  readonly orientation = model<'horizontal' | 'vertical'>('horizontal');

  /** The projected tabs. */
  private readonly tabDirectives = contentChildren(Tab);

  /** Resolved tab view-models with stable, unique values. */
  protected readonly tabs = computed<ResolvedTab[]>(() => {
    const seen = new Map<string, number>();
    return this.tabDirectives().map((tab, index) => {
      const base = tab.value() ?? tab.label() ?? `tab-${index}`;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const value = count === 0 ? base : `${base}-${count}`;
      return {
        value,
        label: tab.label(),
        disabled: tab.disabled(),
        tab,
      };
    });
  });

  /** The value currently selected in the underlying aria TabList. */
  protected readonly selectedValue = model<string | undefined>(undefined);

  constructor() {
    // Public `selectedIndex` (or the tab set) changes → update the internal value.
    effect(() => {
      const tabs = this.tabs();
      const requestedIndex = this.selectedIndex();
      if (!tabs.length) {
        return;
      }
      const index = Math.min(Math.max(requestedIndex, 0), tabs.length - 1);
      const expected = tabs[index]?.value;
      if (expected && untracked(this.selectedValue) !== expected) {
        this.selectedValue.set(expected);
      }
    });

    // Internal value changes (user clicks / keyboard) → update `selectedIndex`.
    effect(() => {
      const value = this.selectedValue();
      const tabs = untracked(this.tabs);
      const index = tabs.findIndex((tab) => tab.value === value);
      if (index !== -1 && index !== untracked(this.selectedIndex)) {
        this.selectedIndex.set(index);
      }
    });
  }
}
