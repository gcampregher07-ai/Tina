
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ImageUploader } from './image-uploader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from './ui/dialog';
import { FilePenIcon, Trash2 } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { getHeroData, saveHeroData } from '@/lib/firestore';
import type { HeroData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const heroSchema = z.object({
    title: z.string().min(1, "El título es requerido."),
    description: z.string().min(1, "La descripción es requerida."),
    buttonText: z.string().min(1, "El texto del botón es requerido."),
    imageUrl: z.string().url({ message: "Se requiere una URL de imagen válida." }).or(z.string().startsWith("data:image/", { message: "Se requiere una imagen." })).or(z.literal('')),
});

type HeroFormValues = z.infer<typeof heroSchema>;

const initialHeroData: HeroData = {
    title: 'Descubre lo último en moda y estilo',
    description: 'Explora nuestra colección curada de las últimas tendencias. Calidad y estilo, entregados a tu puerta.',
    buttonText: 'Explorar Colección',
    imageUrl: 'https://picsum.photos/1200/600?random=admin-hero',
};

export function EditableHeroSection() {
    const { toast } = useToast();
    const [heroData, setHeroData] = useState<HeroData>(initialHeroData);
    const [loading, setLoading] = useState(true);

    const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    const methods = useForm<HeroFormValues>({
        resolver: zodResolver(heroSchema),
        defaultValues: initialHeroData,
    });

    useEffect(() => {
        const fetchHeroData = async () => {
            setLoading(true);
            const data = await getHeroData();
            if (data) {
                setHeroData(data);
                methods.reset(data);
            }
            setLoading(false);
        };
        fetchHeroData();
    }, [methods]);
    
    const onSave = async (data: HeroFormValues) => {
        try {
            await saveHeroData(data);
            setHeroData(data);
            toast({ title: "Banner actualizado", description: "Los cambios en el banner se han guardado correctamente." });
            setIsTextDialogOpen(false);
            setIsImageDialogOpen(false);
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la información del banner." });
        }
    };
    
    const handleImageDelete = async () => {
        const updatedData = { ...heroData, imageUrl: '' };
         try {
            await saveHeroData(updatedData);
            setHeroData(updatedData);
            methods.setValue('imageUrl', '');
            toast({ title: "Imagen eliminada", description: "La imagen del banner ha sido eliminada." });
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la imagen del banner." });
        }
    }
    
    const onImageSave = (data: Pick<HeroFormValues, 'imageUrl'>) => {
        onSave({ ...heroData, ...data });
    };
    
    if (loading) {
        return (
             <section className="w-full py-12 bg-muted/40">
                <div className="container px-4 md:px-6">
                     <p>Cargando banner...</p>
                </div>
            </section>
        );
    }


  return (
    <FormProvider {...methods}>
        <section className="w-full py-12 bg-muted/40 relative group">
          <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilePenIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cambiar Imagen del Banner</DialogTitle>
                </DialogHeader>
                 <Form {...methods}>
                    <form onSubmit={methods.handleSubmit(onImageSave)} className="space-y-4">
                        <FormField
                            control={methods.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Imagen de cabecera</FormLabel>
                                <FormControl>
                                    <ImageUploader fieldName="imageUrl" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Guardar Imagen</Button>
                        </DialogFooter>
                    </form>
                </Form>
              </DialogContent>
            </Dialog>
             <Button variant="destructive" size="icon" onClick={handleImageDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[1fr_550px]">
               <div className="flex flex-col justify-center space-y-4 relative">
                 <div className="absolute top-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
                      <DialogTrigger asChild>
                         <Button variant="outline" size="icon">
                            <FilePenIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                       <DialogContent>
                         <Form {...methods}>
                            <form onSubmit={methods.handleSubmit(onSave)}>
                                <DialogHeader>
                                <DialogTitle>Editar Contenido del Banner</DialogTitle>
                                <DialogDescription>
                                    Actualiza el título, la descripción y el texto del botón.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                     <FormField
                                        control={methods.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Título</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={methods.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripción</FormLabel>
                                                <FormControl><Textarea {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={methods.control}
                                        name="buttonText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Texto del Botón</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                <Button type="submit">Guardar Cambios</Button>
                                </DialogFooter>
                            </form>
                         </Form>
                      </DialogContent>
                    </Dialog>
                 </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none">
                    {heroData.title}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {heroData.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/products">{heroData.buttonText}</Link>
                  </Button>
                </div>
              </div>
                {heroData.imageUrl ? (
                     <Image
                        alt="Hero"
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                        data-ai-hint="fashion collection"
                        src={heroData.imageUrl}
                        width="550"
                        height="310"
                    />
                ) : (
                    <div className="mx-auto aspect-video overflow-hidden rounded-xl bg-gray-200 flex items-center justify-center sm:w-full lg:order-last">
                        <span className="text-muted-foreground">Sin imagen</span>
                    </div>
                )}
            </div>
          </div>
        </section>
    </FormProvider>
  );
}
