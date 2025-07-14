import { Component } from '@angular/core';
import { StorageService } from './services/storage.service';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private storage: StorageService,
    private router: Router,
    private toast: ToastController,
    // private loadingController: LoadingController 
  ) {}


  listenForAppState() {
    App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        console.log('App is in the foreground');
        this.presentToast('App is in the foreground');
      } else {
        console.log('App is in the background');
        this.presentToast('App is in the background');
      }
    });
    
  }
  checkLogin() {
    this.storage.get('token').then((res) => {
      if (res) {
        console.log('User is logged in');
        this.router.navigate(['tabs', 'tabs', 'tab1']);

      } else {
        console.log('User is not logged in');
        this.router.navigate(['']);
      }
    });
  }
  ngOnInit() {
    // this.checkLogin();
  }

  async presentToast(message: string) {
    const toast = await this.toast.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    toast.present();
  }
}
