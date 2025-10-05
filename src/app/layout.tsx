
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart-context';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import { LayoutManager } from '@/components/layout-manager';
import dynamic from 'next/dynamic';
import { getHeroData } from '@/lib/firestore';

const WhatsAppButton = dynamic(() => import('@/components/whatsapp-button').then(mod => mod.WhatsAppButton), {
  ssr: false,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tina Clothing',
  description: 'Moderna aplicación de gestión de tiendas de comercio electrónico.',
};

const initialHeroData = {
    title: 'Descubre lo último en moda y estilo',
    description: 'Explora nuestra colección curada de las últimas tendencias. Calidad y estilo, entregados a tu puerta.',
    buttonText: 'Explorar Colección',
    imageUrl: 'https://picsum.photos/1200/600?random=public-hero',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = process.env.NEXT_PUBLIC_TINA_WHATSAPP_NUMBER || "";
  const heroData = (await getHeroData()) ?? initialHeroData;

  return (
    <html lang="es" className="antialiased">
       <head>
          <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://ventaunica.firebaseapp.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://apis.google.com" crossOrigin="anonymous" />
          {heroData?.imageUrl && (
              <link rel="preload" as="image" href={heroData.imageUrl} fetchPriority="high" />
          )}
      </head>
      <body className={cn("font-sans", inter.variable)}>
        <ChunkLoadErrorHandler />
        <AuthProvider>
            <CartProvider>
                <LayoutManager>
                    {children}
                </LayoutManager>
                <WhatsAppButton phoneNumber={whatsappNumber} />
                <Toaster />
            </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
