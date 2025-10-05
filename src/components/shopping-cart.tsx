
"use client";

import React from "react";
import { ShoppingCart as ShoppingCartIcon, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import type { CartItem } from "@/lib/types";

export function ShoppingCart() {
  const { state, dispatch, getCartTotal, getCartItemCount } = useCart();
  const { items: cart } = state;
  const itemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  const getItemDescription = (item: CartItem) => {
    let descriptionParts = [];
    if (item.size) descriptionParts.push(`Talle: ${item.size}`);
    
    const colorElement = item.color ? (
      <span className="flex items-center gap-1.5">
        Color: <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: item.color }} />
      </span>
    ) : null;

    return (
      <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
        {descriptionParts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < descriptionParts.length - 1 && <span className="mx-1">-</span>}
          </React.Fragment>
        ))}
        {descriptionParts.length > 0 && colorElement && <span className="mx-1">-</span>}
        {colorElement}
      </div>
    );
  };
  
  const handleRemove = (cartItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { cartItemId } });
  }

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { cartItemId, quantity: newQuantity } });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCartIcon className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {itemCount}
            </Badge>
          )}
          <span className="sr-only">Abrir carrito de compras</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Tu Carrito ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCartIcon className="w-16 h-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Tu carrito está vacío</p>
            <p className="mt-2 text-sm text-muted-foreground">
              ¡Añade algunos productos para empezar!
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="flex flex-col gap-4 py-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      {item.imageUrls && item.imageUrls.length > 0 && (
                        <Image
                          src={item.imageUrls[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                       <div className="text-sm text-muted-foreground">{getItemDescription(item)}</div>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                           onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="mt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cartTotal)}</span>
                </div>
                <SheetClose asChild>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">Finalizar Compra</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
