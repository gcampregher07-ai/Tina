

"use client";

import Link from "next/link"
import {
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart-context"
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import ProductImageCarousel from "./product-image-carousel";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
    const { toast } = useToast();
    const { dispatch } = useCart();
    
    const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
    const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
    const [availableColors, setAvailableColors] = React.useState<string[]>([]);
    const [availableQuantity, setAvailableQuantity] = React.useState(0);

    const totalStock = product.stock?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const allColors = React.useMemo(() => Array.from(new Set(product.stock?.map(s => s.color) || [])), [product.stock]);

    React.useEffect(() => {
        // Initially, all colors are available
        setAvailableColors(allColors);
        if (allColors.length === 1 && !selectedColor) {
            setSelectedColor(allColors[0]);
        }
    }, [allColors, selectedColor]);
    
    React.useEffect(() => {
        if (selectedSize) {
            // Filter colors that have stock for the selected size
            const colorsForSize = product.stock
                ?.filter(s => s.size === selectedSize && s.quantity > 0)
                .map(s => s.color) || [];
            setAvailableColors(Array.from(new Set(colorsForSize)));
        } else {
            // If no size is selected, all colors are potentially available
            setAvailableColors(allColors);
        }

        if (selectedSize && selectedColor) {
            const stockEntry = product.stock?.find(
                (s) => s.size === selectedSize && s.color === selectedColor
            );
            setAvailableQuantity(stockEntry ? stockEntry.quantity : 0);
        } else {
            setAvailableQuantity(0);
        }
    }, [selectedSize, selectedColor, product.stock, allColors]);


    const handleAddToCart = () => {
        const hasSizes = product.sizes && product.sizes.length > 0;
        const hasColors = product.colors && product.colors.length > 0;

        if (hasSizes && !selectedSize) {
             toast({
                variant: "destructive",
                title: "Selecciona un talle",
                description: "Por favor, elige un talle.",
            });
            return;
        }

        if (hasColors && !selectedColor) {
             toast({
                variant: "destructive",
                title: "Selecciona un color",
                description: "Por favor, elige un color.",
            });
            return;
        }
        
        if (availableQuantity < 1 && totalStock > 0) {
             toast({
                variant: "destructive",
                title: "Sin Stock",
                description: "Esta combinación de talle y color no está disponible.",
            });
            return;
        }

        if (totalStock === 0) {
            toast({
                variant: "destructive",
                title: "Sin Stock",
                description: "Este producto no está disponible actualmente.",
            });
            return;
        }

        dispatch({
            type: 'ADD_ITEM',
            payload: {
                product,
                quantity: 1,
                size: selectedSize || '',
                color: selectedColor || ''
            }
        })

        let toastDescription = `"${product.name}" ha sido añadido a tu carrito.`;
        if (selectedSize) toastDescription += ` (Talle: ${selectedSize})`;
        if (selectedColor) toastDescription += ` (Color)`;

        toast({
            title: "Añadido al carrito",
            description: toastDescription,
        });
    }

    const handleSizeChange = (value: string) => {
        setSelectedSize(value);
        // Reset color if the new size doesn't have the currently selected color
        const colorsForNewSize = product.stock
            ?.filter(s => s.size === value && s.quantity > 0)
            .map(s => s.color) || [];
        if (selectedColor && !colorsForNewSize.includes(selectedColor)) {
            setSelectedColor(null);
        }
    }

    const isAddToCartDisabled = (product.sizes && product.sizes.length > 0 && !selectedSize) || (product.colors && product.colors.length > 0 && !selectedColor) || (totalStock > 0 && availableQuantity < 1);

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.category && <CardDescription>{product.category.name}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="relative w-full overflow-hidden rounded-md bg-muted">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                        <ProductImageCarousel images={product.imageUrls} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Sin imagen
                        </div>
                    )}
                </div>
                 <p className="text-sm text-muted-foreground">{product.description}</p>
                 {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Talles:</span>
                         <ToggleGroup
                            type="single"
                            value={selectedSize || ""}
                            onValueChange={(value) => {
                                if (value) handleSizeChange(value);
                            }}
                            variant="outline"
                            size="sm"
                         >
                            {product.sizes.map(size => (
                                <ToggleGroupItem key={size} value={size} aria-label={`Talle ${size}`}>
                                    {size}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                )}
                {allColors && allColors.length > 0 && (
                     <div className="space-y-2">
                        <span className="text-sm font-medium">Colores:</span>
                         <ToggleGroup
                            type="single"
                            value={selectedColor || ""}
                            onValueChange={(value) => {
                                if (value) setSelectedColor(value);
                            }}
                            variant="outline"
                            size="sm"
                         >
                            {allColors.map(color => (
                                <ToggleGroupItem key={color} value={color} aria-label={`Color ${color}`} className="relative p-0 w-8 h-8 rounded-full" disabled={!availableColors.includes(color)}>
                                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }}></div>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center mt-auto pt-4">
                <div className="text-xl font-semibold">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}</div>
                <Button onClick={handleAddToCart} disabled={isAddToCartDisabled || totalStock === 0}>
                    {totalStock === 0 ? "Sin Stock" : <><Plus className="mr-2 h-4 w-4" /> Añadir al Carrito</>}
                </Button>
            </CardFooter>
        </Card>
    )
}
