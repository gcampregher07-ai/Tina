
"use client"
import React from "react";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getCategories } from "@/lib/firestore";
import type { Category } from "@/lib/types";
import { ProductGrid } from "@/components/product-grid";

export default function ProductsPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const selectedCategory = (categoryId: string | null) => categoryId ? categories.find(c => c.id === categoryId) : null;

  return (
    <div className="flex flex-col min-h-screen">
       <Header categories={categories} />
        <main className="flex-1">
            <React.Suspense fallback={
                <div className="w-full py-12 md:py-16">
                    <div className="container px-4 md:px-6">
                         <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
                            Cargando...
                        </h1>
                        <div className="text-center py-20 text-muted-foreground">
                            Cargando productos...
                        </div>
                    </div>
                </div>
            }>
                <ProductGrid categories={categories} />
            </React.Suspense>
        </main>
      <Footer />
    </div>
  );
}
