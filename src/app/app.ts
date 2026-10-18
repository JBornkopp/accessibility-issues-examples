import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Card, Code, Tab, Tabs } from './components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Card, Tabs, Tab, Code],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly badDisabledButton = `<button disabled>Deaktivierter Button</button>`;

  protected readonly goodDisabledButton = `<button aria-disabled="true" class="a11y-btn-disabled">Deaktivierter Button</button>`;

  protected readonly badContextMenu = `<div class="bad-context-menu-example">
  <div class="bad-menu-item">Menu Item 1</div>
  <div class="bad-menu-item">Menu Item 2</div>
  <div class="bad-menu-item">Menu Item 3</div>
  <div class="bad-menu-item">Menu Item 4</div>
</div>`;

  protected readonly goodContextMenu = `<ul class="good-context-menu-example">
  <li class="good-menu-item-container">
    <button class="good-menu-item">
      Menu Item 1
    </button>
  </li>
  <li class="good-menu-item-container">
    <button class="good-menu-item">
      Menu Item 2
    </button>
  </li>
  <li class="good-menu-item-container">
    <button class="good-menu-item">
      Menu Item 3
    </button>
  </li>
  <li class="good-menu-item-container">
    <button class="good-menu-item">
      Menu Item 4
    </button>
  </li>
</ul>`;
}
