import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getNatilleraByCodigo, addMiembro } from '../../services/firestore.service';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

function JoinPage() {
  const { codigoInvitacion } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const natillera = await getNatilleraByCodigo(codigoInvitacion);
      
      if (!natillera) {
        setError('Código de invitación inválido');
        setLoading(false);
        return;
      }

      await addMiembro(natillera.id, user.uid);
      navigate(`/natillera/${natillera.id}`);
    } catch (err) {
      console.error('Error al unirse:', err);
      if (err.message.includes('Ya eres miembro')) {
        setError('Ya eres miembro de esta natillera');
      } else {
        setError('Error al unirse a la natillera. Intenta de nuevo.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Unirse a Natillera
          </h1>
          <p className="text-gray-600">
            Has sido invitado a unirte a un grupo
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Código de invitación:</p>
          <p className="text-2xl font-mono font-bold text-emerald-600 text-center">
            {codigoInvitacion}
          </p>
        </div>

        {!user ? (
          <div className="space-y-4">
            <p className="text-center text-gray-600 text-sm">
              Debes iniciar sesión para unirte a esta natillera
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Iniciar Sesión
              </Button>
            </Link>
            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Regístrate
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    ¿Qué sucede al unirte?
                  </p>
                  <ul className="text-sm text-emerald-700 mt-2 space-y-1">
                    <li>• Podrás ver el estado del grupo</li>
                    <li>• Reportar tus pagos</li>
                    <li>• Ver el historial de aportes</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" color="white" /> : 'Unirse a la Natillera'}
            </Button>

            <Link to="/dashboard">
              <Button variant="outline" fullWidth>
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default JoinPage;
