import { TestBed } from '@angular/core/testing';

import { WeatherServicesService } from './weather-service.service';

describe('WeatherServiceService', () => {
  let service: WeatherServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
