import React, { useState } from 'react';
import { sourcesAPI } from '../services/api';

const SourcesList = ({ source, onEdit, onDelete }) => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [viewingFile, setViewingFile] = useState(false);

  const handleTestUrl = async () => {
    if (source.type !== 'url') return;
    
    setTesting(true);
    try {
      const result = await sourcesAPI.testUrl(source.id);
      setTestResult(result.result);
    } catch (error) {
      setTestResult({
        status: 'Error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  const handleViewFile = async () => {
    if (source.type !== 'file') return;
    
    setViewingFile(true);
    try {
      const result = await sourcesAPI.viewFile(source.id);
      setFileContent(result.data);
    } catch (error) {
      setFileContent({
        error: error.message,
        lastViewed: new Date().toISOString()
      });
    } finally {
      setViewingFile(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES');
  };
  if (!source) {
    return (
      <div className="text-center py-24 text-gray-500">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay source seleccionado</h3>
        <p className="text-gray-500">Selecciona un source de la lista para ver sus detalles</p>
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

  const renderConfig = (type, config) => {
    switch (type) {
      case 'file':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Ruta:</span>
                <p className="text-gray-600 break-all">{config.path}</p>
              </div>
              {config.encoding && (
                <div>
                  <span className="font-semibold text-gray-700">Codificación:</span>
                  <p className="text-gray-600">{config.encoding}</p>
                </div>
              )}
            </div>
            {config.format && (
              <div>
                <span className="font-semibold text-gray-700">Formato:</span>
                <p className="text-gray-600">{config.format}</p>
              </div>
            )}

            {/* Botón de visualización y contenido del archivo */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700">Visualizar Archivo</h4>
                <button
                  onClick={handleViewFile}
                  disabled={viewingFile}
                  className="btn btn-primary btn-small"
                >
                  {viewingFile ? (
                    <>
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Cargando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Contenido
                    </>
                  )}
                </button>
              </div>

              {/* Información de la última visualización desde la base de datos */}
              {source.last_request_at && source.last_request_status === 'File Read Success' && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Última visualización guardada</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600">Fecha:</span>
                      <p className="text-gray-800">{formatTimestamp(source.last_request_at)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Estado:</span>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium ml-2">
                        Leído correctamente
                      </span>
                    </div>
                  </div>
                  
                  {source.last_request_data && (
                    <div className="mt-3">
                      <span className="font-semibold text-gray-600">Información del archivo:</span>
                      <div className="bg-white p-3 rounded border text-sm mt-1">
                        {(() => {
                          try {
                            const fileInfo = JSON.parse(source.last_request_data);
                            return (
                              <div className="grid grid-cols-2 gap-2">
                                <div><strong>Nombre:</strong> {fileInfo.fileName}</div>
                                <div><strong>Tamaño:</strong> {formatFileSize(fileInfo.fileSize)}</div>
                                <div><strong>Tipo:</strong> {fileInfo.contentType}</div>
                                <div><strong>Codificación:</strong> {fileInfo.encoding}</div>
                              </div>
                            );
                          } catch {
                            return <p>Información no disponible</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error de última visualización */}
              {source.last_request_at && source.last_request_error && source.last_request_status === 'File Read Error' && (
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-red-700 mb-2">Error en última visualización</h5>
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="font-semibold text-red-600">Fecha:</span>
                      <p className="text-red-800">{formatTimestamp(source.last_request_at)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-red-600">Error:</span>
                      <p className="text-red-600 mt-1">{source.last_request_error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido del archivo actual */}
              {fileContent && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-3">Contenido del archivo</h5>
                  
                  {fileContent.error ? (
                    <div className="text-red-600">
                      <p><strong>Error:</strong> {fileContent.error}</p>
                      <p className="text-sm mt-1">Última visualización: {formatTimestamp(fileContent.lastViewed)}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-semibold text-blue-600">Archivo:</span>
                          <p className="text-blue-800">{fileContent.fileName}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-blue-600">Tamaño:</span>
                          <p className="text-blue-800">{formatFileSize(fileContent.fileSize)}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-blue-600">Tipo:</span>
                          <p className="text-blue-800">{fileContent.contentType}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-blue-600">Contenido:</span>
                        <pre className="bg-white p-4 rounded border text-xs overflow-auto mt-2 max-h-96 font-mono">
                          {fileContent.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 'url':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">URL:</span>
                <p className="text-gray-600 break-all">{config.url}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Método:</span>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {config.method}
                </span>
              </div>
            </div>
            
            {config.headers && Object.keys(config.headers).length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 block mb-2">Headers:</span>
                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto text-gray-600">
                  {JSON.stringify(config.headers, null, 2)}
                </pre>
              </div>
            )}
            
            {config.params && Object.keys(config.params).length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 block mb-2">Parámetros:</span>
                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto text-gray-600">
                  {JSON.stringify(config.params, null, 2)}
                </pre>
              </div>
            )}
            
            {config.auth && Object.keys(config.auth).length > 0 && (
              <div>
                <span className="font-semibold text-gray-700">Autenticación:</span>
                <p className="text-gray-600">{config.auth.type || 'Configurada'}</p>
              </div>
            )}

            {/* Botón de prueba y resultados */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700">Probar URL</h4>
                <button
                  onClick={handleTestUrl}
                  disabled={testing}
                  className="btn btn-primary btn-small"
                >
                  {testing ? (
                    <>
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Probando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Probar
                    </>
                  )}
                </button>
              </div>

              {/* Información de la última solicitud desde la base de datos */}
              {source.last_request_at && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Última solicitud guardada</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600">Fecha:</span>
                      <p className="text-gray-800">{formatTimestamp(source.last_request_at)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Estado:</span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ml-2 ${
                        source.last_request_error 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {source.last_request_status}
                      </span>
                    </div>
                  </div>
                  
                  {source.last_request_error && (
                    <div className="mt-3">
                      <span className="font-semibold text-gray-600">Error:</span>
                      <p className="text-red-600 text-sm mt-1">{source.last_request_error}</p>
                    </div>
                  )}
                  
                  {source.last_request_data && (
                    <div className="mt-3">
                      <span className="font-semibold text-gray-600">Datos recibidos:</span>
                      <pre className="bg-white p-3 rounded border text-xs overflow-x-auto mt-1 max-h-64">
                        {JSON.stringify(JSON.parse(source.last_request_data), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Resultado de la prueba actual */}
              {testResult && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-2">Resultado de la prueba</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-blue-600">Fecha:</span>
                      <p className="text-blue-800">{formatTimestamp(testResult.timestamp)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-600">Estado:</span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ml-2 ${
                        testResult.error 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {testResult.status}
                      </span>
                    </div>
                  </div>
                  
                  {testResult.error && (
                    <div className="mt-3">
                      <span className="font-semibold text-blue-600">Error:</span>
                      <p className="text-red-600 text-sm mt-1">{testResult.error}</p>
                    </div>
                  )}
                  
                  {testResult.data && (
                    <div className="mt-3">
                      <span className="font-semibold text-blue-600">Datos recibidos:</span>
                      <pre className="bg-white p-3 rounded border text-xs overflow-x-auto mt-1 max-h-64">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto text-gray-600">
            {JSON.stringify(config, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="flex-1">
          <div className={`source-type ${source.type} mb-4`}>
            {source.type}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">{source.name}</h2>
          {source.description && (
            <p className="text-gray-600 text-lg leading-relaxed">
              {source.description}
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          {source.type === 'url' && (
            <button 
              className="btn btn-primary btn-small"
              onClick={handleTestUrl}
              disabled={testing}
            >
              {testing ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Probando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Probar
                </>
              )}
            </button>
          )}
          {source.type === 'file' && (
            <button 
              className="btn btn-primary btn-small"
              onClick={handleViewFile}
              disabled={viewingFile}
            >
              {viewingFile ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Archivo
                </>
              )}
            </button>
          )}
          <button 
            className="btn btn-secondary btn-small"
            onClick={() => onEdit(source)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button 
            className="btn btn-danger btn-small"
            onClick={() => onDelete(source.id)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h4>
        <div className="bg-white rounded-lg p-4">
          {renderConfig(source.type, source.config)}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Información del Source</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">ID:</span>
            <p className="text-gray-600">{source.id}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Creado:</span>
            <p className="text-gray-600">{formatDate(source.created_at)}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Actualizado:</span>
            <p className="text-gray-600">{formatDate(source.updated_at)}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Creado por:</span>
            <p className="text-gray-600">{source.created_by}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcesList;