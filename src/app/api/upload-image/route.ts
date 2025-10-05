
import { NextResponse } from "next/server";
import { bucket } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  if (!bucket) {
    return NextResponse.json({ message: "El servicio de almacenamiento no está inicializado. Revisa la configuración de Firebase Admin." }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file || !productId) {
      return NextResponse.json({ message: "Faltan parámetros requeridos: file, productId" }, { status: 400 });
    }

    const imageId = uuidv4();
    const fileName = `${imageId}-${file.name}`;
    const filePath = `products/${productId}/${fileName}`;
    const bucketFile = bucket.file(filePath);

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await bucketFile.save(fileBuffer, {
      metadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable'
      },
    });
    
    await bucketFile.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({ publicUrl });

  } catch (error: any) {
    console.error("Error completo en la API de subida de imágenes:", JSON.stringify(error, null, 2));
    const errorMessage = error.message || "Error interno del servidor al subir la imagen.";
     if (error.code === 403) {
        return NextResponse.json({ message: "Permiso denegado. Revisa los permisos de la cuenta de servicio para Storage." }, { status: 403 });
    }
    return NextResponse.json({ message: `No se pudo subir el archivo al bucket. ${errorMessage}`, error: error }, { status: 500 });
  }
}
