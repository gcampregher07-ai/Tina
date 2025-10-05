
"use client";

import { useRouter } from "next/navigation";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { deleteProduct } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";
import ProductImageCarousel from "./product-image-carousel";

type DashboardProductCardProps = {
  product: Product;
  onProductDeleted?: (productId: string) => void;
};

export function DashboardProductCard({ product, onProductDeleted }: DashboardProductCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEdit = () => {
    router.push(`/dashboard/products/${product.id}`);
  };

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      toast({
        title: "Producto eliminado",
        description: `El producto "${product.name}" ha sido eliminado.`,
      });
      if (onProductDeleted) {
        onProductDeleted(product.id);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el producto.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const totalStock = product.stock?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        {product.category && <CardDescription>{product.category.name}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="relative w-full overflow-hidden rounded-md bg-muted aspect-square">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <ProductImageCarousel images={product.imageUrls} />
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto pt-4">
        <div className="text-lg font-semibold">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}</div>
        <div className="text-sm text-muted-foreground">Stock: {totalStock}</div>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEdit}>
                Editar
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">
                  Eliminar
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
