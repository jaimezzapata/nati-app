import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getReportData,
  exportToPDF,
  exportToExcel,
  exportToCSV,
  getAvailableMonths
} from '../../services/reports.service';
import {
  getNatillera,
  getNatilleraMembers,
  getUserRole
} from '../../services/firestore.service';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';
import { useAlert } from '../../hooks/useModal.jsx';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function ReportsPage() {
  const { natilleraId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert, AlertComponent } = useAlert();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [natillera, setNatillera] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    userId: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    mesCuota: ''
  });

  useEffect(() => {
    loadInitialData();
  }, [natilleraId, user]);

  useEffect(() => {
    if (natillera) {
      loadReportData();
    }
  }, [filters, natillera]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Verificar rol del usuario
      const role = await getUserRole(natilleraId, user.uid);
      setUserRole(role);

      // Solo admin puede ver reportes
      if (role !== 'admin') {
        navigate(`/natillera/${natilleraId}`);
        return;
      }

      const [natilleraData, miembrosData, meses] = await Promise.all([
        getNatillera(natilleraId),
        getNatilleraMembers(natilleraId),
        getAvailableMonths(natilleraId)
      ]);

      setNatillera(natilleraData);
      setMiembros(miembrosData);
      setMesesDisponibles(meses);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      const data = await getReportData(natilleraId, filters);
      setReportData(data);
    } catch (error) {
      console.error('Error al cargar datos del reporte:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      estado: '',
      fechaInicio: '',
      fechaFin: '',
      mesCuota: ''
    });
  };

  const handleExport = async (format) => {
    if (!reportData) return;

    try {
      setExporting(true);

      switch (format) {
        case 'pdf':
          await exportToPDF(reportData, filters);
          showAlert({
            title: '¡Exportación exitosa!',
            message: 'El reporte en PDF se ha descargado correctamente.',
            type: 'success'
          });
          break;
        case 'excel':
          await exportToExcel(reportData, filters);
          showAlert({
            title: '¡Exportación exitosa!',
            message: 'El reporte en Excel se ha descargado correctamente.',
            type: 'success'
          });
          break;
        case 'csv':
          await exportToCSV(reportData);
          showAlert({
            title: '¡Exportación exitosa!',
            message: 'El reporte en CSV se ha descargado correctamente.',
            type: 'success'
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      showAlert({
        title: 'Error al exportar',
        message: 'No se pudo exportar el reporte. Por favor, intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!natillera || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No se pudo cargar el reporte</p>
      </div>
    );
  }

  const { estadisticas, aportes } = reportData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/natillera/${natilleraId}`)}
            className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center"
          >
            ← Volver a la natillera
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">{natillera.nombre}</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Filtro por socio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Socio
              </label>
              <select
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Todos los socios</option>
                {miembros.map(miembro => (
                  <option key={miembro.userId} value={miembro.userId}>
                    {miembro.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            {/* Filtro por mes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes de Cuota
              </label>
              <select
                value={filters.mesCuota}
                onChange={(e) => handleFilterChange('mesCuota', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Todos los meses</option>
                {mesesDisponibles.map(mes => (
                  <option key={mes} value={mes}>
                    {getMonthName(mes)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Filtro fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.fechaFin}
                onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50">
            <p className="text-sm text-gray-600 mb-1">Total Aportes</p>
            <p className="text-3xl font-bold text-emerald-600">
              {estadisticas.totalAportes}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <p className="text-sm text-gray-600 mb-1">Confirmados</p>
            <p className="text-3xl font-bold text-green-600">
              {estadisticas.totalConfirmados}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(estadisticas.montoTotal)}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">
              {estadisticas.totalPendientes}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(estadisticas.montoPendiente)}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50">
            <p className="text-sm text-gray-600 mb-1">Rechazados</p>
            <p className="text-3xl font-bold text-red-600">
              {estadisticas.totalRechazados}
            </p>
          </Card>
        </div>

        {/* Gráficos estadísticos */}
        {reportData.aportes.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Análisis Visual</h2>
            
            {/* Grid de gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de distribución por estado */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Distribución por Estado
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Confirmados', value: estadisticas.totalConfirmados, color: '#10b981' },
                        { name: 'Pendientes', value: estadisticas.totalPendientes, color: '#f59e0b' },
                        { name: 'Rechazados', value: estadisticas.totalRechazados, color: '#ef4444' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Confirmados', value: estadisticas.totalConfirmados, color: '#10b981' },
                        { name: 'Pendientes', value: estadisticas.totalPendientes, color: '#f59e0b' },
                        { name: 'Rechazados', value: estadisticas.totalRechazados, color: '#ef4444' }
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de aportes por socio */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Aportes Confirmados por Socio
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={estadisticas.porSocio}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="nombre" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Bar dataKey="totalConfirmado" fill="#10b981" name="Total Confirmado" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de evolución mensual (solo si hay filtro de mes o rango de fechas) */}
            {(filters.mesCuota || (filters.fechaInicio && filters.fechaFin)) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Evolución por Estado
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: filters.mesCuota || 'Período Seleccionado',
                        Confirmados: estadisticas.totalConfirmados,
                        Pendientes: estadisticas.totalPendientes,
                        Rechazados: estadisticas.totalRechazados
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Confirmados" fill="#10b981" />
                    <Bar dataKey="Pendientes" fill="#f59e0b" />
                    <Bar dataKey="Rechazados" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        )}

        {/* Botones de exportación */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exportar Reporte</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => handleExport('pdf')}
              disabled={exporting || aportes.length === 0}
            >
              {exporting ? <Spinner size="sm" color="white" /> : '📄 Exportar a PDF'}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleExport('excel')}
              disabled={exporting || aportes.length === 0}
            >
              {exporting ? <Spinner size="sm" color="white" /> : '📊 Exportar a Excel'}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleExport('csv')}
              disabled={exporting || aportes.length === 0}
            >
              {exporting ? <Spinner size="sm" color="white" /> : '📋 Exportar a CSV'}
            </Button>
          </div>
          {aportes.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No hay datos para exportar con los filtros actuales
            </p>
          )}
        </Card>

        {/* Estadísticas por socio */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas por Socio</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendientes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rechazados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Confirmado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Pendiente
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estadisticas.porSocio.map((socio, index) => (
                  <tr key={socio.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {socio.nombre}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {socio.totalAportes}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                      {socio.confirmados}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600">
                      {socio.pendientes}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                      {socio.rechazados}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(socio.montoTotal)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(socio.montoPendiente)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detalle de aportes */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detalle de Aportes ({aportes.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aportes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No hay aportes que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  aportes.map((aporte, index) => (
                    <tr key={aporte.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {aporte.nombreUsuario}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {getMonthName(aporte.mesCuota)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(aporte.monto)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(aporte.fechaPago?.toDate?.() || aporte.fechaPago)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            aporte.estado === 'confirmado'
                              ? 'bg-green-100 text-green-800'
                              : aporte.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {aporte.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {aporte.motivoRechazo || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {AlertComponent}
    </div>
  );
}

export default ReportsPage;
