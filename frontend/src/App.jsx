import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NicknamePage from './pages/NicknamePage';
import MainPage from './pages/MainPage';
import ChatRoomPage from './pages/ChatRoomPage';
import { useUserStore } from './store/useUserStore';
import './App.css';

function App() {
   const { nickname } = useUserStore();
   const location = useLocation();

   if (!nickname && location.pathname !== '/nickname') return <Navigate to="/nickname" replace />;

   if (nickname && location.pathname === '/nickname') return <Navigate to="/main" replace />;

   return (
    <Routes>
      <Route path="/nickname" element={<NicknamePage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/room/:roomId" element={<ChatRoomPage />} />
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}

export default App;
