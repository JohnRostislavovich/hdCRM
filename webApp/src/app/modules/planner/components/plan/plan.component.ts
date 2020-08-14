import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Update } from '@ngrx/entity';
import { Store, select } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, map, skipUntil, delay } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { Plan } from '../../models';
import { PlanService } from '../../services';
import { UsersDialogComponent, User } from '@/modules/users';
import { AppState } from '@/core/reducers';
import { planSaved } from '../../store/plan.actions';
import { isPrivileged, currentUser } from '@/core/auth/store/auth.selectors';
import { MediaqueryService, Asset, ApiResponse, ToastMessageService } from '@/shared';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanComponent implements OnInit, OnDestroy {
  appUser$: Observable<User> = this.store.pipe(select(currentUser));
  editPlanPrivilege$: Observable<boolean> = this.store.pipe(select(isPrivileged('plan-edit')));
  configStagesPrivilege$: Observable<boolean> = this.store.pipe(select(isPrivileged('stage-edit')));

  plan: Plan;
  planInitial: Plan;
  editForm = false;
  showDataLoader = true;
  configPlanStages = false;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private planService: PlanService,
    private dialog: MatDialog,
    private store: Store<AppState>,
    private mediaQuery: MediaqueryService,
    private cdr: ChangeDetectorRef,
    private toastMessageService: ToastMessageService
  ) {}

  ngOnInit(): void {
    this.plan = cloneDeep(this.route.snapshot.data['plan']);
    this.planInitial = cloneDeep(this.route.snapshot.data['plan']);
    this.canEditPlan$()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(canEdit => {
        if (canEdit) {
          const edit = this.route.snapshot.queryParams['edit'];
          if (edit) {
            this.editForm = JSON.parse(edit);
          }
        }
      });
  }

  goToNextStage(): void {
    this.toastMessageService
      .confirm('You are about to pass stage.', 'Are you sure you want to go to next plan stage?')
      .then(result => {
        if (result.value) {
          this.planService
            .toNextStage(this.plan.id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
              data => {
                this.updatePlanStore(data);
                this.configPlanStages = false;
                this.toastMessageService.toast('Stages updated!');
              },
              error => {
                this.toastMessageService.popup('Ooops, something went wrong!', 'error');
              }
            );
        }
      });
  }

  onClickEdit(): void {
    this.editForm = true;
  }

  onClickConfigureStages(): void {
    this.configPlanStages = true;
  }

  onClickCancelEditStages(): void {
    this.configPlanStages = false;
    this.plan = cloneDeep(this.planInitial);
  }

  onClickCancelEdit(): void {
    this.editForm = false;
    this.plan = cloneDeep(this.planInitial);
  }

  removeParticipant(userId: number): void {
    this.plan = { ...this.plan, Participants: this.plan.Participants.filter(participant => participant.id !== userId) };
  }

  updatePlanStages(): void {
    this.toastMessageService
      .confirm('You are about to save stages configuration.', 'Are you sure you want update stages configuration?')
      .then(result => {
        if (result.value) {
          this.planService
            .updatePlanStages(this.plan)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
              data => {
                this.updatePlanStore(data);
                this.configPlanStages = false;
                this.toastMessageService.toast('Stages updated!');
              },
              error => {
                this.toastMessageService.popup('Ooops, something went wrong!', 'error');
              }
            );
        }
      });
  }

  updatePlan(): void {
    this.toastMessageService
      .confirm('You are about to update plan', 'Are you sure you want to update plan details?')
      .then(result => {
        if (result.value) {
          this.planService
            .updateOne(this.plan)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
              data => {
                this.updatePlanStore(data);
                this.editForm = false;
                this.toastMessageService.toast('Plan updated!');
              },
              error => {
                this.toastMessageService.popup('Ooops, something went wrong!', 'error');
              }
            );
        }
      });
  }

  // TODO: @ArseniiIrod, @IMalaniak remake logic
  // addStageDialog(): void {
  //   this.showDataLoader = false;
  //   const dialogRef = this.dialog.open(StagesDialogComponent, {
  //     ...this.mediaQuery.deFaultPopupSize,
  //     data: {
  //       title: 'Select stages'
  //     }
  //   });

  //   const stagesC = dialogRef.componentInstance.stagesComponent;

  //   dialogRef
  //     .afterOpened()
  //     .pipe(takeUntil(this.unsubscribe), skipUntil(stagesC.isLoading$), delay(300))
  //     .subscribe(() => {
  //       stagesC.stages
  //         .filter(user => this.plan.Participants.some(participant => participant.id === user.id))
  //         ?.forEach(selectedParticipant => {
  //           stagesC.selection.select(selectedParticipant);
  //         });
  //     });

  //   dialogRef
  //     .afterClosed()
  //     .pipe(takeUntil(this.unsubscribe))
  //     .subscribe((result: Stage[]) => {
  //       // remove unchecked
  //       const removeUnchecked = new Promise((resolve, reject) => {
  //         const pStages = this.plan.Stages;
  //         pStages.forEach((stage, i) => {
  //           const tmp = result.filter(el => {
  //             return stage.id === el.id;
  //           });
  //           if (tmp.length === 0) {
  //             this.plan.Stages.splice(i, 1);
  //           }
  //           if (i === this.plan.Stages.length - 1) {
  //             resolve();
  //           }
  //         });
  //       });

  //       removeUnchecked.then(res => {
  //         // add checked if no such
  //         result.forEach((el: Stage, i) => {
  //           const tmp = this.plan.Stages.filter(stage => {
  //             return stage.id === el.id;
  //           });
  //           if (tmp.length === 0) {
  //             const newStage = el;
  //             newStage.Details = {
  //               order: i,
  //               completed: false,
  //               description: ''
  //             } as PlanStage;
  //             this.plan.Stages.push(newStage);
  //           }
  //         });
  //       });
  //     });
  // }

  dragDropStages(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.plan.Stages, event.previousIndex, event.currentIndex);
    this.plan.Stages = this.plan.Stages.map((stage, i) => {
      stage.Details.order = i;
      return stage;
    });
  }

  addParticipantDialog(): void {
    this.showDataLoader = false;
    const dialogRef = this.dialog.open(UsersDialogComponent, {
      ...this.mediaQuery.deFaultPopupSize,
      data: {
        title: 'Select participants'
      }
    });

    const userC = dialogRef.componentInstance.usersComponent;

    dialogRef
      .afterOpened()
      .pipe(takeUntil(this.unsubscribe), skipUntil(userC.loading$), delay(300))
      .subscribe(() => {
        userC.users
          .filter(user => this.plan.Participants.some(participant => participant.id === user.id))
          ?.forEach(selectedParticipant => {
            userC.selection.select(selectedParticipant);
          });
      });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((result: User[]) => {
        const selectedParticipants: User[] = result?.filter(
          selectedParticipant => !this.plan.Participants.some(user => user.id === selectedParticipant.id)
        );

        if (selectedParticipants?.length) {
          this.plan.Participants = [...this.plan.Participants, ...selectedParticipants];
          this.cdr.detectChanges();
        }
      });
  }

  addDoc(doc: Asset): void {
    this.plan.Documents = [...this.plan.Documents, doc];
    this.updatePlanStore(this.plan);
  }

  deleteDoc(docId: number): void {
    this.toastMessageService
      .confirm('Stages updated!', 'Are you sure you want to delete document from plan, changes cannot be undone?')
      .then(result => {
        if (result.value) {
          const req = {
            planId: this.plan.id,
            docId: docId
          };
          this.planService
            .deleteDoc(req)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: ApiResponse) => {
              if (response.success) {
                this.plan.Documents = this.plan.Documents.filter(doc => {
                  return doc.id !== docId;
                });
                this.updatePlanStore(this.plan);
                this.cdr.detectChanges();

                this.toastMessageService.toast('Stages updated!');
              } else {
                this.toastMessageService.popup('Ooops, something went wrong!', 'error');
              }
            });
        }
      });
  }

  updatePlanStore(data: Plan): void {
    this.plan = cloneDeep(data);
    this.planInitial = cloneDeep(data);
    const plan: Update<Plan> = {
      id: this.plan.id,
      changes: data
    };
    this.store.dispatch(planSaved({ plan }));
  }

  canEditPlan$(): Observable<boolean> {
    // combine 3 observables and compare values => return boolean
    // TODO: @IMalaniak check if works correctly
    const combine = combineLatest([this.editPlanPrivilege$, this.configStagesPrivilege$, this.appUser$]);
    return combine.pipe(map(res => (res[0] && res[1]) || res[2].id === this.plan.CreatorId));
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
