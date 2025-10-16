import React, { useState, useEffect } from 'react';
import SourcesList from './components/SourcesList';
import SourceForm from './components/SourceForm';
import ProcessorsList from './components/ProcessorsList';
import ProcessorForm from './components/ProcessorForm';
import ProcessorsListMain from './components/ProcessorsListMain';
import { sourcesAPI } from './services/api';
import './index.css';

function App() {
  const [sources, setSources] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [editingSource, setEditingSource] = useState(null);
  const [editingProcessor, setEditingProcessor] = useState(null);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showProcessorForm, setShowProcessorForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('sources'); // 'sources' o 'processors'
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSources();
  }, []);

  // Cargar procesadores cuando se cambie a esa vista
  useEffect(() => {
    if (currentView === 'processors' && processors.length === 0) {
      // Los procesadores se cargarán en ProcessorsListMain
    }
  }, [currentView, processors.length]);

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

  const handleSourceSubmit = async (sourceData) => {
    try {
      setError(null);
      if (editingSource) {
        const response = await sourcesAPI.update(editingSource.id, sourceData);
        setSources(prev => prev.map(s => 
          s.id === editingSource.id ? response.data : s
        ));
        setEditingSource(null);
        setMessage('Source actualizado exitosamente');
      } else {
        const response = await sourcesAPI.create(sourceData);
        setSources(prev => [response.data, ...prev]);
        setMessage('Source creado exitosamente');
      }
      setShowSourceForm(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProcessorSubmit = async (processorData) => {
    try {
      // La lógica del submit está en ProcessorForm
      // Este callback puede ser usado para acciones adicionales
      setShowProcessorForm(false);
      setEditingProcessor(null);
    } catch (error) {
      console.error('Error al guardar processor:', error);
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm('¿Estás seguro que quieres eliminar este source?')) return;
    
    try {
      setError(null);
      await sourcesAPI.delete(id);
      setSources(prev => prev.filter(s => s.id !== id));
      if (selectedSource && selectedSource.id === id) {
        setSelectedSource(null);
      }
      setMessage('Source eliminado exitosamente');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (source) => {
    setEditingSource(source);
    setShowSourceForm(true);
  };

  const handleEditProcessor = (processor) => {
    setEditingProcessor(processor);
    setShowProcessorForm(true);
  };

  const renderSourcesView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Sources</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowSourceForm(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Source
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando sources...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay sources</h3>
            <p className="text-gray-500 mb-6">Crea tu primer source para comenzar</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowSourceForm(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Primer Source
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sources.map((source) => (
              <div 
                key={source.id} 
                className={`bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedSource && selectedSource.id === source.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedSource(source)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`source-type ${source.type} mb-2`}>
                        {source.type === 'file' ? '📄 Archivo' : '🌐 URL'}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {source.name}
                      </h3>
                      {source.description && (
                        <p className="text-gray-600 text-sm mt-1">{source.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(source);
                        }}
                        title="Editar source"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSource(source.id);
                        }}
                        title="Eliminar source"
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
      
      <div>
        <SourcesList
          source={selectedSource}
          onEdit={handleEdit}
          onDelete={handleDeleteSource}
          onClose={() => setSelectedSource(null)}
        />
      </div>
    </div>
  );

  const renderProcessorsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Procesadores</h2>
        </div>
        
        <ProcessorsListMain
          processors={processors}
          setProcessors={setProcessors}
          selectedProcessor={selectedProcessor}
          setSelectedProcessor={setSelectedProcessor}
          setEditingProcessor={setEditingProcessor}
          setShowProcessorForm={setShowProcessorForm}
        />
      </div>
      
      <div>
        <ProcessorsList
          processor={selectedProcessor}
          onEdit={handleEditProcessor}
          onDelete={() => {}}
          onClose={() => setSelectedProcessor(null)}
        />
      </div>
    </div>
  );

  if (showSourceForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <SourceForm
            source={editingSource}
            onSubmit={handleSourceSubmit}
            onCancel={() => {
              setShowSourceForm(false);
              setEditingSource(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (showProcessorForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ProcessorForm
            processor={editingProcessor}
            onSubmit={handleProcessorSubmit}
            onCancel={() => {
              setShowProcessorForm(false);
              setEditingProcessor(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mensajes de error y éxito */}
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">×</button>
        </div>
      )}
      
      {message && (
        <div className="alert alert-success">
          <p>{message}</p>
          <button onClick={() => setMessage(null)} className="ml-auto">×</button>
        </div>
      )}

      {/* Header con navegación */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Reporter 2.0</h1>
            
            {/* Navegación entre vistas */}
            <nav className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'sources'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentView('sources')}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sources
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'processors'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentView('processors')}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Procesadores
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'sources' ? renderSourcesView() : renderProcessorsView()}
      </main>
    </div>
  );
}

export default App;