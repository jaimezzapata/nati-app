/**
 * Componente Input reutilizable
 * @param {string} label - Etiqueta del input
 * @param {string} type - Tipo de input
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Si el campo es requerido
 */
function Input({ 
  label, 
  type = 'text', 
  error, 
  required = false,
  className = '',
  ...props 
}) {
  const inputId = props.id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`
          w-full px-4 py-2 
          border rounded-lg 
          text-gray-900 
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export default Input;
