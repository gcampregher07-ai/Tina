
"use client"
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/lib/firestore"
import type { Product, Category } from "@/lib/types"

export function ProductGrid({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');

  useEffect(() => {
    async function fetchData() {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = categoryId ? products.filter(p => p.categoryId === categoryId) : products;
  const selectedCategory = categoryId ? categories.find(c => c.id === categoryId) : null;

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
        ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20 text-muted-foreground">
                No hay productos en esta categoría.
            </div>
        )}
      </div>
    </section>
  );
}
