const express = require('express');
const router = express.Router();
const { 
  getAllSources, 
  getSourceById, 
  createSource, 
  updateSource, 
  deleteSource,
  getDb
} = require('../database/db');

// Validar tipos de source permitidos
const VALID_SOURCE_TYPES = ['file', 'url'];

// Validar estructura de config según tipo
function validateConfig(type, config) {
  switch (type) {
    case 'file':
      return config.path && typeof config.path === 'string';
    case 'url':
      return config.url && config.method && 
             typeof config.url === 'string' && 
             typeof config.method === 'string';
    default:
      return false;
  }
}

// GET /api/sources - Obtener todas las fuentes
router.get('/', async (req, res) => {
  try {
    const sources = await getAllSources();
    res.json({
      success: true,
      data: sources,
      total: sources.length
    });
  } catch (error) {
    console.error('Error al obtener sources:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/sources/:id - Obtener source por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de source inválido'
      });
    }
    
    const source = await getSourceById(parseInt(id));
    
    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'Source no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: source
    });
  } catch (error) {
    console.error('Error al obtener source:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/sources - Crear nuevo source
router.post('/', async (req, res) => {
  try {
    const { name, type, description, config, created_by } = req.body;
    
    // Validaciones
    if (!name || !type || !config) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, type, config'
      });
    }
    
    if (!VALID_SOURCE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de source inválido. Tipos permitidos: ${VALID_SOURCE_TYPES.join(', ')}`
      });
    }
    
    if (!validateConfig(type, config)) {
      return res.status(400).json({
        success: false,
        message: `Configuración inválida para el tipo '${type}'`
      });
    }
    
    const sourceData = {
      name: name.trim(),
      type,
      description: description?.trim() || '',
      config,
      created_by: created_by?.trim() || 'anonymous'
    };
    
    const newSource = await createSource(sourceData);
    
    res.status(201).json({
      success: true,
      message: 'Source creado exitosamente',
      data: newSource
    });
  } catch (error) {
    console.error('Error al crear source:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/sources/:id - Actualizar source
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, config } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de source inválido'
      });
    }
    
    // Validaciones
    if (!name || !type || !config) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, type, config'
      });
    }
    
    if (!VALID_SOURCE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de source inválido. Tipos permitidos: ${VALID_SOURCE_TYPES.join(', ')}`
      });
    }
    
    if (!validateConfig(type, config)) {
      return res.status(400).json({
        success: false,
        message: `Configuración inválida para el tipo '${type}'`
      });
    }
    
    const sourceData = {
      name: name.trim(),
      type,
      description: description?.trim() || '',
      config
    };
    
    const updatedSource = await updateSource(parseInt(id), sourceData);
    
    if (!updatedSource) {
      return res.status(404).json({
        success: false,
        message: 'Source no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Source actualizado exitosamente',
      data: updatedSource
    });
  } catch (error) {
    console.error('Error al actualizar source:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/sources/:id - Eliminar source
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de source inválido'
      });
    }
    
    const deleted = await deleteSource(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Source no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Source eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar source:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/sources/:id/test - Ejecutar solicitud de prueba para URL
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el source
    const source = await new Promise((resolve, reject) => {
      const db = getDb();
      db.get(
        'SELECT * FROM sources WHERE id = ? AND is_active = 1',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!source) {
      return res.status(404).json({
        success: false,
        error: 'Source no encontrado'
      });
    }

    if (source.type !== 'url') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden probar sources de tipo URL'
      });
    }

    const config = JSON.parse(source.config);
    
    // Realizar la solicitud HTTP
    const axios = require('axios');
    let requestData = {};
    let requestStatus = '';
    let requestError = null;
    
    try {
      const requestConfig = {
        method: config.method || 'GET',
        url: config.url,
        timeout: config.timeout || 10000,
        headers: config.headers || {}
      };

      if (config.params && Object.keys(config.params).length > 0) {
        if (config.method === 'GET') {
          requestConfig.params = config.params;
        } else {
          requestConfig.data = config.params;
        }
      }

      const response = await axios(requestConfig);
      
      requestStatus = `${response.status} ${response.statusText}`;
      requestData = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };

    } catch (error) {
      if (error.response) {
        // Error de respuesta del servidor
        requestStatus = `${error.response.status} ${error.response.statusText}`;
        requestError = `HTTP ${error.response.status}: ${error.response.statusText}`;
        requestData = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        };
      } else if (error.request) {
        // Error de red
        requestStatus = 'Network Error';
        requestError = 'No se pudo conectar con el servidor';
        requestData = { error: 'Network timeout or connection refused' };
      } else {
        // Otro tipo de error
        requestStatus = 'Error';
        requestError = error.message;
        requestData = { error: error.message };
      }
    }

    // Guardar el resultado en la base de datos
    await new Promise((resolve, reject) => {
      const db = getDb();
      db.run(
        `UPDATE sources 
         SET last_request_at = CURRENT_TIMESTAMP,
             last_request_status = ?,
             last_request_data = ?,
             last_request_error = ?
         WHERE id = ?`,
        [
          requestStatus,
          JSON.stringify(requestData),
          requestError,
          id
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      result: {
        status: requestStatus,
        data: requestData,
        error: requestError,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error al probar source:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/sources/:id/view - Visualizar contenido de archivo
router.get('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el source
    const source = await getSourceById(id);
    
    if (!source) {
      return res.status(404).json({
        success: false,
        error: 'Source no encontrado'
      });
    }

    if (source.type !== 'file') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden visualizar sources de tipo archivo'
      });
    }

    const config = source.config;
    const fs = require('fs').promises;
    const path = require('path');
    const axios = require('axios');
    
    let fileContent = '';
    let contentType = 'text/plain';
    let fileName = '';
    let fileSize = 0;
    
    try {
      if (config.path.startsWith('http://') || config.path.startsWith('https://')) {
        // Archivo remoto
        const response = await axios({
          method: 'GET',
          url: config.path,
          timeout: 30000,
          responseType: 'text'
        });
        
        fileContent = response.data;
        contentType = response.headers['content-type'] || 'text/plain';
        fileName = path.basename(config.path);
        fileSize = Buffer.byteLength(fileContent, 'utf8');
        
      } else if (config.path.startsWith('/uploads/')) {
        // Archivo subido
        const filePath = path.join(__dirname, '..', config.path);
        const stats = await fs.stat(filePath);
        fileSize = stats.size;
        
        // Limitar tamaño de archivo para visualización (10MB)
        if (fileSize > 10 * 1024 * 1024) {
          return res.status(413).json({
            success: false,
            error: 'Archivo demasiado grande para visualizar (máximo 10MB)'
          });
        }
        
        fileContent = await fs.readFile(filePath, { encoding: config.encoding || 'utf8' });
        fileName = path.basename(filePath);
        
        // Determinar tipo de contenido basado en extensión
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = {
          '.json': 'application/json',
          '.csv': 'text/csv',
          '.txt': 'text/plain',
          '.xml': 'application/xml',
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css'
        };
        contentType = mimeTypes[ext] || 'text/plain';
        
      } else {
        // Archivo local (ruta del sistema)
        const filePath = path.resolve(config.path);
        const stats = await fs.stat(filePath);
        fileSize = stats.size;
        
        // Limitar tamaño de archivo para visualización (10MB)
        if (fileSize > 10 * 1024 * 1024) {
          return res.status(413).json({
            success: false,
            error: 'Archivo demasiado grande para visualizar (máximo 10MB)'
          });
        }
        
        fileContent = await fs.readFile(filePath, { encoding: config.encoding || 'utf8' });
        fileName = path.basename(filePath);
        
        // Determinar tipo de contenido basado en extensión
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = {
          '.json': 'application/json',
          '.csv': 'text/csv',
          '.txt': 'text/plain',
          '.xml': 'application/xml',
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css'
        };
        contentType = mimeTypes[ext] || 'text/plain';
      }

      // Actualizar última visualización en la base de datos
      const db = getDb();
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE sources 
           SET last_request_at = CURRENT_TIMESTAMP,
               last_request_status = 'File Read Success',
               last_request_data = ?,
               last_request_error = NULL
           WHERE id = ?`,
          [
            JSON.stringify({
              fileName,
              fileSize,
              contentType,
              encoding: config.encoding || 'utf8',
              contentLength: fileContent.length
            }),
            id
          ],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({
        success: true,
        data: {
          fileName,
          fileSize,
          contentType,
          encoding: config.encoding || 'utf8',
          content: fileContent,
          lastViewed: new Date().toISOString()
        }
      });

    } catch (fileError) {
      // Guardar error en la base de datos
      const db = getDb();
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE sources 
           SET last_request_at = CURRENT_TIMESTAMP,
               last_request_status = 'File Read Error',
               last_request_data = NULL,
               last_request_error = ?
           WHERE id = ?`,
          [fileError.message, id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      if (fileError.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado'
        });
      } else if (fileError.code === 'EACCES') {
        return res.status(403).json({
          success: false,
          error: 'Sin permisos para leer el archivo'
        });
      } else {
        return res.status(500).json({
          success: false,
          error: `Error al leer archivo: ${fileError.message}`
        });
      }
    }

  } catch (error) {
    console.error('Error al visualizar archivo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;