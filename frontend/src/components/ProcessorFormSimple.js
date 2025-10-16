import React, { useState, useEffect } from 'react';
import { sourcesAPI, processorsAPI } from '../services/api';

const ProcessorFormSimple = ({ onSubmit, onCancel, processor = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    input_source: ''
  });
  const [sources, setSources] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInputOptions();
    
    // Si estamos editando, cargar los datos del procesador
    if (processor) {
      setFormData({
        name: processor.name || '',
        description: processor.description || '',
        input_source: processor.input_source || ''
      });
    }
  }, [processor]);

  const loadInputOptions = async () => {
    try {
      // Cargar sources
      const sourcesResponse = await sourcesAPI.getAll();
      if (sourcesResponse.success) {
        setSources(sourcesResponse.data);
      }

      // Cargar procesadores existentes
      const processorsResponse = await processorsAPI.getAll();
      if (processorsResponse.success) {
        setProcessors(processorsResponse.data);
      }
    } catch (error) {
      console.error('Error al cargar opciones de entrada:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.input_source) {
      newErrors.input_source = 'Debe seleccionar una fuente de entrada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar procesador:', error);
      setErrors({ submit: 'Error al guardar el procesador' });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputSourceDisplayName = (sourceId) => {
    // Buscar en sources
    const source = sources.find(s => s.id.toString() === sourceId);
    if (source) {
      return `📁 ${source.name} (Source)`;
    }
    
    // Buscar en procesadores
    const proc = processors.find(p => p.id.toString() === sourceId);
    if (proc) {
      return `⚙️ ${proc.name} (Procesador)`;
    }
    
    return 'Fuente desconocida';
  };

  return (
    <div className="processor-form-container">
      <div className="form-header">
        <h2>{processor ? 'Editar Procesador' : 'Nuevo Procesador'}</h2>
        <p className="form-description">
          Los procesadores toman datos de una fuente (source) o de otro procesador y los transforman.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="processor-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Procesador *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Analizador de Texto, Extractor de URLs..."
            className={errors.name ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="input_source">Fuente de Entrada *</label>
          <select
            id="input_source"
            name="input_source"
            value={formData.input_source}
            onChange={handleChange}
            className={errors.input_source ? 'error' : ''}
            disabled={isLoading}
          >
            <option value="">Seleccionar fuente de entrada...</option>
            
            {sources.length > 0 && (
              <optgroup label="📁 Sources (Fuentes de Datos)">
                {sources.map(source => (
                  <option key={`source-${source.id}`} value={source.id}>
                    {source.name} - {source.type}
                  </option>
                ))}
              </optgroup>
            )}
            
            {processors.length > 0 && (
              <optgroup label="⚙️ Procesadores (Salidas de otros procesadores)">
                {processors.filter(p => p.id !== processor?.id).map(proc => (
                  <option key={`processor-${proc.id}`} value={proc.id}>
                    {proc.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {errors.input_source && <span className="error-message">{errors.input_source}</span>}
          <small className="help-text">
            Selecciona la fuente de datos que alimentará este procesador
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe qué hace este procesador y qué tipo de transformación realiza..."
            rows="4"
            className={errors.description ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {formData.input_source && (
          <div className="input-preview">
            <h4>Vista Previa de la Configuración</h4>
            <div className="preview-card">
              <p><strong>Procesador:</strong> {formData.name || 'Sin nombre'}</p>
              <p><strong>Entrada:</strong> {getInputSourceDisplayName(formData.input_source)}</p>
              <p><strong>Descripción:</strong> {formData.description || 'Sin descripción'}</p>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="error-message global-error">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : (processor ? 'Actualizar' : 'Crear Procesador')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcessorFormSimple;