import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProjectStore } from '@trungk18/project/state/project/project.store';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { JUser } from '@trungk18/interface/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl: string;
  constructor(private _http: HttpClient, private _store: ProjectStore) {
    this.baseUrl = environment.apiUrl;
  }

  generateRandomUuid() {
    // Generate a random hexadecimal string of length 12
    const randomHex = () => Math.floor(Math.random() * 16).toString(16);

    // Create a UUID-like string
    return `${randomHex()}${randomHex()}${randomHex()}${randomHex()}-${randomHex()}${randomHex()}-${randomHex()}${randomHex()}-${randomHex()}${randomHex()}-${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;
  }

  signIn(email: string, password: string): Observable<any> {
    const account = { email, password };
    return this._http.post(`${this.baseUrl}/auth/signin`, account);
  }


  getUser(email : string): Observable<any>{
    return this._http.get<JUser>(`${this.baseUrl}/data/auth/${email}`);
  }


  setUser(user : JUser): Observable<any>{
    return this._http.put<JUser>(`${this.baseUrl}/data/auth/${user.email}/update`,user);
  }


  signUp(email: string, password: string): Observable<any> {
    const user : JUser = {
      email : email,
      avatarUrl:"assets/avatars/1.jpg",
      password:password,
      name:email,
      id:this.generateRandomUuid()
    }
    return this._http.post(`${this.baseUrl}/auth/signup`, user);
  }


  updateProfilePicture(email: string, image: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('profilePicture', image, image.name);

    return this._http.post(`${this.baseUrl}/data/auth/${email}/update-picture`, formData);
  }

}
