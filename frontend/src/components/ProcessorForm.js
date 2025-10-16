import React, { useState, useEffect } from 'react';

const ProcessorForm = ({ processor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    python_code: '',
    input_type: 'any',
    output_format: 'json',
    created_by: 'anonymous'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del procesador si estamos editando
  useEffect(() => {
    if (processor) {
      setFormData({
        name: processor.name || '',
        description: processor.description || '',
        python_code: processor.python_code || '',
        input_type: processor.input_type || 'any',
        output_format: processor.output_format || 'json',
        created_by: processor.created_by || 'anonymous'
      });
    }
  }, [processor]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.python_code.trim()) {
      newErrors.python_code = 'El código Python es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error al enviar formulario:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPythonCodeTemplate = () => {
    return `# Procesador de datos
# El source está disponible en la variable 'source'
# Retorna el resultado usando 'return'

def process(source):
    """
    Procesa un source y retorna el resultado
    
    Args:
        source: Objeto con la información del source
                - source['type']: 'file' o 'url'
                - source['config']: configuración del source
                - source['data']: datos del source (si aplica)
    
    Returns:
        Resultado procesado
    """
    
    # Ejemplo: procesar archivo CSV
    if source['type'] == 'file':
        # Aquí puedes procesar el contenido del archivo
        return {"message": "Archivo procesado", "type": source['type']}
    
    # Ejemplo: procesar respuesta de URL
    elif source['type'] == 'url':
        # Aquí puedes procesar la respuesta de la URL
        return {"message": "URL procesada", "type": source['type']}
    
    else:
        return {"error": "Tipo de source no soportado"}

# Llamar a la función de procesamiento
result = process(source)
return result`;
  };

  const insertTemplate = () => {
    if (!formData.python_code.trim()) {
      setFormData(prev => ({
        ...prev,
        python_code: getPythonCodeTemplate()
      }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {processor ? 'Editar Procesador' : 'Nuevo Procesador'}
        </h2>
        <button 
          className="btn btn-secondary btn-small"
          onClick={onCancel}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nombre descriptivo del procesador"
              />
              {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción del procesador y su función"
              />
            </div>

            <div>
              <label htmlFor="input_type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entrada *
              </label>
              <select
                id="input_type"
                className="form-control"
                value={formData.input_type}
                onChange={(e) => handleInputChange('input_type', e.target.value)}
              >
                <option value="any">📋 Cualquier tipo</option>
                <option value="file">📄 Solo archivos</option>
                <option value="url">🌐 Solo URLs</option>
              </select>
            </div>

            <div>
              <label htmlFor="output_format" className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Salida
              </label>
              <select
                id="output_format"
                className="form-control"
                value={formData.output_format}
                onChange={(e) => handleInputChange('output_format', e.target.value)}
              >
                <option value="json">📊 JSON</option>
                <option value="text">📝 Texto</option>
                <option value="csv">📈 CSV</option>
                <option value="xml">🏷️ XML</option>
              </select>
            </div>

            <div>
              <label htmlFor="created_by" className="block text-sm font-medium text-gray-700 mb-2">
                Creado por
              </label>
              <input
                type="text"
                id="created_by"
                className="form-control"
                value={formData.created_by}
                onChange={(e) => handleInputChange('created_by', e.target.value)}
                placeholder="Nombre del usuario"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Información del tipo seleccionado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Entrada: {formData.input_type === 'file' ? '📄 Archivos' : formData.input_type === 'url' ? '🌐 URLs' : '📋 Cualquier tipo'}
              </h4>
              <p className="text-sm text-blue-600">
                {formData.input_type === 'file' && 'Este procesador trabajará solo con fuentes de tipo archivo.'}
                {formData.input_type === 'url' && 'Este procesador trabajará solo con fuentes de tipo URL/endpoint.'}
                {formData.input_type === 'any' && 'Este procesador puede trabajar con cualquier tipo de fuente.'}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                Salida: {formData.output_format === 'json' ? '📊 JSON' : formData.output_format === 'csv' ? '📈 CSV' : formData.output_format === 'xml' ? '🏷️ XML' : '📝 Texto'}
              </h4>
              <p className="text-sm text-green-600">
                Los resultados se formatearán como {formData.output_format.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Código Python *
            </h4>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={insertTemplate}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Insertar Template
            </button>
          </div>
          
          <div>
            <textarea
              id="python_code"
              className={`form-control font-mono text-sm ${errors.python_code ? 'error' : ''}`}
              rows="20"
              value={formData.python_code}
              onChange={(e) => handleInputChange('python_code', e.target.value)}
              placeholder="Escribe aquí tu código Python..."
            />
            {errors.python_code && <div className="text-red-600 text-sm mt-1">{errors.python_code}</div>}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Importante:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>El objeto <code>source</code> estará disponible con toda la información de la fuente</li>
              <li>Usa <code>return</code> para devolver el resultado procesado</li>
              <li>El código debe ser Python válido</li>
              <li>Puedes usar librerías estándar como json, csv, requests, etc.</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Guardando...
              </>
            ) : (
              processor ? 'Actualizar Procesador' : 'Crear Procesador'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcessorForm;