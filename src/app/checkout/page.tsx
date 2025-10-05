
import { Header } from "@/components/header";
import { CheckoutForm } from "@/components/checkout-form";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import('@/components/footer').then(mod => mod.Footer), { ssr: false });

function CheckoutLoading() {
    return (
        <div className="flex flex-col min-h-screen">
        <Header categories={[]} />
            <main className="flex-1 flex items-center justify-center text-center">
                <div>
                    <h1 className="text-2xl font-semibold mb-4">Cargando...</h1>
                    <p className="text-muted-foreground mb-8">Preparando el formulario de pago.</p>
                </div>
            </main>
        <Footer />
        </div>
    )
}

export default function CheckoutPage() {

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={[]} />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Finalizar Compra</h1>
            <Suspense fallback={<CheckoutLoading />}>
                <CheckoutForm />
            </Suspense>
        </main>
      <Footer />
    </div>
  );
}
