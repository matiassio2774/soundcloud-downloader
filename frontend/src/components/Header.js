import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <CloudDownloadIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SoundCloud Downloader
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 