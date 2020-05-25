﻿import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@/modules/users';
import { ApiResponse, NewPassword } from '@/shared';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = '/auth';
  }

  registerUser(user: User) {
    return this.http.post<any>(`${this.api}/register`, user);
  }

  login(loginUser: User) {
    return this.http.post<User>(`${this.api}/authenticate`, loginUser);
  }

  activateAccount(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.api}/activate_account`, {
      token: token
    });
  }

  requestPasswordReset(user: User): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.api}/forgot_password`, user);
  }

  resetPassword(data: NewPassword): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.api}/reset_password`, data);
  }

  logout() {
    return this.http.get(`${this.api}/logout`);
  }
}
