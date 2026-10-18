import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal
} from '@angular/core';

/**
 * Displays a block of source code.
 *
 * The code is passed as a plain string via the `code` input and rendered with
 * Angular interpolation, so it is HTML-escaped automatically — consumers never
 * have to hand-escape `&lt;` / `&gt;` etc.
 *
 * ```html
 * <app-code [code]="'<button disabled>Hi</button>'" language="html" />
 * ```
 *
 * Leading indentation that is common to every line is stripped so code can be
 * written inline in a template without the surrounding whitespace leaking into
 * the output.
 *
 * An optional copy-to-clipboard button is shown by default. It exposes the copy
 * result via the `copied` output for consumers that want to react to it.
 */
@Component({
  selector: 'app-code',
  standalone: true,
  templateUrl: './code.html',
  styleUrl: './code.scss',
  host: {
    class: 'app-code',
  },
})
export class Code {
  /** The raw source code to display. */
  public readonly code = input.required<string>();

  /**
   * The language of the snippet. Used for the `aria-label` of the code region
   * and exposed as a `data-language` attribute for optional styling/highlighting.
   */
  public readonly language = input<string>();

  /** Whether to render the copy-to-clipboard button. */
  public readonly copyable = input<boolean, unknown>(
    true,
    { transform: booleanAttribute },
  );

  /** Accessible label for the code region. */
  public readonly ariaLabel = input<string>('Code-Beispiel', {
    alias: 'label',
  });

  /** Emits `true` on a successful copy, `false` when copying failed. */
  public readonly copied = output<boolean>();

  /** The normalized code (common indentation removed, trailing blank lines trimmed). */
  protected readonly formattedCode = computed(() => dedent(this.code()));

  /** Transient "Copied!" confirmation state for the button. */
  protected readonly justCopied = signal(false);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.formattedCode());
      this.justCopied.set(true);
      this.copied.emit(true);
      setTimeout(() => this.justCopied.set(false), 2000);
    } catch {
      this.copied.emit(false);
    }
  }
}

/** Removes leading indentation shared by all lines and trims blank edge lines. */
function dedent(value: string): string {
  const lines = value.replace(/\t/g, '  ').split('\n');

  // Drop leading / trailing blank lines.
  while (lines.length && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  const indent = lines
    .filter((line) => line.trim() !== '')
    .reduce((min, line) => {
      const leading = line.match(/^ */)?.[0].length ?? 0;
      return Math.min(min, leading);
    }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(indent) || indent === 0) {
    return lines.join('\n');
  }

  return lines.map((line) => line.slice(indent)).join('\n');
}
