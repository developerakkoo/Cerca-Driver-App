import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CurrentRidePageRoutingModule } from './current-ride-routing.module';

import { CurrentRidePage } from './current-ride.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CurrentRidePageRoutingModule
  ],
  declarations: [CurrentRidePage]
})
export class CurrentRidePageModule {}
