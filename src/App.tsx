import { Navigate, RouterProvider, createHashRouter } from 'react-router-dom';
import { Home } from './shell/Home';
import { PlayerSetup } from './shell/PlayerSetup';
import { GamePicker } from './shell/GamePicker';
import { PlayScreen } from './shell/PlayScreen';
import { ResultScreen } from './shell/ResultScreen';
import { Stats } from './shell/Stats';
import { Settings } from './shell/Settings';
import { PenaltyEditor } from './shell/PenaltyEditor';

// HashRouter — GitHub Pages 에서 새로고침 시 404 안 나게
const router = createHashRouter([
  { path: '/', element: <Home /> },
  { path: '/players', element: <PlayerSetup /> },
  { path: '/games', element: <GamePicker /> },
  { path: '/play/:gameId', element: <PlayScreen /> },
  { path: '/result', element: <ResultScreen /> },
  { path: '/stats', element: <Stats /> },
  { path: '/settings', element: <Settings /> },
  { path: '/settings/penalties', element: <PenaltyEditor /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
