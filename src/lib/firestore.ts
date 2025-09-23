
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, DocumentReference, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import type { Product, Category, HeroData, Order } from './types';

// Categories
export async function getCategories(): Promise<Category[]> {
  const querySnapshot = await getDocs(collection(db, 'categories'));
  const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
  return categories;
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const docRef = await addDoc(collection(db, "categories"), category);
    return { id: docRef.id, ...category };
}

// Products
export async function getProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, 'products'));
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
    return products;
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

// Orders
export async function getOrders(): Promise<Order[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Firestore Timestamps need to be converted to JS Dates
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        return { id: doc.id, ...data, createdAt } as Order;
    });
}

export async function addOrder(order: Omit<Order, 'id'>): Promise<DocumentReference> {
    const docRef = await addDoc(collection(db, "orders"), order);
    return docRef;
}

export async function getOrder(id: string): Promise<Order | null> {
    const docRef = doc(db, 'orders', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const createdAt = data.createdAt.toDate();
        return { id: docSnap.id, ...data, createdAt } as Order;
    } else {
        return null;
    }
}
