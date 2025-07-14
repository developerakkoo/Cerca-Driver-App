import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CurrentRidePage } from './current-ride.page';

const routes: Routes = [
  {
    path: '',
    component: CurrentRidePage
  },
  {
    path: 'ride-modal',
    loadChildren: () => import('./ride-modal/ride-modal.module').then( m => m.RideModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrentRidePageRoutingModule {}
