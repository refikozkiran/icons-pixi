import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages proje sayfaları https://<kullanici>.github.io/icons-pixi/ altında
  // yayınlanır; bu yüzden tüm asset yolları bu alt dizine göre üretilmeli.
  // Kendi domaininde (root'ta) yayınlayacaksan bunu '/' yap.
  base: '/icons-pixi/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
});
