
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CheckoutSuccessPage() {
    const { dispatch } = useCart();

    useEffect(() => {
        // Clear the cart when the user successfully completes checkout
        dispatch({ type: "CLEAR_CART" });
    }, [dispatch]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header categories={[]} />
            <main className="flex-1 bg-muted/40">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader className="text-center bg-green-50/50 py-8">
                                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                                <CardTitle className="text-3xl mt-4 text-green-700">¡Pago exitoso!</CardTitle>
                                <p className="text-muted-foreground">Gracias por tu compra. Tu pedido está siendo procesado.</p>
                            </CardHeader>
                            <CardContent className="p-6 text-center">
                               <p>Recibirás una confirmación por correo electrónico en breve.</p>
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
