import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnDestroy } from '@angular/core';
import { HttpService } from '../services/http.service';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { StorageService } from '../services/storage.service';
import { Geolocation, Position } from '@capacitor/geolocation';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnDestroy {

  socketId:any;
  driverId: string = '';
  driver: any = {};
  rides
  :any[] = [
    // {
    //   id:1,
    //   name: 'Abhilash Rathod',
    //   description: 'Description for Ride 1',
    //   location: 'Viman Nagar, Pune',
    //   image: 'https://via.placeholder.com/150',
    //   price: 220,
    //   duration: '30 minutes',
    //   readyForRides: true
    // }
    // ,{
    //   id:2,
    //   name: 'John Doe',
    //   description: 'Description for Ride 2',
    //   location: 'Kothrud, Pune',
    //   image: 'https://via.placeholder.com/150',
    //   price: 300,
    //   duration: '45 minutes',
    //   readyForRides: false
    // }
  ];

  isOnlineForRides = false;
  private subscriptions: Subscription[] = [];

  constructor(private http: HttpService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private modalController: ModalController,
    private socket: Socket,
    private zone:NgZone,
    private storage: StorageService,
    private socketService: SocketService
  ) {
    

  }


  ionViewDidEnter() {
    this.getDriverDetails();
    
    // Only setup socket if driver is already online
    if (this.isOnlineForRides && this.socket && this.socket.connected) {
      console.log('Driver is online, setting up socket service in ionViewDidEnter');
      this.socketService.setSocket(this.socket);
      this.socketService.setupRideEventListeners();
      this.subscribeToRideEvents();
    }
  }

  ionViewWillEnter() {
    // Only setup socket if driver is already online
    if (this.isOnlineForRides && this.socket && this.socket.connected) {
      console.log('Driver is online, setting up socket service in ionViewWillEnter');
      this.socketService.setSocket(this.socket);
      this.socketService.setupRideEventListeners();
      this.subscribeToRideEvents();
    }
  }


  ionViewDidLeave() {
    this.setDriverOffline();
    this.socket.disconnect();
    this.socket.removeAllListeners();
  }

  private subscribeToRideEvents() {
    console.log('Subscribing to ride events in Tab1Page');
    console.log('Current subscriptions count before:', this.subscriptions.length);
    
    // Clear existing subscriptions first
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Subscribe to new ride requests
    const newRideSub = this.socketService.newRideRequest$.subscribe((ride: any) => {
      console.log('New ride request received via service in Tab1Page:', ride);
      console.log('Current rides array before adding:', this.rides);
      this.zone.run(() => {
        this.rides.push(ride);
        console.log('Rides array after adding:', this.rides);
        this.presentToast(`New ride request from ${ride.name}`);
      });
    });

    // Subscribe to ride assigned events
    const rideAssignedSub = this.socketService.rideAssigned$.subscribe((ride: any) => {
      console.log('Ride assigned received via service in Tab1Page:', ride);
      this.zone.run(() => {
        this.rides = [];
        this.router.navigate(['tabs','tabs','tab1', 'current-ride', ride._id]);
      });
    });

    // Subscribe to driver connected events
    const driverConnectedSub = this.socketService.driverConnected$.subscribe((data: any) => {
      console.log('Driver connected via service in Tab1Page:', data);
    });

    // Store subscriptions for cleanup
    this.subscriptions.push(newRideSub, rideAssignedSub, driverConnectedSub);
    
    console.log('All ride event subscriptions set up in Tab1Page');
    console.log('New subscriptions count:', this.subscriptions.length);
  }
  async getDriverDetails() {
    this.driverId = await this.storage.get('id');
    console.log('Driver ID:', this.driverId);
    this.getDriverDetailsFromServer();
    
  }
 toggleReadyForRides(ev: any) {
  const isChecked = ev.detail.checked;
  console.log('Toggle ready for rides:', isChecked);

  if (isChecked) {
    // Don't change state yet - wait for confirmation
    this.presentAlertConfirm();
  } else {
    // Immediately go offline
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
    
    try {
      // Connect to socket first
      this.socket.connect();
      
      // Wait for socket to be ready with a timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 10000); // 10 second timeout
        
        this.socket.on('connect', async () => {
          clearTimeout(timeout);
          console.log('Socket connected in setDriverOnline:', this.socket.id);
          this.socketId = this.socket.id;
          
          try {
            // Set the socket instance in the service
            this.socketService.setSocket(this.socket);
            
            // Setup ride event listeners
            this.socketService.setupRideEventListeners();
            
            // Subscribe to ride events
            this.subscribeToRideEvents();
            
            // Emit driver connect event
            this.socketService.emitDriverConnect(this.driverId);

            // Mark as active in backend
            this.http.updateDriver(this.driverId, { isActive: true }).subscribe({
              next: async (response: any) => {
                console.log('Driver marked as active:', response);
                this.isOnlineForRides = true;
                await loading.dismiss();
                await this.presentToast('You are now online for rides!');
                this.startLocationUpdateLoop();
                resolve();
              },
              error: async (error: any) => {
                console.error('Error marking driver as active:', error);
                this.isOnlineForRides = false;
                await loading.dismiss();
                this.presentToast('Failed to set you online. Please try again.');
                reject(error);
              }
            });
          } catch (error) {
            console.error('Error in socket setup:', error);
            this.isOnlineForRides = false;
            await loading.dismiss();
            this.presentToast('Failed to setup socket connection. Please try again.');
            reject(error);
          }
        });
        
        this.socket.on('connect_error', (error: any) => {
          clearTimeout(timeout);
          console.error('Socket connection error:', error);
          this.isOnlineForRides = false;
          loading.dismiss();
          this.presentToast('Failed to connect to server. Please try again.');
          reject(error);
        });
      });
      
    } catch (error) {
      console.error('Error in setDriverOnline:', error);
      this.isOnlineForRides = false;
      await loading.dismiss();
      this.presentToast('Failed to go online. Please try again.');
    }
  }


async setDriverOffline() {
  let loading = await this.loadingController.create({
    message: 'Setting you offline...',
    duration: 2000
  });
  await loading.present();
  
  try {
    // Use socket service to emit driver disconnect and disconnect
    if (this.socketService.getConnectionStatus()) {
      this.socketService.emitDriverDisconnect(this.driverId);
      this.socketService.disconnect();
    }
    
    // Also disconnect the raw socket
    if (this.socket.connected) {
      this.socket.disconnect();
    }

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
  } catch (error) {
    console.error('Error in setDriverOffline:', error);
    this.isOnlineForRides = true; // Revert toggle state
    await loading.dismiss();
    this.presentToast('Failed to go offline. Please try again.');
  }
}

// listenForRides method removed - now handled by SocketService

startLocationUpdateLoop() {
  setInterval(async () => {
    console.log('Sending driver location update...');
    
    // Get current location and update via socket service
    const position: Position = await Geolocation.getCurrentPosition();
    console.log('Current position:', position.coords);
    
    if(position && position.coords) {
      this.socketService.emitDriverLocationUpdate({
        driverId: this.driverId,  
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      });
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
    this.socketService.emitRideAccepted(rideId.toString(), this.driverId);
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


  ngOnDestroy() {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Cleanup socket service
    this.socketService.cleanup();
  }

  // Debug method to check socket connection and service status
  debugSocketService() {
    console.log('=== Socket Service Debug Info ===');
    console.log('Socket connected:', this.socket.connected);
    console.log('Socket ID:', this.socket.id);
    console.log('SocketService initialized:', this.socketService.isInitialized());
    console.log('SocketService connection status:', this.socketService.getConnectionStatus());
    console.log('SocketService socket ID:', this.socketService.getSocketId());
    console.log('Current rides array:', this.rides);
    console.log('Subscriptions count:', this.subscriptions.length);
    console.log('Driver online status:', this.isOnlineForRides);
    console.log('Socket ready for events:', this.isSocketReady());
    console.log('=====================');
  }

  // Check if socket is ready for events
  isSocketReady(): boolean {
    return this.socket.connected && 
           this.socketService.getConnectionStatus() && 
           this.subscriptions.length > 0;
  }

  // Test socket connection manually
  testSocketConnection() {
    console.log('=== Testing Socket Connection ===');
    
    if (!this.socket.connected) {
      console.log('Socket not connected, attempting to connect...');
      this.socket.connect();
      return;
    }
    
    if (!this.socketService.isInitialized()) {
      console.log('SocketService not initialized, setting up...');
      this.socketService.setSocket(this.socket);
      this.socketService.setupRideEventListeners();
      this.subscribeToRideEvents();
      return;
    }
    
    if (this.subscriptions.length === 0) {
      console.log('No subscriptions, setting up...');
      this.subscribeToRideEvents();
      return;
    }
    
    console.log('Socket appears to be ready for events');
    console.log('Emitting test driverConnect event...');
    this.socketService.emitDriverConnect(this.driverId);
  }
}
