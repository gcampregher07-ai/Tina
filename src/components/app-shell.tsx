
"use client"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Tag,
  Home,
  Menu,
  ClipboardList
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { TinaLogo } from "@/components/logo";
import { User } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Inicio", icon: Home, exact: true },
    { href: "/dashboard/products", label: "Productos", icon: Package },
    { href: "/dashboard/categories", label: "Categorías", icon: Tag },
    { href: "/dashboard/orders", label: "Pedidos", icon: ClipboardList },
]

function AppShellNav() {
    const pathname = usePathname()
    return (
         <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  item.exact ? (pathname === item.href ? "bg-muted text-primary" : "") : (pathname.startsWith(item.href) ? "bg-muted text-primary" : "")
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
        </nav>
    )
}

function AppShellMobileNav() {
    const pathname = usePathname()
    return (
        <nav className="grid gap-6 text-lg font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                <TinaLogo width="120" height="40" priority />
            </Link>
            {navItems.map((item) => (
                <Link
                key={item.label}
                href={item.href}
                className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    (item.exact ? pathname === item.href : pathname.startsWith(item.href)) && "text-foreground"
                )}
                >
                <item.icon className="h-5 w-5" />
                {item.label}
                </Link>
            ))}
        </nav>
    )
}


export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
      router.push('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <TinaLogo width={180} height={60} priority className="h-10 w-auto"/>
              <span className="sr-only">Tina Clothing</span>
            </Link>
          </div>
          <div className="flex-1">
            <AppShellNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <AppShellMobileNav />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
             <h1 className="text-xl font-semibold whitespace-nowrap">Panel de Administración</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
              >
                <User className="h-5 w-5"/>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
        </main>
      </div>
    </div>
  )
}
