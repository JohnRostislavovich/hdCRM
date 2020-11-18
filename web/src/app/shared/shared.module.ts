import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { IconModule } from './modules/icon.module';
import { AppMaterialModule } from './modules/app-material.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { COMPONENTS, PIPES } from './imports';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppMaterialModule,
    AttachmentsModule,
    NgxChartsModule,
    ReactiveFormsModule,
    IconModule
  ],
  declarations: [...COMPONENTS, ...PIPES],
  exports: [...COMPONENTS, ...PIPES, AppMaterialModule, OverlayModule, FormsModule, ReactiveFormsModule, IconModule],
  providers: [DatePipe]
})
export class SharedModule {}
