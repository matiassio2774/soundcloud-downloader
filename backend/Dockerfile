FROM node:18-alpine

WORKDIR /app

# Copiar solo los archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias con --no-cache para evitar problemas
RUN npm install --no-cache

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto definido en las variables de entorno
EXPOSE ${BACKEND_PORT}

# Comando para iniciar la aplicación
CMD ["npm", "start"] 