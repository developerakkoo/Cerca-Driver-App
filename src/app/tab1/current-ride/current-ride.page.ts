import { Component, OnInit } from '@angular/core';
import { RideModalPage } from './ride-modal/ride-modal.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-current-ride',
  templateUrl: './current-ride.page.html',
  styleUrls: ['./current-ride.page.scss'],
  standalone: false,
})
export class CurrentRidePage implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.presentRideModal();
  }

  async presentRideModal() {
    const modal = await this.modalController.create({
    component: RideModalPage,
    componentProps: { value: 123 },
    animated:true,
    backdropDismiss: true,
    initialBreakpoint: 0.3,
    breakpoints: [0.3, 0.5, 1],
    });
  
    await modal.present();
  
    const data = await modal.onDidDismiss();
    console.log(data)
  
  }
}
