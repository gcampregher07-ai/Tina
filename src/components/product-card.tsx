
"use client";

import Link from "next/link"
import "react-multi-carousel/lib/styles.css";
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

const colorNameToTailwind: { [key: string]: string } = {
    'negro': 'bg-black',
    'azul': 'bg-blue-500',
    'marrón': 'bg-yellow-900',
    'gris': 'bg-gray-500',
    'verde': 'bg-green-500',
    'naranja': 'bg-orange-500',
    'rosa': 'bg-pink-500',
    'púrpura': 'bg-purple-500',
    'rojo': 'bg-red-500',
    'blanco': 'bg-white border',
    'amarillo': 'bg-yellow-500',
    'turquesa': 'bg-cyan-500',
    'verde menta': 'bg-emerald-300',
    'magenta': 'bg-fuchsia-500',
    'beige': 'bg-amber-200',
    'rosado': 'bg-rose-400',
    'verde oscuro': 'bg-green-800',
    'lila': 'bg-violet-400',
    'azul claro': 'bg-sky-400',
    'melocotón': 'bg-orange-300',
    'violeta': 'bg-violet-600',
};


type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
    const { toast } = useToast();
    const { dispatch } = useCart();
    
    const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
    const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
    const [availableQuantity, setAvailableQuantity] = React.useState(0);

    const totalStock = product.stock?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    React.useEffect(() => {
        if (selectedSize && selectedColor) {
            const stockEntry = product.stock?.find(
                (s) => s.size === selectedSize && s.color === selectedColor
            );
            setAvailableQuantity(stockEntry ? stockEntry.quantity : 0);
        } else {
            setAvailableQuantity(0);
        }
    }, [selectedSize, selectedColor, product.stock]);


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
        if (selectedColor) toastDescription += ` (Color: ${selectedColor})`;

        toast({
            title: "Añadido al carrito",
            description: toastDescription,
        });
    }

    const isAddToCartDisabled = (product.sizes && product.sizes.length > 0 && !selectedSize) || (product.colors && product.colors.length > 0 && !selectedColor) || availableQuantity < 1;

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
                                if (value) setSelectedSize(value);
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
                {product.colors && product.colors.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Colores:</span>
                        <ToggleGroup
                            type="single"
                            value={selectedColor || ''}
                            onValueChange={(value) => {
                                if (value) setSelectedColor(value);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex flex-wrap justify-start gap-2"
                        >
                            {product.colors.map(color => (
                                <ToggleGroupItem
                                    key={color}
                                    value={color}
                                    aria-label={`Color ${color}`}
                                    className={cn("w-8 h-8 rounded-full p-0 border-2", selectedColor === color ? 'border-ring' : 'border-transparent')}
                                >
                                    <div className={cn("w-6 h-6 rounded-full", colorNameToTailwind[color.toLowerCase()] || 'bg-gray-400')}></div>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center mt-auto pt-4">
                <div className="text-xl font-semibold">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}</div>
                <Button onClick={handleAddToCart} disabled={totalStock > 0 && isAddToCartDisabled}>
                    <Plus className="mr-2 h-4 w-4" /> Añadir al Carrito
                </Button>
            </CardFooter>
        </Card>
    )
}

    