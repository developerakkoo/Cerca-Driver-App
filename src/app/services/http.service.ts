import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http:HttpClient) { }


  login(body:any){
    return this.http.post(environment.apiUrl + '/driver/login',body);
  }

  register(formdata:any){
    return this.http.post(environment.apiUrl +'/driver',formdata);
  }
  getDriverById(id:any){
    return this.http.get(environment.apiUrl +`/driver/${id}`);
  }

  updateDriver(id:any,formdata:any){
    return this.http.put(environment.apiUrl +`/driver/${id}`,formdata);
  }
  
  toggleReadyForRides(id:any,body:any){
    return this.http.put(environment.apiUrl +`/driver/ready-for-ride${id}`,body);
  }
}
