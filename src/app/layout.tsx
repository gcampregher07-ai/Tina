
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = process.env.NEXT_PUBLIC_TINA_WHATSAPP_NUMBER || "";

  return (
    <html lang="es" className="antialiased">
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
