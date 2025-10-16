import React, { useState, useEffect } from 'react';
import { processorsAPI } from '../services/api';

const ProcessorsListMain = ({ processors = [], setProcessors, selectedProcessor, setSelectedProcessor, setEditingProcessor, setShowProcessorForm }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Asegurar que processors sea siempre un array
  const safeProcessors = Array.isArray(processors) ? processors : [];

  useEffect(() => {
    // La carga de procesadores se maneja desde App.js
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro que quieres eliminar este procesador?')) return;
    
    try {
      await processorsAPI.delete(id);
      setProcessors(safeProcessors.filter(p => p.id !== id));
      if (selectedProcessor && selectedProcessor.id === id) {
        setSelectedProcessor(null);
      }
    } catch (error) {
      console.error('Error eliminando procesador:', error);
    }
  };

  const filteredProcessors = safeProcessors.filter(processor => {
    const matchesSearch = processor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         processor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || processor.input_type === filterType;
    return matchesSearch && matchesType;
  });

  const getInputTypeLabel = (type) => {
    const types = {
      'file': '📄 Archivos',
      'url': '🌐 URLs',
      'any': '📋 Cualquier tipo'
    };
    return types[type] || type;
  };

  const getOutputFormatIcon = (format) => {
    const icons = {
      'json': '📊',
      'text': '📝',
      'csv': '📈',
      'xml': '🏷️'
    };
    return icons[format] || '📄';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando procesadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="search-input">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar procesadores..."
              className="form-input"
            />
            <svg className="search-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input form-select"
          >
            <option value="all">Todos los tipos</option>
            <option value="file">Archivos</option>
            <option value="url">URLs</option>
            <option value="any">Cualquier tipo</option>
          </select>
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowProcessorForm(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Procesador
          </button>
        </div>
      </div>

      {/* Lista de procesadores */}
      {filteredProcessors.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-state-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="empty-state-title">
            {safeProcessors.length === 0 ? 'No hay procesadores' : 'No se encontraron procesadores'}
          </h3>
          <p className="empty-state-description">
            {safeProcessors.length === 0 
              ? 'Crea tu primer procesador para comenzar a procesar datos'
              : 'Intenta cambiar los filtros de búsqueda'
            }
          </p>
          {safeProcessors.length === 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowProcessorForm(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Primer Procesador
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 fade-in">
          {filteredProcessors.map((processor) => (
            <div 
              key={processor.id} 
              className={`card cursor-pointer ${
                selectedProcessor && selectedProcessor.id === processor.id
                  ? 'card-selected'
                  : ''
              }`}
              onClick={() => setSelectedProcessor(processor)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`processor-type ${processor.input_type} inline-block`}>
                        {getInputTypeLabel(processor.input_type)}
                      </div>
                      <span className="text-xl" title={`Salida: ${processor.output_format}`}>
                        {getOutputFormatIcon(processor.output_format)}
                      </span>
                      {processor.last_executed_at && (
                        <span className="badge badge-success">
                          ✓ Ejecutado
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {processor.name}
                    </h3>
                    
                    {processor.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {processor.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Por {processor.created_by}</span>
                      <span>•</span>
                      <span>{new Date(processor.created_at).toLocaleDateString('es-ES')}</span>
                      {processor.last_executed_at && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8" />
                            </svg>
                            Último: {new Date(processor.last_executed_at).toLocaleDateString('es-ES')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button 
                      className="btn btn-secondary btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProcessor(processor);
                        setShowProcessorForm(true);
                      }}
                      title="Editar procesador"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(processor.id);
                      }}
                      title="Eliminar procesador"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessorsListMain;