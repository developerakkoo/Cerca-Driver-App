import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from '../services/http.service';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  rides = [
    {
      id:1,
      name: 'Abhilash Rathod',
      description: 'Description for Ride 1',
      location: 'Viman Nagar, Pune',
      image: 'https://via.placeholder.com/150',
      price: 220,
      duration: '30 minutes',
      readyForRides: true
    }
    ,{
      id:2,
      name: 'John Doe',
      description: 'Description for Ride 2',
      location: 'Kothrud, Pune',
      image: 'https://via.placeholder.com/150',
      price: 300,
      duration: '45 minutes',
      readyForRides: false
    }
  ]

  isOnlineForRides = false;
  constructor(private http: HttpService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController
  ) {}


  ionViewDidEnter() {
  }
  toggleReadyForRides(ev:any){
    const isChecked = ev.detail.checked;
    this.isOnlineForRides = isChecked;
    console.log('Ready for rides:', isChecked);
    // Perform any additional actions based on the toggle state
  }
  
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();
  }
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    toast.present();
  }


  
  acceptRide(rideId: number) {
    // Add your logic to handle accepting the ride
    console.log(`Ride with ID ${rideId} accepted!`);
    this.router.navigate(['tabs','tab1', 'current-ride', rideId]);
  }


}
