import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models';
import { User } from '@/modules/users/models';
import { CollectionApiResponse, ItemApiResponse, BaseMessage } from '@/shared/models';
import { APIS } from '@/shared/constants';

@Injectable()
export class RoleService {
  constructor(private http: HttpClient) {}

  create(role: Role): Observable<ItemApiResponse<Role>> {
    return this.http.post<ItemApiResponse<Role>>(APIS.ROLES, this.formatBeforeSend(role));
  }

  getRole(id: number): Observable<ItemApiResponse<Role>> {
    return this.http.get<ItemApiResponse<Role>>(`${APIS.ROLES}/${id}`);
  }

  updateRole(role: Role): Observable<ItemApiResponse<Role>> {
    return this.http.put<ItemApiResponse<Role>>(`${APIS.ROLES}/${role.id}`, this.formatBeforeSend(role));
  }

  delete(id: number): Observable<BaseMessage> {
    return this.http.delete<BaseMessage>(`${APIS.ROLES}/${id}`);
  }

  getList(
    pageIndex = 0,
    pageSize = 5,
    sortIndex = 'id',
    sortDirection = 'asc'
  ): Observable<CollectionApiResponse<Role>> {
    return this.http.get<CollectionApiResponse<Role>>(APIS.ROLES, {
      params: new HttpParams()
        .set('pageIndex', pageIndex.toString())
        .set('pageSize', pageSize.toString())
        .set('sortIndex', sortIndex)
        .set('sortDirection', sortDirection)
    });
  }

  getDashboardData(): Observable<CollectionApiResponse<Role>> {
    return this.http.get<CollectionApiResponse<Role>>(APIS.ROLES_DASHBOARD);
  }

  formatBeforeSend(role: Role): Role {
    let formated = { ...role };
    if (role.Users && role.Users.length) {
      formated = Object.assign({}, formated, {
        Users: formated.Users.map((user) => {
          return <User>{
            id: user.id
          };
        })
      });
    }
    return formated;
  }
}
