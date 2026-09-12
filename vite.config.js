import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || '/api';

  return {
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      __GOOGLE_LOGIN_ENABLED__: JSON.stringify(Boolean(env.VITE_CLIENTE_ID && env.VITE_API_URL)),
    },
    plugins: [react()],
    server: {
      host: true,
      allowedHosts: ["glamorous-fever-remarry.ngrok-free.dev"],
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
