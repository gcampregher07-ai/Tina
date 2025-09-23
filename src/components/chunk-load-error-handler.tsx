"use client";

import { useEffect } from "react";

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Este es un error común en Next.js cuando se despliega una nueva versión
      // y el cliente intenta cargar un chunk de JS antiguo que ya no existe.
      if (
        event.message.includes("Loading chunk") &&
        event.message.includes("failed")
      ) {
        console.warn("ChunkLoadError detectado, recargando la página...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
