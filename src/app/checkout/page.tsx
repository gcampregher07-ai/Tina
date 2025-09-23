
"use client";

import React from "react";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/lib/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const customerInfoSchema = z.object({
  firstName: z.string().min(2, "Nombre es requerido."),
  lastName: z.string().min(2, "Apellido es requerido."),
  phone: z.string().min(6, "Teléfono es requerido."),
  address: z.string().min(5, "Dirección es requerida."),
  city: z.string().min(2, "Ciudad es requerida."),
  postalCode: z.string().min(4, "Código Postal es requerido."),
});

type CustomerInfoValues = z.infer<typeof customerInfoSchema>;

export default function CheckoutPage() {
  const { state, dispatch, getCartTotal, getCartItemCount } = useCart();
  const { items: cart } = state;
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    }
  });

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

  const handleCheckout = async (customerInfo: CustomerInfoValues) => {
    setLoading(true);
    try {
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItems: cart, customerInfo }),
        });

        const data = await response.json();

        if (response.ok) {
            dispatch({ type: "CLEAR_CART" });
            router.push(`/order-summary/${data.orderId}`);
        } else {
            throw new Error(data.error || "Error desconocido en el checkout.");
        }
    } catch (err: any) {
        console.error("Error al iniciar checkout:", err);
        toast({
            variant: "destructive",
            title: "Error en el Checkout",
            description: err.message,
        });
    } finally {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Tus Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form id="checkout-form" onSubmit={form.handleSubmit(handleCheckout)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

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
                 <Button form="checkout-form" type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                    {loading ? "Procesando..." : "Confirmar Pedido"}
                </Button>
              </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
