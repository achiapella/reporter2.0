const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta de la base de datos
const DB_PATH = path.join(__dirname, '..', 'database.db');

// Crear conexión a la base de datos
let db = new sqlite3.Database(DB_PATH);

// Inicializar base de datos con las nuevas columnas
async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS processors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        input_source TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// GET /api/processors - Obtener todos los procesadores
router.get('/', async (req, res) => {
  try {
    await initDatabase();
    
    const query = 'SELECT * FROM processors ORDER BY created_at DESC';
    
    const processors = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

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

    await initDatabase();
    
    const query = 'SELECT * FROM processors WHERE id = ?';
    
    const processor = await new Promise((resolve, reject) => {
      db.get(query, [parseInt(id)], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
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
    const { name, description, input_source } = req.body;
    
    // Validación
    if (!name || !description || !input_source) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, descripción y fuente de entrada son requeridos'
      });
    }

    // Crear tabla si no existe
    await initDatabase();

    const insertQuery = `
      INSERT INTO processors (name, description, input_source, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `;

    const result = await new Promise((resolve, reject) => {
      db.run(insertQuery, [name, description, input_source], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        name,
        description,
        input_source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
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
    const { name, description, input_source } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de procesador inválido'
      });
    }
    
    // Validación
    if (!name || !description || !input_source) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, descripción y fuente de entrada son requeridos'
      });
    }

    await initDatabase();
    
    const updateQuery = `
      UPDATE processors 
      SET name = ?, description = ?, input_source = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.run(updateQuery, [name, description, input_source, parseInt(id)], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Procesador no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        name,
        description,
        input_source,
        updated_at: new Date().toISOString()
      },
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

    await initDatabase();
    
    const deleteQuery = 'DELETE FROM processors WHERE id = ?';
    
    const result = await new Promise((resolve, reject) => {
      db.run(deleteQuery, [parseInt(id)], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Procesador no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Procesador eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar procesador:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;