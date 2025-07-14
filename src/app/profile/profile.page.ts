import { Component, OnInit } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { HttpService } from '../services/http.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {


  form!: FormGroup;
  documents: File[] = [];
  aadharFile: File | null = null;
  licenseFile: File | null = null;
  name: string = '';
  email: string = '';
  phone: string = '';
  constructor(private storage: StorageService,
    private http:HttpService,
    private router:Router,
    private formBuilder: FormBuilder,
    private toast:ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.form = this.formBuilder.group({
      name: [''],
      email: [''],
      phone: [''],
    });
   }

  ngOnInit() {
    const fileInput = document.getElementById('file1') as HTMLInputElement;
const fileNameDisplay = document.getElementById('file1-name') as HTMLSpanElement;

fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files.length > 0) {
    fileNameDisplay.textContent = "File Selected :- "+ fileInput.files[0].name;
    fileNameDisplay.classList.add('selected');
  } else {
    fileNameDisplay.textContent = '';
    fileNameDisplay.classList.remove('selected');
  }
});

const fileInput2 = document.getElementById('file2') as HTMLInputElement;
const fileNameDisplay2 = document.getElementById('file2-name') as HTMLSpanElement;

fileInput2.addEventListener('change', () => {
  if (fileInput2.files && fileInput2.files.length > 0) {
    fileNameDisplay2.textContent = "File Selected :- "+ fileInput2.files[0].name;
    fileNameDisplay2.classList.add('selected');
  } else {
    fileNameDisplay2.textContent = '';
    fileNameDisplay2.classList.remove('selected');
  }
});

  }


  ionViewDidEnter(){
    this.getUserProfile();
  }

  getUserProfile() {
    this.storage.get('id').then((id) => {
      this.http.getDriverById(id).subscribe((res: any) => {
        console.log(res);
        this.name = res.name;
        this.email = res.email;
        this.phone = res.phone;
        this.form.patchValue({
          name: res.name,
          email: res.email,
          phone: res.phone
        });
        this.documents = res.documents || [];
      }, (err) => {
        console.log(err);
      })
    })
  }
  async presentToast(message: string) {
    const toast = await this.toast.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    toast.present();
  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();
  }
  logout() {
    this.storage.remove('token').then(() => {
      console.log("Token removed");
      this.storage.remove('id').then(() => {
        console.log("User removed");
        this.router.navigate(['login']);
      })
    })
  }

  adharFileChange(event: any) {
    const file = event.target.files[0];
    this.aadharFile = file;
    console.log('Aadhar file selected:', file);
  }


  licenseFileChange(event: any) {
    const file = event.target.files[0];
    this.licenseFile = file;
    console.log('License file selected:', file);
  }

  uploadDocument(type: string) {
  
    console.log(type);
      
  
  } 
    
    
    updateProfile() {
    this.router.navigate(['tabs','tabs','tab1']);
  }
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.logout();
          }
        }

      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
  onSubmit(){
    if(this.form.valid){
      console.log(this.form.value);
      
    }
  }

}