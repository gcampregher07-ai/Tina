import { AppShell } from "@/components/app-shell";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <AppShell>
       <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Añadir Nuevo Producto</h1>
        <p className="text-muted-foreground">Rellena los detalles para añadir un nuevo producto a tu tienda.</p>
      </div>
       <div className="mx-auto w-full max-w-6xl items-start gap-6 pt-6">
         <ProductForm />
       </div>
    </AppShell>
  );
}
