import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RideModalPageRoutingModule } from './ride-modal-routing.module';

import { RideModalPage } from './ride-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RideModalPageRoutingModule
  ],
  declarations: [RideModalPage]
})
export class RideModalPageModule {}
