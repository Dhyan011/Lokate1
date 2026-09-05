import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import {
  useNetworkStats, useWarehouses, useLowStockAlerts, useStockMovements, useDeliveries, useStockOverview
} from '../api/hooks';
import {
  Card, Badge, CapacityBar, SkeletonCard, Skeleton,
  SectionLabel, ErrorState
} from '../components/ui/primitives';
import { colors } from '../styles/tokens';

// ─── Network Stat Card ────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <Card className="p-5">
      <SectionLabel>{label}</SectionLabel>
      <div className={`font-display text-4xl font-black mt-1 mb-1 ${accent ? 'text-accent' : 'text-ink'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <p className="text-xs text-ink-muted">{sub}</p>}
    </Card>
  );
}

// ─── Stock By Row Chart (Hackathon Requirement) ─────────────────────────────

function StockByRowChart() {
  const { data: rawData, isLoading } = useStockOverview();

  // Format data for Recharts, filter to Ludhiana warehouse (id: 2) as an example
  // Or just use the first warehouse we have data for.
  const chartData = rawData
    ?.filter(r => r.warehouse_id === 2) // PB-LDH-001 is typically ID 2
    .map(r => ({
      name: r.row_label,
      items: r.total_quantity
    })) || [];

  if (isLoading) {
    return (
      <Card className="p-6 border-accent/20 bg-accent/5 flex items-center justify-center min-h-[300px]">
        <Skeleton height="200px" width="100%" />
      </Card>
    );
  }

  return (
    <Card className="p-6 border-accent/20 bg-accent/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Warehouse Internal: Stock Overview by Row</h2>
          <p className="text-xs text-ink-subtle mt-1">Ludhiana Grain Depot (PB-LDH-001)</p>
        </div>
        <Badge variant="accent" size="sm">📍 Row/Bin Tracking</Badge>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barCategoryGap="25%">
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.inkSubtle, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: colors.inkSubtle, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={v => `${v} MT`} />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ background: colors.ink, border: 'none', borderRadius: 8, color: colors.base, fontSize: 12 }} 
            labelStyle={{ color: colors.base, fontWeight: 600, marginBottom: 4 }}
          />
          <Bar dataKey="items" fill={colors.accentPrimary} radius={[4, 4, 0, 0]} name="Stock Available (MT)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Capacity Chart ───────────────────────────────────────────────────────

function CapacityChart({ warehouses }: { warehouses: import('../types').Warehouse[] }) {
  const data = warehouses
    .sort((a, b) => b.utilization_pct - a.utilization_pct)
    .slice(0, 8)
    .map(w => ({
      name: w.warehouse_code,
      used: Math.round(w.used_capacity_mt / 1000),
      available: Math.round(w.available_capacity_mt / 1000),
      pct: w.utilization_pct,
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barCategoryGap="30%">
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: colors.inkSubtle, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: colors.inkSubtle, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}K`}
        />
        <Tooltip
          contentStyle={{
            background: colors.ink,
            border: 'none',
            borderRadius: 8,
            color: colors.base,
            fontSize: 12,
            fontFamily: 'Inter',
          }}
          labelStyle={{ color: colors.base, fontWeight: 600 }}
          formatter={(v: number, name: string) => [
            `${v}K MT`,
            name === 'used' ? 'Used' : 'Available'
          ]}
        />
        <Bar dataKey="used" stackId="a" fill={colors.accentPrimary} radius={[0, 0, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pct > 85 ? colors.accentAlert : entry.pct > 65 ? colors.accentWarm : colors.accentPrimary}
            />
          ))}
        </Bar>
        <Bar dataKey="available" stackId="a" fill={colors.baseDeep} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Utilization Donut ─────────────────────────────────────────────────────

function UtilizationDonut({ pct }: { pct: number }) {
  const data = [
    { name: 'Used', value: pct },
    { name: 'Available', value: 100 - pct },
  ];
  const color = pct > 85 ? colors.accentAlert : pct > 65 ? colors.accentWarm : colors.accentSuccess;

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={70}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill={colors.baseDeep} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-2xl font-black text-ink">{pct.toFixed(0)}%</div>
        <div className="text-xs text-ink-subtle">utilized</div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useNetworkStats();
  const { data: warehouses, isLoading: whLoading } = useWarehouses();
  const { data: alerts } = useLowStockAlerts();
  const { data: movements } = useStockMovements();
  const { data: deliveries } = useDeliveries();

  const deliveryCounts = React.useMemo(() => {
    if (!deliveries) return {};
    return deliveries.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [deliveries]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-base-dark/50 backdrop-blur-md border-b border-base-deep">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <SectionLabel>Operations</SectionLabel>
            <h1 className="font-display text-4xl font-bold text-ink">Network Dashboard</h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)
          ) : stats ? (
            <>
              <StatCard label="Total Facilities" value={stats.total_warehouses + stats.total_cold_storages + stats.total_hybrid} sub={`${stats.total_cold_storages} cold · ${stats.total_hybrid} hybrid`} />
              <StatCard label="States Covered" value={stats.states_covered} sub="Across India" accent />
              <StatCard label="Total Capacity" value={`${(stats.total_capacity_mt / 1000).toFixed(0)}K MT`} sub="metric tonnes" />
              <StatCard label="Network Util." value={`${stats.network_utilization_pct.toFixed(1)}%`} sub={`${(stats.total_used_capacity_mt / 1000).toFixed(0)}K MT in use`} />
            </>
          ) : null}
        </motion.div>

        {/* Hackathon Requirement: Stock by Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <StockByRowChart />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,280px] gap-6">
          {/* Capacity Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold text-ink">Capacity by Facility</h2>
                <div className="flex gap-4 text-xs text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.accentPrimary }} />
                    Used
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.baseDeep }} />
                    Available
                  </span>
                </div>
              </div>
              {whLoading ? (
                <Skeleton height="260px" />
              ) : warehouses ? (
                <CapacityChart warehouses={warehouses} />
              ) : null}
            </Card>
          </motion.div>

          {/* Network utilization donut */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            <Card className="p-6 flex flex-col items-center justify-center h-full">
              <SectionLabel>Network Utilization</SectionLabel>
              {stats ? (
                <>
                  <UtilizationDonut pct={stats.network_utilization_pct} />
                  <div className="mt-4 text-center">
                    <div className="text-sm text-ink-muted">
                      {(stats.total_used_capacity_mt / 1000).toFixed(0)}K of {(stats.total_capacity_mt / 1000).toFixed(0)}K MT
                    </div>
                  </div>
                </>
              ) : <Skeleton height="160px" width="160px" circle />}
            </Card>
          </motion.div>
        </div>

        {/* Alerts + Movements Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold text-ink">Low Stock Alerts</h2>
                {alerts && alerts.length > 0 && (
                  <Badge variant="alert" size="md">{alerts.length} alerts</Badge>
                )}
              </div>
              <div className="space-y-3">
                {alerts?.map(alert => (
                  <div key={alert.id}
                       className={`flex items-start gap-4 p-3 rounded-lg border
                                   ${alert.severity === 'CRITICAL'
                                     ? 'bg-alert-light/60 border-alert/30'
                                     : 'bg-warm-light/40 border-warm/30'}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-alert' : 'bg-warm'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-ink truncate">{alert.product.name}</div>
                      <div className="text-xs text-ink-muted">{alert.warehouse.name} · {alert.warehouse.city}</div>
                      <div className="text-xs mt-1">
                        <span className={alert.severity === 'CRITICAL' ? 'text-alert-dark' : 'text-warm-dark'}>
                          {alert.quantity_available.toLocaleString()} MT
                        </span>
                        <span className="text-ink-subtle"> / threshold {alert.threshold.toLocaleString()} MT</span>
                      </div>
                    </div>
                    <Badge variant={alert.severity === 'CRITICAL' ? 'alert' : 'warm'} size="sm">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                {!alerts?.length && (
                  <p className="text-center text-ink-subtle text-sm py-8">✓ No active alerts</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Stock Movements */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.27 }}
          >
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold text-ink mb-5">Recent Movements</h2>
              <div className="space-y-3">
                {movements?.map(mv => (
                  <div key={mv.id} className="flex items-center gap-4 py-2.5 border-b border-base-deep last:border-0">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${mv.type === 'INBOUND' ? 'bg-success-light text-success-dark' :
                        mv.type === 'OUTBOUND' ? 'bg-alert-light text-alert-dark' :
                        'bg-warm-light text-warm-dark'}
                    `}>
                      {mv.type === 'INBOUND' ? '↓' : mv.type === 'OUTBOUND' ? '↑' : '⇄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{mv.product.name}</div>
                      <div className="text-xs text-ink-subtle">{mv.warehouse.name} · {mv.warehouse.city}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-ink">{mv.quantity.toLocaleString()} MT</div>
                      <div className="text-xs text-ink-subtle">
                        {new Date(mv.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Deliveries Summary */}
        {deliveries && deliveries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold text-ink mb-5">Active Deliveries</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['IN_TRANSIT', 'DELAYED', 'PENDING', 'DELIVERED'] as const).map(status => (
                  <div key={status} className="bg-base-dark rounded-xl p-4 text-center">
                    <div className="font-display text-3xl font-bold text-ink mb-1">
                      {deliveryCounts[status] ?? 0}
                    </div>
                    <Badge
                      variant={status === 'DELAYED' ? 'alert' : status === 'DELIVERED' ? 'success' : status === 'IN_TRANSIT' ? 'warm' : 'default'}
                    >
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-3">
                {deliveries.filter(d => ['IN_TRANSIT', 'DELAYED'].includes(d.status)).map(d => {
                  const hasWeatherWarning = ['SEVERE', 'MODERATE'].includes((d.weather_condition || '').toUpperCase());
                  return (
                    <div key={d.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-base-dark/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-ink">#{d.id}</span>
                          <Badge variant={d.status === 'DELAYED' ? 'alert' : 'warm'} size="sm">
                            {d.status.replace('_', ' ')}
                          </Badge>
                          {hasWeatherWarning && (
                            <Badge variant="alert" size="sm">⚠️ {d.weather_condition?.toUpperCase()} WEATHER</Badge>
                          )}
                        </div>
                        <p className="text-sm text-ink truncate max-w-[280px]">To: {d.destination_address}</p>
                      </div>
                      <div className="text-right">
                        {d.estimated_delivery ? (
                          <>
                            <div className={`font-display text-base font-bold ${hasWeatherWarning ? 'text-alert' : 'text-ink'}`}>
                              {new Date(d.estimated_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-xs text-ink-subtle">ETA {hasWeatherWarning && '(Inflated)'}</div>
                          </>
                        ) : (
                          <div className="text-sm text-ink-subtle mt-2">Computing...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
