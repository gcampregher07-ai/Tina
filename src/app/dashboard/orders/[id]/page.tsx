
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClientOrder } from "@/lib/firebase-client";
import type { Order, CartItem } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

function OrderDetailSkeleton() {
    return (
         <AppShell>
            <div className="grid flex-1 auto-rows-max gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-24 ml-auto" />
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-7 w-1/3" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-48 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                     <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                         <Card>
                            <CardHeader>
                               <Skeleton className="h-7 w-2/3" />
                               <Skeleton className="h-5 w-1/2" />
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                     </div>
                </div>
            </div>
        </AppShell>
    )
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getClientOrder(params.id)
        .then((orderData) => {
          if (!orderData) {
            setError("El pedido no fue encontrado.");
          } else {
            setOrder(orderData);
          }
        })
        .catch(err => {
            console.error(err);
            setError("No se pudo cargar el pedido.");
        })
        .finally(() => setLoading(false));
    } else {
        setError("No se proporcionó un ID de pedido.");
        setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <AppShell>
        <div className="mx-auto grid w-full max-w-6xl gap-4 text-center">
          <h1 className="text-3xl font-semibold text-destructive">{error || "El pedido no fue encontrado."}</h1>
           <p className="text-muted-foreground">El pedido que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => router.push('/dashboard/orders')}>Volver a Pedidos</Button>
        </div>
      </AppShell>
    );
  }

  const getItemDescription = (item: CartItem) => {
    let details = [];
    if (item.size) details.push(item.size);
    if (item.color) details.push(item.color);
    return details.join(' / ') || '-';
  }

  return (
    <AppShell>
      <div className="grid flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/dashboard/orders">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Volver a Pedidos</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Detalles del Pedido
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0 bg-green-100 text-green-800">
            {order.status || 'Completado'}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Productos</CardTitle>
                 <CardDescription>{order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Imagen</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Talle / Color</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                           {item.imageUrls && item.imageUrls.length > 0 && (
                             <Image
                                src={item.imageUrls[0]}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                              />
                           )}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getItemDescription(item)}</TableCell>
                        <TableCell>x{item.quantity}</TableCell>
                        <TableCell className="text-right">
                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Actualizado por última vez: <time dateTime={format(new Date(order.createdAt), "yyyy-MM-dd'T'HH:mm:ss")}>{format(new Date(order.createdAt), "'el' dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</time>
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
                <CardDescription>
                    ID Pedido: {order.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <div className="font-semibold">Detalles del Cliente</div>
                    <address className="grid gap-0.5 not-italic text-muted-foreground">
                    <span>{order.firstName} {order.lastName}</span>
                    <span>{order.address}</span>
                    <span>{order.city}</span>
                    </address>
                </div>
                <div className="grid gap-2">
                    <div className="font-semibold">Contacto</div>
                    <div className="text-muted-foreground">
                        <span>{order.phone}</span>
                    </div>
                </div>
                <Separator />
                <div className="grid gap-2 text-sm">
                    <div className="flex items-center">
                        <div>Subtotal</div>
                        <div className="ml-auto">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(order.total)}</div>
                    </div>
                     <div className="flex items-center">
                        <div>Envío</div>
                        <div className="ml-auto">Gratis</div>
                    </div>
                    <Separator />
                     <div className="flex items-center font-semibold">
                        <div>Total</div>
                        <div className="ml-auto">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(order.total)}</div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
