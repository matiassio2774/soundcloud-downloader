const express = require('express');
const router = express.Router();
const validator = require('validator');
const scdl = require('soundcloud-downloader').default;
const axios = require('axios');
const { Readable } = require('stream');

// Validar URL de SoundCloud
const isValidSoundCloudUrl = (url) => {
  return validator.isURL(url) && url.includes('soundcloud.com');
};

// Métodos alternativos para obtener información de SoundCloud
const getSoundCloudInfo = async (url) => {
  try {
    // Método primario: usando soundcloud-downloader
    console.log('Intentando obtener info con soundcloud-downloader');
    return await scdl.getInfo(url);
  } catch (error) {
    console.error('Error al obtener info con soundcloud-downloader:', error);
    
    // Intento fallido, retornamos información mínima
    const trackId = url.split('/').pop();
    return {
      title: `SoundCloud Track (${trackId})`,
      user: { username: 'SoundCloud Artist' },
      artwork_url: null
    };
  }
};

// Almacén temporal para los streams de descarga (en un entorno de producción usaríamos una base de datos o almacenamiento persistente)
const streamStorage = {};

// Endpoint para obtener la información y URL de descarga
router.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    // Validar la URL
    if (!url || !isValidSoundCloudUrl(url)) {
      return res.status(400).json({
        error: true,
        message: 'URL inválida. Por favor, proporciona una URL válida de SoundCloud.'
      });
    }

    console.log('Procesando URL:', url);

    // Verificar si la URL es un track válido en SoundCloud
    try {
      const isTrack = await scdl.isValidUrl(url);
      if (!isTrack) {
        return res.status(400).json({
          error: true,
          message: 'La URL proporcionada no corresponde a una pista de SoundCloud válida.'
        });
      }
    } catch (validationError) {
      console.error('Error al validar URL de SoundCloud:', validationError);
      // Continuamos de todas formas, asumiendo que la URL es válida
    }

    // Obtener información de la pista
    const info = await getSoundCloudInfo(url);
    console.log('Información de la pista obtenida:', info.title);
    
    // Crear un identificador único para este track
    const trackId = Buffer.from(url).toString('base64');
    
    // Generar una respuesta inmediata con la información de la pista
    res.status(200).json({
      error: false,
      message: 'URL procesada correctamente',
      data: {
        title: info.title,
        artist: info.user.username,
        artwork: info.artwork_url || info.user.avatar_url,
        // Añadir una URL directa a nuestra API para descargar el archivo
        directDownloadUrl: `/api/download-file/${trackId}`
      }
    });

    // En segundo plano, intentamos obtener el stream o URL de descarga para tenerlo listo
    try {
      console.log('Intentando obtener stream o URL de descarga en segundo plano...');
      const result = await scdl.download(url);
      console.log('Tipo de resultado de descarga:', typeof result, result ? result.constructor.name : 'null');
      
      // Almacenar el resultado para su uso posterior
      streamStorage[trackId] = {
        type: typeof result,
        constructor: result ? result.constructor.name : 'null',
        // Si es un stream, lo guardamos como tal, si no, guardamos la URL
        value: result,
        timestamp: Date.now()
      };
    } catch (bgError) {
      console.error('Error al obtener stream/URL en segundo plano:', bgError);
      // No hacemos nada en caso de error, simplemente seguimos con la respuesta ya enviada
    }
    
  } catch (error) {
    console.error('Error al procesar la URL de SoundCloud:', error);
    res.status(500).json({
      error: true,
      message: 'Error al procesar la solicitud. Por favor, intenta de nuevo.'
    });
  }
});

// Endpoint para descargar el archivo directamente
router.get('/download-file/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Recuperar la URL original
    const originalUrl = Buffer.from(trackId, 'base64').toString();
    console.log('URL original para descargar:', originalUrl);
    
    // Verificar si tenemos un stream o URL almacenada para este trackId
    const storedData = streamStorage[trackId];
    
    // Obtener información de la pista para el nombre del archivo
    let trackInfo;
    try {
      trackInfo = await getSoundCloudInfo(originalUrl);
    } catch (infoError) {
      console.error('Error al obtener información de la pista:', infoError);
      // Continuamos con información genérica
      trackInfo = {
        title: 'soundcloud-track',
        user: { username: 'artist' }
      };
    }
    
    // Preparar el nombre del archivo con formato seguro
    const safeTitle = (trackInfo.title || 'soundcloud-track')
      .replace(/[^\w\s]/gi, '')  // Quitar caracteres especiales
      .replace(/\s+/g, '_');     // Reemplazar espacios con guiones bajos
    const fileName = `${safeTitle}.mp3`;
    
    // Configurar los encabezados de respuesta para la descarga
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Manejar diferentes casos según lo que tengamos almacenado
    if (storedData && storedData.constructor === 'PassThrough') {
      console.log('Usando stream PassThrough almacenado');
      // Si es un stream PassThrough, lo transmitimos directamente
      storedData.value.pipe(res);
      return;
    }
    
    if (storedData && typeof storedData.value === 'string') {
      console.log('Usando URL almacenada:', storedData.value.substring(0, 50) + '...');
      // Si tenemos una URL almacenada, descargamos y reenviamos
      try {
        const response = await axios({
          method: 'GET',
          url: storedData.value,
          responseType: 'stream',
          timeout: 60000
        });
        response.data.pipe(res);
        return;
      } catch (axiosError) {
        console.error('Error al descargar con URL almacenada:', axiosError);
        // Continuamos con el método alternativo
      }
    }
    
    // Si no tenemos datos almacenados o falló la descarga con datos almacenados,
    // intentamos descargar nuevamente directamente
    console.log('Descargando directamente desde SoundCloud...');
    try {
      const downloadResult = await scdl.download(originalUrl);
      console.log('Resultado de descarga directa:', typeof downloadResult, downloadResult ? downloadResult.constructor.name : 'null');
      
      if (typeof downloadResult === 'string') {
        // Si es una URL, la descargamos y enviamos
        const response = await axios({
          method: 'GET',
          url: downloadResult,
          responseType: 'stream',
          timeout: 60000
        });
        response.data.pipe(res);
      } else if (downloadResult && downloadResult.pipe && typeof downloadResult.pipe === 'function') {
        // Si es un stream, lo enviamos directamente
        downloadResult.pipe(res);
      } else {
        throw new Error('Formato de descarga no reconocido');
      }
    } catch (directError) {
      console.error('Error en descarga directa:', directError);
      res.status(500).json({
        error: true,
        message: 'No se pudo descargar la pista. Por favor, intenta con otra URL.'
      });
    }
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    res.status(500).json({
      error: true,
      message: 'Error al descargar el archivo. Por favor, intenta de nuevo.'
    });
  }
});

module.exports = router; 