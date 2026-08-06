import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base 는 저장소명과 반드시 일치해야 한다 (GitHub Pages).
export default defineConfig({
  base: '/hanjankak/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '한잔각',
        short_name: '한잔각',
        description: '인원수만 입력하면 바로 시작하는 술자리 랜덤 벌칙 미니게임 모음',
        lang: 'ko',
        start_url: '/hanjankak/',
        scope: '/hanjankak/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B1020',
        theme_color: '#0B1020',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
  },
});
