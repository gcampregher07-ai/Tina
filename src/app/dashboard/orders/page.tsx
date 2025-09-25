
"use client"
import * as React from "react"
import Link from "next/link"
import {
  File,
  ListFilter,
  MoreHorizontal,
  ChevronRight
} from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getOrders } from "@/lib/firestore"
import type { Order } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const PAGE_SIZE = 20;

export default function OrdersPage() {
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [lastId, setLastId] = React.useState<string | null>(null);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [totalOrders, setTotalOrders] = React.useState(0);
    const { toast } = useToast();

    React.useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const res = await getOrders(PAGE_SIZE);
                if (!mounted) return;
                setOrders(res.orders);
                setLastId(res.lastDocId);
                setTotalOrders(res.orders.length);
            } catch (error) {
                 console.error("Error fetching orders:", error);
                toast({
                    variant: "destructive",
                    title: "Error al cargar los pedidos",
                    description: "No se pudieron cargar los pedidos. Inténtalo de nuevo.",
                });
            } finally {
                setLoading(false);
            }
        }
        load();
        return () => { mounted = false; }
    }, [toast]);

    const loadMore = async () => {
        if (!lastId || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await getOrders(PAGE_SIZE, lastId);
            setOrders(prev => [...prev, ...res.orders]);
            setLastId(res.lastDocId);
            setTotalOrders(prev => prev + res.orders.length);
        } catch(error) {
             console.error("Error fetching more orders:", error);
             toast({
                variant: "destructive",
                title: "Error al cargar más pedidos",
                description: "No se pudieron cargar más pedidos. Inténtalo de nuevo.",
            });
        } finally {
            setLoadingMore(false);
        }
    };
    
  return (
    <AppShell>
       <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="pending" className="hidden sm:flex">
                Pendientes
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="hidden sm:flex">
                Cancelados
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filtrar
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Últimos 30 días
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>
                    Últimos 90 días
                  </DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem>
                    Todo el año
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Exportar
                </span>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Card className="mt-4">
                 <CardHeader>
                    <CardTitle>Pedidos</CardTitle>
                    <CardDescription>
                      Gestiona los pedidos de tus clientes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-10">Cargando pedidos...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="hidden md:table-cell">Estado</TableHead>
                                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.firstName} {order.lastName}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {order.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                            {order.status || 'Completado'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                      {format(new Date(order.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(order.total)}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/orders/${order.id}`}>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <ChevronRight className="h-4 w-4" />
                                                <span className="sr-only">Ver pedido</span>
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: !loading && `Mostrando <strong>${orders.length}</strong> pedidos` }} />
                </CardFooter>
            </Card>
            {!loading && (
                 <>
                 {lastId ? (
                    <div className="text-center my-4">
                        <Button onClick={loadMore} disabled={loadingMore}>
                        {loadingMore ? "Cargando..." : "Cargar más"}
                        </Button>
                    </div>
                    ) : (
                    <div className="text-sm text-muted-foreground text-center my-4">No hay más pedidos para mostrar</div>
                    )}
                </>
            )}
          </TabsContent>
        </Tabs>
    </AppShell>
  )
}
