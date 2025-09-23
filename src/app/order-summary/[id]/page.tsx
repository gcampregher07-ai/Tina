
"use client";

import { useEffect, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrder } from "@/lib/firestore";
import type { Order, CartItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function OrderSummarySkeleton() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header categories={[]} />
            <main className="flex-1 bg-muted/40">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader className="text-center">
                                <Skeleton className="h-10 w-10 mx-auto rounded-full" />
                                <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                                <Skeleton className="h-5 w-1/2 mx-auto mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Skeleton className="h-6 w-1/3 mb-4" />
                                    <div className="space-y-4">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="h-16 w-16 rounded-md" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-5 w-3/4" />
                                                    <Skeleton className="h-4 w-1/4" />
                                                </div>
                                                <Skeleton className="h-5 w-1/6" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/5" /></div>
                                    <div className="flex justify-between font-bold"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-6 w-1/5" /></div>
                                </div>
                                <Separator />
                                 <div>
                                    <Skeleton className="h-6 w-1/3 mb-2" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="flex justify-center">
                                <Skeleton className="h-10 w-1/3" />
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function OrderSummaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) {
        setLoading(false);
        notFound();
        return;
    };
    
    getOrder(params.id)
      .then((orderData) => {
        if (!orderData) {
            setOrder(null);
        } else {
          setOrder(orderData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <OrderSummarySkeleton />;
  }

  if (!order) {
    notFound();
  }
  
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
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center bg-green-50/50 py-8">
                 <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                <CardTitle className="text-3xl mt-4 text-green-700">¡Gracias por tu pedido!</CardTitle>
                <p className="text-muted-foreground">Tu pedido ha sido confirmado.</p>
                <p className="text-sm text-muted-foreground pt-2">ID del Pedido: {order.id}</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Productos</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border">
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
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(order.total)}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <Separator className="my-2"/>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(order.total)}</span>
                  </div>
                </div>

                <Separator />

                <div>
                    <h3 className="font-semibold text-lg mb-2">Dirección de Envío y Contacto</h3>
                    <div className="text-muted-foreground">
                        <p>{order.firstName} {order.lastName}</p>
                        <p>{order.address}</p>
                        <p>{order.city}</p>
                         <p>{order.phone}</p>
                    </div>
                </div>

              </CardContent>
              <CardFooter className="flex justify-center p-6">
                <Button asChild>
                  <Link href="/products">Seguir comprando</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
