# Reporter 2.0 - Gestor de Fuentes de Datos

Sistema web para gestión colaborativa de fuentes de datos (archivos, APIs, endpoints) con acceso multiusuario.

## Características

- ✅ ABM completo de fuentes de datos
- ✅ Soporte para archivos, APIs y endpoints
- ✅ Acceso multiusuario sin autenticación
- ✅ Compartición de sources entre usuarios
- ✅ Interfaz web responsiva
- ✅ API REST

## Tecnologías

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + CSS3
- **Base de datos**: SQLite (sin configuración adicional)

## Instalación y Uso

### Opción 1: Script automático (Recomendado)
```bash
./setup.sh
```

### Opción 2: Manual
```bash
# 1. Instalar dependencias
npm run install:all

# 2. Desarrollo (Backend + Frontend simultáneo)
npm run dev

# 3. Producción
npm run build
npm start
```

### Acceso a la aplicación

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:5001/api

### Funcionalidades principales

1. **Crear Sources**: Botón "Nuevo Source" en la barra lateral
2. **Listar Sources**: Vista de lista en la barra lateral
3. **Ver Detalles**: Click en cualquier source para ver detalles
4. **Editar**: Botón "Editar" en la vista de detalles
5. **Eliminar**: Botón "Eliminar" con confirmación

## URLs

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:5000/api

## API Endpoints

- `GET /api/sources` - Listar todas las fuentes
- `POST /api/sources` - Crear nueva fuente
- `PUT /api/sources/:id` - Actualizar fuente
- `DELETE /api/sources/:id` - Eliminar fuente

## Estructura del Proyecto

```
reporter2.0/
├── backend/          # Servidor Express + API
├── frontend/         # Aplicación React
└── package.json      # Scripts principales
```

## Tipos de Sources Soportados

### 1. **Archivo** 
- Archivos locales o rutas de red
- Configuración: ruta, codificación, formato
- Ejemplo: CSV, JSON, XML, TXT

### 2. **API**
- Endpoints REST completos
- Configuración: URL, método HTTP, headers, parámetros, autenticación
- Soporte para GET, POST, PUT, DELETE, PATCH

### 3. **Endpoint**
- URLs simples con parámetros
- Configuración: URL, parámetros de consulta, timeout
- Ideal para webhooks o endpoints simples

## Estructura de la Base de Datos

La aplicación utiliza SQLite con la siguiente estructura:

```sql
CREATE TABLE sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('file', 'api', 'endpoint')),
  description TEXT,
  config TEXT NOT NULL, -- JSON con configuración específica
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT DEFAULT 'anonymous',
  is_active BOOLEAN DEFAULT 1
);
```