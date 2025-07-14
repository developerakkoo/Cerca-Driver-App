import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RideModalPage } from './ride-modal.page';

const routes: Routes = [
  {
    path: '',
    component: RideModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RideModalPageRoutingModule {}
