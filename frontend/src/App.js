import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import DownloaderForm from './components/DownloaderForm';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Descargador de MP3 de SoundCloud
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Ingresa la URL de SoundCloud y descarga la pista en formato MP3
          </Typography>
          <DownloaderForm />
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}

export default App; 