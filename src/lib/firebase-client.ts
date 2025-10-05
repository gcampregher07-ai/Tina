
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp, FirebaseError } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, collection, doc, getDoc, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import type { Order } from "./types";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
    if (!firebaseConfig.apiKey) {
      throw new Error("Missing Firebase API Key. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file.");
    }
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Orders (Client SDK)
export async function getClientOrders(pageSize = 20, startAfterDocId?: string): Promise<{ orders: Order[], lastDocId: string | null }> {
  let q;
  if (startAfterDocId) {
    const startDocRef = doc(db, "orders", startAfterDocId);
    const startSnap = await getDoc(startDocRef);
    if (!startSnap.exists()) {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(pageSize));
    } else {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"), startAfter(startSnap), limit(pageSize));
    }
  } else {
    q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(pageSize));
  }

  const snap = await getDocs(q);
  const orders = snap.docs.map(docSnap => {
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date() } as Order;
  });

  const lastDoc = snap.docs[snap.docs.length - 1];
  return { orders, lastDocId: lastDoc ? lastDoc.id : null };
}


export async function getClientOrder(id: string): Promise<Order | null> {
    try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = data.createdAt.toDate();
            return { id: docSnap.id, ...data, createdAt } as Order;
        } else {
            return null;
        }
    } catch (error) {
        console.error("[FIRESTORE_GET_ORDER_ERROR]", error);
        throw error;
    }
}


export { app, auth, db, storage };
