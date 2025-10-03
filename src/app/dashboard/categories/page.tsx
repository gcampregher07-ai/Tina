
"use client"
import * as React from "react"
import {
  MoreHorizontal,
  PlusCircle,
  Database,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from '@/lib/firebase-client';
import { collection, addDoc as addCategoryDoc, getDocs, query, where } from 'firebase/firestore';
import { getCategories, addCategory, getProducts } from "@/lib/firestore";
import type { Category, Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const initialCategories = [
    "Remeras/Tops",
    "Short",
    "Pantalones",
    "Faldas",
    "Vestidos",
    "Abrigos"
];

export default function CategoriesPage() {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const { toast } = useToast();

    const fetchCategoriesAndProducts = async () => {
        setLoading(true);
        try {
            const [categoriesData, productsResponse] = await Promise.all([
                getCategories(),
                getProducts()
            ]);
            setCategories(categoriesData || []);
            setProducts(productsResponse?.products || []);
        } catch (error) {
            console.error("Error fetching data:", error);
             toast({
                variant: "destructive",
                title: "Error al cargar los datos",
                description: "No se pudieron cargar las categorías y productos. Inténtalo de nuevo.",
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCategoriesAndProducts();
    }, []);

    const handleSaveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        if (name) {
            try {
                await addCategory({ name });
                setIsDialogOpen(false);
                (event.target as HTMLFormElement).reset();
                await fetchCategoriesAndProducts();
                toast({
                    title: "Categoría guardada",
                    description: `La categoría "${name}" se ha añadido correctamente.`,
                });
            } catch (error) {
                console.error("Error saving category:", error);
                 toast({
                    variant: "destructive",
                    title: "Error al guardar",
                    description: "No se pudo guardar la categoría.",
                });
            }
        }
    }
    
    const handleSeedCategories = async () => {
        try {
            const categoriesCollection = collection(db, 'categories');
            for (const categoryName of initialCategories) {
                const q = query(categoriesCollection, where("name", "==", categoryName));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    await addCategoryDoc(categoriesCollection, { name: categoryName });
                }
            }
            await fetchCategoriesAndProducts();
            toast({
                title: "Categorías sembradas",
                description: "Las categorías iniciales se han añadido a la base de datos.",
            });
        } catch (error) {
            console.error("Error seeding categories:", error);
            toast({
                variant: "destructive",
                title: "Error al sembrar",
                description: "No se pudieron añadir las categorías iniciales.",
            });
        }
    }

  const getProductCount = (categoryId: string) => {
    if (!products || !Array.isArray(products)) return 0;
    return products.filter(p => p.categoryId === categoryId).length;
  }
  
  const handleActionClick = () => {
    alert("Funcionalidad no implementada todavía.");
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-semibold">Categorías</h1>
            <p className="text-muted-foreground mt-2">Gestiona las categorías de tus productos.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleSeedCategories}>
                <Database className="h-3.5 w-3.5" />
                 <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Cargar Categorías
                </span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Añadir Categoría
                </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSaveCategory}>
                    <DialogHeader>
                    <DialogTitle>Añadir Nueva Categoría</DialogTitle>
                    <DialogDescription>
                        Introduce el nombre para la nueva categoría de productos.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                        Nombre
                        </Label>
                        <Input id="name" name="name" className="col-span-3" required />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit">Guardar categoría</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          {loading ? (
             <p className="text-center py-10">Cargando categorías...</p>
          ): (
            <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre de la Categoría</TableHead>
                    <TableHead>Nº de Productos</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getProductCount(category.id)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleActionClick}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleActionClick} className="text-destructive">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-4">
              {categories.map((category) => (
                  <Card key={category.id}>
                      <CardHeader>
                          <CardTitle>{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                              {getProductCount(category.id)} Productos
                          </div>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Toggle menu</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={handleActionClick}>Editar</DropdownMenuItem>
                                  <DropdownMenuItem onClick={handleActionClick} className="text-destructive">Eliminar</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </CardContent>
                  </Card>
              ))}
            </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            {!loading && `Mostrando <strong>1-${categories.length}</strong> de <strong>${categories.length}</strong> categorías`}
          </div>
        </CardFooter>
      </Card>
    </AppShell>
  )
}
