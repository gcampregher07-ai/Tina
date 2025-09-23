
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import type { Auth, Storage, Firestore } from 'firebase-admin/lib/index';
import type { Bucket } from '@google-cloud/storage';

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey,
};

let adminAuth: Auth;
let adminStorage: Storage;
let adminDb: Firestore;
let bucket: Bucket | null = null;

if (!admin.apps.length) {
  try {
    const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET;
    
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Las credenciales de administrador de Firebase (proyecto, email, clave) no están configuradas correctamente en las variables de entorno.");
    }
    if (!storageBucketName) {
        throw new Error("La variable de entorno FIREBASE_STORAGE_BUCKET no está configurada.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucketName,
    });
    
    console.log(`Firebase Admin SDK inicializado correctamente para el bucket: ${storageBucketName}`);

  } catch (error: any) {
    console.error("Error crítico al inicializar Firebase Admin SDK:", error.message);
  }
}

try {
    adminAuth = admin.auth();
    adminStorage = admin.storage();
    adminDb = admin.firestore();
    bucket = adminStorage.bucket();
} catch (error) {
    console.error("No se pudo obtener una instancia de los servicios de Firebase Admin. ¿Se inicializó correctamente?", error);
}

export { adminAuth, adminStorage, adminDb, bucket };
