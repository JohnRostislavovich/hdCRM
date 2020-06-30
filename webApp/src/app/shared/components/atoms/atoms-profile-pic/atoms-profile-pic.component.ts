import { Component, OnInit, Input } from '@angular/core';
import { AtomsUserPicComponent } from '../atoms-user-pic/atoms-user-pic.component';

@Component({
  selector: 'atoms-profile-pic',
  template: `
    <img class="userpic" src="{{ src }}" alt="{{ title }}" [ngClass]="[classes]" />
  `,
  styleUrls: ['./atoms-profile-pic.component.scss']
})
export class AtomsProfilePicComponent extends AtomsUserPicComponent implements OnInit {
  @Input() picClass: string;

  ngOnInit(): void {
    if (!!this.avatar) {
      this.src = this.baseUrl + this.avatar.location + '/' + this.avatar.title;
    }
  }

  get classes(): string {
    return `${this.picClass}`;
  }
}
