
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import type { CartItem, Product } from './types';

type State = {
  items: CartItem[];
};

type Action =
  | { type: "ADD_ITEM"; payload: { product: Product, quantity: number, size: string, color: string } }
  | { type: "REMOVE_ITEM"; payload: { cartItemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { cartItemId: string; quantity: number } }
  | { type: "CLEAR_CART" };

const initialState: State = {
  items: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity, size, color } = action.payload;
      const cartItemId = product.id + size + color;
      const existingIndex = state.items.findIndex((item) => item.id === cartItemId);

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += quantity;
        return { ...state, items: updatedItems };
      }

      const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          size,
          color,
          imageUrls: product.imageUrls
      }

      return { ...state, items: [...state.items, newItem] };
    }

    case "REMOVE_ITEM": {
        const { cartItemId } = action.payload;
        return {
            ...state,
            items: state.items.filter((item) => item.id !== cartItemId),
        };
    }

    case "UPDATE_QUANTITY": {
      const { cartItemId, quantity } = action.payload;
       if (quantity <= 0) {
            return {
                ...state,
                items: state.items.filter((item) => item.id !== cartItemId),
            };
        }
      const updatedItems = state.items.map((item) => {
        if (item.id === cartItemId) {
          return { ...item, quantity };
        }
        return item;
      });
      return { ...state, items: updatedItems };
    }

    case "CLEAR_CART": {
        return { ...state, items: [] };
    }

    default:
      return state;
  }
}

type CartContextType = {
    state: State;
    dispatch: React.Dispatch<Action>;
    getCartTotal: () => number;
    getCartItemCount: () => number;
};

const CartContext = createContext<CartContextType>({
  state: initialState,
  dispatch: () => null,
  getCartTotal: () => 0,
  getCartItemCount: () => 0,
});


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    try {
      const localData = localStorage.getItem('tina-cart');
      return localData ? { items: JSON.parse(localData) } : initial;
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tina-cart', JSON.stringify(state.items));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [state.items]);

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return <CartContext.Provider value={{ state, dispatch, getCartTotal, getCartItemCount }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
