const { onObjectFinalized } = require('firebase-functions/v2/storage');
const admin = require('firebase-admin');
const sharp = require('sharp');
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp();

exports.convertHeicToJpeg = onObjectFinalized({ memory: '1GiB' }, async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;

  // Solo procesar archivos HEIC/HEIF
  if (!filePath || !contentType || (!contentType.includes('image/heic') && !contentType.includes('image/heif'))) {
    console.log('Archivo no es HEIC/HEIF, ignorando.');
    return null;
  }

  // Evitar bucles infinitos
  if (path.basename(filePath).endsWith('.jpg')) {
    console.log('Ya es un JPEG, terminando la función para evitar bucle.');
    return null;
  }

  const bucket = admin.storage().bucket(fileBucket);
  const fileName = path.basename(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const convertedFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
  const convertedFilePath = path.join(path.dirname(filePath), convertedFileName);
  const tempConvertedFilePath = path.join(os.tmpdir(), convertedFileName);

  try {
    // Descargar archivo HEIC a temporal local
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log(`Archivo HEIC descargado localmente en ${tempFilePath}`);

    // Convertir a JPEG con Sharp
    await sharp(tempFilePath)
      .jpeg({ quality: 80 })
      .toFile(tempConvertedFilePath);
    console.log(`Archivo convertido a JPEG en ${tempConvertedFilePath}`);

    // Subir archivo JPEG convertido a Storage
    await bucket.upload(tempConvertedFilePath, {
      destination: convertedFilePath,
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000, immutable'
      },
    });
    console.log(`Archivo JPEG subido a ${convertedFilePath}`);

    // Hacer público el nuevo archivo
    await bucket.file(convertedFilePath).makePublic();

  } catch (error) {
    console.error("Error durante la conversión:", error);
  } finally {
    // Limpiar archivos temporales
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(tempConvertedFilePath)) fs.unlinkSync(tempConvertedFilePath);
  }

  return null;
});
