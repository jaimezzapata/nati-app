import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateAporteEstado } from '../../services/firestore.service';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { useAlert } from '../../hooks/useModal.jsx';

function AdminView({ natillera, members, aportes, totalAhorrado }) {
  const navigate = useNavigate();
  const { showAlert, AlertComponent } = useAlert();
  const [processingId, setProcessingId] = useState(null);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAporteId, setRejectAporteId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingAportes = aportes.filter(a => a.estado === 'pendiente');
  const confirmedAportes = aportes.filter(a => a.estado === 'confirmado');
  const rejectedAportes = aportes.filter(a => a.estado === 'rechazado');

  const handleConfirmAporte = async (aporteId) => {
    setProcessingId(aporteId);
    try {
      await updateAporteEstado(aporteId, 'confirmado');
      showAlert({
        title: '¡Pago confirmado!',
        message: 'El aporte ha sido confirmado exitosamente',
        type: 'success'
      });
    } catch (error) {
      console.error('Error al confirmar aporte:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo confirmar el pago. Intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectAporte = async (aporteId) => {
    setRejectAporteId(aporteId);
    setShowRejectModal(true);
  };

  const confirmRejectAporte = async () => {
    if (!rejectReason.trim()) {
      showAlert({
        title: 'Motivo requerido',
        message: 'Por favor ingresa el motivo del rechazo',
        type: 'warning'
      });
      return;
    }

    if (rejectReason.trim().length < 10) {
      showAlert({
        title: 'Motivo muy corto',
        message: 'El motivo debe tener al menos 10 caracteres',
        type: 'warning'
      });
      return;
    }

    setProcessingId(rejectAporteId);
    try {
      await updateAporteEstado(rejectAporteId, 'rechazado', rejectReason.trim());
      setShowRejectModal(false);
      setRejectAporteId(null);
      setRejectReason('');
      showAlert({
        title: 'Pago rechazado',
        message: 'El aporte ha sido rechazado y el socio será notificado',
        type: 'success'
      });
    } catch (error) {
      console.error('Error al rechazar aporte:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo rechazar el pago. Intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getUserName = (userId) => {
    const member = members.find(m => m.userId === userId);
    return member?.nombre || member?.email || 'Usuario';
  };

  const copyInviteCode = () => {
    const url = `${window.location.origin}/unirse/${natillera.codigoInvitacion}`;
    navigator.clipboard.writeText(url);
    showAlert({
      title: '¡Copiado!',
      message: 'El enlace de invitación se ha copiado al portapapeles',
      type: 'success'
    });
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
      {/* Invite Code Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Código de Invitación
            </h2>
            <p className="text-sm text-gray-600">
              Comparte este código con nuevos miembros
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowInviteCode(!showInviteCode)}>
            {showInviteCode ? 'Ocultar' : 'Mostrar'} Código
          </Button>
        </div>

        {showInviteCode && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Código:</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono font-bold text-purple-600 flex-1">
                {natillera.codigoInvitacion}
              </code>
              <Button variant="primary" size="sm" onClick={copyInviteCode}>
                📋 Copiar Enlace
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {window.location.origin}/unirse/{natillera.codigoInvitacion}
            </p>
          </div>
        )}
      </Card>

      {/* Botón de Reportes */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              📊 Reportes y Estadísticas
            </h2>
            <p className="text-sm text-gray-600">
              Genera reportes detallados y exporta datos a PDF, Excel o CSV
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => navigate(`/reportes/${natillera.id}`)}
          >
            Ver Reportes
          </Button>
        </div>
      </Card>

      {/* Pending Payments */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pagos Pendientes de Confirmación ({pendingAportes.length})
        </h2>
        
        {pendingAportes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No hay pagos pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAportes.map((aporte) => (
              <div
                key={aporte.id}
                className="flex items-center justify-between p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">
                      {getUserName(aporte.userId)}
                    </p>
                    <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">
                      ⏳ Pendiente
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    {getMonthName(aporte.mesCuota)} - {formatCurrency(aporte.monto)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Reportado: {formatDate(aporte.fechaReporte, 'short')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRejectAporte(aporte.id)}
                    disabled={processingId === aporte.id}
                  >
                    ✗ Rechazar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfirmAporte(aporte.id)}
                    disabled={processingId === aporte.id}
                  >
                    ✓ Confirmar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmed Payments */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Historial de Pagos Confirmados ({confirmedAportes.length})
        </h2>
        
        {confirmedAportes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No hay pagos confirmados aún</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {confirmedAportes
              .sort((a, b) => new Date(b.fechaConfirmacion) - new Date(a.fechaConfirmacion))
              .map((aporte) => (
                <div
                  key={aporte.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        {getUserName(aporte.userId)}
                      </p>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                        ✓ Confirmado
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {getMonthName(aporte.mesCuota)} - {formatCurrency(aporte.monto)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Confirmado: {formatDate(aporte.fechaConfirmacion, 'short')}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Rejected Payments */}
      {rejectedAportes.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pagos Rechazados ({rejectedAportes.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rejectedAportes
              .sort((a, b) => new Date(b.fechaRechazo || b.fechaReporte) - new Date(a.fechaRechazo || a.fechaReporte))
              .map((aporte) => (
                <div
                  key={aporte.id}
                  className="p-4 border-2 border-red-200 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {getUserName(aporte.userId)}
                        </p>
                        <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-medium">
                          ✗ Rechazado
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        {getMonthName(aporte.mesCuota)} - {formatCurrency(aporte.monto)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Rechazado: {formatDate(aporte.fechaRechazo || aporte.fechaReporte, 'short')}
                      </p>
                    </div>
                  </div>
                  {aporte.motivoRechazo && (
                    <div className="mt-3 pt-3 border-t border-red-300">
                      <p className="text-xs font-medium text-red-900 mb-1">
                        Motivo del rechazo:
                      </p>
                      <p className="text-sm text-red-800">
                        {aporte.motivoRechazo}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Members Management */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Miembros del Grupo ({members.length})
        </h2>
        <div className="space-y-3">
          {members.map((member) => {
            const memberAportes = aportes.filter(a => a.userId === member.userId);
            const confirmedCount = memberAportes.filter(a => a.estado === 'confirmado').length;
            const pendingCount = memberAportes.filter(a => a.estado === 'pendiente').length;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {member.nombre?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{member.nombre || member.email}</p>
                      {member.rol === 'admin' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          👑 Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {confirmedCount} confirmados
                  </p>
                  {pendingCount > 0 && (
                    <p className="text-xs text-yellow-600">
                      {pendingCount} pendientes
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Rechazar Pago
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectAporteId(null);
                  setRejectReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900">
                  <strong>⚠️ Importante:</strong> Al rechazar este pago, el miembro 
                  será notificado del motivo del rechazo.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ej: El monto transferido no coincide con la cuota, falta comprobante de pago, etc."
                  rows={4}
                  required
                  disabled={processingId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 10 caracteres
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectAporteId(null);
                    setRejectReason('');
                  }}
                  disabled={processingId}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button 
                  type="button"
                  variant="danger" 
                  onClick={confirmRejectAporte}
                  disabled={processingId || rejectReason.trim().length < 10}
                  fullWidth
                >
                  {processingId ? 'Rechazando...' : 'Rechazar Pago'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {AlertComponent}
    </div>
  );
}

export default AdminView;
