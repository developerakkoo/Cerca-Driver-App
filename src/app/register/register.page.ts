import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { HttpService } from '../services/http.service';
import { StorageService } from '../services/storage.service';
import { Geolocation, Position } from '@capacitor/geolocation';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

  form!: FormGroup;
  aadharFile: string | null = null;
  documents: File[] = [];
  licenseFile: string | null = null;
  currentLocation: { latitude: number; longitude: number } | null = null;
  coordinates!: Position;
  constructor( private formBuilder: FormBuilder,
              private http: HttpService,
              private storage: StorageService,
              private router: Router,
              private toast: ToastController,
              private loadingController: LoadingController,
  ) {
    this.form = this.formBuilder.group({
      name: ['',[Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      
    });
   }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.form.reset();
    this.aadharFile = null;
    this.licenseFile = null;
    this.checkPermissionsAndGetCurrentLocation();
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'aadhar') {
          this.aadharFile = e.target.result;
         this.documents.push(file);
          this.form.patchValue({ aadhar: event.target.files[0]});
        } else if (type === 'license') {
          this.licenseFile = e.target.result;
          this.documents.push(file);
          this.form.patchValue({ license: event.target.files[0] });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(type: string) {
    if (type === 'aadhar') {
      this.aadharFile = null;
      this.documents = this.documents.filter((file) => file.name !== this.aadharFile);
    } else if (type === 'license') {
      this.licenseFile = null;
      this.documents = this.documents.filter((file) => file.name !== this.licenseFile);
    }
  }

  
  submit() {
    let formData = new FormData();
    formData.append('name', this.form.value.name);
    formData.append('email', this.form.value.email);
    formData.append('password', this.form.value.password);
    formData.append('phone', this.form.value.phone);

  
    // Log FormData contents
    

    // setTimeout(() => {
    //   console.log('FormData ready for submission');
    // }, 400);
    // for (const [key, value] of (formData as any).entries()) {
    //   console.log(`${key}:`, value);
    // }

    this.presentLoading();
    this.http.register(this.form.value).subscribe({
      next:async (res: any) => {
        console.log(res);
          this.presentToast('Registration Successful');
          //this.storage.set('user', res.data);
          this.router.navigate(['/']);
       
      },
      error:async (err: HttpErrorResponse) => {
        console.log(err.status);   
          if( err.status === 400) {
            this.presentToast('Email or Phone already exists. Please Login');
          this.router.navigate(['/']);

            return;
          }
          if (err.status === 500) {
            this.presentToast('Server Error, Please try again later');
            return;
          }
          this.presentToast('Something went wrong');
      },
  })

  }


  async presentToast(message: string) {
    const toast = await this.toast.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'primary'
    });
    toast.present();
  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();
    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }


  async checkPermissionsAndGetCurrentLocation() {
    try {
      let permission = await Geolocation.checkPermissions();
      console.log(permission.location);

      if (permission?.location != 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        console.log(requestStatus.location);

        if (requestStatus?.location != 'granted') {
          //GO TO Settings Page To manually Enable Permission
          this.openSettings(true);
        }
      }

      let options: PositionOptions = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true,
      };

      let position = await Geolocation.getCurrentPosition(options);
      console.log(position.coords);
      this.presentToast(position.coords.latitude + ' ' + position.coords.longitude);
      this.coordinates = position;
    
    } catch (e: any) {
      console.log(e);
      if (e?.message === 'Location services are not enabled') {
        await this.openSettings();
        
      }
    }
  }

  openSettings(app = false) {
    console.log('Open Settings');
    return NativeSettings.open({
      optionAndroid: app
        ? AndroidSettings.ApplicationDetails
        : AndroidSettings.Location,
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices,
    });
  }

}
