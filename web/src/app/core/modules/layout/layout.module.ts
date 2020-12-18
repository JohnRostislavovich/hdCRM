import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { PublicViewComponent, PrivateViewComponent } from './view-containers';
import {
  BreadcrumbsComponent,
  HeaderComponent,
  FooterComponent,
  PageNotFoundComponent,
  InternalServerErrorComponent,
  SidebarComponent,
  NotificationsComponent,
  UserDropdownComponent
} from './components';
import { SharedModule } from '@/shared/shared.module';
import * as fromLayout from './store/layout.reducer';
import { LayoutEffects } from './store/layout.effects';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    StoreModule.forFeature(fromLayout.layoutFeatureKey, fromLayout.reducer),
    EffectsModule.forFeature([LayoutEffects])
  ],
  declarations: [
    PublicViewComponent,
    PrivateViewComponent,
    BreadcrumbsComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent,
    InternalServerErrorComponent,
    NotificationsComponent,
    UserDropdownComponent
  ],
  exports: [
    BreadcrumbsComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent,
    InternalServerErrorComponent
  ]
})
export class LayoutModule {}
