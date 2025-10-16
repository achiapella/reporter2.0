import React, { useState, useEffect } from 'react';
import SourcesList from './components/SourcesList';
import SourceForm from './components/SourceForm';
import { sourcesAPI } from './services/api';

function App() {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Cargar sources al iniciar
  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sourcesAPI.getAll();
      setSources(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSource = async (sourceData) => {
    try {
      setError(null);
      const response = await sourcesAPI.create(sourceData);
      setSources(prev => [response.data, ...prev]);
      setShowForm(false);
      setMessage('Source creado exitosamente');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSource = async (sourceData) => {
    try {
      setError(null);
      const response = await sourcesAPI.update(selectedSource.id, sourceData);
      setSources(prev => prev.map(s => 
        s.id === selectedSource.id ? response.data : s
      ));
      setSelectedSource(null);
      setShowForm(false);
      setMessage('Source actualizado exitosamente');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este source?')) {
      return;
    }

    try {
      setError(null);
      await sourcesAPI.delete(id);
      setSources(prev => prev.filter(s => s.id !== id));
      if (selectedSource?.id === id) {
        setSelectedSource(null);
      }
      setMessage('Source eliminado exitosamente');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSource = (source) => {
    setSelectedSource(source);
    setShowForm(true);
  };

  const handleNewSource = () => {
    setSelectedSource(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedSource(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-light text-center mb-2">Reporter 2.0</h1>
          <p className="text-center text-xl opacity-90">Gestor de Fuentes de Datos Compartidas</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className="alert alert-success animate-slide-up">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error animate-slide-up">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[600px]">
          <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm h-fit">
            <button 
              className="btn btn-primary w-full mb-6" 
              onClick={handleNewSource}
            >
              + Nuevo Source
            </button>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sources ({sources.length})
              </h3>
              
              {loading ? (
                <div className="text-center py-12 text-gray-600">
                  <div className="loading-spinner"></div>
                  Cargando...
                </div>
              ) : sources.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="mb-4">No hay sources creados</p>
                  <button 
                    className="btn btn-primary btn-small" 
                    onClick={handleNewSource}
                  >
                    Crear el primero
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sources.map(source => (
                    <div
                      key={source.id}
                      className={`source-card p-4 ${selectedSource?.id === source.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSource(source)}
                    >
                      <div className={`source-type ${source.type}`}>
                        {source.type}
                      </div>
                      <div className="font-semibold text-gray-800 mb-2">
                        {source.name}
                      </div>
                      {source.description && (
                        <div className="text-sm text-gray-600">
                          {source.description.length > 50 
                            ? `${source.description.substring(0, 50)}...`
                            : source.description
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm">
            {showForm ? (
              <SourceForm
                source={selectedSource}
                onSubmit={selectedSource ? handleUpdateSource : handleCreateSource}
                onCancel={handleCloseForm}
              />
            ) : selectedSource ? (
              <SourcesList
                source={selectedSource}
                onEdit={handleEditSource}
                onDelete={handleDeleteSource}
                onClose={() => setSelectedSource(null)}
              />
            ) : (
              <div className="text-center py-24 text-gray-500">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Selecciona un source para ver detalles</h3>
                <p className="text-gray-500">O crea uno nuevo para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;