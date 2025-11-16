/**
 * Formatea un número como moneda colombiana (COP)
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado (ej: $50.000)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha a formato legible en español
 * @param {Date|Timestamp|string} date - Fecha a formatear
 * @param {string} format - 'short', 'long', 'relative'
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  // Convertir Timestamp de Firebase a Date si es necesario
  const dateObj = date?.toDate ? date.toDate() : new Date(date);
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  }
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }
  
  if (format === 'relative') {
    const now = new Date();
    const diffTime = now - dateObj;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }
  
  return dateObj.toLocaleDateString('es-CO');
};

/**
 * Genera un código de invitación único alfanumérico
 * @param {number} length - Longitud del código (default: 6)
 * @returns {string} - Código generado (ej: "A4T8YZ")
 */
export const generateInvitationCode = (length = 6) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos (I, O, 0, 1)
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Obtiene el nombre del mes en español
 * @param {string|number} input - Formato YYYY-MM o número del mes (1-12)
 * @returns {string} - Nombre del mes con año (ej: "Enero 2025") o solo mes
 */
export const getMonthName = (input) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Si es formato YYYY-MM
  if (typeof input === 'string' && input.includes('-')) {
    const [year, month] = input.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex]} ${year}`;
  }
  
  // Si es número de mes
  const monthNumber = typeof input === 'string' ? parseInt(input, 10) : input;
  return months[monthNumber - 1] || '';
};

/**
 * Calcula el total de días entre dos fechas
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {number} - Número de días
 */
export const getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string}
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
