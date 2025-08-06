import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from '../services/http.service';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { StorageService } from '../services/storage.service';
import { Geolocation, Position } from '@capacitor/geolocation';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  driverId: string = '';
  driver: any = {};
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
    private alertController: AlertController,
    private router: Router,
    private modalController: ModalController,
    private socket: Socket,
    private storage: StorageService
  ) {
    

  }


  ionViewDidEnter() {
    this.getDriverDetails();

    this.socket.on('driverConnected', (data: any) => {
      console.log('Driver connected:', data);
    });
  }


  ionViewDidLeave() {
    this.setDriverOffline();
    this.socket.disconnect();
    this.socket.removeAllListeners();
  }
  async getDriverDetails() {
    this.driverId = await this.storage.get('id');
    console.log('Driver ID:', this.driverId);
    this.getDriverDetailsFromServer();
    
  }
 toggleReadyForRides(ev: any) {
  const isChecked = ev.detail.checked;
  this.isOnlineForRides = isChecked;
  console.log('Ready for rides:', isChecked);

  if (isChecked) {
    this.presentAlertConfirm();
  } else {
    this.setDriverOffline();
  }
}


  async presentAlertConfirm() {
  const alert = await this.alertController.create({
    header: 'Confirm!',
    message: 'You will start getting rides!!!',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.isOnlineForRides = false;
        }
      },
      {
        text: 'Okay',
        handler: () => {
          this.setDriverOnline();
        }
      }
    ]
  });

  await alert.present();
}

async setDriverOnline() {
  let loading = await this.loadingController.create({
    message: 'Setting you online...',
    duration: 2000
  });
  await loading.present();
  this.driverId = await this.storage.get('id');
  this.socket.connect();

  // Prevent duplicate listeners
  this.socket.removeAllListeners('connect');
  this.socket.on('connect', async () => {
    console.log('Socket connected');
    this.socket.emit('driverConnect', { driverId: this.driverId });

    // Mark as active in backend
    this.http.updateDriver(this.driverId, { isActive: true }).subscribe({
      next:async (response: any) => {
        console.log('Driver marked as active:', response);
        this.isOnlineForRides = true;
        await loading.dismiss();
        await this.presentToast('You are now online for rides!');
        this.listenForRides();
  this.startLocationUpdateLoop();
      },
      error: async (error: any) => {
        console.error('Error marking driver as active:', error);
        this.isOnlineForRides = false;
        await loading.dismiss();
        this.presentToast('Failed to set you online. Please try again.');
      },
      complete: () => {
        this.isOnlineForRides = true;
        console.log('Driver status update complete');
      }
    });

  });
  
}


async setDriverOffline() {
  let loading = await this.loadingController.create({
    message: 'Setting you offline...',
    duration: 2000
  });
  await loading.present();
  this.socket.emit('driverDisconnect', { driverId: this.driverId });
  this.socket.disconnect();

  this.socket.removeAllListeners();

  this.http.updateDriver(this.driverId, { isActive: false }).subscribe({
    next: async (response: any) => {
      console.log('Driver marked as inactive:', response);
      this.isOnlineForRides = false;
      await loading.dismiss();
      await this.presentToast('You are now offline for rides!');
    },
    error: async (error: any) => {
      console.error('Error marking driver as inactive:', error);
      this.isOnlineForRides = true; // Revert toggle state
      await loading.dismiss();
      this.presentToast('Failed to set you offline. Please try again.');
    }
  });
}

listenForRides() {
  this.socket.removeAllListeners('driver');
  this.socket.on('driver', (ride: any) => {
    console.log('New ride request:', ride);
    this.presentToast(`New ride request from ${ride.name}`);
  });
}

startLocationUpdateLoop() {
  setInterval(async () => {
    console.log('Sending driver location update...');
    
   // Logic to start listening for rides
  //Get Current locations and update via socket 
  const position: Position = await Geolocation.getCurrentPosition();
  console.log('Current position:', position.coords);
  //Broadcast the current location to the server
  if(position && position.coords) {
   this.socket.emit('driverLocationUpdate', {
    driverId: this.driverId,  
    location:{
      latitude: position.coords.latitude,
    longitude: position.coords.longitude
    }
                }                )
  } 
  }, 5000); // update every 5 seconds
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

  async getDriverDetailsFromServer() {
    this.http.getDriverById(this.driverId).subscribe(
      (response: any) => {
        this.driver = response;
        console.log('Driver details:', this.driver);
        if(this.driver && this.driver.isActive) {
          console.log('Driver is active for rides:', this.driver.isActive);
          
          this.isOnlineForRides = this.driver.isActive;
        }
      },
      (error: any) => {
        console.error('Error fetching driver details:', error);
      }
    );
  }
async startListeningForRides(){
  console.log("Listening for rides...");
  this.socket.connect();
            // Always attach 'connect' listener before connecting
            // this.socket.off('connect');
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket.emit('driverConnect', { driverId: this.driverId });
       // Start listening for rides (should ideally be inside connect block or separate logic)
      });
      
  this.getDriverDetailsFromServer();
  
  // Listen for ride requests from the server
  this.socket.on('driver', (ride: any) => {
    console.log('New ride request received:', ride);
    this.presentToast(`New ride request from ${ride.name}`);
    // You can also navigate to a ride details page or show a modal here
  }); 
}

  ngOnDestroy() {
    // Cleanup socket listeners when the component is destroyed
    this.socket.off('driver');
    this.socket.off('connect');
    this.socket.off('disconnect');
  }
}
