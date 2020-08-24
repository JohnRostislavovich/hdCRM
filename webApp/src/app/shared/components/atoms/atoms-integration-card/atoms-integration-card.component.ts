import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'atoms-integration-card',
  template: `
    <div matRipple class="integration-card" [ngClass]="[classes]" (click)="onClick($event)">
      <img src="{{ './assets/images/integrations/' + src }}" alt="{{ imgTitle }}" />
    </div>
  `,
  styleUrls: ['./atoms-integration-card.component.scss']
})
export class AtomsIntegrationCardComponent {
  @Input() src: string;

  @Input() imgTitle = 'noimage';

  @Input() cardClass = '';

  @Input() isEnabled: boolean;

  @Output() onclick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.onclick.emit(event);
  }

  get classes(): string {
    return `${this.cardClass} ` + (this.isEnabled ? 'active' : '');
  }
}
