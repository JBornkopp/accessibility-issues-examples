import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Declares a single tab inside an {@link Tabs} component.
 *
 * Apply it to an `<ng-template>`; the template content becomes the tab panel
 * and is lazily rendered only while the tab is selected.
 *
 * ```html
 * <app-tabs>
 *   <ng-template appTab label="Komponente">
 *     <button>Hallo</button>
 *   </ng-template>
 * </app-tabs>
 * ```
 */
@Directive({
  selector: 'ng-template[appTab]',
  standalone: true,
})
export class Tab {
  /** The visible label shown in the tab strip. */
  readonly label = input.required<string>({ alias: 'appTab' });

  /** Whether this tab is disabled (not selectable, but still announced). */
  readonly disabled = input<boolean>(false);

  /** A stable value identifying this tab; defaults to the label. */
  readonly value = input<string>();

  /** The template rendered inside the tab panel. */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
