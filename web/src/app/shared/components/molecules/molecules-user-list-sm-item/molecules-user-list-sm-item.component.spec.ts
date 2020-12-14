import { currentUserMock } from '@/shared/testing/mocks';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';

import { MoleculesUserListSmItemComponent } from './molecules-user-list-sm-item.component';

describe('MoleculesUserListSmItemComponent', () => {
  let component: MoleculesUserListSmItemComponent;
  let fixture: ComponentFixture<MoleculesUserListSmItemComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatIconTestingModule],
        declarations: [MoleculesUserListSmItemComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleculesUserListSmItemComponent);
    component = fixture.componentInstance;
    component.user = currentUserMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
