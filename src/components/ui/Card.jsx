/**
 * Componente Card reutilizable
 * @param {string} padding - Tamaño del padding
 * @param {boolean} shadow - Si la card debe tener sombra
 */
function Card({ 
  children, 
  padding = 'md', 
  shadow = true,
  className = '',
  ...props 
}) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClass = shadow ? 'shadow-lg' : '';
  
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 ${paddings[padding]} ${shadowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
