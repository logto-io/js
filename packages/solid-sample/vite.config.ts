import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ["@logto/solid"],
  },
  build: {
    // commonjsOptions: {
    //   include: [/vue/, /node_modules/],
    // },
  },
  server: {
    port: 3000,
  },
});
