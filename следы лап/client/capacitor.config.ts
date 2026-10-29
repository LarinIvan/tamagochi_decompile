import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sledylap.app',
  appName: 'След Лапы',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
