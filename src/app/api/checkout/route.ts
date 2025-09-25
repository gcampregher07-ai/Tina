
import { NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebaseAdmin";
import type { CartItem, Order } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

async function addOrder(order: Omit<Order, 'id'>) {
  try {
    const docRef = await adminDb.collection("orders").add(order);
    return docRef;
  } catch (error) {
    console.error("[FIRESTORE_ADD_ORDER_ERROR]", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { cartItems, customerInfo } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "No hay artículos en el carrito." }, { status: 400 });
    }

    if (!customerInfo || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
        return NextResponse.json({ error: "Falta información del cliente." }, { status: 400 });
    }
    
    // Transaction to update stock
    await adminDb.runTransaction(async (transaction) => {
      for (const item of cartItems) {
        const productRef = adminDb.collection("products").doc(item.productId);
        const productSnap = await transaction.get(productRef);
        
        if (!productSnap.exists) {
          throw new Error(`El producto ${item.name} no existe.`);
        }

        const productData = productSnap.data();
        if (!productData) {
             throw new Error(`No se encontraron datos para el producto ${item.name}.`);
        }

        const stock = productData.stock || [];
        const stockIndex = stock.findIndex(
          (s: any) => s.size === item.size && s.color === item.color
        );

        if (stockIndex === -1) {
          throw new Error(`La combinación de talle y color para ${item.name} no se encontró.`);
        }
        if (stock[stockIndex].quantity < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.name} (Talle: ${item.size}, Color: ${item.color}).`);
        }

        // Create a new stock array with the updated quantity
        const newStock = [...stock];
        newStock[stockIndex] = {
            ...newStock[stockIndex],
            quantity: newStock[stockIndex].quantity - item.quantity
        };
        
        transaction.update(productRef, { stock: newStock });
      }
    });
    
    const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const newOrder: Omit<Order, 'id'> = {
        ...customerInfo,
        items: cartItems,
        total,
        createdAt: Timestamp.now().toDate(),
        status: 'Completado'
    };

    const docRef = await addOrder(newOrder);

    return NextResponse.json({ orderId: docRef.id });

  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
