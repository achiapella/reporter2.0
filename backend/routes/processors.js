const express = require('express');
const router = express.Router();
const { 
  getAllProcessors, 
  getProcessorById, 
  createProcessor, 
  updateProcessor, 
  deleteProcessor,
  getDb
} = require('../database/db');

// Validar tipos de entrada permitidos
const VALID_INPUT_TYPES = ['file', 'url', 'any'];

// Validar formato de salida permitidos
const VALID_OUTPUT_FORMATS = ['json', 'text', 'csv', 'xml'];

// Validar estructura de procesador
function validateProcessor(processorData) {
  const { name, python_code, input_type } = processorData;
  
  if (!name || !name.trim()) {
    return 'El nombre es requerido';
  }
  
  if (!python_code || !python_code.trim()) {
    return 'El código Python es requerido';
  }
  
  if (!input_type || !VALID_INPUT_TYPES.includes(input_type)) {
    return `Tipo de entrada inválido. Debe ser uno de: ${VALID_INPUT_TYPES.join(', ')}`;
  }
  
  return null;
}

// GET /api/processors - Obtener todos los procesadores
router.get('/', async (req, res) => {
  try {
    const processors = await getAllProcessors();
    res.json({
      success: true,
      data: processors,
      total: processors.length
    });
  } catch (error) {
    console.error('Error al obtener procesadores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/processors/:id - Obtener procesador por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de procesador inválido'
      });
    }
    
    const processor = await getProcessorById(parseInt(id));
    
    if (!processor) {
      return res.status(404).json({
        success: false,
        error: 'Procesador no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: processor
    });
  } catch (error) {
    console.error('Error al obtener procesador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/processors - Crear nuevo procesador
router.post('/', async (req, res) => {
  try {
    const processorData = req.body;
    
    // Validar datos
    const validationError = validateProcessor(processorData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }
    
    // Validar formato de salida
    if (processorData.output_format && !VALID_OUTPUT_FORMATS.includes(processorData.output_format)) {
      return res.status(400).json({
        success: false,
        error: `Formato de salida inválido. Debe ser uno de: ${VALID_OUTPUT_FORMATS.join(', ')}`
      });
    }
    
    const processor = await createProcessor(processorData);
    
    res.status(201).json({
      success: true,
      data: processor,
      message: 'Procesador creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear procesador:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/processors/:id - Actualizar procesador
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const processorData = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de procesador inválido'
      });
    }
    
    // Validar datos
    const validationError = validateProcessor(processorData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }
    
    // Validar formato de salida
    if (processorData.output_format && !VALID_OUTPUT_FORMATS.includes(processorData.output_format)) {
      return res.status(400).json({
        success: false,
        error: `Formato de salida inválido. Debe ser uno de: ${VALID_OUTPUT_FORMATS.join(', ')}`
      });
    }
    
    const processor = await updateProcessor(parseInt(id), processorData);
    
    res.json({
      success: true,
      data: processor,
      message: 'Procesador actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar procesador:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/processors/:id - Eliminar procesador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de procesador inválido'
      });
    }
    
    const result = await deleteProcessor(parseInt(id));
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error al eliminar procesador:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/processors/:id/execute - Ejecutar procesador con un source
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceId } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de procesador inválido'
      });
    }
    
    if (!sourceId || isNaN(parseInt(sourceId))) {
      return res.status(400).json({
        success: false,
        error: 'ID de source inválido'
      });
    }
    
    // TODO: Implementar ejecución de código Python
    // Por ahora retornamos un placeholder
    
    res.json({
      success: true,
      result: {
        status: 'Executed',
        message: 'Funcionalidad de ejecución en desarrollo',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error al ejecutar procesador:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;