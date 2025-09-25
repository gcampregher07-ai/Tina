
"use client"

import Link from "next/link"
import React, { useEffect, useState } from "react";
import {
  ListFilter,
  PlusCircle,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DashboardProductCard } from "@/components/dashboard-product-card"
import { AppShell } from "@/components/app-shell"
import { getProducts, getCategories } from "@/lib/firestore";
import type { Product, Category } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData?.products || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleProductDeleted = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  return (
    <AppShell>
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Cargando datos...</div>
      ) : (
      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <ScrollArea className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">
                <Package className="h-4 w-4 mr-2" />
                Todo
              </TabsTrigger>
              {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filtrar
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Activo
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Borrador
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Archivado
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="default" className="h-8 gap-1" asChild>
              <Link href="/dashboard/products/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Añadir Producto
                </span>
              </Link>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 py-4">
                {products.map((product) => (
                    <DashboardProductCard key={product.id} product={product} onProductDeleted={handleProductDeleted}/>
                ))}
            </div>
        </TabsContent>
        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id}>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 py-4">
                {products.filter(p => p.categoryId === cat.id).map((product) => (
                    <DashboardProductCard key={product.id} product={product} onProductDeleted={handleProductDeleted}/>
                ))}
            </div>
            {products.filter(p => p.categoryId === cat.id).length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No hay productos en esta categoría.
                </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      )}
    </AppShell>
  )
}
