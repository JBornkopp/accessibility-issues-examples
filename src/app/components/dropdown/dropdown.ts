import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
  type InputSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';

/** A single selectable entry of a {@link Dropdown}. */
export interface DropdownOption<T extends string = string> {
  readonly value: T;
  /** Visible label; also the accessible name (WCAG 2.5.3). */
  readonly label: string;
  /** Optional language of the label (WCAG 3.1.2). */
  readonly lang?: string;
}

let nextId = 0;

/**
 * Accessible dropdown built on the disclosure pattern.
 *
 * - A real `<button>` toggles the list and exposes its state via
 *   `aria-expanded` / `aria-controls` (WCAG 4.1.2).
 * - Options are real buttons; the current one is marked with `aria-current`
 *   and a check mark, not colour alone (WCAG 1.4.1).
 * - Selection only happens on explicit activation of an option — not on focus
 *   or arrow navigation — so there is no unexpected change of context
 *   (WCAG 3.2.2).
 * - Keyboard: Enter/Space/ArrowDown open the list and focus the current
 *   option; ArrowUp/ArrowDown/Home/End move between options; Escape closes and
 *   returns focus to the toggle; Tab out or click outside closes it.
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Dropdown<T extends string = string> {
  /** Accessible name of the surrounding `<nav>` landmark. */
  public readonly navLabel: InputSignal<string> = input.required<string>();

  /** Visible prefix inside the toggle, e.g. "Sprache:". */
  public readonly prefix: InputSignal<string> = input.required<string>();

  public readonly options: InputSignal<readonly DropdownOption<T>[]> =
    input.required<readonly DropdownOption<T>[]>();

  /** Value of the currently active option. */
  public readonly value: InputSignal<T> = input.required<T>();

  /** Emits when the user explicitly activates an option. */
  public readonly selected: OutputEmitterRef<T> = output<T>();

  private readonly injector: Injector = inject(Injector);

  private readonly host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly toggleButton: Signal<ElementRef<HTMLButtonElement>> =
    viewChild.required<ElementRef<HTMLButtonElement>>('toggle');

  private readonly optionButtons: Signal<readonly ElementRef<HTMLButtonElement>[]> =
    viewChildren<ElementRef<HTMLButtonElement>>('option');

  protected readonly current: Signal<DropdownOption<T> | undefined> = computed(() =>
    this.options().find((option: DropdownOption<T>) => option.value === this.value()),
  );

  protected readonly open: WritableSignal<boolean> = signal(false);

  /** Unique id linking the toggle to the list via `aria-controls`. */
  protected readonly listId: string = `app-dropdown-list-${nextId++}`;

  protected toggleOpen(): void {
    if (this.open()) {
      this.close(false);
    } else {
      this.openAndFocus(this.currentIndex());
    }
  }

  protected onToggleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.openAndFocus(event.key === 'ArrowUp' ? this.options().length - 1 : this.currentIndex());
    }
  }

  protected onListKeydown(event: KeyboardEvent): void {
    const buttons: HTMLButtonElement[] = this.optionButtons().map(
      (ref: ElementRef<HTMLButtonElement>) => ref.nativeElement,
    );
    const index: number = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = (index + 1) % buttons.length;
        break;
      case 'ArrowUp':
        next = (index - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = buttons.length - 1;
        break;
      case 'Escape':
        event.preventDefault();
        this.close(true);
        return;
      default:
        return;
    }
    event.preventDefault();
    buttons[next]?.focus();
  }

  /** Close when focus leaves the component (e.g. Tab out). */
  protected onFocusOut(event: FocusEvent): void {
    const target: Node | null = event.relatedTarget as Node | null;
    if (this.open() && target && !this.host.nativeElement.contains(target)) {
      this.close(false);
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }

  protected select(value: T): void {
    this.close(true);
    if (value !== this.value()) {
      this.selected.emit(value);
    }
  }

  private currentIndex(): number {
    return Math.max(
      this.options().findIndex((option: DropdownOption<T>) => option.value === this.value()),
      0,
    );
  }

  private openAndFocus(index: number): void {
    this.open.set(true);
    // Options are rendered in the next change detection cycle.
    afterNextRender(() => this.optionButtons()[index]?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  private close(returnFocus: boolean): void {
    this.open.set(false);
    if (returnFocus) {
      this.toggleButton().nativeElement.focus();
    }
  }
}
