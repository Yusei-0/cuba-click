import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Products count
        const { count: productsCount, error: err1 } = await supabase
          .from("productos")
          .select("*", { count: "exact", head: true });
        if (err1) console.error("Error products:", err1);

        // Orders count
        const { count: ordersCount, error: err2 } = await supabase
          .from("pedidos")
          .select("*", { count: "exact", head: true });
        if (err2) console.error("Error orders:", err2);

        // Pending orders
        const { count: pendingCount, error: err3 } = await supabase
          .from("pedidos")
          .select("*", { count: "exact", head: true })
          .eq("estado", "pendiente");
        if (err3) console.error("Error pending:", err3);

        // Revenue (approximate sum of completed orders)
        // Note: This might be heavy if many orders, better to use a database function or simpler stat
        const { data: orders, error: err4 } = await (
          supabase.from("pedidos") as any
        )
          .select("total_productos, total_envio")
          .eq("estado", "completado");

        if (err4) console.error("Error revenue:", err4);

        const revenue =
          orders?.reduce(
            (sum: number, o: any) => sum + o.total_productos + o.total_envio,
            0,
          ) || 0;

        setStats({
          products: productsCount || 0,
          orders: ordersCount || 0,
          revenue,
          pendingOrders: pendingCount || 0,
        });
      } catch (e) {
        console.error("Dashboard error:", e);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Package className="w-8 h-8" />
            </div>
            <div className="stat-title">Productos</div>
            <div className="stat-value text-primary">{stats.products}</div>
            <div className="stat-desc">En catálogo</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="stat-title">Pedidos Totales</div>
            <div className="stat-value text-secondary">{stats.orders}</div>
            <div className="stat-desc">Histórico</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="stat-title">Pendientes</div>
            <div className="stat-value text-accent">{stats.pendingOrders}</div>
            <div className="stat-desc">Por procesar</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="stat-title">Ingresos</div>
            <div className="stat-value text-success font-normal text-3xl">
              ${stats.revenue.toFixed(0)}
            </div>
            <div className="stat-desc">Pedidos completados</div>
          </div>
        </div>
      </div>

      {/* Need to implement more charts or lists here later */}
      <div className="card bg-base-100 shadow-xl p-6">
        <h3 className="font-bold text-lg mb-4">
          Bienvenido al Panel de Administración
        </h3>
        <p className="text-gray-600">
          Desde aquí puedes gestionar el inventario, ver y actualizar el estado
          de los pedidos y administrar la tienda.
        </p>
      </div>
    </div>
  );
}
