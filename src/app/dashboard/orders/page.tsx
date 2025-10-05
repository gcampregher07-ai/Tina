
"use client"
import * as React from "react"
import Link from "next/link"
import {
  File,
  ListFilter,
  ChevronRight,
  CreditCard,
  DollarSign
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
import { getClientOrders } from "@/lib/firebase-client"
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
    const { toast } = useToast();

    const { monthlySales, monthlyOrdersCount } = React.useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const relevantOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });

        const totalSales = relevantOrders.reduce((sum, order) => sum + order.total, 0);

        return { monthlySales: totalSales, monthlyOrdersCount: relevantOrders.length };
    }, [orders]);


    React.useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const res = await getClientOrders(100); // Fetch more to calculate monthly sales accurately
                if (!mounted) return;
                setOrders(res.orders);
                setLastId(res.lastDocId);
            } catch (error) {
                 console.error("Error fetching orders:", error);
                toast({
                    variant: "destructive",
                    title: "Error al cargar los pedidos",
                    description: "No se pudieron cargar los pedidos. Inténtalo de nuevo.",
                });
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }
        load();
        return () => { mounted = false; }
    }, [toast]);

    const loadMore = async () => {
        if (!lastId || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await getClientOrders(PAGE_SIZE, lastId);
            setOrders(prev => [...prev, ...res.orders]);
            setLastId(res.lastDocId);
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
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Pedidos</h1>
          </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ventas del Mes
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                 {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monthlySales)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de ingresos para el mes actual
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos del Mes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{monthlyOrdersCount}</div>
               <p className="text-xs text-muted-foreground">
                Número de pedidos realizados este mes
              </p>
            </CardContent>
          </Card>
        </div>
          
        <Card className="mt-4">
              <CardHeader>
                <CardTitle>Todos los Pedidos</CardTitle>
                <CardDescription>
                  Revisa y gestiona los pedidos de tus clientes.
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
    </AppShell>
  )
}
