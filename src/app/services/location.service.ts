import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private platform: Platform) {}

  async getCurrentLocation() {
    try {
      // Ensure the platform is ready (important for mobile devices)
      await this.platform.ready();

      await Geolocation.requestPermissions();
      // Check if the Geolocation API is available
      if (!Geolocation) {
        throw new Error('Geolocation API is not available on this device.');
      }
      // Check if the user has granted permission
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location !== 'granted') {
        throw new Error('Location permission not granted.');
      }
      // Check if the user has granted permission
      const locationStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location !== 'granted') {
        throw new Error('Location permission not granted.');
      }
      // Get the current position
      const position = await Geolocation.getCurrentPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location', error);
      throw new Error('Unable to fetch location. Please check permissions.');
    }
  }
}