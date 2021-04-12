import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

import { AtomsUserPicComponent } from '../atoms-user-pic/atoms-user-pic.component';

@Component({
  selector: 'atoms-profile-pic',
  template: `
    <img
      src="{{ src }}"
      alt="{{ title }}"
      [class]="classes"
      [ngClass]="{ visible: !imageIsLoading }"
      (load)="imageIsLoading = false; imageLoad.emit()"
    />
    <mat-spinner class="mx-auto mb-5" *ngIf="imageIsLoading" [diameter]="90" [strokeWidth]="5"></mat-spinner>
  `,
  styleUrls: ['./atoms-profile-pic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AtomsProfilePicComponent extends AtomsUserPicComponent implements OnInit {
  @Input() picClass: string;

  @Output() imageLoad = new EventEmitter();

  ngOnInit(): void {
    if (!!this.avatar) {
      this.src = this.baseUrl + this.avatar.location + '/' + this.avatar.title;
    }
  }

  get classes(): string {
    return `${this.picClass}`;
  }
}
