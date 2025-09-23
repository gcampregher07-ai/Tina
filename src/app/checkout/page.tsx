
"use client";

import React from "react";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/lib/types";
import { loadStripe } from "@stripe/stripe-js";

// It's safe to use process.env here because it's a client component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

async function iniciarCheckout(cartItems: CartItem[]) {
    const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
    });

    const data = await response.json();

    if (response.ok) {
        const stripe = await stripePromise;
        if (stripe) {
            await stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
            throw new Error("No se pudo cargar Stripe.");
        }
    } else {
        throw new Error(data.error || "Error desconocido en el checkout.");
    }
}


export default function CheckoutPage() {
  const { state, getCartTotal, getCartItemCount } = useCart();
  const { items: cart } = state;
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);


  if (getCartItemCount() === 0) {
    return (
        <div className="flex flex-col min-h-screen">
        <Header categories={[]} />
            <main className="flex-1 flex items-center justify-center text-center">
                <div>
                <h1 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h1>
                <p className="text-muted-foreground mb-8">Añade productos a tu carrito antes de proceder al pago.</p>
                <Button asChild>
                    <Link href="/products">Volver a la tienda</Link>
                </Button>
                </div>
            </main>
        <Footer />
        </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
        await iniciarCheckout(cart);
    } catch (err: any) {
        console.error("Error al iniciar checkout:", err);
        toast({
            variant: "destructive",
            title: "Error en el Checkout",
            description: err.message,
        });
        setLoading(false);
    }
  };

  const getItemDescription = (item: CartItem) => {
    let description = [];
    if (item.size) description.push(`Talle: ${item.size}`);
    if (item.color) description.push(`Color: ${item.color}`);
    description.push(`Cantidad: ${item.quantity}`);
    return description.join(' - ');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={[]} />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Finalizar Compra</h1>
        <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                       {item.imageUrls && item.imageUrls.length > 0 && (
                        <Image
                            src={item.imageUrls[0]}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                       )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                         {getItemDescription(item)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(getCartTotal())}</span>
                </div>
                 <Button onClick={handleCheckout} className="w-full mt-6" size="lg" disabled={loading}>
                    {loading ? "Procesando..." : "Pagar con Tarjeta"}
                </Button>
              </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
