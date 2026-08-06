import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 전역 스타일을 먼저 불러야 화면별 CSS가 뒤에 와서 이긴다.
// (.stage 의 display:flex 를 게임 화면이 grid 로 덮어쓰는 식)
import './styles/global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
