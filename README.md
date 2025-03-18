# SoundCloud Downloader

Una aplicación full-stack dockerizada para descargar archivos MP3 de SoundCloud.

## Características

- **Backend**: Node.js con Express
- **Frontend**: React con Material UI
- **Docker**: Aplicación completamente dockerizada

## Requisitos previos

- Docker y Docker Compose instalados en tu sistema

## Instrucciones de uso

1. Clona este repositorio
2. Ejecuta `docker-compose up` en la raíz del proyecto
3. Abre tu navegador en `http://localhost:3000`
4. Ingresa la URL de SoundCloud y descarga el archivo MP3

## Estructura del proyecto

- `/backend`: Servidor Express que maneja la descarga de archivos
- `/frontend`: Aplicación React para la interfaz de usuario

## Variables de entorno

El archivo `.env` debe contener:

```
BACKEND_PORT=5000
FRONTEND_PORT=3000
NODE_ENV=development
``` 