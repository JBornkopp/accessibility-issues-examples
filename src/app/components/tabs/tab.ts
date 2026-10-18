import {
  Directive,
  InputSignalWithTransform,
  InputSignal,
  TemplateRef,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

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
  public readonly label: InputSignal<string> = input.required<string>();

  /** Whether this tab is disabled (not selectable, but still announced). */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /** A stable value identifying this tab; defaults to the label. */
  public readonly value: InputSignal<string | undefined> = input<string>();

  /** The template rendered inside the tab panel. */
  public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
