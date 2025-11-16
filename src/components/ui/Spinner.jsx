/**
 * Componente Spinner de carga
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {string} color - Color del spinner
 */
function Spinner({ size = 'md', color = 'emerald' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  const colors = {
    emerald: 'border-emerald-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
      />
    </div>
  );
}

export default Spinner;
