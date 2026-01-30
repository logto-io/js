import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.logto.capacitor",
  appName: "Logto Capacitor Sample",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
