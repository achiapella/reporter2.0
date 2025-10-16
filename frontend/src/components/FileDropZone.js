import React, { useState } from 'react';

const FileDropZone = ({ onFileSelect, accept = {}, maxSize = 5242880 }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        alert(`Archivo demasiado grande. Máximo: ${formatFileSize(maxSize)}`);
        return;
      }
      onFileSelect(file);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        alert(`Archivo demasiado grande. Máximo: ${formatFileSize(maxSize)}`);
        return;
      }
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBorderStyle = () => {
    let className = 'drag-zone';
    if (isDragOver) {
      className += ' drag-over';
    }
    return className;
  };

  return (
    <div
      className={getBorderStyle()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input').click()}
      style={{
        border: '2px dashed #d1d5db',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isDragOver ? '#f8faff' : 'white',
        borderColor: isDragOver ? '#667eea' : '#d1d5db'
      }}
    >
      <input
        id="file-input"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept={Object.keys(accept).join(',')}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        {isDragOver ? (
          <div style={{ color: '#667eea' }}>
            <svg style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>
              ¡Suelta el archivo aquí!
            </p>
          </div>
        ) : (
          <>
            <svg style={{ width: '4rem', height: '4rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151' }}>
                Arrastra y suelta un archivo aquí
              </p>
              <p style={{ color: '#6b7280' }}>
                o <span style={{ color: '#667eea', fontWeight: '500' }}>haz clic para seleccionar</span>
              </p>
            </div>
            
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p>Tamaño máximo: {formatFileSize(maxSize)}</p>
              {Object.keys(accept).length > 0 && (
                <p>
                  Tipos permitidos: {Object.keys(accept).join(', ')}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;