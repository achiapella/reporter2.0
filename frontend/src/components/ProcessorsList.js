import React, { useState } from 'react';
import { processorsAPI } from '../services/api';

const ProcessorsList = ({ processor, onEdit, onDelete, onClose }) => {
  const [executionResult, setExecutionResult] = useState(null);
  const [executing, setExecuting] = useState(false);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES');
  };

  const handleExecute = async (sourceId) => {
    if (!sourceId) return;
    
    setExecuting(true);
    try {
      const result = await processorsAPI.execute(processor.id, sourceId);
      setExecutionResult(result.result);
    } catch (error) {
      setExecutionResult({
        status: 'Error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setExecuting(false);
    }
  };

  if (!processor) {
    return (
      <div className="text-center py-24 text-gray-500">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Selecciona un procesador para ver detalles</h3>
        <p className="text-gray-500">O crea uno nuevo para comenzar</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInputTypeLabel = (type) => {
    const types = {
      'file': '📄 Archivos',
      'url': '🌐 URLs',
      'any': '📋 Cualquier tipo'
    };
    return types[type] || type;
  };

  const getOutputFormatLabel = (format) => {
    const formats = {
      'json': '📊 JSON',
      'text': '📝 Texto',
      'csv': '📈 CSV',
      'xml': '🏷️ XML'
    };
    return formats[format] || format;
  };

  return (
    <div className="space-y-8">
      {/* Botón de cerrar */}
      <div className="flex justify-end">
        <button 
          className="btn btn-secondary btn-small"
          onClick={onClose}
          title="Cerrar detalles"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cerrar
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="flex-1">
          <div className={`processor-type ${processor.input_type} mb-4`}>
            {getInputTypeLabel(processor.input_type)}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">{processor.name}</h2>
          {processor.description && (
            <p className="text-gray-600 text-lg leading-relaxed">
              {processor.description}
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <button 
            className="btn btn-primary btn-small"
            onClick={() => {/* TODO: Abrir modal para seleccionar source */}}
            disabled={executing}
          >
            {executing ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                Ejecutando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ejecutar
              </>
            )}
          </button>
          <button 
            className="btn btn-secondary btn-small"
            onClick={() => onEdit(processor)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button 
            className="btn btn-danger btn-small"
            onClick={() => onDelete(processor.id)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Información del Procesador</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="font-semibold text-gray-700">Tipo de Entrada:</span>
              <p className="text-gray-600">{getInputTypeLabel(processor.input_type)}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Formato de Salida:</span>
              <p className="text-gray-600">{getOutputFormatLabel(processor.output_format)}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Creado por:</span>
              <p className="text-gray-600">{processor.created_by}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="font-semibold text-gray-700">Fecha de creación:</span>
              <p className="text-gray-600">{formatDate(processor.created_at)}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Última modificación:</span>
              <p className="text-gray-600">{formatDate(processor.updated_at)}</p>
            </div>
          </div>

          {/* Código Python */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Código Python</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-96 font-mono">
              {processor.python_code}
            </pre>
          </div>

          {/* Información de última ejecución desde la base de datos */}
          {processor.last_executed_at && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Última ejecución guardada</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">Fecha:</span>
                  <p className="text-gray-800">{formatTimestamp(processor.last_executed_at)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Estado:</span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ml-2 ${
                    processor.last_execution_error 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {processor.last_execution_status}
                  </span>
                </div>
              </div>
              
              {processor.last_execution_error && (
                <div className="mt-3">
                  <span className="font-semibold text-gray-600">Error:</span>
                  <p className="text-red-600 text-sm mt-1">{processor.last_execution_error}</p>
                </div>
              )}
              
              {processor.last_execution_result && (
                <div className="mt-3">
                  <span className="font-semibold text-gray-600">Resultado:</span>
                  <pre className="bg-white p-3 rounded border text-xs overflow-x-auto mt-1 max-h-64">
                    {processor.last_execution_result}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Resultado de la ejecución actual */}
          {executionResult && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-3">Resultado de la ejecución</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-blue-600">Fecha:</span>
                  <p className="text-blue-800">{formatTimestamp(executionResult.timestamp)}</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-600">Estado:</span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ml-2 ${
                    executionResult.error 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {executionResult.status}
                  </span>
                </div>
              </div>
              
              {executionResult.error && (
                <div className="mt-3">
                  <span className="font-semibold text-blue-600">Error:</span>
                  <p className="text-red-600 text-sm mt-1">{executionResult.error}</p>
                </div>
              )}
              
              {executionResult.result && (
                <div className="mt-3">
                  <span className="font-semibold text-blue-600">Resultado:</span>
                  <pre className="bg-white p-3 rounded border text-xs overflow-x-auto mt-1 max-h-64">
                    {JSON.stringify(executionResult.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessorsList;