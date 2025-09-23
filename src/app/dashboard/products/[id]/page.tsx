
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProductForm } from "@/components/product-form";
import { getProduct } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function EditProductSkeleton() {
    return (
        <AppShell>
            <div className="mx-auto grid w-full max-w-6xl gap-2">
                <Skeleton className="h-9 w-1/4" />
                <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="mx-auto w-full max-w-6xl items-start gap-6 pt-6">
                <Skeleton className="h-[600px] w-full" />
            </div>
        </AppShell>
    )
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No se proporcionó un ID de producto.");
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProduct(id);
        if (productData) {
          setProduct(productData);
        } else {
          setError("El producto no fue encontrado.");
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <EditProductSkeleton />;
  }

  if (error) {
    return (
      <AppShell>
        <div className="mx-auto grid w-full max-w-6xl gap-4 text-center">
          <h1 className="text-3xl font-semibold text-destructive">{error}</h1>
          <Button onClick={() => router.push('/dashboard/products')}>Volver a Productos</Button>
        </div>
      </AppShell>
    );
  }
  
  if (!product) {
       return (
      <AppShell>
        <div className="mx-auto grid w-full max-w-6xl gap-4 text-center">
          <h1 className="text-3xl font-semibold">Producto no encontrado</h1>
          <p className="text-muted-foreground">El producto que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => router.push('/dashboard/products')}>Volver a Productos</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Editar Producto</h1>
        <p className="text-muted-foreground">Actualiza los detalles de tu producto.</p>
      </div>
      <div className="mx-auto w-full max-w-6xl items-start gap-6 pt-6">
        <ProductForm product={product} />
      </div>
    </AppShell>
  );
}
