/**
 * Componente Button reutilizable con variantes
 * @param {string} variant - 'primary', 'secondary', 'outline', 'danger'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {boolean} fullWidth - Si el botón debe ocupar todo el ancho
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {function} onClick - Función a ejecutar al hacer clic
 * @param {string} type - Tipo de botón ('button', 'submit', 'reset')
 */
function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-white text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    google: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 flex items-center justify-center gap-2'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
