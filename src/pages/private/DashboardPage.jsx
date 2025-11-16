import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/auth.service';
import { subscribeToUserNatilleras, getNatilleraByCodigo, addMiembro } from '../../services/firestore.service';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [natilleras, setNatilleras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserNatilleras(user.uid, (natillerasData) => {
      setNatilleras(natillerasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleJoinNatillera = async (e) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      setJoinError('Ingresa un código de invitación');
      return;
    }

    setJoinLoading(true);
    setJoinError('');
    
    try {
      const natillera = await getNatilleraByCodigo(joinCode.toUpperCase().trim());
      
      if (!natillera) {
        setJoinError('Código de invitación inválido');
        setJoinLoading(false);
        return;
      }

      await addMiembro(natillera.id, user.uid);
      setShowJoinModal(false);
      setJoinCode('');
      navigate(`/natillera/${natillera.id}`);
    } catch (err) {
      console.error('Error al unirse:', err);
      if (err.message.includes('Ya eres miembro')) {
        setJoinError('Ya eres miembro de esta natillera');
      } else {
        setJoinError('Error al unirse. Verifica el código.');
      }
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mis Natilleras
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {user?.displayName || user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/perfil">
                <Button variant="outline" size="sm">
                  Mi Perfil
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <Link to="/crear-natillera">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Crear Nueva Natillera
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sé el administrador de un nuevo grupo
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setShowJoinModal(true)}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Unirse a Natillera
                </h3>
                <p className="text-sm text-gray-600">
                  Ingresa el código de invitación
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Natilleras List */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Tus Natilleras
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : natilleras.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes natilleras aún
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera natillera o únete a una existente con un código de invitación
            </p>
            <Link to="/crear-natillera">
              <Button variant="primary">
                Crear Mi Primera Natillera
              </Button>
            </Link>
          </Card>
        ) : (
          /* Natilleras Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {natilleras.map((natillera) => (
              <Card key={natillera.id} className="hover:shadow-xl transition-shadow">
                <Link to={`/natillera/${natillera.id}`}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {natillera.nombre}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          natillera.rol === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {natillera.rol === 'admin' ? '👑 Admin' : '👤 Miembro'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cuota:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(natillera.montoCuota)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Periodicidad:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {natillera.periodicidad}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Miembros:</span>
                        <span className="font-medium text-gray-900">
                          {natillera.cantidadMiembros || 1}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {formatDate(natillera.fechaInicio, 'short')} - {formatDate(natillera.fechaFin, 'short')}
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Unirse a Natillera
              </h3>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                  setJoinError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleJoinNatillera} className="space-y-4">
              {joinError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {joinError}
                </div>
              )}

              <Input
                label="Código de invitación"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ej: A4T8YZ"
                required
                disabled={joinLoading}
                maxLength={6}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> El código de invitación es un código de 6 caracteres 
                  que te proporciona el administrador de la natillera.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setJoinError('');
                  }}
                  disabled={joinLoading}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={joinLoading} fullWidth>
                  {joinLoading ? <Spinner size="sm" color="white" /> : 'Unirse'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
