import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  getNatillera, 
  getUserRole,
  getNatilleraMembers,
  getTotalAhorrado,
  subscribeToNatilleraAportes
} from '../../services/firestore.service';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import MemberView from '../../components/natillera/MemberView';
import AdminView from '../../components/natillera/AdminView';

function NatilleraDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [natillera, setNatillera] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [totalAhorrado, setTotalAhorrado] = useState(0);
  const [totalAhorradoUsuario, setTotalAhorradoUsuario] = useState(0);
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) return;

    const loadData = async () => {
      try {
        const [natilleraData, role, membersData, total] = await Promise.all([
          getNatillera(id),
          getUserRole(id, user.uid),
          getNatilleraMembers(id),
          getTotalAhorrado(id)
        ]);

        if (!natilleraData) {
          setError('Natillera no encontrada');
          setLoading(false);
          return;
        }

        if (!role) {
          setError('No tienes acceso a esta natillera');
          setLoading(false);
          return;
        }

        setNatillera(natilleraData);
        setUserRole(role);
        setMembers(membersData);
        setTotalAhorrado(total);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar natillera:', err);
        setError('Error al cargar la información');
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates for aportes
    const unsubscribe = subscribeToNatilleraAportes(id, (aportesData) => {
      setAportes(aportesData);
      // Recalculate totals when aportes change
      getTotalAhorrado(id).then(setTotalAhorrado);
      
      // Calculate user's individual total (only confirmados)
      const userTotal = aportesData
        .filter(a => a.userId === user.uid && a.estado === 'confirmado')
        .reduce((sum, a) => sum + a.monto, 0);
      setTotalAhorradoUsuario(userTotal);
    });

    return () => unsubscribe();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !natillera) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">
            No tienes acceso a esta natillera o no existe
          </p>
          <Link to="/dashboard">
            <Button variant="primary">
              Volver al Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  ← Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {natillera.nombre}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    userRole === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userRole === 'admin' ? '👑 Administrador' : '👤 Miembro'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {members.length} miembros
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {userRole === 'admin' ? 'Total Natillera' : 'Total Natillera'}
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalAhorrado)}
              </p>
              {userRole === 'miembro' && (
                <>
                  <p className="text-xs text-gray-500 mt-2">Tu Total</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(totalAhorradoUsuario)}
                  </p>
                </>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Cuota</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(natillera.montoCuota)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Periodicidad</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {natillera.periodicidad}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Duración</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(natillera.fechaInicio, 'short')}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(natillera.fechaFin, 'short')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === 'admin' ? (
          <AdminView 
            natillera={natillera} 
            members={members}
            aportes={aportes}
            totalAhorrado={totalAhorrado}
          />
        ) : (
          <MemberView 
            natillera={natillera}
            members={members}
            aportes={aportes}
            userId={user.uid}
            totalAhorradoUsuario={totalAhorradoUsuario}
            totalAhorradoNatillera={totalAhorrado}
          />
        )}
      </main>
    </div>
  );
}

export default NatilleraDetailPage;
