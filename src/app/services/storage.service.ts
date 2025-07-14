import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {
    this.init();
   }

  async init() {
    await this.storage.create();  
  }

   set(key: string, value: any) {
    return this.storage.set(key, value);
  }

  async get(key: string) {
    return await this.storage.get(key);
  }
  async remove(key: string) {
    await this.storage.remove(key);
  }
  async clear() {
    await this.storage.clear();
  }
  async keys() {
    return await this.storage.keys();
  }
  async length() {
    return await this.storage.length();
  }
  async forEach(callback: (key: string, value: any) => void) {
    const keys = await this.storage.keys();
    for (const key of keys) {
      const value = await this.storage.get(key);
      callback(key, value);
    }
  }
  async getAll() {
    const keys = await this.storage.keys();
    const items: { [key: string]: any } = {};
    for (const key of keys) {
      const value = await this.storage.get(key);
      items[key] = value;
    }
    return items;
  }
 
}
