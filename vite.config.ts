import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages 프로젝트 사이트는 /저장소명/ 아래에서 서빙되므로 base 가
// 저장소명과 일치해야 한다. Cloudflare Pages·Netlify·Vercel 처럼 도메인
// 루트에서 서빙하는 곳에 올릴 땐 BASE_PATH=/ 를 주면 된다.
const base = process.env.BASE_PATH || '/hanjan-gak/';

export default defineConfig({
  base,
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
        start_url: base,
        scope: base,
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
