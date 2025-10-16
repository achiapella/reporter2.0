const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'sources.db');
let db = null;

// Inicializar la base de datos
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos:', err);
        reject(err);
        return;
      }
      console.log('✅ Conectado a la base de datos SQLite');
      
      // Crear tabla de sources si no existe
      createSourcesTable()
        .then(() => resolve())
        .catch(reject);
    });
  });
}

// Crear tabla de sources
function createSourcesTable() {
  return new Promise((resolve, reject) => {
    // Primero verificamos si la tabla existe y necesita migración
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='sources'", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row && row.sql.includes("CHECK(type IN ('file', 'api', 'endpoint'))")) {
        // Necesitamos migrar la tabla
        console.log('🔄 Migrando tabla sources...');
        migrateSourcesTable().then(resolve).catch(reject);
      } else if (row && row.sql.includes("CHECK(type IN ('file', 'url'))")) {
        // La tabla ya está actualizada
        console.log('✅ Tabla sources ya está actualizada');
        resolve();
      } else {
        // Crear nueva tabla
        createNewSourcesTable().then(resolve).catch(reject);
      }
    });
  });
}

// Crear nueva tabla con la estructura correcta
function createNewSourcesTable() {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('file', 'url')),
        description TEXT,
        config TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT DEFAULT 'anonymous',
        is_active BOOLEAN DEFAULT 1,
        last_request_at DATETIME,
        last_request_status TEXT,
        last_request_data TEXT,
        last_request_error TEXT
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        console.error('Error al crear tabla sources:', err);
        reject(err);
      } else {
        console.log('✅ Tabla sources creada correctamente');
        resolve();
      }
    });
  });
}

// Migrar tabla existente
function migrateSourcesTable() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Crear tabla temporal con nueva estructura
      const createTempTable = `
        CREATE TABLE sources_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('file', 'url')),
          description TEXT,
          config TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT DEFAULT 'anonymous',
          is_active BOOLEAN DEFAULT 1,
          last_request_at DATETIME,
          last_request_status TEXT,
          last_request_data TEXT,
          last_request_error TEXT
        )
      `;

      db.run(createTempTable, (err) => {
        if (err) {
          console.error('Error al crear tabla temporal:', err);
          reject(err);
          return;
        }

        // 2. Copiar datos, convirtiendo tipos
        const copyData = `
          INSERT INTO sources_new (
            id, name, type, description, config, created_at, updated_at, created_by, is_active
          )
          SELECT 
            id, 
            name, 
            CASE 
              WHEN type = 'api' THEN 'url'
              WHEN type = 'endpoint' THEN 'url'
              ELSE type 
            END as type,
            description, 
            config, 
            created_at, 
            updated_at, 
            created_by, 
            is_active
          FROM sources
        `;

        db.run(copyData, (err) => {
          if (err) {
            console.error('Error al copiar datos:', err);
            reject(err);
            return;
          }

          // 3. Eliminar tabla vieja
          db.run('DROP TABLE sources', (err) => {
            if (err) {
              console.error('Error al eliminar tabla vieja:', err);
              reject(err);
              return;
            }

            // 4. Renombrar tabla nueva
            db.run('ALTER TABLE sources_new RENAME TO sources', (err) => {
              if (err) {
                console.error('Error al renombrar tabla:', err);
                reject(err);
              } else {
                console.log('✅ Migración completada: api/endpoint → url');
                resolve();
              }
            });
          });
        });
      });
    });
  });
}

// Obtener todos los sources
function getAllSources() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, name, type, description, config, created_at, updated_at, created_by, is_active,
             last_request_at, last_request_status, last_request_data, last_request_error
      FROM sources 
      WHERE is_active = 1 
      ORDER BY updated_at DESC
    `;
    
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Parsear config JSON para cada source
      const sources = rows.map(row => ({
        ...row,
        config: JSON.parse(row.config),
        is_active: Boolean(row.is_active)
      }));
      
      resolve(sources);
    });
  });
}

// Obtener source por ID
function getSourceById(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, name, type, description, config, created_at, updated_at, created_by, is_active,
             last_request_at, last_request_status, last_request_data, last_request_error
      FROM sources 
      WHERE id = ? AND is_active = 1
    `;
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        resolve(null);
        return;
      }
      
      const source = {
        ...row,
        config: JSON.parse(row.config),
        is_active: Boolean(row.is_active)
      };
      
      resolve(source);
    });
  });
}

// Crear nuevo source
function createSource(sourceData) {
  return new Promise((resolve, reject) => {
    const { name, type, description, config, created_by = 'anonymous' } = sourceData;
    
    const sql = `
      INSERT INTO sources (name, type, description, config, created_by, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const configJson = JSON.stringify(config);
    
    db.run(sql, [name, type, description, configJson, created_by], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      // Retornar el source creado
      getSourceById(this.lastID)
        .then(resolve)
        .catch(reject);
    });
  });
}

// Actualizar source
function updateSource(id, sourceData) {
  return new Promise((resolve, reject) => {
    const { name, type, description, config } = sourceData;
    
    const sql = `
      UPDATE sources 
      SET name = ?, type = ?, description = ?, config = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `;
    
    const configJson = JSON.stringify(config);
    
    db.run(sql, [name, type, description, configJson, id], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      if (this.changes === 0) {
        resolve(null);
        return;
      }
      
      // Retornar el source actualizado
      getSourceById(id)
        .then(resolve)
        .catch(reject);
    });
  });
}

// Eliminar source (soft delete)
function deleteSource(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE sources 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `;
    
    db.run(sql, [id], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(this.changes > 0);
    });
  });
}

// Cerrar conexión
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err);
      } else {
        console.log('Base de datos cerrada');
      }
    });
  }
}

module.exports = {
  initDatabase,
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
  closeDatabase,
  getDb: () => db
};