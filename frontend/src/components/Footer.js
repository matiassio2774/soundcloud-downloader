import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {'© '}
        {new Date().getFullYear()}
        {' '}
        <Link color="inherit" href="#">
          SoundCloud Downloader
        </Link>
        {' - Creado con '}
        <Link color="inherit" href="https://material-ui.com/">
          Material UI
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer; 