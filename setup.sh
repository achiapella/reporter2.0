#!/bin/bash

echo "🚀 Configurando Reporter 2.0..."

# Instalar dependencias principales
echo "📦 Instalando dependencias principales..."
npm install

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

echo "✅ Instalación completada!"
echo ""
echo "Para iniciar en modo desarrollo:"
echo "npm run dev"
echo ""
echo "Para producción:"
echo "npm run build && npm start"