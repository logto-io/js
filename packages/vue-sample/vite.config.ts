import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ["@logto/vue"],
  },
  build: {
    commonjsOptions: {
      include: [/vue/, /node_modules/],
    },
  },
  server: {
    port: 3000,
  },
});
