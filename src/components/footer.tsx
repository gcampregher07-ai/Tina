import Link from "next/link";
import { MapPin } from "lucide-react";
import { TinaLogo } from "./logo";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  const whatsappNumber = "5493584922453";
  const instagramUrl = "https://www.instagram.com/tinabas.clothing/";
  const address = "Pedro Goyena 112, Río Cuarto, Córdoba";
  const mapsQuery = encodeURIComponent(address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/">
            <TinaLogo width="100" height="32" />
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Tina Clothing. Todos los derechos reservados.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="h-5 w-5" />
            </Link>
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="h-5 w-5" />
            </Link>
            <Link
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Ubicación"
            >
              <MapPin className="h-5 w-5" />
            </Link>
          </nav>
          <div className="h-6 w-px bg-border hidden sm:block"></div>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            prefetch={false}
          >
            Gestión
          </Link>
        </div>
      </div>
    </footer>
  );
}
