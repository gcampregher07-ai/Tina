

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
import ColorPicker from "./ColorPicker";

const SIZES_LETTERS = ["S", "M", "L", "XL"];
const SIZES_NUMBERS = ["34", "36", "38", "40", "42", "44", "46"];

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
  colors: z.array(z.string()).nonempty("Debe definir al menos un color en el stock."),
  stock: z.array(stockItemSchema).nonempty("Debe ingresar stock para al menos una combinación de talle y color"),
})

type ProductFormValues = z.infer<typeof productSchema>

function StockInputs() {
  const { control, getValues, formState: { errors } } = useFormContext<ProductFormValues>();
  
  const { fields, replace } = useFieldArray({
    control,
    name: "stock",
  });
  
  const watchedSizes = useWatch({ control, name: "sizes" });
  const [newColor, setNewColor] = React.useState("#000000");

  const handleAddColor = () => {
    const currentStock = getValues("stock") || [];
    const newStock: StockItem[] = [...currentStock];
    const watchedSizesValue = watchedSizes || [];

    // Check if this color is already managed
    const colorExists = currentStock.some(item => item.color === newColor);
    if(colorExists) {
      // Maybe show a toast? For now, we just don't add it.
      return;
    }

    if (watchedSizesValue.length > 0) {
      for (const size of watchedSizesValue) {
        newStock.push({
          size,
          color: newColor,
          quantity: 0,
        });
      }
    }
    replace(newStock);
  };


  React.useEffect(() => {
    const currentStock = getValues("stock") || [];
    const newStock: StockItem[] = [];
    const existingColors = Array.from(new Set(currentStock.map(s => s.color)));

    if (watchedSizes && watchedSizes.length > 0 && existingColors.length > 0) {
      for (const color of existingColors) {
          for (const size of watchedSizes) {
              const existingStockItem = currentStock.find(
                  (s: StockItem) => s.size === size && s.color === color
              );
              newStock.push({
                  size,
                  color,
                  quantity: existingStockItem ? existingStockItem.quantity : 0,
              });
          }
      }
       // Filter out items for sizes that are no longer selected
      const filteredStock = newStock.filter(item => watchedSizes.includes(item.size));
      replace(filteredStock);
    } else {
      replace([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSizes]);


  if (!watchedSizes?.length) {
      return <p className="text-sm text-muted-foreground">Selecciona al menos un talle para empezar a gestionar el stock.</p>
  }
  
  const stockByColor = fields.reduce((acc, field) => {
    if (!acc[field.color]) {
      acc[field.color] = [];
    }
    acc[field.color].push(field);
    return acc;
  }, {} as Record<string, typeof fields>);

  return (
    <div className="space-y-4">
        <div className="flex items-end gap-4">
            <FormItem>
                <FormLabel>Añadir Color</FormLabel>
                <FormControl>
                    <ColorPicker
                        initialColor={newColor}
                        onColorChange={setNewColor}
                    />
                </FormControl>
            </FormItem>
            <Button type="button" onClick={handleAddColor} variant="outline">Añadir Color a Stock</Button>
        </div>
        
        {Object.entries(stockByColor).map(([color, stockItems]) => (
            <div key={color} className="space-y-2 rounded border p-4 bg-muted/50">
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border" style={{backgroundColor: color}}></div>
                    <h4 className="font-medium">Stock para color: {color}</h4>
                 </div>
                {stockItems.map((field) => {
                    const index = fields.findIndex(f => f.id === field.id);
                    return (
                        <div key={field.id} className="flex items-center justify-between gap-4 p-2 rounded bg-background">
                            <span className="font-medium text-sm capitalize">Talle: {field.size}</span>
                            <Controller
                                control={control}
                                name={`stock.${index}.quantity`}
                                render={({ field: controllerField }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormLabel className="text-sm">Cantidad:</FormLabel>
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
            </div>
        ))}

       {errors.stock && typeof errors.stock === 'object' && 'message' in errors.stock && (
          <p className="text-sm font-medium text-destructive">{errors.stock.message}</p>
      )}
       {errors.colors && typeof errors.colors === 'object' && 'message' in errors.colors && (
          <p className="text-sm font-medium text-destructive">{errors.colors.message}</p>
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
  const watchedStock = watch("stock");

  // Automatically update `colors` array based on the stock
  React.useEffect(() => {
      const uniqueColors = Array.from(new Set(watchedStock.map(item => item.color)));
      setValue("colors", uniqueColors, { shouldValidate: true, shouldDirty: true });
  }, [watchedStock, setValue]);

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
                             <FormLabel>Talles Aplicables</FormLabel>
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
                     <div className="space-y-2">
                        <FormLabel>Gestión de Stock por Color</FormLabel>
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
