import { Coordinates } from '../types/map';

export type GeoMode = 'real' | 'simulation';

export interface GeoState {
  coords: Coordinates;
  mode: GeoMode;
  speedKmh: number;
  heading: number; // degrees
  accuracy: number;
  isMoving: boolean;
}

export type GeoCallback = (state: GeoState) => void;

class GeoManager {
  private currentCoords: Coordinates = { lat: 55.7315, lng: 37.6035 };
  private mode: GeoMode = 'simulation';
  private speedKmh = 4.5;
  private heading = 0;
  private watchId: number | null = null;
  private listeners: Set<GeoCallback> = new Set();

  // Симуляция движения по вектору джойстика
  private joystickVector = { x: 0, y: 0 };
  private simIntervalId: any = null;
  private speedMultiplier = 1.0;

  // Симуляция движения к точке клика
  private targetCoords: Coordinates | null = null;

  constructor() {
    this.startSimulationLoop();
  }

  public setInitialCoords(coords: Coordinates) {
    this.currentCoords = coords;
    this.notify();
  }

  public getCoords(): Coordinates {
    return this.currentCoords;
  }

  public getMode(): GeoMode {
    return this.mode;
  }

  public setMode(mode: GeoMode) {
    this.mode = mode;
    if (mode === 'real') {
      this.startRealGps();
    } else {
      this.stopRealGps();
    }
    this.notify();
  }

  public setSpeedMultiplier(mult: number) {
    this.speedMultiplier = mult;
  }

  public setJoystickVector(x: number, y: number) {
    this.joystickVector = { x, y };
    if (x !== 0 || y !== 0) {
      this.targetCoords = null; // Отменяем клик-таргет если крутим джойстик
    }
  }

  public moveToTarget(target: Coordinates) {
    this.targetCoords = target;
  }

  public teleport(coords: Coordinates) {
    this.currentCoords = coords;
    this.targetCoords = null;
    this.notify();
  }

  public subscribe(cb: GeoCallback): () => void {
    this.listeners.add(cb);
    cb(this.getState());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private getState(): GeoState {
    const isMoving =
      this.joystickVector.x !== 0 ||
      this.joystickVector.y !== 0 ||
      this.targetCoords !== null;

    return {
      coords: { ...this.currentCoords },
      mode: this.mode,
      speedKmh: isMoving ? this.speedKmh * this.speedMultiplier : 0,
      heading: this.heading,
      accuracy: this.mode === 'real' ? 5 : 1,
      isMoving
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  private startRealGps() {
    if (!navigator.geolocation) {
      console.warn('Геолокация не поддерживается браузером');
      this.setMode('simulation');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.currentCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        this.speedKmh = pos.coords.speed ? pos.coords.speed * 3.6 : 4.0;
        this.heading = pos.coords.heading || 0;
        this.notify();
      },
      (err) => {
        console.warn('Ошибка получения реального GPS:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );
  }

  private stopRealGps() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private startSimulationLoop() {
    const FPS = 30;
    const intervalMs = 1000 / FPS;

    this.simIntervalId = setInterval(() => {
      if (this.mode !== 'simulation') return;

      let changed = false;

      // 1. Движение по джойстику
      if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
        const speedMetersPerSec = (this.speedKmh / 3.6) * this.speedMultiplier;
        const stepDist = (speedMetersPerSec * intervalMs) / 1000; // метров за кадр

        const dxMeters = this.joystickVector.x * stepDist;
        const dyMeters = this.joystickVector.y * stepDist;

        // Перевод смещения в метрах в градусы широты и долготы
        const dLat = dyMeters / 111139;
        const dLng = dxMeters / (111139 * Math.cos((this.currentCoords.lat * Math.PI) / 180));

        this.currentCoords = {
          lat: this.currentCoords.lat + dLat,
          lng: this.currentCoords.lng + dLng
        };

        this.heading = (Math.atan2(this.joystickVector.x, this.joystickVector.y) * 180) / Math.PI;
        if (this.heading < 0) this.heading += 360;
        changed = true;
      }
      // 2. Движение к точке таргета (клик по карте)
      else if (this.targetCoords) {
        const dLat = this.targetCoords.lat - this.currentCoords.lat;
        const dLng = this.targetCoords.lng - this.currentCoords.lng;

        const dyMeters = dLat * 111139;
        const dxMeters = dLng * 111139 * Math.cos((this.currentCoords.lat * Math.PI) / 180);
        const distMeters = Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters);

        if (distMeters < 3) {
          // Прибыли к точке
          this.currentCoords = { ...this.targetCoords };
          this.targetCoords = null;
          changed = true;
        } else {
          const speedMetersPerSec = (this.speedKmh / 3.6) * this.speedMultiplier;
          const stepDist = (speedMetersPerSec * intervalMs) / 1000;
          const ratio = Math.min(1.0, stepDist / distMeters);

          this.currentCoords = {
            lat: this.currentCoords.lat + dLat * ratio,
            lng: this.currentCoords.lng + dLng * ratio
          };

          this.heading = (Math.atan2(dxMeters, dyMeters) * 180) / Math.PI;
          if (this.heading < 0) this.heading += 360;
          changed = true;
        }
      }

      if (changed) {
        this.notify();
      }
    }, intervalMs);
  }
}

export const geoService = new GeoManager();
