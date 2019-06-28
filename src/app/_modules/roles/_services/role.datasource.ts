


import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Observable, BehaviorSubject, of} from 'rxjs';
import {Role} from '../_models/';
import {catchError, tap} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {RolesListPageRequested} from '../store/role.actions';
import {selectRolesPage} from '../store/role.selectors';
import { AppState } from '@/core/reducers';
import { PageQuery } from '@/core/_models';



export class RolesDataSource implements DataSource<Role> {

    private rolesSubject = new BehaviorSubject<Role[]>([]);

    constructor(private store: Store<AppState>) {

    }

    loadRoles(page: PageQuery) {
        this.store
          .pipe(
            select(selectRolesPage(page)),
            tap(roles => {
              if (roles.length > 0) {
                this.rolesSubject.next(roles);
              } else {
                this.store.dispatch(new RolesListPageRequested({page}));
              }
            }),
            catchError(() => of([]))
          )
          .subscribe();

    }

    connect(collectionViewer: CollectionViewer): Observable<Role[]> {
        return this.rolesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.rolesSubject.complete();
    }

}
