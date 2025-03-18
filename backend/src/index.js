require('dotenv').config();
const express = require('express');
const cors = require('cors');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors());
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