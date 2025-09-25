
"use client"
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/lib/firestore"
import type { Product, Category } from "@/lib/types"
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type ProductGridProps = {
  categories: Category[];
  initialProducts: Product[];
  initialLastDocId: string | null;
  initialCategoryId?: string;
};

export function ProductGrid({
  categories,
  initialProducts,
  initialLastDocId,
  initialCategoryId,
}: ProductGridProps) {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category') ?? initialCategoryId;

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [lastDocId, setLastDocId] = useState<string | null>(initialLastDocId);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null | undefined>(categoryId);

  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    if (!currentCategoryId) return products;
    return products.filter(p => p.categoryId === currentCategoryId);
  }, [products, currentCategoryId]);

  useEffect(() => {
    const newCategoryId = searchParams.get('category');
    if (newCategoryId !== currentCategoryId) {
      setLoading(true);
      setCurrentCategoryId(newCategoryId);
      // Reset products and load from scratch for the new category
      getProducts(12).then(data => {
        setProducts(data.products);
        setLastDocId(data.lastDocId);
      }).catch(error => {
        console.error("Error fetching category products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los productos para esta categoría.",
        });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [searchParams, currentCategoryId, toast]);
  

  const loadMoreProducts = async () => {
    if (!lastDocId || loadingMore) return;
    setLoadingMore(true);
    try {
      const { products: newProducts, lastDocId: newLastDocId } = await getProducts(12, lastDocId);
      setProducts(prev => [...prev, ...newProducts]);
      setLastDocId(newLastDocId);
    } catch (error) {
      console.error("Error fetching more products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar más productos.",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const selectedCategory = currentCategoryId ? categories.find(c => c.id === currentCategoryId) : null;
  const displayProducts = currentCategoryId ? filteredProducts : products;

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
          {selectedCategory ? `Productos en ${selectedCategory.name}` : "Toda la Colección"}
        </h1>
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Cargando productos...
          </div>
        ) : displayProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {lastDocId && (
                <div className="text-center mt-12">
                  <Button onClick={loadMoreProducts} disabled={loadingMore}>
                    {loadingMore ? 'Cargando...' : 'Cargar más productos'}
                  </Button>
                </div>
              )}
            </>
        ) : (
            <div className="text-center py-20 text-muted-foreground">
                No hay productos {selectedCategory ? 'en esta categoría' : 'disponibles'}.
            </div>
        )}
      </div>
    </section>
  );
}
