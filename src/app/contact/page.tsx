
"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import ContactForm from "@/components/contact-form";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0"
        {...props}
    >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.316 1.906 6.03.21.262.35.565.41.884l-1.072 3.911 3.996-1.045a.93.93 0 0 1 .819.122z" />
    </svg>
);


export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_TINA_WHATSAPP_NUMBER || "";
  const instagramUrl = "https://www.instagram.com/tinabas.clothing/";
  const address = "Pedro Goyena 112, Río Cuarto, Córdoba";
  const mapsQuery = encodeURIComponent(address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const contactItems = [
    {
      icon: <WhatsAppIcon className="h-8 w-8 text-green-500" />,
      title: "WhatsApp",
      content: "+54 9 3584 92-2453",
      href: `https://wa.me/${whatsappNumber}`,
    },
    {
      icon: <InstagramIcon className="h-8 w-8 text-pink-600" />,
      title: "Instagram",
      content: "@tinabas.clothing",
      href: instagramUrl,
    },
    {
      icon: <MapPin className="h-8 w-8 text-blue-500" />,
      title: "Dirección",
      content: address,
      href: mapsUrl,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={[]} />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Ponte en Contacto
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Contáctanos a través de cualquiera de
              los siguientes canales.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {contactItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground group-hover:underline">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
          <div className="max-w-3xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
