import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 80, // Forces Vite to run on standard port 80[[1](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQEX8HBrae5p9ogoc5My-ctRhawuZpqYcLA9fIg5AKBRm0Gy6yeSwXhul_u15LTlP6VkAADIfPPXVWxzY2g1JTEaScv3oap-kAs0mlRSRGsmqEZYUN0EafHzIWjJgS0%3D)][[2](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQEX8HBrae5p9ogoc5My-ctRhawuZpqYcLA9fIg5AKBRm0Gy6yeSwXhul_u15LTlP6VkAADIfPPXVWxzY2g1JTEaScv3oap-kAs0mlRSRGsmqEZYUN0EafHzIWjJgS0%3D)]
    allowedHosts: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
