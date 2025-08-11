import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ride-details-modal',
  templateUrl: './ride-details-modal.component.html',
  styleUrls: ['./ride-details-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RideDetailsModalComponent {
  @Input() rideData: any;
  @Input() driverLocation: any;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  callRider() {
    // Implement rider calling functionality
    console.log('Calling rider...');
  }

  openChat() {
    // Implement chat functionality
    console.log('Opening chat...');
  }

  getStatusColor(): string {
    switch (this.rideData?.status) {
      case 'accepted': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      default: return 'medium';
    }
  }

  getStatusText(): string {
    switch (this.rideData?.status) {
      case 'accepted': return 'Ready to Start';
      case 'in_progress': return 'Ride in Progress';
      case 'completed': return 'Ride Completed';
      default: return 'Unknown Status';
    }
  }
}
