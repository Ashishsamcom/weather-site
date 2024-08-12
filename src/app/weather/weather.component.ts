import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WeatherServicesService } from '../services/weather-service.service';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { environment } from '../../environments/environment.prod';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatButtonToggleModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss',
  providers: [ToastrModule]
})
export class WeatherComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject<void>();
  weatherForm!: FormGroup;
  weatherReport: any = [];
  temperatureChart: any;
  isLoading = false;
  activeReport: 'daily' | 'weekly' | null = null;

  @ViewChild("weatherChart", { static: true }) weatherChart!: ElementRef;

  private latitude!: number;
  private longitude!: number;

  constructor(
    private weatherService: WeatherServicesService,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.weatherForm = new FormGroup({
      address: new FormControl('', Validators.required)
    });
  }

  //download the data in json format
  downloadWeatherReport() {
    const blob = new Blob([JSON.stringify(this.weatherReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weatherData.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Weather form submit
  doSubmitWeatherForm() {
    if (this.weatherForm.valid) {
      const addressValue = this.weatherForm.get('address')?.value.trim();
      if (addressValue) {
        this.clearChart();
        this.getCoordinates(addressValue);
      }
    } else {
      this.weatherForm.markAllAsTouched();
    }
  }

  // Get the coordinates of the address
  private getCoordinates(city: any) {
    this.isLoading = true
    this.weatherReport = [];
    this.weatherService.getCordinates(city).pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: res => this.handleCoordinatesResponse(res),
        error: err => this.handleError(err.message)
      })
  }

  private handleCoordinatesResponse(res: any): void {
    if (res.status.code == 200 && res.results.length > 0) {
      this.latitude = res.results[0].geometry.lat;
      this.longitude = res.results[0].geometry.lng;
      this.fetchWeatherReport('weekly');
    } else {
      this.toast.error('Address not found');
      this.isLoading = false;
    }
  }

  //Toggle daily and weekly weather report
  onToggleChange(event: any) {
    this.fetchWeatherReport(event.value);
  }

  //function to serach the weather report
  private fetchWeatherReport(timePeriod: 'daily' | 'weekly') {
    this.isLoading = true;
    this.activeReport = timePeriod;
    
    const startDate = this.getStartDate(timePeriod);

    this.weatherService.getWeather(this.latitude, this.longitude, startDate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: res => this.handleWeatherResponse(res, timePeriod),
        error: err => this.handleError(err.message)
    });
  }

  private getStartDate(timePeriod: 'daily' | 'weekly'): number {
    const now = new Date();
    if (timePeriod === 'daily') {
      return Math.floor(now.getTime() / 1000) - 86400; // 24 hours in seconds
    }
    now.setDate(now.getDate() - 5);
    return Math.floor(now.getTime() / 1000);
  }

  private handleWeatherResponse(res: any, timePeriod: 'daily' | 'weekly'): void {
    this.weatherReport = res;
    this.loadChart(timePeriod);
    this.isLoading = false;
  }

  //Get the weather icon
  getIconUrl(iconCode: string): string {
    return `${environment.ICON_URL}${iconCode}.png`;
  }

  //Convert ferenhite to degree celcius
  convertTemperature(fahrenheit: number): number {
    return Math.round(fahrenheit - environment.FERENITE);
  }

  //Clear the chart
  private clearChart() {
    if (this.temperatureChart) {
      this.temperatureChart.destroy();
      this.temperatureChart = undefined;
    }
  }

  //Create chart based on retreived data
  private loadChart(timePeriod: 'daily' | 'weekly') {

    const temperature = this.weatherReport.hourly.map((item: any) => this.convertTemperature(item.temp));
    const windSpeed = this.weatherReport.hourly.map((item: any) => item.wind_speed);
    const humidity = this.weatherReport.hourly.map((item: any) => item.humidity);

    const labels = timePeriod === 'daily'
      ? this.weatherReport.hourly.map((_: any, index: number) => index.toString())
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    this.clearChart();

    this.temperatureChart = new Chart(this.weatherChart.nativeElement, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperature,
            borderColor: "rgb(255, 99, 132, 0.5)",
            borderWidth: 2,
            fill: false
          },
          {
            label: "Wind Speed (mph)",
            data: windSpeed,
            borderColor: "rgb(54, 162, 235, 0.5)",
            borderWidth: 2,
            fill: false
          },
          {
            label: "Humidity (%)",
            data: humidity,
            borderColor: "rgb(75, 192, 192, 0.5)",
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        elements: {
          line: {
            tension: 0 // disables bezier curves
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: timePeriod === 'daily' ? 'Hours' : 'Days',
            },
          },
        },
      }
    });
  }

  private handleError(message: string): void {
    this.toast.error(message);
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
