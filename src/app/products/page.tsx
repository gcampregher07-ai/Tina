
import React from "react";
import { Header } from '@/components/header';
import { getCategories, getProducts } from "@/lib/firestore";
import type { Category, Product } from "@/lib/types";
import { ProductGrid } from "@/components/product-grid";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import('@/components/footer').then(mod => mod.Footer), { ssr: false });

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const categoryId = searchParams?.category as string | undefined;

  const [categories, initialProductData] = await Promise.all([
    getCategories(),
    getProducts(12),
  ]);
  
  return (
    <div className="flex flex-col min-h-screen">
       <Header categories={categories} />
        <main className="flex-1">
          <ProductGrid
            categories={categories}
            initialProducts={initialProductData.products}
            initialLastDocId={initialProductData.lastDocId}
            initialCategoryId={categoryId}
          />
        </main>
      <Footer />
    </div>
  );
}
