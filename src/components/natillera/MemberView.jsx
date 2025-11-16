import { useState } from 'react';
import { createAporte, getUserAportes } from '../../services/firestore.service';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

function MemberView({ natillera, members, aportes, userId, totalAhorradoUsuario, totalAhorradoNatillera }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    mesCuota: '',
    monto: natillera.montoCuota
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter user's own aportes
  const myAportes = aportes.filter(aporte => aporte.userId === userId);

  const handleReportPago = async (e) => {
    e.preventDefault();
    
    if (!reportData.mesCuota) {
      setError('Selecciona el mes de la cuota');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createAporte({
        natilleraId: natillera.id,
        userId: userId,
        monto: Number(reportData.monto),
        mesCuota: reportData.mesCuota
      });

      setShowReportModal(false);
      setReportData({ mesCuota: '', monto: natillera.montoCuota });
    } catch (err) {
      console.error('Error al reportar pago:', err);
      setError('Error al reportar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen de aportes del usuario */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-sm text-gray-600 mb-1">💰 Mi Total Ahorrado</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(totalAhorradoUsuario || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {myAportes.filter(a => a.estado === 'confirmado').length} aportes confirmados
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50">
          <p className="text-sm text-gray-600 mb-1">🏆 Total de la Natillera</p>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(totalAhorradoNatillera || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Aportes de {members.length} miembros
          </p>
        </Card>
      </div>

      {/* Report Payment Button */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Reportar Pago
            </h2>
            <p className="text-sm text-gray-600">
              Informa cuando hayas realizado tu cuota mensual
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowReportModal(true)}>
            💰 Reportar Pago
          </Button>
        </div>
      </Card>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Reportar Pago
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReportPago} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes de la cuota <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  value={reportData.mesCuota}
                  onChange={(e) => setReportData({ ...reportData, mesCuota: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <Input
                label="Monto pagado (COP)"
                type="number"
                value={reportData.monto}
                onChange={(e) => setReportData({ ...reportData, monto: e.target.value })}
                required
                disabled={loading}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Importante:</strong> El administrador debe confirmar tu pago 
                  después de verificar que se haya realizado la transferencia.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
                  disabled={loading}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={loading} fullWidth>
                  {loading ? 'Reportando...' : 'Reportar Pago'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* My Payments History */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Mis Pagos
        </h2>
        {myAportes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No has reportado pagos aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAportes.map((aporte) => (
              <div
                key={aporte.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {getMonthName(aporte.mesCuota)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(aporte.monto)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reportado: {formatDate(aporte.fechaReporte, 'short')}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(aporte.estado)}`}>
                      {aporte.estado === 'confirmado' ? '✓ Confirmado' : 
                       aporte.estado === 'pendiente' ? '⏳ Pendiente' : '✗ Rechazado'}
                    </span>
                  </div>
                </div>
                {aporte.estado === 'rechazado' && aporte.motivoRechazo && (
                  <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 -m-4 mt-2 p-4 rounded-b-lg">
                    <p className="text-xs font-medium text-red-900 mb-1">
                      Motivo del rechazo:
                    </p>
                    <p className="text-sm text-red-700">
                      {aporte.motivoRechazo}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Members List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Miembros ({members.length})
        </h2>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold">
                    {member.nombre?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.nombre || member.email}</p>
                  <p className="text-xs text-gray-600">{member.email}</p>
                </div>
              </div>
              {member.rol === 'admin' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  👑 Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default MemberView;
