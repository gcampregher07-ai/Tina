
"use client"

import { AppShell } from "@/components/app-shell"
import { EditableHeroSection } from "@/components/editable-hero-section"

export default function Dashboard() {
  return (
    <AppShell>
      <EditableHeroSection />
      <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Bienvenido al panel de Tina Clothing
        </h2>
        <p className="mt-2 text-muted-foreground">
          Desde aquí puedes gestionar tus productos, categorías, pedidos y más.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Utiliza la barra de navegación de la izquierda para empezar.
        </p>
      </div>
    </AppShell>
  )
}
