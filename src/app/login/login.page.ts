import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { StorageService } from '../services/storage.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})
export class LoginPage implements OnInit {

  form!:FormGroup
  constructor(private formBuilder: FormBuilder,
     private http:HttpService,
     private storage:StorageService,
     private router:Router,
     private toast:ToastController,
     private loadingController: LoadingController
  ) { 
    this.form = this.formBuilder.group({
      email: ['akshay@test.com'],
      password: ['test123']
    });
  }

  ngOnInit() {
  }


  async submit() {  
    console.log(this.form.value);
    this.presentLoading();
    this.http.login(this.form.value).subscribe((res:any)=>{
      console.log(res);
      this.loadingController.dismiss();
     let token = res.token;
    this.storage.set('token',token).then(()=>{
      console.log("Token set");
      this.storage.set('id',res.id).then(()=>{
        console.log("User set");
        this.router.navigate(['tabs','tabs','tab1']);
      })
    
    });
    },(err)=>{
      console.log(err);
      this.loadingController.dismiss();
      this.presentToast("Something went wrong");
    })
  }

  register() { 
    this.router.navigate(['/register']);
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
    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }
}
