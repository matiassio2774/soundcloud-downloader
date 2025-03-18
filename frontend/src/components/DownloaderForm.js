import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Snackbar,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { downloadTrack } from '../services/api';

function DownloaderForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [track, setTrack] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloading, setDownloading] = useState(false);

  const validateUrl = (url) => {
    return url.includes('soundcloud.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTrack(null);

    if (!url.trim()) {
      setError('Por favor, ingresa una URL de SoundCloud');
      return;
    }

    if (!validateUrl(url)) {
      setError('Por favor, ingresa una URL válida de SoundCloud');
      return;
    }

    setLoading(true);
    try {
      const response = await downloadTrack(url);
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Error desconocido al procesar la URL');
      }
      
      if (!response.data.data) {
        throw new Error('Respuesta del servidor incompleta');
      }
      
      setTrack(response.data.data);
      
      // Mostrar mensaje de éxito
      setSnackbarMessage('¡Pista encontrada! Ahora puedes descargarla.');
      setSnackbarOpen(true);
      
    } catch (err) {
      console.error('Error al procesar:', err);
      setError(
        err.response?.data?.message || 
        err.message ||
        'Error al procesar la URL. Por favor, verifica la URL e intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la descarga del archivo
  const handleDownload = () => {
    if (!track) {
      setError('No hay información de pista disponible');
      return;
    }
    
    console.log('Iniciando descarga de:', track);
    setDownloading(true);
    
    try {
      // Usar la URL directa de la API
      if (track.directDownloadUrl) {
        console.log('Usando URL directa de la API:', track.directDownloadUrl);
        const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://backend-soundcloud-downloader.onrender.com';
        const fullUrl = `${apiBaseUrl}${track.directDownloadUrl}`;
        
        console.log('URL completa para descarga:', fullUrl);
        
        // Mostrar mensaje mientras se descarga
        setSnackbarMessage('Iniciando descarga...');
        setSnackbarOpen(true);
        
        // Usar setTimeout para asegurar que la UI se actualice antes de abrir la ventana
        setTimeout(() => {
          window.open(fullUrl, '_blank');
          setDownloading(false);
          
          // Mostrar mensaje de finalización
          setSnackbarMessage('¡Descarga iniciada! Si no comenzó automáticamente, haz clic en el enlace que se abrió.');
          setSnackbarOpen(true);
        }, 1000);
        return;
      }
      
      throw new Error('No hay una URL de descarga directa disponible');
    } catch (err) {
      console.error('Error en la descarga:', err);
      setError(err.message || 'Error al intentar descargar la pista');
      setDownloading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mt: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="URL de SoundCloud"
            variant="outlined"
            placeholder="https://soundcloud.com/artist/track"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
          >
            {loading ? 'Procesando...' : 'Buscar pista'}
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {track && (
        <Card sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            height="194"
            image={track.artwork || 'https://via.placeholder.com/400?text=SoundCloud+Track'}
            alt={track.title}
          />
          <CardContent>
            <Typography variant="h5" component="div">
              {track.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {track.artist}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              onClick={handleDownload}
              variant="contained"
              color="primary"
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <MusicNoteIcon />}
              fullWidth
              disabled={downloading}
            >
              {downloading ? 'Descargando...' : 'Descargar MP3'}
            </Button>
          </CardActions>
        </Card>
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
}

export default DownloaderForm; 