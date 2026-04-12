import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.megakumul',
  appName: 'MegaKUMUL',
  webDir: 'dist',
  server: {
    url: 'https://44614f00-163a-465a-9909-224d12d3c25d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
