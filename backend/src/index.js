require('dotenv').config();
const express = require('express');
const cors = require('cors');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
// Configuración de CORS
const corsOptions = {
  origin: 'https://frontend-soundcloud-downloader.onrender.com', // URL de tu frontend en Render
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api', downloadRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de SoundCloud Downloader funcionando correctamente');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: true,
    message: 'Error en el servidor'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en el puerto ${PORT}`);
}); 