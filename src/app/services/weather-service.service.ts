import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Weather } from '../models/weather';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WeatherServicesService {

  constructor(private http: HttpClient) { }

  getWeather(lat: number, long: number, timestamp: number): Observable<Weather> {

    const url = `${environment.apiBaseUrl}${lat}&lon=${long}&dt=${timestamp}&appid=${environment.WEATHER_API_KEY}`;
    return this.http.get<Weather>(url);
  }

  getCordinates(area: string): Observable<Weather> {
    return this.http.get<Weather>(environment.coordinateApiUrl + `${area}&key=${environment.COORDINATE_API_KEY}`, {
    })
  }
}


