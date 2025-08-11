import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClientModule } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'https://api.myserverdevops.com', options: {} };
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, IonicStorageModule.forRoot({
    name: 'cerca_driver',
  }),SocketIoModule.forRoot(config)],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
