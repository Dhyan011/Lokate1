import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IndiaMap } from '../components/map/IndiaMap';
import { useWarehouses } from '../api/hooks';
import {
  Card, Badge, CapacityBar, FacilityBadge, SkeletonCard,
  ErrorState, EmptyState, SectionLabel, Button
} from '../components/ui/primitives';
import type { FacilityType } from '../types';

const STATES = [
  'All States', 'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
  'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const FACILITY_TYPES: Array<{ value: '' | FacilityType; label: string }> = [
  { value: '', label: 'All Types' },
  { value: 'COLD_STORAGE', label: '❄️ Cold Storage' },
  { value: 'WAREHOUSE', label: '🏭 Warehouse' },
  { value: 'HYBRID', label: '⚡ Hybrid' },
];

const MIN_CAPACITY_OPTIONS = [0, 500, 1000, 2000, 5000];

export default function MapPage() {
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [facilityType, setFacilityType] = useState<'' | FacilityType>('');
  const [minCapacity, setMinCapacity] = useState(0);

  const filters = useMemo(() => ({
    state: selectedState,
    facility_type: facilityType || undefined,
    min_available: minCapacity || undefined,
  }), [selectedState, facilityType, minCapacity]);

  const { data: warehouses, isLoading, error, refetch } = useWarehouses(filters);

  const handleStateSelect = (state: string | undefined) => {
    setSelectedState(state);
  };

  const allWarehouses = useWarehouses().data ?? [];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Page Header */}
      <div className="bg-base-dark/50 backdrop-blur-md border-b border-base-deep">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SectionLabel>Network Overview</SectionLabel>
            <h1 className="font-display text-4xl font-bold text-ink mb-2">
              Warehouse Network Map
            </h1>
            <p className="text-ink-muted text-base max-w-2xl">
              {allWarehouses.length} facilities across {new Set(allWarehouses.map(w => w.state)).size} states —
              hover to preview, click to inspect capacity and contact details.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border p-4 mb-6 flex flex-wrap gap-4 items-end"
        >
          {/* State filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider block mb-1.5">
              State
            </label>
            <select
              value={selectedState ?? 'All States'}
              onChange={e => setSelectedState(e.target.value === 'All States' ? undefined : e.target.value)}
              className="w-full bg-base-dark border border-base-deep rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            >
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Facility type filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider block mb-1.5">
              Facility Type
            </label>
            <select
              value={facilityType}
              onChange={e => setFacilityType(e.target.value as '' | FacilityType)}
              className="w-full bg-base-dark border border-base-deep rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            >
              {FACILITY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Min capacity filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider block mb-1.5">
              Min Available (MT)
            </label>
            <select
              value={minCapacity}
              onChange={e => setMinCapacity(Number(e.target.value))}
              className="w-full bg-base-dark border border-base-deep rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            >
              {MIN_CAPACITY_OPTIONS.map(c => (
                <option key={c} value={c}>{c === 0 ? 'Any capacity' : `≥ ${c.toLocaleString()} MT`}</option>
              ))}
            </select>
          </div>

          {/* Reset */}
          {(selectedState || facilityType || minCapacity > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedState(undefined); setFacilityType(''); setMinCapacity(0); }}
            >
              Reset filters
            </Button>
          )}

          {/* Active count */}
          <div className="text-sm text-ink-muted ml-auto self-end pb-0.5">
            {isLoading ? '...' : <><strong className="text-ink">{warehouses?.length ?? 0}</strong> facilities</>}
          </div>
        </motion.div>

        {/* Main Grid: Map + List */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <IndiaMap
              warehouses={allWarehouses}
              selectedState={selectedState}
              onStateSelect={handleStateSelect}
              className="h-full"
            />
          </motion.div>

          {/* Warehouse List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="space-y-3 max-h-[600px] overflow-y-auto pr-1"
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} />)
            ) : error ? (
              <ErrorState message="Failed to load warehouses" onRetry={() => refetch()} />
            ) : !warehouses?.length ? (
              <EmptyState
                icon="🔍"
                title="No matches"
                message="Adjust your filters to see facilities in this area."
              />
            ) : (
              warehouses.map((wh, i) => (
                <motion.div
                  key={wh.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <WarehouseListCard warehouse={wh} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Warehouse List Card ─────────────────────────────────────────────────

function WarehouseListCard({ warehouse: wh }: { warehouse: import('../types').Warehouse }) {
  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FacilityBadge type={wh.facility_type} />
            <Badge variant={wh.status === 'ACTIVE' ? 'success' : 'default'}>{wh.status}</Badge>
          </div>
          <h3 className="font-display text-base font-bold text-ink leading-tight truncate">
            {wh.name}
          </h3>
          <p className="text-xs text-ink-subtle mt-0.5">{wh.warehouse_code} · {wh.city}, {wh.state}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-display text-xl font-bold ${
            wh.utilization_pct > 85 ? 'text-alert' :
            wh.utilization_pct > 65 ? 'text-warm' : 'text-success'
          }`}>
            {wh.utilization_pct.toFixed(0)}%
          </div>
          <div className="text-xs text-ink-subtle">utilized</div>
        </div>
      </div>

      <CapacityBar used={wh.used_capacity_mt} total={wh.total_capacity_mt} />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-ink-muted">
          {(wh.available_capacity_mt / 1000).toFixed(1)}K MT available
        </span>
        <div className="flex gap-1 flex-wrap justify-end">
          {wh.facility_tags.slice(0, 2).map(tag => (
            <Badge key={tag} size="sm">{tag}</Badge>
          ))}
          {wh.facility_tags.length > 2 && (
            <Badge size="sm">+{wh.facility_tags.length - 2}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
