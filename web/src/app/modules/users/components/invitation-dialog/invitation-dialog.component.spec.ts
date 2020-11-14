import { DialogCreateEditModel } from '@/shared/models';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { provideMockStore } from '@ngrx/store/testing';
import { initialUsersState } from '../../store/user.reducer';
import { InvitationDialogComponent } from './invitation-dialog.component';
import { SharedModule } from '@/shared/shared.module';

describe('InvitationDialogComponent', () => {
  let component: InvitationDialogComponent<DialogCreateEditModel>;
  let fixture: ComponentFixture<InvitationDialogComponent<DialogCreateEditModel>>;
  const initialState = {
    users: initialUsersState
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InvitationDialogComponent],
        imports: [BrowserAnimationsModule, SharedModule],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
