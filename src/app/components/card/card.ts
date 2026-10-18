import {
  Component,
  computed,
  input
} from '@angular/core';

/**
 * A reusable content card.
 *
 * Renders an optional badge, a heading and a description, followed by any
 * projected content.
 *
 * ```html
 * <app-card badge="Buttons" title="Buttons und States" description="…">
 *   <!-- arbitrary body content -->
 * </app-card>
 * ```
 *
 * The heading level is configurable (defaults to `h2`) so the card can be
 * placed at the correct position in the document outline — important for
 * screen-reader users navigating by headings (WCAG 1.3.1 / 2.4.6).
 */
@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  host: {
    class: 'app-card',
    // `title` is also a global HTML attribute. Strip it from the host so it does
    // not create a tooltip over the whole card / a duplicate SR announcement.
    '[attr.title]': 'null',
  },
})
export class Card {
  /** Optional pill-shaped badge shown above the title. Hidden when empty. */
  public readonly badge = input<string>();

  /** The card heading. */
  public readonly title = input.required<string>();

  /** Optional supporting text shown below the title. Hidden when empty. */
  public readonly description = input<string>();

  /** Heading level used for the title, for a correct document outline. */
  public readonly headingLevel = input<1 | 2 | 3 | 4 | 5 | 6>(
    2,
  );

  /** Resolved heading tag name, e.g. `h2`. */
  protected readonly headingTag =
    computed<`h${1 | 2 | 3 | 4 | 5 | 6}`>(() => `h${this.headingLevel()}` as const);
}
