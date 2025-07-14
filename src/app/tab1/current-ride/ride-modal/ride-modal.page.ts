import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ride-modal',
  templateUrl: './ride-modal.page.html',
  styleUrls: ['./ride-modal.page.scss'],
  standalone: false,
})
export class RideModalPage implements OnInit {

  pickupAddress: string = 'Geras Plaza, Pune';
  dropAddress: string = ' Kothrud, Pune';
  estimatedTime: string = '30 minutes';

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }
  

 // Start and stop ride logic
 startRide() {
  console.log('Ride started');
  // Logic for starting the ride, e.g., calculate the estimated time
  this.estimatedTime = '30 minutes'; // Dummy estimated time for now
}

stopRide() {
  console.log('Ride stopped');
  // Logic for stopping the ride
}
}
