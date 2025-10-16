const express = require('express');
const cors = require('cors');
const path = require('path');
const sourcesRoutes = require('./routes/sources');
const uploadRoutes = require('./routes/upload');
const processorsRoutes = require('./routes/processors');
const { initDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Rutas de la API
app.use('/api/sources', sourcesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/processors', processorsRoutes);

// Servir archivos subidos de forma estática
app.use('/api/files', express.static(path.join(__dirname, 'uploads')));

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Reporter 2.0 API funcionando correctamente' });
});

// Ruta fallback para React Router en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Inicializar base de datos y servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Frontend disponible en http://localhost:${PORT}`);
      }
    });
  })
  .catch(err => {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  });