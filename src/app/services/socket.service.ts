import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ToastController } from '@ionic/angular';

export interface RideData {
  _id: string;
  name: string;
  description?: string;
  location: string;
  image?: string;
  price: number;
  duration?: string;
  status?: string;
  driverId?: string;
  rider?: any;
  fare?: number;
  distanceInKm?: number;
}

export interface DriverLocation {
  driverId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface RideEvent {
  rideId: string;
  driverId?: string;
  startOtp?: string;
  stopOtp?: string;
  fare?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  // Event subjects for different ride events
  private newRideRequestSubject = new Subject<RideData>();
  private rideAssignedSubject = new Subject<RideData>();
  private rideStartedSubject = new Subject<RideEvent>();
  private rideCompletedSubject = new Subject<RideEvent>();
  private driverConnectedSubject = new Subject<any>();

  // Public observables for components to subscribe to
  public newRideRequest$ = this.newRideRequestSubject.asObservable();
  public rideAssigned$ = this.rideAssignedSubject.asObservable();
  public rideStarted$ = this.rideStartedSubject.asObservable();
  public rideCompleted$ = this.rideCompletedSubject.asObservable();
  public driverConnected$ = this.driverConnectedSubject.asObservable();

  constructor(private toastController: ToastController) {
    // Socket will be set via setSocket method from components
    this.socket = {} as Socket;
  }

  /**
   * Set the socket instance (called from components that inject Socket)
   */
  public setSocket(socket: Socket): void {
    console.log('Setting socket in SocketService:', socket.id, 'Connected:', socket.connected);
    this.socket = socket;
    this.setupConnectionHandlers();
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected in SocketService:', this.socket.id);
      this.isConnectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected in SocketService');
      this.isConnectedSubject.next(false);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      this.isConnectedSubject.next(false);
    });
  }

  /**
   * Setup all ride-related event listeners
   */
  public setupRideEventListeners(): void {
    console.log('Setting up ride event listeners in SocketService');
    console.log('Socket connected status:', this.socket.connected);
    console.log('Socket ID:', this.socket.id);

    // Remove existing listeners to prevent duplicates
    this.socket.off('newRideRequest');
    this.socket.off('rideAssigned');
    this.socket.off('rideStarted');
    this.socket.off('rideCompleted');
    this.socket.off('driverConnected');

    // New ride request event
    this.socket.on('newRideRequest', (ride: RideData) => {
      console.log('New ride request received in SocketService:', ride);
      console.log('Emitting to newRideRequestSubject');
      this.newRideRequestSubject.next(ride);
    });

    // Ride assigned event
    this.socket.on('rideAssigned', (ride: RideData) => {
      console.log('Ride assigned received in SocketService:', ride);
      console.log('Emitting to rideAssignedSubject');
      this.rideAssignedSubject.next(ride);
    });

    // Ride started event
    this.socket.on('rideStarted', (data: RideEvent) => {
      console.log('Ride started event received in SocketService:', data);
      console.log('Emitting to rideStartedSubject');
      this.rideStartedSubject.next(data);
    });

    // Ride completed event
    this.socket.on('rideCompleted', (data: RideEvent) => {
      console.log('Ride completed event received in SocketService:', data);
      console.log('Emitting to rideCompletedSubject');
      this.rideCompletedSubject.next(data);
    });

    // Driver connected event
    this.socket.on('driverConnected', (data: any) => {
      console.log('Driver connected event received in SocketService:', data);
      console.log('Emitting to driverConnectedSubject');
      this.driverConnectedSubject.next(data);
    });

    console.log('All ride event listeners set up successfully');
  }

  /**
   * Connect to socket
   */
  public connect(): void {
    if (!this.socket.connected) {
      console.log('Connecting to socket...');
      this.socket.connect();
    } else {
      console.log('Socket already connected:', this.socket.id);
    }
  }

  /**
   * Disconnect from socket
   */
  public disconnect(): void {
    if (this.socket.connected) {
      console.log('Disconnecting from socket...');
      this.socket.disconnect();
    }
  }

  /**
   * Emit driver connection event
   */
  public emitDriverConnect(driverId: string): void {
    if (this.socket.connected) {
      console.log('Emitting driverConnect event:', { driverId });
      this.socket.emit('driverConnect', { driverId });
    } else {
      console.error('Cannot emit driverConnect - socket not connected');
    }
  }

  /**
   * Emit driver disconnection event
   */
  public emitDriverDisconnect(driverId: string): void {
    if (this.socket.connected) {
      console.log('Emitting driverDisconnect event:', { driverId });
      this.socket.emit('driverDisconnect', { driverId });
    } else {
      console.error('Cannot emit driverDisconnect - socket not connected');
    }
  }

  /**
   * Emit driver location update
   */
  public emitDriverLocationUpdate(locationData: DriverLocation): void {
    if (this.socket.connected) {
      console.log('Emitting driverLocationUpdate event:', locationData);
      this.socket.emit('driverLocationUpdate', locationData);
    } else {
      console.error('Cannot emit driverLocationUpdate - socket not connected');
    }
  }

  /**
   * Emit ride accepted event
   */
  public emitRideAccepted(rideId: string, driverId: string): void {
    if (this.socket.connected) {
      console.log('Emitting rideAccepted event:', { rideId, driverId });
      this.socket.emit('rideAccepted', { rideId, driverId });
    } else {
      console.error('Cannot emit rideAccepted - socket not connected');
    }
  }

  /**
   * Emit ride started event
   */
  public emitRideStarted(rideId: string, driverId: string, startOtp: string): void {
    if (this.socket.connected) {
      console.log('Emitting rideStarted event:', { rideId, driverId, startOtp });
      this.socket.emit('rideStarted', { rideId, driverId, startOtp });
    } else {
      console.error('Cannot emit rideStarted - socket not connected');
    }
  }

  /**
   * Emit ride completed event
   */
  public emitRideCompleted(rideId: string, driverId: string, fare: number): void {
    if (this.socket.connected) {
      console.log('Emitting rideCompleted event:', { rideId, driverId, fare });
      this.socket.emit('rideCompleted', { rideId, driverId, fare });
    } else {
      console.error('Cannot emit rideCompleted - socket not connected');
    }
  }

  /**
   * Get socket connection status
   */
  public getConnectionStatus(): boolean {
    return this.socket && this.socket.connected;
  }

  /**
   * Check if socket service is properly initialized
   */
  public isInitialized(): boolean {
    return this.socket && Object.keys(this.socket).length > 0;
  }

  /**
   * Get socket ID
   */
  public getSocketId(): string {
    return this.socket.id || '';
  }

  /**
   * Clean up all listeners
   */
  public cleanup(): void {
    console.log('Cleaning up socket listeners in SocketService');
    this.socket.off('newRideRequest');
    this.socket.off('rideAssigned');
    this.socket.off('rideStarted');
    this.socket.off('rideCompleted');
    this.socket.off('driverConnected');
    this.socket.off('connect');
    this.socket.off('disconnect');
    this.socket.off('error');
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string = 'primary'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    toast.present();
  }
}
