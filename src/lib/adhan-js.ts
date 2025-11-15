/*
 * Adhan.js
 * https://github.com/batoulapps/adhan-js
 *
 * Copyright (c) 2017 Batoul Apps
 *
 * Released under the MIT license
 */

//
// Add a polyfill for Object.assign for legacy environments
//
if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
      value: function assign(target: any, varArgs: any) {
        // .length of function is 2
        'use strict';
        if (target === null || target === undefined) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
  
        var to = Object(target);
  
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
  
          if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is used as a property name in V8's hidden classes
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true,
    });
  }
  
  /**
   * Represent a date object with a timezone.
   * This is a stripped down and modified version of the js-joda library.
   * This is not a full implementation of js-joda and is only intended to be used for the purposes of this library.
   * For the full implementation of js-joda, see https://github.com/js-joda/js-joda
   */
  export class ZonedDateTime {
    private _dateTime: Date;
    private _timezone: string;
  
    private constructor(date: Date, timezone: string) {
      this._dateTime = date;
      this._timezone = timezone;
    }
  
    static from(date: Date, timezone: string): ZonedDateTime {
      return new ZonedDateTime(date, timezone);
    }
  
    get timezone(): string {
      return this._timezone;
    }
  
    get dateTime(): Date {
      return this._dateTime;
    }
  }
  
  /**
   * A date and time with a timezone.
   */
  export interface Time {
    date: Date;
    timezone: string;
  }
  
  /**
   * Units of time.
   */
  export enum Unit {
    HOURS = 'hours',
    MINUTES = 'minutes',
    SECONDS = 'seconds',
  }
  
  /**
   * An angle.
   */
  export class Angle {
    /**
     * The value of the angle in degrees.
     */
    degrees: number;
  
    constructor(degrees: number) {
      this.degrees = degrees;
    }
  
    static fromDegrees(degrees: number): Angle {
      return new Angle(degrees);
    }
  
    static fromRadians(radians: number): Angle {
      return new Angle((radians * 180) / Math.PI);
    }
  
    get radians(): number {
      return (this.degrees * Math.PI) / 180;
    }
  }
  
  /**
   * The supported madhabs for calculating Asr prayer time.
   */
  export enum Madhab {
    /**
     * Shafi, Maliki, Ja'fari, and Hanbali madhabs.
     */
    Shafi = 'shafi',
  
    /**
     * Hanafi madhab.
     */
    Hanafi = 'hanafi',
  }
  
  /**
   * The high latitude rules for calculating prayer times.
   */
  export enum HighLatitudeRule {
    /**
     * Fajr will never be earlier than the middle of the night and Isha will never be later than the middle of the night.
     */
    MiddleOfTheNight = 'middleofthenight',
  
    /**
     * Fajr will never be earlier than the beginning of the last seventh of the night and Isha will never be later than the end of the first seventh of the night.
     */
    SeventhOfTheNight = 'seventhofthenight',
  
    /**
     * The Fajr angle will be adjusted to the angle of the closest latitude that has a valid time and Isha will be adjusted to the angle of the closest latitude that has a valid time.
     */
    TwilightAngle = 'twilightangle',
  }
  
  /**
   * The names of the prayers.
   */
  export enum Prayer {
    Fajr = 'fajr',
    Sunrise = 'sunrise',
    Dhuhr = 'dhuhr',
    Asr = 'asr',
    Maghrib = 'maghrib',
    Isha = 'isha',
    None = 'none',
  }
  
  /**
   * The definition of a calculation method.
   */
  export class CalculationParameters {
    /**
     * The angle of the sun below the horizon for Fajr.
     */
    fajrAngle: number;
  
    /**
     * The angle of the sun below the horizon for Isha.
     */
    ishaAngle: number;
  
    /**
     * The number of minutes after Maghrib to wait before Isha.
     */
    ishaInterval: number;
  
    /**
     * The madhab for calculating Asr prayer time.
     */
    madhab: Madhab;
  
    /**
     * The high latitude rule for calculating prayer times.
     */
    highLatitudeRule: HighLatitudeRule;
  
    /**
     * The adjustments for each prayer time.
     */
    adjustments: PrayerAdjustments;
  
    /**
     * The method for calculating Fajr and Isha.
     */
    method: string | undefined;
  
    /**
     * The method adjustments for each prayer time.
     */
    methodAdjustments: PrayerAdjustments;
  
    constructor(
      fajrAngle: number,
      ishaAngle: number,
      method?: string,
      ishaInterval?: number,
      madhab?: Madhab,
      highLatitudeRule?: HighLatitudeRule,
      adjustments?: PrayerAdjustments,
      methodAdjustments?: PrayerAdjustments
    ) {
      this.fajrAngle = fajrAngle;
      this.ishaAngle = ishaAngle;
      this.ishaInterval = ishaInterval || 0;
      this.madhab = madhab || Madhab.Shafi;
      this.highLatitudeRule = highLatitudeRule || HighLatitudeRule.MiddleOfTheNight;
      this.adjustments = adjustments || {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      };
      this.method = method;
      this.methodAdjustments = methodAdjustments || {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      };
    }
  }
  
  /**
   * Prayer time adjustments.
   */
  export interface PrayerAdjustments {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  }
  
  /**
   * Coordinates.
   */
  export class Coordinates {
    /**
     * The latitude.
     */
    latitude: number;
  
    /**
     * The longitude.
     */
    longitude: number;
  
    constructor(latitude: number, longitude: number) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
  }
  
  /**
   * Solar coordinates.
   */
  export class SolarCoordinates {
    /**
     * The declination of the sun.
     */
    declination: number;
  
    /**
     * The right ascension of the sun.
     */
    rightAscension: number;
  
    /**
     * The apparent sidereal time.
     */
    apparentSiderealTime: number;
  
    constructor(julianDay: number) {
      const T = Astronomical.julianCentury(julianDay);
      const L0 = Astronomical.meanSolarLongitude(T);
      const Lp = Astronomical.meanLunarLongitude(T);
      const Ω = Astronomical.ascendingLunarNodeLongitude(T);
      const λ = Angle.fromRadians(Astronomical.apparentSolarLongitude(T, L0)).degrees;
  
      const θ0 = Astronomical.meanSiderealTime(T);
      const ΔΨ = Astronomical.nutationInLongitude(L0, Lp, Ω);
      const ε0 = Astronomical.meanObliquityOfTheEcliptic(T);
      const εapp = Angle.fromRadians(Astronomical.apparentObliquityOfTheEcliptic(T, ε0)).degrees;
  
      this.declination = Angle.fromRadians(
        Astronomical.declination(λ, εapp)
      ).degrees;
      this.rightAscension = Angle.fromRadians(
        Astronomical.rightAscension(λ, εapp)
      ).degrees;
      this.apparentSiderealTime =
        θ0 + ΔΨ * 3600 * Math.cos(Angle.fromDegrees(εapp).radians) / 3600;
    }
  }
  
  /**
   * Solar time.
   */
  export class SolarTime {
    /**
     * The time for a given angle above the horizon.
     */
    private readonly time: (angle: number, afterTransit: boolean) => number;
  
    /**
     * The time of transit.
     */
    transit: number;
  
    /**
     * The time of sunrise.
     */
    sunrise: number;
  
    /**
     * The time of sunset.
     */
    sunset: number;
  
    /**
     * The time of the observer.
     */
    private observer: Coordinates;
  
    /**
     * The solar coordinates.
     */
    private solar: SolarCoordinates;
  
    /**
     * The time of the previous transit.
     */
    private prevSolar: SolarCoordinates;
  
    /**
     * The time of the next transit.
     */
    private nextSolar: SolarCoordinates;
  
    /**
     * The approximate transit.
     */
    private approxTransit: number;
  
    constructor(today: Date, coordinates: Coordinates) {
      const todayInUTC = new Date(today.getTime());
      todayInUTC.setUTCHours(0, 0, 0, 0);
  
      const tomorrowInUTC = new Date(todayInUTC.getTime());
      tomorrowInUTC.setDate(tomorrowInUTC.getDate() + 1);
  
      const yesterdayInUTC = new Date(todayInUTC.getTime());
      yesterdayInUTC.setDate(yesterdayInUTC.getDate() - 1);
  
      const prevSolar = new SolarCoordinates(
        Astronomical.julianDay(yesterdayInUTC)
      );
      const solar = new SolarCoordinates(Astronomical.julianDay(todayInUTC));
      const nextSolar = new SolarCoordinates(
        Astronomical.julianDay(tomorrowInUTC)
      );
  
      const m0 = Astronomical.approximateTransit(
        coordinates.longitude,
        solar.apparentSiderealTime,
        solar.rightAscension
      );
      const solarAltitude = -50.0 / 60.0;
  
      this.observer = coordinates;
      this.solar = solar;
      this.prevSolar = prevSolar;
      this.nextSolar = nextSolar;
      this.approxTransit = m0;
      this.transit = Astronomical.correctedTransit(
        m0,
        coordinates.longitude,
        solar.apparentSiderealTime,
        solar.rightAscension,
        prevSolar.rightAscension,
        nextSolar.rightAscension
      );
      this.sunrise = Astronomical.correctedHourAngle(
        m0,
        solarAltitude,
        coordinates,
        false,
        solar.apparentSiderealTime,
        solar.rightAscension,
        prevSolar.rightAscension,
        nextSolar.rightAscension,
        solar.declination,
        prevSolar.declination,
        nextSolar.declination
      );
      this.sunset = Astronomical.correctedHourAngle(
        m0,
        solarAltitude,
        coordinates,
        true,
        solar.apparentSiderealTime,
        solar.rightAscension,
        prevSolar.rightAscension,
        nextSolar.rightAscension,
        solar.declination,
        prevSolar.declination,
        nextSolar.declination
      );
  
      const thisClass = this;
  
      this.time = function(angle: number, afterTransit: boolean): number {
        return Astronomical.correctedHourAngle(
          thisClass.approxTransit,
          angle,
          thisClass.observer,
          afterTransit,
          thisClass.solar.apparentSiderealTime,
          thisClass.solar.rightAscension,
          thisClass.prevSolar.rightAscension,
          thisClass.nextSolar.rightAscension,
          thisClass.solar.declination,
          thisClass.prevSolar.declination,
          thisClass.nextSolar.declination
        );
      };
    }
  
    hourAngle(angle: number, afterTransit: boolean): number {
      return this.time(angle, afterTransit);
    }
  
    afternoon(shadowLength: number): number {
      const tangent = this.observer.latitude - this.solar.declination;
      const inverse = shadowLength + Math.tan(Angle.fromDegrees(tangent).radians);
      const angle = Angle.fromRadians(Math.atan(1.0 / inverse)).degrees;
      return this.hourAngle(angle, true);
    }
  }
  
  /**
   * Prayer times.
   */
  export class PrayerTimes {
    /**
     * The time for Fajr prayer.
     */
    fajr: Date;
  
    /**
     * The time for Sunrise.
     */
    sunrise: Date;
  
    /**
     * The time for Dhuhr prayer.
     */
    dhuhr: Date;
  
    /**
     * The time for Asr prayer.
     */
    asr: Date;
  
    /**
     * The time for Maghrib prayer.
     */
    maghrib: Date;
  
    /**
     * The time for Isha prayer.
     */
    isha: Date;
  
    constructor(
      coordinates: Coordinates,
      date: Date,
      calculationParameters: CalculationParameters
    ) {
      const dateInUTC = new Date(date.getTime());
      dateInUTC.setUTCHours(0, 0, 0, 0);
  
      const solarTime = new SolarTime(dateInUTC, coordinates);
      let fajrTime: Date;
      let sunriseTime: Date;
      let dhuhrTime: Date;
      let asrTime: Date;
      let maghribTime: Date;
      let ishaTime: Date;
  
      const timezone = 'UTC';
  
      let asrJuristic =
        calculationParameters.madhab == Madhab.Hanafi
          ? solarTime.afternoon(2)
          : solarTime.afternoon(1);
  
      const dhuhr = solarTime.transit;
      dhuhrTime = dateByAddingHours(dateInUTC, dhuhr, timezone);
  
      sunriseTime = dateByAddingHours(dateInUTC, solarTime.sunrise, timezone);
      const sunset = solarTime.sunset;
      maghribTime = dateByAddingHours(dateInUTC, sunset, timezone);
  
      asrTime = dateByAddingHours(dateInUTC, asrJuristic, timezone);
  
      const tomorrow = new Date(dateInUTC.getTime());
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowSolarTime = new SolarTime(tomorrow, coordinates);
      const tomorrowSunrise = tomorrowSolarTime.sunrise;
  
      const night = tomorrowSunrise - sunset;
  
      fajrTime = dateByAddingHours(
        dateInUTC,
        solarTime.hourAngle(-calculationParameters.fajrAngle, false),
        timezone
      );
  
      // special case for moonsighting committee above latitude 55
      if (
        calculationParameters.method === 'MoonsightingCommittee' &&
        coordinates.latitude >= 55
      ) {
        const nightFraction = night / 7;
        fajrTime = dateByAddingHours(
          dateInUTC,
          sunset + nightFraction,
          timezone
        );
      }
  
      const safeFajr = (function(): Date {
        if (calculationParameters.method === 'MoonsightingCommittee') {
          return Astronomical.seasonAdjustedMorningTwilight(
            coordinates.latitude,
            dayOfYear(date),
            date.getFullYear(),
            sunriseTime
          );
        } else {
          const portion = calculationParameters.highLatitudeRule.valueOf();
          const nightFraction = (portion as any)[portion] * night;
          return dateByAddingHours(
            dateInUTC,
            sunset + nightFraction,
            timezone
          );
        }
      })();
  
      if (isNaN(fajrTime.getTime()) || safeFajr > fajrTime) {
        fajrTime = safeFajr;
      }
  
      if (calculationParameters.ishaInterval > 0) {
        ishaTime = new Date(
          maghribTime.getTime() + calculationParameters.ishaInterval * 60000
        );
      } else {
        ishaTime = dateByAddingHours(
          dateInUTC,
          solarTime.hourAngle(-calculationParameters.ishaAngle, true),
          timezone
        );
  
        // special case for moonsighting committee above latitude 55
        if (
          calculationParameters.method === 'MoonsightingCommittee' &&
          coordinates.latitude >= 55
        ) {
          const nightFraction = night / 7;
          ishaTime = dateByAddingHours(
            dateInUTC,
            sunset + nightFraction,
            timezone
          );
        }
  
        const safeIsha = (function(): Date {
          if (calculationParameters.method === 'MoonsightingCommittee') {
            return Astronomical.seasonAdjustedEveningTwilight(
              coordinates.latitude,
              dayOfYear(date),
              date.getFullYear(),
              maghribTime
            );
          } else {
            const portion = calculationParameters.highLatitudeRule.valueOf();
            const nightFraction = (portion as any)[portion] * night;
            return dateByAddingHours(
              dateInUTC,
              sunset - nightFraction,
              timezone
            );
          }
        })();
  
        if (isNaN(ishaTime.getTime()) || safeIsha < ishaTime) {
          ishaTime = safeIsha;
        }
      }
  
      const dhuhrAdjustments =
        calculationParameters.adjustments.dhuhr +
        calculationParameters.methodAdjustments.dhuhr;
      dhuhrTime = new Date(dhuhrTime.getTime() + dhuhrAdjustments * 60000);
  
      const fajrAdjustments =
        calculationParameters.adjustments.fajr +
        calculationParameters.methodAdjustments.fajr;
      fajrTime = new Date(fajrTime.getTime() + fajrAdjustments * 60000);
  
      const sunriseAdjustments =
        calculationParameters.adjustments.sunrise +
        calculationParameters.methodAdjustments.sunrise;
      sunriseTime = new Date(sunriseTime.getTime() + sunriseAdjustments * 60000);
  
      const asrAdjustments =
        calculationParameters.adjustments.asr +
        calculationParameters.methodAdjustments.asr;
      asrTime = new Date(asrTime.getTime() + asrAdjustments * 60000);
  
      const maghribAdjustments =
        calculationParameters.adjustments.maghrib +
        calculationParameters.methodAdjustments.maghrib;
      maghribTime = new Date(maghribTime.getTime() + maghribAdjustments * 60000);
  
      const ishaAdjustments =
        calculationParameters.adjustments.isha +
        calculationParameters.methodAdjustments.isha;
      ishaTime = new Date(ishaTime.getTime() + ishaAdjustments * 60000);
  
      this.fajr = fajrTime;
      this.sunrise = sunriseTime;
      this.dhuhr = dhuhrTime;
      this.asr = asrTime;
      this.maghrib = maghribTime;
      this.isha = ishaTime;
    }
  
    timeForPrayer(prayer: Prayer): Date | null {
      if (prayer === Prayer.Fajr) {
        return this.fajr;
      } else if (prayer === Prayer.Sunrise) {
        return this.sunrise;
      } else if (prayer === Prayer.Dhuhr) {
        return this.dhuhr;
      } else if (prayer === Prayer.Asr) {
        return this.asr;
      } else if (prayer === Prayer.Maghrib) {
        return this.maghrib;
      } else if (prayer === Prayer.Isha) {
        return this.isha;
      } else {
        return null;
      }
    }
  
    currentPrayer(date?: Date): Prayer {
      const dateToCompare = date || new Date();
      if (dateToCompare >= this.isha) {
        return Prayer.Isha;
      } else if (dateToCompare >= this.maghrib) {
        return Prayer.Maghrib;
      } else if (dateToCompare >= this.asr) {
        return Prayer.Asr;
      } else if (dateToCompare >= this.dhuhr) {
        return Prayer.Dhuhr;
      } else if (dateToCompare >= this.sunrise) {
        return Prayer.Sunrise;
      } else if (dateToCompare >= this.fajr) {
        return Prayer.Fajr;
      } else {
        return Prayer.None;
      }
    }
  
    nextPrayer(date?: Date): Prayer {
      const dateToCompare = date || new Date();
      if (dateToCompare >= this.isha) {
        return Prayer.None;
      } else if (dateToCompare >= this.maghrib) {
        return Prayer.Isha;
      } else if (dateToCompare >= this.asr) {
        return Prayer.Maghrib;
      } else if (dateToCompare >= this.dhuhr) {
        return Prayer.Asr;
      } else if (dateToCompare >= this.sunrise) {
        return Prayer.Dhuhr;
      } else if (dateToCompare >= this.fajr) {
        return Prayer.Sunrise;
      } else {
        return Prayer.Fajr;
      }
    }
  }
  
  /**
   * Calculation methods for prayer times.
   */
  export class CalculationMethod {
    /**
     * Muslim World League.
     * Fajr: 18 degrees, Isha: 17 degrees.
     */
    static MuslimWorldLeague(): CalculationParameters {
      const params = new CalculationParameters(18, 17, 'MuslimWorldLeague');
      params.methodAdjustments = {
        fajr: 0,
        sunrise: 0,
        dhuhr: 1,
        asr: 1,
        maghrib: 1,
        isha: 1,
      };
      return params;
    }
  
    /**
     * Egyptian General Authority of Survey.
     * Fajr: 19.5 degrees, Isha: 17.5 degrees.
     */
    static Egyptian(): CalculationParameters {
      const params = new CalculationParameters(19.5, 17.5, 'Egyptian');
      params.methodAdjustments = {
        fajr: 0,
        sunrise: 0,
        dhuhr: 1,
        asr: 1,
        maghrib: 1,
        isha: 1,
      };
      return params;
    }
  
    /**
     * University of Islamic Sciences, Karachi.
     * Fajr: 18 degrees, Isha: 18 degrees.
     */
    static Karachi(): CalculationParameters {
      const params = new CalculationParameters(18, 18, 'Karachi');
      params.methodAdjustments = {
        fajr: 0,
        sunrise: 0,
        dhuhr: 1,
        asr: 1,
        maghrib: 1,
        isha: 1,
      };
      return params;
    }
  
    /**
     * Umm al-Qura University, Makkah.
     * Fajr: 18.5 degrees, Isha: 90 minutes after Maghrib.
     */
    static UmmAlQura(): CalculationParameters {
      return new CalculationParameters(
        18.5,
        0,
        'UmmAlQura',
        90
      );
    }
  
    /**
     * Dubai.
     * Fajr: 18.2 degrees, Isha: 18.2 degrees.
     */
    static Dubai(): CalculationParameters {
      const params = new CalculationParameters(18.2, 18.2, 'Dubai');
      params.methodAdjustments = {
        fajr: 0,
        sunrise: -1,
        dhuhr: 1,
        asr: 1,
        maghrib: 1,
        isha: 0,
      };
      return params;
    }
  
    /**
     * Moonsighting Committee.
     * Fajr: 18 degrees, Isha: 18 degrees.
     */
    static MoonsightingCommittee(): CalculationParameters {
      const params = new CalculationParameters(
        18,
        18,
        'MoonsightingCommittee'
      );
      params.methodAdjustments = {
        fajr: 0,
        sunrise: 0,
        dhuhr: 5,
        asr: 5,
        maghrib: 3,
        isha: 0,
      };
      return params;
    }
  
    /**
     * Islamic Society of North America (ISNA).
     * Fajr: 15 degrees, Isha: 15 degrees.
     */
    static NorthAmerica(): CalculationParameters {
      const params = new CalculationParameters(15, 15, 'NorthAmerica');
      params.methodAdjustments = {
        fajr: 0,
        sunrise: 0,
        dhuhr: 1,
        asr: 1,
        maghrib: 1,
        isha: 1,
      };
      return params;
    }
  
    /**
     * Kuwait.
     * Fajr: 18 degrees, Isha: 17.5 degrees.
     */
    static Kuwait(): CalculationParameters {
      return new CalculationParameters(18, 17.5, 'Kuwait');
    }
  
    /**
     * Qatar.
     * Fajr: 18 degrees, Isha: 90 minutes after Maghrib.
     */
    static Qatar(): CalculationParameters {
      return new CalculationParameters(18, 0, 'Qatar', 90);
    }
  
    /**
     * Singapore.
     * Fajr: 20 degrees, Isha: 18 degrees.
     */
    static Singapore(): CalculationParameters {
      const params = new CalculationParameters(20, 18, 'Singapore');
      params.methodAdjustments = {
        fajr: 0,
        sunrise: 0,
        dhuhr: 1,
        asr: 1,
        maghrib: 1,
        isha: 1,
      };
      return params;
    }
  
    /**
     * Other.
     */
    static Other(): CalculationParameters {
      return new CalculationParameters(0, 0, 'Other');
    }
  }
  
  /**
   * Astronomical calculations.
   */
  export class Astronomical {
    /**
     * The geometric mean longitude of the sun.
     * @param {number} T The Julian century.
     * @returns {number} The geometric mean longitude of the sun in degrees.
     */
    static meanSolarLongitude(T: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const term1 = 280.4664567;
      const term2 = 36000.76983 * T;
      const term3 = 0.0003032 * Math.pow(T, 2);
      const L0 = term1 + term2 + term3;
      return this.unwindAngle(L0);
    }
  
    /**
     * The geometric mean longitude of the moon.
     * @param {number} T The Julian century.
     * @returns {number} The geometric mean longitude of the moon in degrees.
     */
    static meanLunarLongitude(T: number): number {
      /* Equation from Montenbruck and Pfleger, p. 52 */
      const term1 = 218.3164591;
      const term2 = 481267.88134236 * T;
      const term3 = -0.0013268 * Math.pow(T, 2);
      const term4 = (1 / 538841) * Math.pow(T, 3);
      const term5 = (-1 / 65194000) * Math.pow(T, 4);
      const Lp = term1 + term2 + term3 + term4 + term5;
      return this.unwindAngle(Lp);
    }
  
    static ascendingLunarNodeLongitude(T: number): number {
      /* Equation from Montenbruck and Pfleger, p. 52 */
      const term1 = 125.0445550;
      const term2 = -1934.1361849 * T;
      const term3 = 0.0020762 * Math.pow(T, 2);
      const term4 = (1 / 467410) * Math.pow(T, 3);
      const term5 = (-1 / 60616000) * Math.pow(T, 4);
      const Ω = term1 + term2 + term3 + term4 + term5;
      return this.unwindAngle(Ω);
    }
  
    /**
     * The apparent longitude of the sun, referred to the true equinox of the date.
     * @param {number} T The Julian century.
     * @param {number} L0 The mean longitude of the sun.
     * @returns {number} The apparent longitude of the sun in radians.
     */
    static apparentSolarLongitude(T: number, L0: number): number {
      /* Equation from Montenbruck and Pfleger, p. 66 */
      const longitude = L0 + this.solarEquationOfTheCenter(T, L0);
      const Ω = 125.04 - 1934.136 * T;
      const λ =
        longitude - 0.00569 - 0.00478 * Math.sin(Angle.fromDegrees(Ω).radians);
      return Angle.fromDegrees(λ).radians;
    }
  
    /**
     * The solar equation of the center.
     * @param {number} T The Julian century.
     * @param {number} L0 The mean longitude of the sun.
     * @returns {number} The solar equation of the center in degrees.
     */
    static solarEquationOfTheCenter(T: number, L0: number): number {
      /* Equation from Montenbruck and Pfleger, p. 66 */
      const M = this.unwindAngle(357.5291092 + 35999.0502909 * T);
      const Mrad = Angle.fromDegrees(M).radians;
      const term1 = (1.914666471 - 0.004817 * T) * Math.sin(Mrad);
      const term2 = (0.019994643 - 0.000101 * T) * Math.sin(2 * Mrad);
      const term3 = 0.0002888 * Math.sin(3 * Mrad);
      return term1 + term2 + term3;
    }
  
    /**
     * The mean obliquity of the ecliptic, corrected for calculating the apparent position of the sun.
     * @param {number} T The Julian century.
     * @returns {number} The mean obliquity of the ecliptic in degrees.
     */
    static meanObliquityOfTheEcliptic(T: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const term1 = 23.439291;
      const term2 = -0.0130042 * T;
      const term3 = -0.0000001639 * Math.pow(T, 2);
      const term4 = 0.0000005036 * Math.pow(T, 3);
      return term1 + term2 + term3 + term4;
    }
  
    /**
     * The apparent obliquity of the ecliptic, corrected for calculating the apparent position of the sun.
     * @param {number} T The Julian century.
     * @param {number} ε0 The mean obliquity of the ecliptic.
     * @returns {number} The apparent obliquity of the ecliptic in radians.
     */
    static apparentObliquityOfTheEcliptic(T: number, ε0: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const Ω = 125.04452 - 1934.136261 * T;
      const ε =
        ε0 + 0.00256 * Math.cos(Angle.fromDegrees(Ω).radians);
      return Angle.fromDegrees(ε).radians;
    }
  
    /**
     * The mean sidereal time, referred to the true equinox of the date.
     * @param {number} T The Julian century.
     * @returns {number} The mean sidereal time in degrees.
     */
    static meanSiderealTime(T: number): number {
      /* Equation from Montenbruck and Pfleger, p. 66 */
      const JD = 2451545.0 + T * 36525;
      const term1 = 280.46061837;
      const term2 = 360.98564736629 * (JD - 2451545.0);
      const term3 = 0.000387933 * Math.pow(T, 2);
      const term4 = Math.pow(T, 3) / 38710000;
      const θ = term1 + term2 + term3 - term4;
      return this.unwindAngle(θ);
    }
  
    static nutationInLongitude(
      L0: number,
      Lp: number,
      Ω: number
    ): number {
      /* Equation from Montenbruck and Pfleger, p. 66 */
      const term1 = -17.2e-5 * Math.sin(Angle.fromDegrees(Ω).radians);
      const term2 = -1.32e-5 * Math.sin(Angle.fromDegrees(2 * L0).radians);
      const term3 = -0.23e-5 * Math.sin(Angle.fromDegrees(2 * Lp).radians);
      const term4 = 0.21e-5 * Math.sin(Angle.fromDegrees(2 * Ω).radians);
      return term1 + term2 + term3 + term4;
    }
  
    static nutationInObliquity(
      L0: number,
      Lp: number,
      Ω: number
    ): number {
      /* Equation from Montenbruck and Pfleger, p. 66 */
      const term1 = 9.2e-5 * Math.cos(Angle.fromDegrees(Ω).radians);
      const term2 = 0.57e-5 * Math.cos(Angle.fromDegrees(2 * L0).radians);
      const term3 = 0.1e-5 * Math.cos(Angle.fromDegrees(2 * Lp).radians);
      const term4 = -0.09e-5 * Math.cos(Angle.fromDegrees(2 * Ω).radians);
      return term1 + term2 + term3 + term4;
    }
  
    /**
     * The declination of the sun.
     * @param {number} λ The apparent longitude of the sun.
     * @param {number} ε The apparent obliquity of the ecliptic.
     * @returns {number} The declination of the sun in radians.
     */
    static declination(λ: number, ε: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      return Math.asin(
        Math.sin(Angle.fromDegrees(ε).radians) *
          Math.sin(Angle.fromDegrees(λ).radians)
      );
    }
  
    /**
     * The right ascension of the sun.
     * @param {number} λ The apparent longitude of the sun.
     * @param {number} ε The apparent obliquity of the ecliptic.
     * @returns {number} The right ascension of the sun in radians.
     */
    static rightAscension(λ: number, ε: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      return Math.atan2(
        Math.cos(Angle.fromDegrees(ε).radians) *
          Math.sin(Angle.fromDegrees(λ).radians),
        Math.cos(Angle.fromDegrees(λ).radians)
      );
    }
  
    /**
     * The hour angle of the sun.
     * @param {number} angle The angle of the sun above the horizon.
     * @param {number} latitude The latitude of the observer.
     * @param {number} δ The declination of the sun.
     * @returns {number} The hour angle of the sun in degrees.
     */
    static hourAngle(
      angle: number,
      latitude: number,
      δ: number
    ): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const term1 = Math.sin(Angle.fromDegrees(angle).radians);
      const term2 =
        Math.sin(Angle.fromDegrees(latitude).radians) *
        Math.sin(Angle.fromDegrees(δ).radians);
      const term3 =
        Math.cos(Angle.fromDegrees(latitude).radians) *
        Math.cos(Angle.fromDegrees(δ).radians);
      return Angle.fromRadians(Math.acos((term1 - term2) / term3)).degrees;
    }
  
    /**
     * The Julian day.
     * @param {Date} date The date.
     * @returns {number} The Julian day.
     */
    static julianDay(date: Date): number {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      const hours = date.getUTCHours();
      return this.julianDayOfYear(year, month, day, hours);
    }
  
    /**
     * The Julian day for a given year, month, and day.
     * @param {number} year The year.
     * @param {number} month The month.
     * @param {number} day The day.
     * @param {number} hours The hours.
     * @returns {number} The Julian day.
     */
    static julianDayOfYear(
      year: number,
      month: number,
      day: number,
      hours: number = 0
    ): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      if (month <= 2) {
        year -= 1;
        month += 12;
      }
      const A = Math.floor(year / 100);
      const B = 2 - A + Math.floor(A / 4);
      const JD =
        Math.floor(365.25 * (year + 4716)) +
        Math.floor(30.6001 * (month + 1)) +
        day +
        B -
        1524.5;
      return JD + hours / 24;
    }
  
    /**
     * The Julian century.
     * @param {number} JD The Julian day.
     * @returns {number} The Julian century.
     */
    static julianCentury(JD: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      return (JD - 2451545.0) / 36525;
    }
  
    /**
     * The approximate transit time of the sun.
     * @param {number} L The longitude of the observer.
     * @param {number} Θ0 The mean sidereal time.
     * @param {number} α2 The right ascension of the sun.
     * @returns {number} The approximate transit time of the sun in hours.
     */
    static approximateTransit(
      L: number,
      Θ0: number,
      α2: number
    ): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const Lw = L * -1;
      return this.normalize(
        (α2 + Lw - Θ0) / 360
      );
    }
  
    /**
     * The corrected transit time of the sun.
     * @param {number} m0 The approximate transit time of the sun.
     * @param {number} L The longitude of the observer.
     * @param {number} Θ0 The mean sidereal time.
     * @param {number} α2 The right ascension of the sun.
     * @param {number} α1 The right ascension of the sun at the previous day.
     * @param {number} α3 The right ascension of the sun at the next day.
     * @returns {number} The corrected transit time of the sun in hours.
     */
    static correctedTransit(
      m0: number,
      L: number,
      Θ0: number,
      α2: number,
      α1: number,
      α3: number
    ): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const Lw = L * -1;
      const θ = this.unwindAngle(Θ0 + 360.985647 * m0);
      const α = this.unwindAngle(
        this.interpolate(α2, α1, α3, m0)
      );
      const H = this.quadInterpolation(
        -Lw,
        θ,
        α
      );
      const Δm = H / -360;
      return (m0 + Δm) * 24;
    }
  
    /**
     * The corrected hour angle of the sun.
     * @param {number} m0 The approximate transit time of the sun.
     * @param {number} h0 The altitude of the sun.
     * @param {Coordinates} coordinates The coordinates of the observer.
     * @param {boolean} afterTransit Whether it is after transit.
     * @param {number} Θ0 The mean sidereal time.
     * @param {number} α2 The right ascension of the sun.
     * @param {number} α1 The right ascension of the sun at the previous day.
     * @param {number} α3 The right ascension of the sun at the next day.
     * @param {number} δ2 The declination of the sun.
     * @param {number} δ1 The declination of the sun at the previous day.
     * @param {number} δ3 The declination of the sun at the next day.
     * @returns {number} The corrected hour angle of the sun in hours.
     */
    static correctedHourAngle(
      m0: number,
      h0: number,
      coordinates: Coordinates,
      afterTransit: boolean,
      Θ0: number,
      α2: number,
      α1: number,
      α3: number,
      δ2: number,
      δ1: number,
      δ3: number
    ): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const Lw = coordinates.longitude * -1;
      const term1 = Math.sin(Angle.fromDegrees(h0).radians);
      const term2 =
        Math.sin(Angle.fromDegrees(coordinates.latitude).radians) *
        Math.sin(Angle.fromDegrees(δ2).radians);
      const term3 =
        Math.cos(Angle.fromDegrees(coordinates.latitude).radians) *
        Math.cos(Angle.fromDegrees(δ2).radians);
      const H0 = Angle.fromRadians(
        Math.acos((term1 - term2) / term3)
      ).degrees;
      const m = afterTransit ? m0 + H0 / 360 : m0 - H0 / 360;
      const θ = this.unwindAngle(Θ0 + 360.985647 * m);
      const α = this.unwindAngle(
        this.interpolate(α2, α1, α3, m)
      );
      const δ = this.interpolate(δ2, δ1, δ3, m);
      const H = θ - Lw - α;
      const h = Angle.fromRadians(
        this.altitude(
          coordinates.latitude,
          δ,
          H
        )
      ).degrees;
      const Δm = (h - h0) / (360 * Math.cos(Angle.fromDegrees(δ).radians) * Math.cos(Angle.fromDegrees(coordinates.latitude).radians) * Math.sin(Angle.fromDegrees(H).radians));
      return (m + Δm) * 24;
    }
  
    static seasonAdjustedMorningTwilight(
      latitude: number,
      day: number,
      year: number,
      sunrise: Date
    ): Date {
      const a = 75 + (28.65 / 55.0) * Math.abs(latitude);
      const b = 75 + (19.44 / 55.0) * Math.abs(latitude);
      const c = 75 + (32.74 / 55.0) * Math.abs(latitude);
      const d = 75 + (48.1 / 55.0) * Math.abs(latitude);
  
      let adjustment: number;
      const dYY = this.daysSinceSolstice(day, year, latitude);
      if (dYY < 91) {
        adjustment = a + ((b - a) / 91.0) * dYY;
      } else if (dYY < 137) {
        adjustment = b + ((c - b) / 46.0) * (dYY - 91);
      } else if (dYY < 183) {
        adjustment = c + ((d - c) / 46.0) * (dYY - 137);
      } else {
        adjustment = d + ((a - d) / (this.isLeapYear(year) ? 92.0 : 91.0)) * (dYY - 183);
      }
  
      return new Date(sunrise.getTime() - Math.round(adjustment * 60000));
    }
  
    static seasonAdjustedEveningTwilight(
      latitude: number,
      day: number,
      year: number,
      sunset: Date
    ): Date {
      const a = 75 + (25.6 / 55.0) * Math.abs(latitude);
      const b = 75 + (2.05 / 55.0) * Math.abs(latitude);
      const c = 75 - (9.21 / 55.0) * Math.abs(latitude);
      const d = 75 + (6.14 / 55.0) * Math.abs(latitude);
  
      let adjustment: number;
      const dYY = this.daysSinceSolstice(day, year, latitude);
      if (dYY < 91) {
        adjustment = a + ((b - a) / 91.0) * dYY;
      } else if (dYY < 137) {
        adjustment = b + ((c - b) / 46.0) * (dYY - 91);
      } else if (dYY < 183) {
        adjustment = c + ((d - c) / 46.0) * (dYY - 137);
      } else {
        adjustment = d + ((a - d) / (this.isLeapYear(year) ? 92.0 : 91.0)) * (dYY - 183);
      }
  
      return new Date(sunset.getTime() + Math.round(adjustment * 60000));
    }
  
    static daysSinceSolstice(
      dayOfYear: number,
      year: number,
      latitude: number
    ): number {
      let daysSinceSolstice: number;
      const northernOffset = 10;
      const southernOffset = this.isLeapYear(year) ? 173 : 172;
      const daysInYear = this.isLeapYear(year) ? 366 : 365;
  
      if (latitude >= 0) {
        daysSinceSolstice = dayOfYear + northernOffset;
        if (daysSinceSolstice >= daysInYear) {
          daysSinceSolstice = daysSinceSolstice - daysInYear;
        }
      } else {
        daysSinceSolstice = dayOfYear - southernOffset;
        if (daysSinceSolstice < 0) {
          daysSinceSolstice = daysSinceSolstice + daysInYear;
        }
      }
  
      return daysSinceSolstice;
    }
  
    static isLeapYear(year: number): boolean {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
  
    static unwindAngle(angle: number): number {
      return this.normalize(angle, 360);
    }
  
    static quadInterpolation(y2: number, y1: number, y3: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      let a = y2 - y1;
      let b = y3 - y2;
      let c = a + b;
      return y2 + (c/2)
    }
  
    static interpolate(y2: number, y1: number, y3: number, n: number): number {
      /* Equation from Montenbruck and Pfleger, p. 48 */
      const a = y2 - y1;
      const b = y3 - y2;
      const c = a + b;
      return y2 + (n/2) * (a + b + n * c)
    }
  
    static altitude(φ: number, δ: number, H: number): number {
      return Math.asin(
        Math.sin(Angle.fromDegrees(φ).radians) * Math.sin(Angle.fromDegrees(δ).radians) +
        Math.cos(Angle.fromDegrees(φ).radians) * Math.cos(Angle.fromDegrees(δ).radians) * Math.cos(Angle.fromDegrees(H).radians)
      );
    }
  
    static normalize(value: number, max: number = 1): number {
      value = value - max * Math.floor(value / max);
      return value < 0 ? value + max : value;
    }
  }
  
  //
  // Private
  //
  function dateByAddingDays(date: Date, days: number): Date {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }
  
  function dateByAddingMinutes(date: Date, minutes: number): Date {
    return dateByAddingSeconds(date, minutes * 60);
  }
  
  function dateByAddingSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
  }
  
  function dateByAddingHours(date: Date, hours: number, timezone: string): Date {
    return dateByAddingMinutes(date, hours * 60);
  }
  
  function dayOfYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfYear = (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 24 / 60 / 60 / 1000;
    return dayOfYear;
  }
  
  function dateBySettingHour(date: Date, hour: number, timezone: string): Date {
    const newDate = new Date(date.getTime());
    newDate.setHours(hour);
    return newDate;
  }
  
  function dateBySettingMinutes(
    date: Date,
    minutes: number,
    timezone: string
  ): Date {
    const newDate = new Date(date.getTime());
    newDate.setMinutes(minutes);
    return newDate;
  }
  
  function dateBySettingSeconds(
    date: Date,
    seconds: number,
    timezone: string
  ): Date {
    const newDate = new Date(date.getTime());
    newDate.setSeconds(seconds);
    return newDate;
  }
  
  function dateBySetting(
    date: Date,
    hour: number,
    minute: number,
    second: number,
    timezone: string
  ): Date {
    const newDate = new Date(date.getTime());
    newDate.setHours(hour, minute, second);
    return newDate;
  }
  