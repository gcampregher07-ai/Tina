
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getProducts, getCategories, getHeroData } from "@/lib/firestore";
import type { Product, Category, HeroData } from "@/lib/types";
import { Header } from "@/components/header";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Footer } from "@/components/footer";

const initialHeroData = {
    title: 'Descubre lo último en moda y estilo',
    description: 'Explora nuestra colección curada de las últimas tendencias. Calidad y estilo, entregados a tu puerta.',
    buttonText: 'Explorar Colección',
    imageUrl: 'https://picsum.photos/1200/600?random=public-hero',
};


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData, heroDataFromDb] = await Promise.all([
          getProducts(4), // Fetch only 4 featured products
          getCategories(),
          getHeroData(),
        ]);
        setProducts(productsData.products);
        setCategories(categoriesData);
        setHeroData(heroDataFromDb ?? initialHeroData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHeroData(initialHeroData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  

  const featuredProducts = products;

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categories} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                   {loading || !heroData ? (
                    <>
                      <Skeleton className="h-12 w-3/4 mx-auto lg:mx-0" />
                      <div className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0 space-y-2 mt-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                      </div>
                    </>
                  ) : (
                    <>
                       <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                        {heroData.title}
                      </h1>
                      <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                        {heroData.description}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row mx-auto lg:mx-0">
                   <Button size="lg" variant="secondary" asChild>
                    <Link href="/products">{loading || !heroData ? '...' : heroData.buttonText}</Link>
                  </Button>
                </div>
              </div>
               {loading || !heroData ? (
                    <Skeleton className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last" />
               ) : heroData.imageUrl ? (
                    <Image
                        alt="Hero"
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                        data-ai-hint="fashion collection"
                        src={heroData.imageUrl}
                        width={600}
                        height={338}
                        priority
                    />
                ) : (
                    <div className="mx-auto aspect-video overflow-hidden rounded-xl bg-gray-200 flex items-center justify-center sm:w-full lg:order-last">
                    </div>
                )}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Productos Destacados
            </h2>
            {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent><Skeleton className="aspect-video w-full" /></CardContent>
                            <CardFooter><Skeleton className="h-8 w-1/2" /></CardFooter>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
