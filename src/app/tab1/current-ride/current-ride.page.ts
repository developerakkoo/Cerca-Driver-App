import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonModal, IonicModule } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { HttpService } from '../../services/http.service';
import { Subscription, interval } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { RideCompletionModalComponent } from './ride-completion-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-current-ride',
  templateUrl: './current-ride.page.html',
  styleUrls: ['./current-ride.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CurrentRidePage implements OnInit, OnDestroy {
  @ViewChild('rideDetailsModal') rideDetailsModal!: IonModal;
  
  rideId: string = '';
  rideData: any = null;
  startOtp: string = '';
  stopOtp: string = '';
  isModalOpen = false;
  rideStartTime: Date | null = null;
  rideDuration: string = '00:00';
  rideProgress: number = 0;
  isEmergencyMode: boolean = false;
  private timerSubscription!: Subscription;
  private progressSubscription!: Subscription;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private socket: Socket,
    private httpService: HttpService,
    private toastController: ToastController,
    public router: Router,
    private actionSheetController: ActionSheetController,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.rideId = this.route.snapshot.paramMap.get('rideId') || '';
    console.log("ride id");
    console.log(this.rideId);
    
    if (this.rideId) {
      this.getRideById();
    }
  }

  ionViewDidEnter() {
    console.log('CurrentRidePage view entered');
    if (this.rideId) {
      // Set the socket instance in the service
      this.socketService.setSocket(this.socket);
      
      // Subscribe to ride events
      this.subscribeToRideEvents();
    }
  }

  ionViewWillEnter() {
    console.log('CurrentRidePage view will enter');
    // Give the socket a moment to be ready
    setTimeout(() => {
      if (this.rideId) {
        // Set the socket instance in the service
        this.socketService.setSocket(this.socket);
        
        // Subscribe to ride events
        this.subscribeToRideEvents();
      }
    }, 100);
  }

  ionViewWillLeave() {
    console.log('CurrentRidePage view will leave - closing modal');
    // Close the modal if it's open
    this.isModalOpen = false;
    
    // Reset modal state to ensure it's closed
    if (this.rideDetailsModal) {
      this.rideDetailsModal.dismiss();
    }
  }

  ionViewDidLeave() {
    console.log('CurrentRidePage view leaving - resetting state');
    // Ensure modal state is reset
    this.isModalOpen = false;
  }

  private subscribeToRideEvents() {
    console.log('Subscribing to ride events in CurrentRidePage');
    
    // Subscribe to ride started events
    const rideStartedSub = this.socketService.rideStarted$.subscribe((data: any) => {
      console.log('Ride started event received via service:', data);
      if (data.rideId === this.rideId) {
        console.log('Ride started event matches current ride');
        this.getRideById();
        this.startRideTimer();
        this.startProgressTracking();
        this.presentToast('Ride has been started!', 'success');
      }
    });

    // Subscribe to ride completed events
    const rideCompletedSub = this.socketService.rideCompleted$.subscribe((data: any) => {
      console.log('Ride completed event received via service:', data);
      if (data.rideId === this.rideId) {
        console.log('Ride completed event matches current ride');
        this.getRideById();
        this.stopRideTimer();
        this.stopProgressTracking();
        this.presentToast('Ride has been completed!', 'success');
        this.showCompletionModal();
      }
    });

    // Store subscriptions for cleanup
    this.subscriptions.push(rideStartedSub, rideCompletedSub);
  }

  // setupSocketListeners method removed - now handled by SocketService

  async getRideById() {
   this.httpService.getRideById(this.rideId).subscribe({
    next:(data:any)=>{
      console.log("ride data");
      
      console.log(data);
      this.rideData = data;
      this.isModalOpen = true;
    },
    error:(error:any)=>{
      console.log(error);
    }
   });
  }

  async startRide() {
    console.log('startRide called - startOtp:', this.startOtp, 'Length:', this.startOtp?.length, 'Type:', typeof this.startOtp);
    
    if (!this.startOtp || this.startOtp.length !== 4) {
      console.log('OTP validation failed - startOtp:', this.startOtp, 'Length:', this.startOtp?.length);
      this.presentToast('Please enter a valid 4-digit OTP', 'warning');
      return;
    }

      this.startOtp = '';
      try {
       
        console.log('Event data:', { rideId: this.rideId });
        this.httpService.updateRide(this.rideId,{
          status:'in_progress',
        }).subscribe({
          next:(data:any)=>{
            console.log('Ride updated successfully:', data);
            this.presentToast('Ride started successfully!', 'success');
            this.getRideById()
          },
          error:(error:any)=>{
            console.error('Error updating ride:', error);
          }
        })

       
        
      } catch (error) {
        console.error('Error starting ride:', error);
        this.presentToast('Error starting ride', 'danger');
      }


    
  }

  async completeRide() {
    console.log('completeRide called - stopOtp:', this.stopOtp, 'Length:', this.stopOtp?.length, 'Type:', typeof this.stopOtp);
    
    if (!this.stopOtp || this.stopOtp.length !== 4) {
      console.log('OTP validation failed - stopOtp:', this.stopOtp, 'Length:', this.stopOtp?.length);
      this.presentToast('Please enter a valid 4-digit OTP', 'warning');
      return;
    }

    try {
      console.log('Event data:', { rideId: this.rideId, fare: this.rideData.fare });
      this.httpService.updateRide(this.rideId,{
        status:'completed',
      }).subscribe({
        next:(data:any)=>{
          console.log('Ride updated successfully:', data);
          this.presentToast('Ride completed successfully!', 'success');
          this.getRideById()
        }
      })
      this.presentToast('Ride completed successfully!', 'success');
      this.isModalOpen = false;
      this.showCompletionModal();
      
      setTimeout(() => {
        this.router.navigate(['/tabs/tabs/tab1']);
      }, 3000);
    } catch (error) {
      console.error('Error completing ride', error);
      this.presentToast('Error completing ride', 'danger');
    }
  }

  async showCompletionModal() {
    this.isModalOpen = false;
    const actionSheet = await this.actionSheetController.create({
      header: 'Ride Completed',
      subHeader: 'Thank you for completing the ride!',
      buttons: [
        {
          text: 'View Ride Summary',
          icon: 'document-text',
          handler: () => {
            this.presentToast('Ride summary available', 'success');
          }
        },
        {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['/tabs/tabs/tab1']);
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async openRideDetails() {
    this.isModalOpen = true;
  }

  async callRider() {
    if (this.rideData?.rider?.phoneNumber) {
      window.open(`tel:${this.rideData.rider.phoneNumber}`, '_system');
    } else {
      this.presentToast('Phone number not available', 'warning');
    }
  }

  async openChat() {
    console.log('Opening chat...');
    this.presentToast('Chat feature coming soon!', 'info');
  }

  async openEmergencyOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Emergency Options',
      buttons: [
        {
          text: 'Call Emergency Services',
          icon: 'call',
          handler: () => {
            this.callEmergencyServices();
          }
        },
        {
          text: 'Report Issue',
          icon: 'warning',
          handler: () => {
            this.reportIssue();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async callEmergencyServices() {
    // Customize emergency number based on region
    // window.open('tel:911', '_system');
  }

  async reportIssue() {
    this.presentToast('Issue reported successfully', 'success');
  }

  async submitIssueReport() {
    // Emit to server
    this.presentToast('Issue report submitted', 'success');
  }

  onStartOtpInput(event: any) {
    const value = event.target.value;
    console.log('Start OTP input value:', value, 'Length:', value?.length);
    
    // Ensure we only take the first 4 characters
    if (value && value.length > 4) {
      this.startOtp = value.slice(0, 4);
    } else {
      this.startOtp = value;
    }
    
    console.log('Start OTP after processing:', this.startOtp, 'Length:', this.startOtp?.length);
  }

  onStopOtpInput(event: any) {
    const value = event.target.value;
    console.log('Stop OTP input value:', value, 'Length:', value?.length);
    
    // Ensure we only take the first 4 characters
    if (value && value.length > 4) {
      this.stopOtp = value.slice(0, 4);
    } else {
      this.stopOtp = value;
    }
    
    console.log('Stop OTP after processing:', this.stopOtp, 'Length:', this.stopOtp?.length);
  }

  // Debug method to check current OTP values
  debugOtpValues() {
    console.log('=== OTP Debug Info ===');
    console.log('startOtp:', this.startOtp, 'Length:', this.startOtp?.length, 'Type:', typeof this.startOtp);
    console.log('stopOtp:', this.stopOtp, 'Length:', this.stopOtp?.length, 'Type:', typeof this.stopOtp);
    console.log('startOtp disabled condition:', !this.startOtp || this.startOtp.length !== 4);
    console.log('stopOtp disabled condition:', !this.stopOtp || this.stopOtp.length !== 4);
    console.log('=====================');
  }

  // Debug method to check socket connection
  debugSocketConnection() {
    console.log('=== Socket Debug Info ===');
    console.log('Socket connected:', this.socket.connected);
    console.log('Socket ID:', this.socket.id);
    console.log('Socket readyState:', (this.socket as any).io?.readyState);
    console.log('Current ride ID:', this.rideId);
    console.log('=====================');
  }

  startRideTimer() {
    this.rideStartTime = new Date();
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.rideStartTime) {
        const now = new Date();
        const diff = now.getTime() - this.rideStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        this.rideDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    });
  }

  stopRideTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startProgressTracking() {
    this.progressSubscription = interval(1000).subscribe(() => {
      if (this.rideStartTime) {
        const now = new Date();
        const diff = now.getTime() - this.rideStartTime.getTime();
        const estimatedDuration = this.rideData?.estimatedDuration || 1800000; // 30 minutes default
        this.rideProgress = Math.min((diff / estimatedDuration) * 100, 100);
      }
    });
  }

  stopProgressTracking() {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  getEstimatedTime(): string {
    if (!this.rideData?.estimatedDuration) return 'N/A';
    const minutes = Math.floor(this.rideData.estimatedDuration / 60000);
    return `${minutes} min`;
  }

  getStatusIcon(): string {
    switch (this.rideData?.status) {
      case 'pending': return 'time';
      case 'in_progress': return 'car';
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      default: return 'information-circle';
    }
  }

  getStatusColor(): string {
    switch (this.rideData?.status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  ngOnDestroy() {
    console.log('CurrentRidePage destroying - cleaning up subscriptions');
    
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Clean up timer and progress subscriptions
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }
}
