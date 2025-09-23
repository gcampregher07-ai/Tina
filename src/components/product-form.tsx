
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider, useWatch, useFieldArray, Controller, useFormContext } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import * as React from "react";
import { doc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addProduct, updateProduct, getCategories } from "@/lib/firestore"
import type { Product, Category, StockItem } from "@/lib/types"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { ImageUploader } from "./image-uploader"

const SIZES_LETTERS = ["S", "M", "L", "XL"];
const SIZES_NUMBERS = ["34", "36", "38", "40", "42", "44", "46"];
const COLORS = [
    "negro", "azul", "marrón", "gris", "verde", "naranja", "rosa", "púrpura", 
    "rojo", "blanco", "amarillo", "turquesa", "verde menta", "magenta", 
    "beige", "rosado", "verde oscuro", "lila", "azul claro", "melocotón", "violeta"
];
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


const stockItemSchema = z.object({
  size: z.string(),
  color: z.string(),
  quantity: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo."),
});

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(1, "La descripción es requerida."),
  price: z.coerce.number().positive("El precio debe ser un número positivo."),
  categoryId: z.string().nonempty("Por favor, selecciona una categoría."),
  imageUrls: z.array(z.string().url()).max(4, "Puedes subir un máximo de 4 imágenes.").optional().default([]),
  sizes: z.array(z.string()).nonempty("Debe seleccionar al menos un talle"),
  colors: z.array(z.string()).nonempty("Debe seleccionar al menos un color"),
  stock: z.array(stockItemSchema).nonempty("Debe ingresar stock para talles y colores"),
})

type ProductFormValues = z.infer<typeof productSchema>

function StockInputs() {
  const { control, getValues, formState: { errors } } = useFormContext<ProductFormValues>();
  
  const { fields, replace } = useFieldArray({
    control,
    name: "stock",
  });
  
  const watchedSizes = useWatch({ control, name: "sizes" });
  const watchedColors = useWatch({ control, name: "colors" });

  React.useEffect(() => {
    const currentStock = getValues("stock") || [];
    const newStock: StockItem[] = [];

    if (watchedSizes && watchedSizes.length > 0 && watchedColors && watchedColors.length > 0) {
      for (const size of watchedSizes) {
        for (const color of watchedColors) {
          const existingStock = currentStock.find(
            (s: StockItem) => s.size === size && s.color === color
          );
          newStock.push({
            size,
            color,
            quantity: existingStock ? existingStock.quantity : 0,
          });
        }
      }
    }
    replace(newStock);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSizes, watchedColors, replace]);

  if (!watchedSizes?.length || !watchedColors?.length) {
      return <p className="text-sm text-muted-foreground">Selecciona al menos un talle y un color para gestionar el stock.</p>
  }
  
  return (
    <div className="space-y-2 max-h-60 overflow-auto rounded border p-2 bg-muted/50">
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="flex items-center justify-between gap-4 p-2 rounded bg-background">
            <div className="flex items-center gap-2">
               <div className={cn("w-4 h-4 rounded-full border", colorNameToTailwind[field.color.toLowerCase()] || 'bg-gray-400')}></div>
               <span className="font-medium text-sm capitalize">{field.color} / {field.size}</span>
            </div>
            <Controller
                control={control}
                name={`stock.${index}.quantity`}
                render={({ field: controllerField }) => (
                    <FormItem>
                         <FormControl>
                            <Input
                            type="number"
                            min={0}
                            {...controllerField}
                            className="w-24 h-8"
                            inputMode="numeric"
                            />
                        </FormControl>
                        <FormMessage />
                   </FormItem>
                )}
            />
          </div>
        )
      })}
       {errors.stock && typeof errors.stock === 'object' && 'message' in errors.stock && (
          <p className="text-sm font-medium text-destructive">{errors.stock.message}</p>
      )}
    </div>
  );
}


export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = React.useState<Category[]>([]);
  
  const productId = React.useMemo(() => {
    return product?.id || doc(collection(db, "products")).id
  }, [product])
  
  React.useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        imageUrls: product.imageUrls || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock || [],
    } : {
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        imageUrls: [],
        sizes: [],
        colors: [],
        stock: [],
    },
    mode: "onChange",
  })
  
  const { formState, control, setValue, watch } = methods;

  const imageUrls = watch("imageUrls");

  async function onSubmit(data: ProductFormValues) {
    // Filter out any empty strings from imageUrls before submitting
    const payload = {
        ...data,
        imageUrls: data.imageUrls?.filter(url => url && typeof url === 'string' && url.length > 0) || []
    };

    try {
      if (product) {
        await updateProduct(product.id, payload);
        toast({
          title: "Producto Actualizado",
          description: `El producto "${data.name}" ha sido actualizado con éxito.`,
        })
      } else {
        await addProduct(productId, payload);
        toast({ title: "Producto guardado", description: `El producto "${data.name}" ha sido guardado con éxito.` })
      }
      router.push('/dashboard/products');
      router.refresh();
    } catch (error) {
       console.error(error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar el producto. Inténtelo de nuevo.",
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Producto</CardTitle>
                <CardDescription>
                  {product ? "Actualiza los detalles de tu producto." : "Introduce los detalles de tu nuevo producto."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Remera Lisa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tu producto en detalle..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Talles, Colores y Stock</CardTitle>
                    <CardDescription>Define las variaciones de tu producto y gestiona el stock para cada una.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <FormField
                        control={control}
                        name="sizes"
                        render={({ field }) => (
                            <FormItem>
                             <FormLabel>Talles</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <ToggleGroup
                                        type="multiple"
                                        variant="outline"
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        {SIZES_LETTERS.map(size => (
                                            <ToggleGroupItem key={size} value={size} aria-label={`Talle ${size}`}>
                                                {size}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                     <ToggleGroup
                                        type="multiple"
                                        variant="outline"
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        {SIZES_NUMBERS.map(size => (
                                            <ToggleGroupItem key={size} value={size} aria-label={`Talle ${size}`}>
                                                {size}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </div>
                            </FormControl>
                            <FormMessage className="pt-2" />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={control}
                        name="colors"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Colores</FormLabel>
                                <FormControl>
                                    <ToggleGroup
                                        type="multiple"
                                        variant="outline"
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="flex flex-wrap justify-start gap-2"
                                    >
                                        {COLORS.map(color => (
                                            <ToggleGroupItem
                                                key={color}
                                                value={color}
                                                aria-label={`Color ${color}`}
                                                className={cn("w-8 h-8 rounded-full p-0 border-2", field.value?.includes(color) ? 'border-ring' : 'border-transparent')}
                                            >
                                                <div className={cn("w-6 h-6 rounded-full", colorNameToTailwind[color.toLowerCase()] || 'bg-gray-400')}></div>
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </FormControl>
                                <FormMessage className="pt-2" />
                            </FormItem>
                        )}
                    />
                     <div className="space-y-2">
                        <FormLabel>Gestión de Stock</FormLabel>
                        <StockInputs />
                     </div>
                </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Imágenes del Producto</CardTitle>
                    <CardDescription>Sube hasta 4 imágenes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                      <FormField
                          key={index}
                          control={control}
                          name={`imageUrls.${index}`}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Imagen {index + 1}</FormLabel>
                                  <FormControl>
                                      <ImageUploader
                                          fieldName={field.name}
                                          productId={productId}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  ))}
                   <FormField
                      control={control}
                      name="imageUrls"
                      render={() => <FormMessage />}
                    />
                </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Organización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={product?.categoryId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="99.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={formState.isSubmitting}>
                Cancelar
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Guardando..." : (product ? "Guardar Cambios" : "Guardar Producto")}
            </Button>
        </div>
      </form>
    </FormProvider>
  )
}

    