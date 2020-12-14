import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';

import { MoleculesCardHeaderActionsComponent } from './molecules-card-header-actions.component';

describe('MoleculesCardHeaderActionsComponent', () => {
  let component: MoleculesCardHeaderActionsComponent;
  let fixture: ComponentFixture<MoleculesCardHeaderActionsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatIconTestingModule],
        declarations: [MoleculesCardHeaderActionsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleculesCardHeaderActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
