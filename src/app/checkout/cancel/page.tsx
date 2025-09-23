
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={[]} />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center bg-red-50/50 py-8">
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                <CardTitle className="text-3xl mt-4 text-red-700">Pago cancelado</CardTitle>
                <p className="text-muted-foreground">Tu proceso de pago ha sido cancelado.</p>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <p>Tu carrito ha sido guardado. Puedes intentar el pago de nuevo cuando quieras.</p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 p-6">
                <Button asChild variant="outline">
                  <Link href="/checkout">Volver al Checkout</Link>
                </Button>
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
