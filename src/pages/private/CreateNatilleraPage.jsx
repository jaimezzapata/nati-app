import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createNatillera } from '../../services/firestore.service';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

function CreateNatilleraPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    montoCuota: '',
    periodicidad: 'mensual',
    fechaInicio: '',
    fechaFin: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.montoCuota || formData.montoCuota <= 0) {
      newErrors.montoCuota = 'El monto debe ser mayor a 0';
    }
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }
    
    if (formData.fechaInicio && formData.fechaFin) {
      if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const natilleraData = {
        nombre: formData.nombre.trim(),
        montoCuota: Number(formData.montoCuota),
        periodicidad: formData.periodicidad,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin
      };

      const natilleraId = await createNatillera(user.uid, natilleraData);
      navigate(`/natillera/${natilleraId}`);
    } catch (error) {
      console.error('Error al crear natillera:', error);
      setErrors({ general: 'Error al crear la natillera. Intenta de nuevo.' });
    } finally {
      setLoading(false);
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
                Crear Nueva Natillera
              </h1>
              <p className="text-sm text-gray-600">
                Configura tu grupo de ahorro
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información Básica
              </h2>
              <div className="space-y-4">
                <Input
                  label="Nombre de la natillera"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={errors.nombre}
                  placeholder="Ej: Natillera Familia Pérez 2025"
                  required
                  disabled={loading}
                />

                <Input
                  label="Monto de la cuota (COP)"
                  type="number"
                  name="montoCuota"
                  value={formData.montoCuota}
                  onChange={handleChange}
                  error={errors.montoCuota}
                  placeholder="50000"
                  required
                  disabled={loading}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periodicidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="periodicidad"
                    value={formData.periodicidad}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="quincenal">Quincenal</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Duración
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Fecha de inicio"
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  error={errors.fechaInicio}
                  required
                  disabled={loading}
                />

                <Input
                  label="Fecha de fin"
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  error={errors.fechaFin}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    Información importante
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Una vez creada la natillera, se generará un código de invitación único 
                    que podrás compartir con los miembros de tu grupo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link to="/dashboard">
                <Button variant="outline" type="button" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" color="white" /> : 'Crear Natillera'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default CreateNatilleraPage;
