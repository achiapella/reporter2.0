import React, { useState, useEffect } from 'react';
import { processorsAPI, sourcesAPI } from '../services/api';

const ProcessorsListSimple = ({ onEdit, onNew }) => {
  const [processors, setProcessors] = useState([]);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar procesadores y sources en paralelo
      const [processorsResponse, sourcesResponse] = await Promise.all([
        processorsAPI.getAll(),
        sourcesAPI.getAll()
      ]);

      if (processorsResponse.success) {
        setProcessors(processorsResponse.data);
      } else {
        setError('Error al cargar procesadores');
      }

      if (sourcesResponse.success) {
        setSources(sourcesResponse.data);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputSourceInfo = (inputSource) => {
    // Buscar en sources
    const source = sources.find(s => s.id.toString() === inputSource.toString());
    if (source) {
      return {
        type: 'source',
        name: source.name,
        icon: '📁',
        detail: source.type
      };
    }
    
    // Buscar en procesadores
    const processor = processors.find(p => p.id.toString() === inputSource.toString());
    if (processor) {
      return {
        type: 'processor',
        name: processor.name,
        icon: '⚙️',
        detail: 'Procesador'
      };
    }
    
    return {
      type: 'unknown',
      name: 'Fuente desconocida',
      icon: '❓',
      detail: 'No encontrado'
    };
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este procesador?')) {
      return;
    }

    try {
      const response = await processorsAPI.delete(id);
      if (response.success) {
        await loadData(); // Recargar la lista
      } else {
        alert('Error al eliminar el procesador');
      }
    } catch (error) {
      console.error('Error al eliminar procesador:', error);
      alert('Error al eliminar el procesador');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando procesadores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>❌ Error</h3>
        <p>{error}</p>
        <button onClick={loadData} className="btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="processors-list-container">
      <div className="list-header">
        <div className="header-content">
          <h2>📊 Procesadores de Datos</h2>
          <p>Gestiona los procesadores que transforman y analizan tus datos</p>
        </div>
        <button onClick={onNew} className="btn-primary">
          ➕ Nuevo Procesador
        </button>
      </div>

      {processors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚙️</div>
          <h3>No hay procesadores configurados</h3>
          <p>Los procesadores transforman datos de sources o de otros procesadores.</p>
          <button onClick={onNew} className="btn-primary">
            Crear primer procesador
          </button>
        </div>
      ) : (
        <div className="processors-grid">
          {processors.map((processor) => {
            const inputInfo = getInputSourceInfo(processor.input_source);
            
            return (
              <div key={processor.id} className="processor-card">
                <div className="card-header">
                  <div className="processor-title">
                    <h3>{processor.name}</h3>
                    <span className="processor-id">ID: {processor.id}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => onEdit(processor)}
                      className="btn-edit"
                      title="Editar procesador"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(processor.id)}
                      className="btn-delete"
                      title="Eliminar procesador"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <div className="processor-description">
                    <p>{processor.description}</p>
                  </div>

                  <div className="input-source-info">
                    <h4>📥 Fuente de Entrada</h4>
                    <div className="source-badge">
                      <span className="source-icon">{inputInfo.icon}</span>
                      <div className="source-details">
                        <span className="source-name">{inputInfo.name}</span>
                        <span className="source-type">{inputInfo.detail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="processor-meta">
                    <div className="meta-item">
                      <span className="meta-label">Creado:</span>
                      <span className="meta-value">{formatDate(processor.created_at)}</span>
                    </div>
                    {processor.updated_at && processor.updated_at !== processor.created_at && (
                      <div className="meta-item">
                        <span className="meta-label">Actualizado:</span>
                        <span className="meta-value">{formatDate(processor.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <div className="data-flow">
                    <span className="flow-input">{inputInfo.icon} {inputInfo.name}</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-processor">⚙️ {processor.name}</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-output">📤 Datos Procesados</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="list-footer">
        <div className="stats">
          <span>Total: {processors.length} procesadores</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessorsListSimple;