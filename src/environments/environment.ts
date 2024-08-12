// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: `https://api.openweathermap.org/data/2.5/forecast?q=`,
  coordinateApiUrl: `https://api.opencagedata.com/geocode/v1/json?q=`,
  COORDINATE_API_KEY: `c39371409079455d9760f5eddb4e5c4d`,
  WEATHER_API_KEY: `76c425f83d3dd4a696721e5d4d4cc3fe`,
  FERENITE: 273.15,
  ICON_URL: `https://openweathermap.org/img/wn/`,
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
