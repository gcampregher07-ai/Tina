
"use client";

import { useState } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { AlertCircle, Trash2, Upload } from "lucide-react";
import { ref, deleteObject } from "firebase/storage";

import { storage } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  fieldName: string;
  productId?: string;
}

export function ImageUploader({ fieldName, productId }: ImageUploaderProps) {
  const { setValue, watch, formState: { isSubmitting } } = useFormContext();
  const imageUrl = watch(fieldName);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId || "new");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload-image", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const { publicUrl } = JSON.parse(xhr.responseText);
          setValue(fieldName, publicUrl, { shouldValidate: true, shouldDirty: true });
          toast({ title: "Imagen subida", description: "La imagen se ha subido correctamente." });
          setTimeout(() => setUploadProgress(null), 1000);
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.message || `Error al subir: ${xhr.statusText}`);
            toast({ variant: "destructive", title: "Error de subida", description: errorData.message || xhr.statusText });
          } catch {
             setError(`Error al subir: ${xhr.statusText}`);
             toast({ variant: "destructive", title: "Error de subida", description: xhr.responseText || xhr.statusText });
          }
          setUploadProgress(null);
        }
      };

      xhr.onerror = () => {
          const networkError = `Fallo de red al intentar subir la imagen. Por favor, revisa tu conexión a internet.`;
          setError(networkError);
          toast({ variant: "destructive", title: "Error de Red", description: networkError, duration: 9000 });
          setUploadProgress(null);
      };

      xhr.send(formData);

    } catch (uploadError: any) {
      console.error("Upload error:", uploadError);
      const errorMessage = uploadError.message || "Ocurrió un error desconocido al subir la imagen.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Error de subida", description: errorMessage, duration: 9000 });
      setUploadProgress(null);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;

    try {
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
      setValue(fieldName, "", { shouldValidate: true, shouldDirty: true });
      toast({ title: "Imagen eliminada", description: "La imagen se ha eliminado correctamente." });
    } catch (error: any) {
      console.error("Error deleting image:", error);
      if (error.code === 'storage/object-not-found') {
        setValue(fieldName, "", { shouldValidate: true, shouldDirty: true });
      } else {
        toast({ variant: "destructive", title: "Error al eliminar", description: "No se pudo eliminar la imagen." });
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById(`image-upload-input-${fieldName}`)?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagen del Producto</CardTitle>
        <CardDescription>Sube una imagen para tu producto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "aspect-video w-full flex items-center justify-center rounded-md border-2 border-dashed transition-colors",
            { "border-destructive": error, "p-0 border-none": imageUrl && !error }
          )}
        >
          {error ? (
            <div className="flex flex-col items-center gap-2 text-destructive p-4 text-center">
              <AlertCircle className="h-10 w-10" />
              <p className="font-medium">Error al cargar la imagen</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt="Vista previa del producto"
                fill
                className="object-contain rounded-md"
              />
            </div>
          ) : (
            uploadProgress === null && (
              <div onClick={triggerFileInput} className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground p-4 text-center">
                <Upload className="h-10 w-10" />
                <p className="font-medium">Haz clic o arrastra para subir un archivo</p>
                <p className="text-xs">Cualquier formato y tamaño de imagen</p>
              </div>
            )
          )}
          {uploadProgress !== null && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center w-full h-full">
              <p>Subiendo...</p>
              <Progress value={uploadProgress} className="w-[80%]" />
            </div>
          )}
        </div>
        <Input id={`image-upload-input-${fieldName}`} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={uploadProgress !== null || isSubmitting} />

        {imageUrl && !uploadProgress && (
          <Button type="button" variant="outline" className="w-full" onClick={handleDeleteImage} disabled={isSubmitting}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar imagen
          </Button>
        )}
        {!imageUrl && !uploadProgress && (
          <Button type="button" variant="outline" className="w-full" onClick={triggerFileInput} disabled={isSubmitting}>
            <Upload className="mr-2 h-4 w-4" />
            Subir una imagen
          </Button>
        )}

      </CardContent>
    </Card>
  );
}
