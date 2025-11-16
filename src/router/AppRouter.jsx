import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Páginas públicas (las crearemos en la siguiente tarea)
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import JoinPage from '../pages/public/JoinPage';

// Páginas privadas (las crearemos más adelante)
import DashboardPage from '../pages/private/DashboardPage';
import CreateNatilleraPage from '../pages/private/CreateNatilleraPage';
import NatilleraDetailPage from '../pages/private/NatilleraDetailPage/NatilleraDetailPage';
import ProfilePage from '../pages/private/ProfilePage';

/**
 * Router principal de la aplicación
 * Define todas las rutas públicas y privadas
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unirse/:codigoInvitacion" element={<JoinPage />} />

        {/* Rutas privadas (protegidas) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-natillera"
          element={
            <ProtectedRoute>
              <CreateNatilleraPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/natillera/:natilleraId"
          element={
            <ProtectedRoute>
              <NatilleraDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto - redirige a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
