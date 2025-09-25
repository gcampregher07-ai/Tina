
"use client";

import Link from "next/link";
import { MapPin, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "@/components/shopping-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { TinaLogo } from "./logo";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Header({ categories }: { categories: Category[] }) {
  const address = "Pedro Goyena 112, Río Cuarto, Córdoba";
  const mapsQuery = encodeURIComponent(address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const pathname = usePathname();
  const showTopBar = !pathname.startsWith('/dashboard') && pathname !== '/login';
  
  return (
    <header className={cn("px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm z-40 border-b", showTopBar ? "sticky top-[33px]" : "sticky top-0")}>
      <div className="flex items-center justify-start lg:w-1/4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
                <SheetTitle>
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                        <TinaLogo width="120" height="40" priority />
                    </Link>
                </SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-6">
              <SheetClose asChild>
                <Link href="/" className="font-medium">Inicio</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/products" className="font-medium">Toda la colección</Link>
              </SheetClose>
              {categories.map((category) => (
                <SheetClose key={category.id} asChild>
                  <Link href={`/products?category=${category.id}`} className="font-medium">
                    {category.name}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link href="/contact" className="font-medium">Contacto</Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="hidden lg:block">
          <TinaLogo width={180} height={60} priority className="h-12 w-auto" />
        </Link>
      </div>


      <nav className="hidden lg:flex flex-1 justify-center items-center gap-6">
        <Link href="/" className="text-sm font-medium hover:text-accent-foreground/80 transition-colors">
          Inicio
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium hover:text-accent-foreground/80 transition-colors px-0 gap-1">
              Productos <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
             <DropdownMenuItem asChild>
                <Link href="/products">Toda la colección</Link>
             </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link href={`/products?category=${category.id}`}>{category.name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/contact" className="text-sm font-medium hover:text-accent-foreground/80 transition-colors">
          Contacto
        </Link>
      </nav>

      <div className="flex items-center justify-end gap-2 lg:w-1/4">
        <Link 
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
            aria-label="Ubicación"
        >
            <Button variant="ghost" size="icon">
                <MapPin className="h-5 w-5" />
                <span className="sr-only">Ubicación</span>
            </Button>
        </Link>
        <ShoppingCart />
      </div>
    </header>
  );
}
