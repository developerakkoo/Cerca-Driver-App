import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ride-completion-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Ride Completed!</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="completion-content">
        <div class="success-icon">
          <ion-icon name="checkmark-circle" color="success"></ion-icon>
        </div>
        
        <h2>Ride Completed Successfully!</h2>
        <p class="completion-message">Thank you for providing a great ride experience.</p>
        
        <ion-card class="ride-summary">
          <ion-card-content>
            <h3>Ride Summary</h3>
            
            <div class="summary-item">
              <ion-icon name="person" color="primary"></ion-icon>
              <div class="summary-content">
                <span class="label">Rider</span>
                <span class="value">{{ rideData?.rider?.fullName }}</span>
              </div>
            </div>
            
            <div class="summary-item">
              <ion-icon name="trending-up" color="success"></ion-icon>
              <div class="summary-content">
                <span class="label">Distance</span>
                <span class="value">{{ rideData?.distanceInKm }} km</span>
              </div>
            </div>
            
            <div class="summary-item">
              <ion-icon name="card" color="warning"></ion-icon>
              <div class="summary-content">
                <span class="label">Fare</span>
                <span class="value">₹{{ rideData?.fare }}</span>
              </div>
            </div>
            
            <div class="summary-item">
              <ion-icon name="wallet" color="medium"></ion-icon>
              <div class="summary-content">
                <span class="label">Payment Method</span>
                <span class="value">{{ rideData?.paymentMethod }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
        
        <div class="action-buttons">
          <ion-button expand="block" color="primary" (click)="dismiss()">
            <ion-icon name="checkmark" slot="start"></ion-icon>
            Got it!
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .completion-content {
      text-align: center;
      padding: 20px 0;
    }
    
    .success-icon {
      margin-bottom: 24px;
      
      ion-icon {
        font-size: 80px;
        color: #10b981;
      }
    }
    
    h2 {
      margin: 0 0 16px 0;
      font-size: 28px;
      font-weight: 700;
      color: #10b981;
      line-height: 1.2;
    }
    
    .completion-message {
      margin: 0 0 32px 0;
      color: #64748b;
      font-size: 18px;
      line-height: 1.5;
    }
    
    .ride-summary {
      margin: 24px 0;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      
      ion-card-content {
        padding: 24px;
      }
      
      h3 {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        text-align: center;
      }
      
      .summary-item {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        ion-icon {
          font-size: 24px;
          color: #667eea;
        }
        
        .summary-content {
          flex: 1;
          text-align: left;
          
          .label {
            display: block;
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 4px;
          }
          
          .value {
            display: block;
            font-size: 16px;
            color: #1e293b;
            font-weight: 600;
          }
        }
      }
    }
    
    .action-buttons {
      margin-top: 32px;
      
      ion-button {
        height: 56px;
        font-size: 18px;
        font-weight: 600;
        border-radius: 16px;
        --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --color: white;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
        }
        
        ion-icon {
          font-size: 20px;
        }
      }
    }
  `]
})
export class RideCompletionModalComponent {
  @Input() rideData: any;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
}
