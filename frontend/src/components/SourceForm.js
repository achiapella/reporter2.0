import React, { useState, useEffect } from 'react';
import FileDropZone from './FileDropZone';
import { uploadAPI } from '../services/api';

const SourceForm = ({ source, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'file',
    description: '',
    created_by: 'anonymous'
  });

  const [config, setConfig] = useState({
    file: { path: '', encoding: 'utf-8', format: '' },
    url: { url: '', method: 'GET', headers: {}, params: {}, auth: {} }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Cargar datos del source si estamos editando
  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name || '',
        type: source.type || 'file',
        description: source.description || '',
        created_by: source.created_by || 'anonymous'
      });
      
      const newConfig = { ...config };
      newConfig[source.type] = { ...config[source.type], ...source.config };
      setConfig(newConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Validar configuración según el tipo
    const currentConfig = config[formData.type];
    
    switch (formData.type) {
      case 'file':
        if (!currentConfig.path.trim()) {
          newErrors.path = 'La ruta del archivo es requerida';
        }
        break;
      case 'url':
        if (!currentConfig.url.trim()) {
          newErrors.url = 'La URL es requerida';
        } else if (!/^https?:\/\/.+/.test(currentConfig.url)) {
          newErrors.url = 'La URL debe comenzar con http:// o https://';
        }
        if (!currentConfig.method) {
          newErrors.method = 'El método HTTP es requerido';
        }
        break;
      default:
        break;
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
      const submitData = {
        ...formData,
        config: config[formData.type]
      };
      
      await onSubmit(submitData);
    } catch (err) {
      console.error('Error al enviar formulario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [formData.type]: {
        ...prev[formData.type],
        [field]: value
      }
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileUpload = async (file) => {
    setUploadLoading(true);
    try {
      const response = await uploadAPI.uploadSingle(file);
      const fileInfo = response.data;
      
      setUploadedFiles(prev => [...prev, fileInfo]);
      
      // Auto-llenar la ruta del archivo si estamos en modo file
      if (formData.type === 'file') {
        handleConfigChange('path', fileInfo.relativePath);
        // Auto-detectar formato basado en extensión
        const extension = fileInfo.originalName.split('.').pop().toLowerCase();
        handleConfigChange('format', extension);
      }
      
      // Auto-llenar nombre si está vacío
      if (!formData.name.trim()) {
        const nameWithoutExt = fileInfo.originalName.replace(/\.[^/.]+$/, "");
        handleInputChange('name', nameWithoutExt);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, upload: error.message }));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleHeadersChange = (value) => {
    try {
      const headers = value ? JSON.parse(value) : {};
      handleConfigChange('headers', headers);
      setErrors(prev => ({ ...prev, headers: null }));
    } catch (err) {
      setErrors(prev => ({ ...prev, headers: 'JSON inválido' }));
    }
  };

  const handleParamsChange = (value) => {
    try {
      const params = value ? JSON.parse(value) : {};
      handleConfigChange('params', params);
      setErrors(prev => ({ ...prev, params: null }));
    } catch (err) {
      setErrors(prev => ({ ...prev, params: 'JSON inválido' }));
    }
  };

  const handleAuthChange = (value) => {
    try {
      const auth = value ? JSON.parse(value) : {};
      handleConfigChange('auth', auth);
      setErrors(prev => ({ ...prev, auth: null }));
    } catch (err) {
      setErrors(prev => ({ ...prev, auth: 'JSON inválido' }));
    }
  };

  const currentConfig = config[formData.type];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          {source ? 'Editar Source' : 'Nuevo Source'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                placeholder="Nombre descriptivo del source"
              />
              {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                id="type"
                className="form-control"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="file">📄 Archivo</option>
                <option value="url">🌐 URL/Endpoint</option>
              </select>
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
                placeholder="Descripción opcional del source"
              />
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

          <div className="space-y-6">
            {/* Upload Zone para archivos */}
            {formData.type === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subir Archivo
                </label>
                <FileDropZone
                  onFileSelect={handleFileUpload}
                  accept={{
                    'text/*': ['.txt', '.csv', '.json', '.xml'],
                    'application/*': ['.json', '.xml', '.xlsx', '.pdf']
                  }}
                  maxSize={10485760} // 10MB
                />
                {uploadLoading && (
                  <div className="text-center mt-2 text-primary-600">
                    <div className="loading-spinner"></div>
                    Subiendo archivo...
                  </div>
                )}
                {errors.upload && (
                  <div className="text-red-600 text-sm mt-2">{errors.upload}</div>
                )}
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos subidos:</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-600">{file.originalName}</span>
                          <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Información del tipo seleccionado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Tipo: {formData.type === 'file' ? '📄 Archivo' : '🌐 URL/Endpoint'}
              </h4>
              <p className="text-sm text-blue-600">
                {formData.type === 'file' && 'Para archivos locales, remotos o subidos. Configura la ruta y formato.'}
                {formData.type === 'url' && 'Para URLs y endpoints. Configura URL, método, headers y parámetros.'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Configuración - {formData.type === 'file' ? '📄 Archivo' : '🌐 URL/Endpoint'}
          </h4>
          
          {formData.type === 'file' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-2">
                  Ruta del archivo *
                </label>
                <input
                  type="text"
                  id="path"
                  className={`form-control ${errors.path ? 'error' : ''}`}
                  value={currentConfig.path}
                  onChange={(e) => handleConfigChange('path', e.target.value)}
                  placeholder="/ruta/al/archivo.csv o usa drag & drop arriba"
                />
                {errors.path && <div className="text-red-600 text-sm mt-1">{errors.path}</div>}
              </div>
              
              <div>
                <label htmlFor="encoding" className="block text-sm font-medium text-gray-700 mb-2">
                  Codificación
                </label>
                <select
                  id="encoding"
                  className="form-control"
                  value={currentConfig.encoding}
                  onChange={(e) => handleConfigChange('encoding', e.target.value)}
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="latin1">Latin1</option>
                  <option value="ascii">ASCII</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                  Formato
                </label>
                <input
                  type="text"
                  id="format"
                  className="form-control"
                  value={currentConfig.format}
                  onChange={(e) => handleConfigChange('format', e.target.value)}
                  placeholder="csv, json, xml, etc."
                />
              </div>
            </div>
          )}

          {formData.type === 'url' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    id="url"
                    className={`form-control ${errors.url ? 'error' : ''}`}
                    value={currentConfig.url}
                    onChange={(e) => handleConfigChange('url', e.target.value)}
                    placeholder="https://api.ejemplo.com/datos"
                  />
                  {errors.url && <div className="text-red-600 text-sm mt-1">{errors.url}</div>}
                </div>
                
                <div>
                  <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                    Método HTTP *
                  </label>
                  <select
                    id="method"
                    className={`form-control ${errors.method ? 'error' : ''}`}
                    value={currentConfig.method}
                    onChange={(e) => handleConfigChange('method', e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                  {errors.method && <div className="text-red-600 text-sm mt-1">{errors.method}</div>}
                </div>
              </div>
              
              <div>
                <label htmlFor="headers" className="block text-sm font-medium text-gray-700 mb-2">
                  Headers (JSON)
                </label>
                <textarea
                  id="headers"
                  className={`form-control ${errors.headers ? 'error' : ''}`}
                  rows="4"
                  value={JSON.stringify(currentConfig.headers, null, 2)}
                  onChange={(e) => handleHeadersChange(e.target.value)}
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                />
                {errors.headers && <div className="text-red-600 text-sm mt-1">{errors.headers}</div>}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="params" className="block text-sm font-medium text-gray-700 mb-2">
                    Parámetros (JSON)
                  </label>
                  <textarea
                    id="params"
                    className={`form-control ${errors.params ? 'error' : ''}`}
                    rows="4"
                    value={JSON.stringify(currentConfig.params, null, 2)}
                    onChange={(e) => handleParamsChange(e.target.value)}
                    placeholder='{"page": 1, "limit": 100}'
                  />
                  {errors.params && <div className="text-red-600 text-sm mt-1">{errors.params}</div>}
                </div>
                
                <div>
                  <label htmlFor="auth" className="block text-sm font-medium text-gray-700 mb-2">
                    Autenticación (JSON)
                  </label>
                  <textarea
                    id="auth"
                    className={`form-control ${errors.auth ? 'error' : ''}`}
                    rows="4"
                    value={JSON.stringify(currentConfig.auth, null, 2)}
                    onChange={(e) => handleAuthChange(e.target.value)}
                    placeholder='{"type": "bearer", "token": "..."}'
                  />
                  {errors.auth && <div className="text-red-600 text-sm mt-1">{errors.auth}</div>}
                </div>
              </div>
            </div>
          )}
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
              source ? 'Actualizar Source' : 'Crear Source'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SourceForm;