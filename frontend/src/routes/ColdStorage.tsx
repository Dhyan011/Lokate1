import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWarehouses } from '../api/hooks';
import {
  Card, Badge, CapacityBar, SkeletonCard, SectionLabel, EmptyState, Button
} from '../components/ui/primitives';
import type { Warehouse } from '../types';

const INDIAN_STATES_WITH_COLD = [
  'All States', 'Maharashtra', 'Gujarat', 'Tamil Nadu', 'Telangana',
  'West Bengal', 'Karnataka', 'Delhi', 'Haryana', 'Punjab',
];

function ColdStorageCard({ wh, index }: { wh: Warehouse; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card hover className="p-6 h-full flex flex-col">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="accent">❄️ Cold Storage</Badge>
          {wh.facility_tags.slice(0, 2).map(t => (
            <Badge key={t} size="sm">{t}</Badge>
          ))}
        </div>

        {/* Name & location */}
        <div className="mb-4">
          <div className="text-xs font-mono text-ink-subtle mb-1">{wh.warehouse_code}</div>
          <h3 className="font-display text-xl font-bold text-ink mb-1 leading-tight">
            {wh.name}
          </h3>
          <p className="text-sm text-ink-muted flex items-center gap-1.5">
            <span>📍</span>
            {wh.city}, {wh.state}
          </p>
        </div>

        {/* Capacity */}
        <div className="mb-4">
          <CapacityBar
            used={wh.used_capacity_mt}
            total={wh.total_capacity_mt}
            label="Current occupancy"
          />
          <div className="flex justify-between mt-2 text-xs text-ink-muted">
            <span>{wh.available_capacity_mt.toLocaleString()} MT free</span>
            <span>{wh.total_capacity_mt.toLocaleString()} MT total</span>
          </div>
        </div>

        {/* Feasibility note */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-warm-light/40 rounded-lg p-3 mb-4 text-sm text-ink-muted"
          >
            {wh.feasibility_note}
          </motion.div>
        )}

        {/* CTA row */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-base-deep">
          <div>
            <div className="text-sm font-medium text-ink">{wh.point_of_contact.name}</div>
            <a href={`tel:${wh.point_of_contact.phone}`}
               className="text-xs text-accent hover:text-accent-dark transition-colors">
              {wh.point_of_contact.phone}
            </a>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Less' : 'Details'}
            </Button>
            <Button variant="primary" size="sm">
              Enquire
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function ColdStorage() {
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [minCapacity, setMinCapacity] = useState(0);

  const { data: warehouses, isLoading } = useWarehouses({
    facility_type: 'COLD_STORAGE',
    state: selectedState,
    min_available: minCapacity || undefined,
  });

  // Also fetch hybrid (which have cold zones)
  const { data: hybrids } = useWarehouses({
    facility_type: 'HYBRID',
    state: selectedState,
  });

  const combined = [...(warehouses ?? []), ...(hybrids ?? [])];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Warm hero header */}
      <div className="bg-base-dark/50 backdrop-blur-md border-b border-base-deep py-16">
        <div className="max-w-screen-2xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full
                            px-4 py-1.5 text-sm font-medium text-accent mb-6">
              ❄️ For Farmers & Producers
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="font-display text-5xl font-black text-ink mb-4 leading-tight text-balance">
                  Cold storage built for your harvest.
                </h1>
                <p className="text-ink-muted text-lg leading-relaxed max-w-lg mb-8">
                  Find temperature-controlled facilities near you that specialise in your crop —
                  potatoes, onions, horticulture, marine, or grains. Certified, affordable, and
                  reachable within a day.
                </p>

                {/* Why cold storage numbered points */}
                <div className="space-y-4">
                  {[
                    { n: '01', t: 'Stop post-harvest loss', b: 'Cold storage extends shelf life by weeks or months, letting you sell when prices are right — not when the crop demands.' },
                    { n: '02', t: 'Certified & food-safe', b: 'Every facility listed here holds FSSAI certification at minimum, many with HACCP and ISO-22000 as well.' },
                    { n: '03', t: 'Contact before you arrive', b: 'All facilities show live capacity and a direct point of contact — no middlemen, no surprises.' },
                  ].map(item => (
                    <div key={item.n} className="flex gap-4">
                      <div className="font-display text-xs font-bold text-accent mt-1 flex-shrink-0 w-6">
                        {item.n}
                      </div>
                      <div>
                        <div className="font-semibold text-ink text-sm">{item.t}</div>
                        <div className="text-ink-muted text-sm mt-0.5">{item.b}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Cold Storage Facilities', value: '23+', icon: '❄️' },
                  { label: 'States with Coverage', value: '14', icon: '🗺' },
                  { label: 'Certified FSSAI', value: '100%', icon: '✅' },
                  { label: 'Avg. Response Time', value: '<2h', icon: '⚡' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    className={`rounded-2xl p-6 text-center border shadow-card
                                ${i === 0 || i === 3 ? 'bg-accent text-base-dark border-transparent shadow-accent' : 'bg-card/90 backdrop-blur-sm border-border'}`}
                  >
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className={`font-display text-3xl font-black mb-1 ${i === 0 || i === 3 ? 'text-base-dark' : 'text-ink'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs ${i === 0 || i === 3 ? 'text-base-dark/70' : 'text-ink-muted'}`}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-base-dark/50 backdrop-blur-md border-b border-base-deep">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider block mb-1">State</label>
            <select
              value={selectedState ?? 'All States'}
              onChange={e => setSelectedState(e.target.value === 'All States' ? undefined : e.target.value)}
              className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            >
              {INDIAN_STATES_WITH_COLD.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider block mb-1">Min Available (MT)</label>
            <select
              value={minCapacity}
              onChange={e => setMinCapacity(Number(e.target.value))}
              className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            >
              {[0, 500, 1000, 2000].map(c => (
                <option key={c} value={c}>{c === 0 ? 'Any capacity' : `≥ ${c.toLocaleString()} MT`}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-ink-muted self-end pb-1">
            {isLoading ? '...' : <><strong className="text-ink">{combined.length}</strong> facilities</>}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
          </div>
        ) : combined.length === 0 ? (
          <EmptyState icon="❄️" title="No cold storage found" message="Adjust filters to find nearby facilities." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {combined.map((wh, i) => (
              <ColdStorageCard key={wh.id} wh={wh} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
