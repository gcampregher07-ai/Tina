
import { db } from './firebase-server';
import { storage } from './firebase-client';
import { collection, getDocs, doc, getDoc, addDoc as addClientDoc, updateDoc, deleteDoc, setDoc, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import type { Product, Category, HeroData, Order } from './types';

// Categories
export async function getCategories(): Promise<Category[]> {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'categories'), orderBy("name")));
    const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
    return categories;
  } catch (error) {
    console.error("Error fetching categories: ", error);
    return []; // Devuelve un array vacío en caso de error
  }
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const docRef = await addClientDoc(collection(db, "categories"), category);
    return { id: docRef.id, ...category };
}

export async function deleteCategory(categoryId: string): Promise<void> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', categoryId), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error("No se puede eliminar. Hay productos asociados a esta categoría.");
    }
    
    const docRef = doc(db, 'categories', categoryId);
    await deleteDoc(docRef);
}


// Products
export async function getProducts(pageSize = 24, startAfterDocId?: string): Promise<{ products: Product[], lastDocId: string | null }> {
    try {
        let q;
        if (startAfterDocId) {
            const startDocRef = doc(db, "products", startAfterDocId);
            const startSnap = await getDoc(startDocRef);
            if (!startSnap.exists()) {
                q = query(collection(db, "products"), orderBy("name"), limit(pageSize));
            } else {
                q = query(collection(db, "products"), orderBy("name"), startAfter(startSnap), limit(pageSize));
            }
        } else {
            q = query(collection(db, "products"), orderBy("name"), limit(pageSize));
        }

        const querySnapshot = await getDocs(q);
        const products = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
            const productData = docSnapshot.data() as Omit<Product, 'id' | 'category'>;
            let category: Category | undefined = undefined;
            if (productData.categoryId) {
                try {
                    const catDoc = await getDoc(doc(db, 'categories', productData.categoryId));
                    if (catDoc.exists()) {
                        category = { id: catDoc.id, ...catDoc.data() } as Category;
                    }
                } catch (e) {
                    console.error(`Could not fetch category ${productData.categoryId}`, e);
                }
            }
            return {
                id: docSnapshot.id,
                ...productData,
                imageUrls: productData.imageUrls || [],
                category,
            };
        }));
        
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        return { products, lastDocId: lastDoc ? lastDoc.id : null };
    } catch(error) {
        console.error("Error fetching products: ", error);
        return { products: [], lastDocId: null }; // Devuelve un objeto con un array vacío en caso de error
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const productData = docSnap.data() as Omit<Product, 'id' | 'category'>;
        let category: Category | undefined = undefined;
        if (productData.categoryId) {
            const catDoc = await getDoc(doc(db, 'categories', productData.categoryId));
            if (catDoc.exists()) {
                category = { id: catDoc.id, ...catDoc.data() } as Category;
            }
        }
        return { id: docSnap.id, ...productData, imageUrls: productData.imageUrls || [], category };
    } else {
        return null;
    }
}

export async function addProduct(productId: string, product: Omit<Product, 'id' | 'category'>): Promise<void> {
    const docRef = doc(db, 'products', productId);
    await setDoc(docRef, product);
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'category'>>): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, product);
}

export async function deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const productData = docSnap.data() as Product;

        // Delete images from storage first
        if (productData.imageUrls && productData.imageUrls.length > 0) {
            const deletePromises = productData.imageUrls.map(url => {
                if (url && url.includes("firebasestorage.googleapis.com")) {
                    try {
                        const imageRef = ref(storage, url);
                        return deleteObject(imageRef);
                    } catch (error) {
                        console.error(`Error creating reference for URL: ${url}`, error);
                        return Promise.resolve(); // Don't block deletion if one URL is invalid
                    }
                }
                return Promise.resolve();
            });
            await Promise.all(deletePromises).catch(error => {
                console.error("Error deleting one or more images from storage:", error);
            });
        }
    }
    
    // Then delete the product document from firestore
    await deleteDoc(docRef);
}


// Hero Section
export async function getHeroData(): Promise<HeroData | null> {
    const heroDocRef = doc(db, 'site_settings', 'hero');
    const docSnap = await getDoc(heroDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as HeroData;
    }
    return null;
}

export async function saveHeroData(heroData: HeroData): Promise<void> {
    const heroDocRef = doc(db, 'site_settings', 'hero');
    await setDoc(heroDocRef, heroData);
}

// Orders (Client SDK)
export async function getOrders(pageSize = 20, startAfterDocId?: string): Promise<{ orders: Order[], lastDocId: string | null }> {
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


export async function getOrder(id: string): Promise<Order | null> {
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
