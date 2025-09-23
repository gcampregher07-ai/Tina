
import { NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebaseAdmin";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "No hay artículos en el carrito." }, { status: 400 });
    }
    
    // Determine the base URL from the request headers
    const origin = req.headers.get('origin') || 'http://localhost:3000';

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

    // Create Stripe Checkout Session
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "ars",
        product_data: { 
            name: `${item.name} (${item.size} / ${item.color})`,
            images: item.imageUrls && item.imageUrls.length > 0 ? [item.imageUrls[0]] : []
        },
        unit_amount: Math.round(item.price * 100), // Price in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    // Revert stock logic could be added here if needed
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
