import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserNatilleras, getUserAportes } from '../../services/firestore.service';
import { updateUserName } from '../../services/auth.service';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';

function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    natillerasCount: 0,
    totalAhorrado: 0,
    pagosConfirmados: 0
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const [natilleras, aportes] = await Promise.all([
          getUserNatilleras(user.uid),
          getUserAportes(user.uid)
        ]);

        const confirmedAportes = aportes.filter(a => a.estado === 'confirmado');
        const totalAhorrado = confirmedAportes.reduce((sum, a) => sum + a.monto, 0);

        setStats({
          natillerasCount: natilleras.length,
          totalAhorrado,
          pagosConfirmados: confirmedAportes.length
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const handleEditProfile = () => {
    setEditName(user?.displayName || '');
    setShowEditModal(true);
    setEditError('');
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    
    if (!editName.trim()) {
      setEditError('El nombre no puede estar vacío');
      return;
    }

    if (editName.trim().length < 3) {
      setEditError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      await updateUserName(user.uid, editName.trim());
      setShowEditModal(false);
      // El user se actualizará automáticamente por el listener de AuthContext
      window.location.reload(); // Recargar para ver cambios inmediatos
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      setEditError('Error al actualizar el nombre. Intenta de nuevo.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                ← Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mi Perfil
              </h1>
              <p className="text-sm text-gray-600">
                Gestiona tu información personal
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Profile Info */}
          <Card>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-emerald-600">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.displayName || 'Usuario'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditProfile}>
                Editar Perfil
              </Button>
            </div>
          </Card>

          {/* Account Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de la Cuenta
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <p className="text-gray-900">
                  {user?.displayName || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de autenticación
                </label>
                <p className="text-gray-900">
                  {user?.providerData?.[0]?.providerId === 'google.com' 
                    ? 'Google' 
                    : 'Email/Contraseña'}
                </p>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estadísticas
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats.natillerasCount}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Natilleras activas</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(stats.totalAhorrado)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total ahorrado</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.pagosConfirmados}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Pagos confirmados</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Edit Name Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Editar Nombre
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditName('');
                  setEditError('');
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={editLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              <Input
                label="Nombre completo"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
                disabled={editLoading}
                autoFocus
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Nota:</strong> Este nombre se mostrará en todas tus natilleras 
                  y será visible para otros miembros.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditName('');
                    setEditError('');
                  }}
                  disabled={editLoading}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={editLoading || !editName.trim()}
                  fullWidth
                >
                  {editLoading ? <Spinner size="sm" color="white" /> : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
