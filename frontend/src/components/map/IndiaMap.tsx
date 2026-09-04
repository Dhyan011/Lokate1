import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import type { Warehouse } from '../../types';
import { colors } from '../../styles/tokens';
import { Badge, CapacityBar, FacilityBadge, Button, SectionLabel } from '../ui/primitives';

// India-specific TopoJSON from public CDN (bundled at build time via vite import)
// react-simple-maps handles this gracefully
const GEO_URL = 'https://cdn.jsdelivr.net/npm/india-atlas@1.0.3/states-simplified.json';

// Fallback: use world-atlas and filter to India
const WORLD_GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface TooltipState {
  x: number;
  y: number;
  warehouse: Warehouse;
}

interface IndiaMapProps {
  warehouses: Warehouse[];
  selectedState?: string;
  onStateSelect?: (state: string | undefined) => void;
  className?: string;
}

// Map projection center on India
const INDIA_CENTER: [number, number] = [82.5, 22.5];
const INDIA_SCALE = 1100;

function markerColor(type: Warehouse['facility_type'], active: boolean): string {
  if (!active) return colors.inkSubtle;
  switch (type) {
    case 'COLD_STORAGE': return colors.accentPrimary;
    case 'WAREHOUSE': return colors.ink;
    case 'HYBRID': return colors.accentWarm;
  }
}

function markerSize(utilization: number): number {
  if (utilization > 80) return 9;
  if (utilization > 60) return 7;
  return 6;
}

export function IndiaMap({ warehouses, selectedState, onStateSelect, className = '' }: IndiaMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMarkerEnter = useCallback((wh: Warehouse, e: React.MouseEvent) => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      warehouse: wh,
    });
  }, []);

  const handleMarkerLeave = useCallback(() => {
    tooltipTimeout.current = setTimeout(() => setTooltip(null), 120);
  }, []);

  const handleMarkerClick = useCallback((wh: Warehouse) => {
    setSelectedWarehouse(wh);
    setDrawerOpen(true);
    setTooltip(null);
  }, []);

  const handleStateClick = useCallback((stateName: string) => {
    onStateSelect?.(selectedState === stateName ? undefined : stateName);
  }, [selectedState, onStateSelect]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedWarehouse(null), 350);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeDrawer]);

  const filteredWarehouses = selectedState
    ? warehouses.filter(w => w.state === selectedState)
    : warehouses;

  return (
    <div className={`relative ${className}`} ref={mapRef}>
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden bg-base-dark border border-base-deep shadow-lg"
           style={{ minHeight: 520 }}>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: INDIA_CENTER, scale: INDIA_SCALE }}
          style={{ width: '100%', height: '100%' }}
          height={560}
        >
          <ZoomableGroup center={INDIA_CENTER} minZoom={1} maxZoom={4}>
            {/* State geographies */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) => {
                // Filter to India if using world atlas, or use india-atlas directly
                const indiaGeos = geographies.filter(geo =>
                  // india-atlas: all features are Indian states
                  // world-atlas: filter by ISO code
                  !geo.properties?.ADMIN || geo.properties?.ADMIN === 'India'
                );
                return (indiaGeos.length > 0 ? indiaGeos : geographies).map(geo => {
                  const stateName = geo.properties?.ST_NM ||
                                    geo.properties?.NAME_1 ||
                                    geo.properties?.name ||
                                    geo.properties?.NAME ||
                                    '';
                  const isSelected = selectedState === stateName;
                  const hasWarehouses = warehouses.some(w => w.state === stateName);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => stateName && handleStateClick(stateName)}
                      style={{
                        default: {
                          fill: isSelected
                            ? `${colors.accentPrimary}22`
                            : hasWarehouses
                              ? `${colors.baseDark}`
                              : colors.baseDeep,
                          stroke: colors.base,
                          strokeWidth: 1.2,
                          outline: 'none',
                          cursor: stateName ? 'pointer' : 'default',
                          transition: 'fill 200ms ease',
                        },
                        hover: {
                          fill: isSelected
                            ? `${colors.accentPrimary}33`
                            : `${colors.accentPrimary}18`,
                          stroke: colors.base,
                          strokeWidth: 1.2,
                          outline: 'none',
                        },
                        pressed: {
                          fill: `${colors.accentPrimary}28`,
                          stroke: colors.base,
                          strokeWidth: 1.2,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                });
              }}
            </Geographies>

            {/* Warehouse Markers */}
            {warehouses.map(wh => {
              const isFiltered = selectedState ? wh.state === selectedState : true;
              const color = markerColor(wh.facility_type, isFiltered);
              const size = markerSize(wh.utilization_pct);

              return (
                <Marker
                  key={wh.id}
                  coordinates={[wh.longitude, wh.latitude]}
                  onMouseEnter={(e) => handleMarkerEnter(wh, e as unknown as React.MouseEvent)}
                  onMouseLeave={handleMarkerLeave}
                  onClick={() => isFiltered && handleMarkerClick(wh)}
                >
                  {/* Outer glow ring for cold storages */}
                  {wh.facility_type === 'COLD_STORAGE' && isFiltered && (
                    <circle
                      r={size + 4}
                      fill={`${colors.accentPrimary}20`}
                      stroke={`${colors.accentPrimary}40`}
                      strokeWidth={1}
                    />
                  )}
                  {/* Main dot */}
                  <circle
                    r={size}
                    fill={color}
                    stroke={colors.base}
                    strokeWidth={1.5}
                    style={{
                      cursor: isFiltered ? 'pointer' : 'default',
                      transition: 'all 200ms ease',
                    }}
                  />
                  {/* High utilization pulse indicator */}
                  {wh.utilization_pct > 82 && isFiltered && (
                    <circle
                      r={size + 2}
                      fill="none"
                      stroke={colors.accentAlert}
                      strokeWidth={1.5}
                      opacity={0.6}
                      style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                    />
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-base/90 backdrop-blur-sm border border-base-deep rounded-lg p-3 shadow-card">
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wider mb-2">Facilities</p>
          <div className="space-y-1.5">
            {[
              { color: colors.accentPrimary, label: 'Cold Storage', ring: true },
              { color: colors.ink, label: 'Warehouse', ring: false },
              { color: colors.accentWarm, label: 'Hybrid', ring: false },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4">
                  {item.ring && (
                    <div className="absolute w-4 h-4 rounded-full opacity-20"
                         style={{ backgroundColor: item.color }} />
                  )}
                  <div className="w-2.5 h-2.5 rounded-full border border-white/60"
                       style={{ backgroundColor: item.color }} />
                </div>
                <span className="text-xs text-ink-muted">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-base-deep mt-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-alert opacity-60" />
              <span className="text-xs text-ink-muted">&gt;82% utilized</span>
            </div>
          </div>
        </div>

        {/* Active filter indicator */}
        {selectedState && (
          <div className="absolute top-4 left-4 bg-accent text-white rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-accent text-sm font-medium">
            <span>{selectedState}</span>
            <button
              onClick={() => onStateSelect?.(undefined)}
              className="hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {[
            { label: 'Active', value: warehouses.filter(w => w.status === 'ACTIVE').length, color: 'text-success' },
            { label: 'Cold', value: warehouses.filter(w => w.facility_type === 'COLD_STORAGE').length, color: 'text-accent' },
          ].map(stat => (
            <div key={stat.label}
                 className="bg-base/90 backdrop-blur-sm border border-base-deep rounded-lg px-3 py-2 text-center shadow-card min-w-[56px]">
              <div className={`font-display text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-ink-subtle">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 40,
            }}
          >
            <div className="bg-ink text-base rounded-lg px-3 py-2 shadow-xl text-sm whitespace-nowrap">
              <div className="font-semibold">{tooltip.warehouse.name}</div>
              <div className="text-base/60 text-xs mt-0.5">
                {tooltip.warehouse.warehouse_code} · {tooltip.warehouse.city}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedWarehouse && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm"
              onClick={closeDrawer}
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 35 }}
              className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-base shadow-xl border-l border-base-deep overflow-y-auto"
            >
              <WarehouseDrawer
                warehouse={selectedWarehouse}
                onClose={closeDrawer}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pulse ring animation */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Warehouse Detail Drawer ─────────────────────────────────────────────

function WarehouseDrawer({ warehouse: wh, onClose }: { warehouse: Warehouse; onClose: () => void }) {
  const utilColor = wh.utilization_pct > 85 ? 'text-alert' : wh.utilization_pct > 65 ? 'text-warm' : 'text-success';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-base-deep bg-base-dark">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <SectionLabel>{wh.warehouse_code}</SectionLabel>
            <h2 className="font-display text-2xl font-bold text-ink leading-tight mb-2">
              {wh.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <FacilityBadge type={wh.facility_type} />
              <Badge variant={wh.status === 'ACTIVE' ? 'success' : 'default'}>
                {wh.status}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-base-deep transition-colors text-ink-muted hover:text-ink flex-shrink-0"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Location */}
        <section>
          <SectionLabel>Location</SectionLabel>
          <p className="text-ink-muted text-sm">{wh.address}</p>
          <p className="text-ink-subtle text-xs mt-1">
            {wh.city}, {wh.state} · {wh.latitude.toFixed(4)}°N {wh.longitude.toFixed(4)}°E
          </p>
        </section>

        {/* Capacity */}
        <section>
          <SectionLabel>Capacity</SectionLabel>
          <div className="space-y-3">
            <CapacityBar used={wh.used_capacity_mt} total={wh.total_capacity_mt} label="Utilization" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: `${(wh.total_capacity_mt / 1000).toFixed(0)}K MT` },
                { label: 'Used', value: `${(wh.used_capacity_mt / 1000).toFixed(0)}K MT` },
                { label: 'Available', value: `${(wh.available_capacity_mt / 1000).toFixed(0)}K MT` },
              ].map(item => (
                <div key={item.label} className="bg-base-dark rounded-lg p-3 text-center">
                  <div className={`font-display text-lg font-bold ${item.label === 'Available' ? 'text-success' : item.label === 'Used' ? utilColor : 'text-ink'}`}>
                    {item.value}
                  </div>
                  <div className="text-xs text-ink-subtle mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Facility Tags */}
        {wh.facility_tags.length > 0 && (
          <section>
            <SectionLabel>Facility Features</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {wh.facility_tags.map(tag => (
                <Badge key={tag} variant="default" size="sm">{tag}</Badge>
              ))}
            </div>
          </section>
        )}

        {/* Feasibility Note */}
        {wh.feasibility_note && (
          <section>
            <SectionLabel>Feasibility Note</SectionLabel>
            <div className="bg-warm-light/40 border border-warm-light rounded-lg p-3">
              <p className="text-sm text-ink-muted leading-relaxed">{wh.feasibility_note}</p>
            </div>
          </section>
        )}

        {/* Point of Contact */}
        <section>
          <SectionLabel>Point of Contact</SectionLabel>
          <div className="bg-base-dark rounded-lg p-4 space-y-2">
            <div className="font-semibold text-ink">{wh.point_of_contact.name}</div>
            <a
              href={`tel:${wh.point_of_contact.phone}`}
              className="flex items-center gap-2 text-sm text-ink-muted hover:text-accent transition-colors"
            >
              <span>📞</span>
              <span>{wh.point_of_contact.phone}</span>
            </a>
            <a
              href={`mailto:${wh.point_of_contact.email}`}
              className="flex items-center gap-2 text-sm text-ink-muted hover:text-accent transition-colors"
            >
              <span>✉️</span>
              <span>{wh.point_of_contact.email}</span>
            </a>
          </div>
        </section>
      </div>

      {/* Footer actions */}
      <div className="p-6 border-t border-base-deep bg-base-dark flex gap-3">
        <Button variant="primary" className="flex-1">
          Create Order
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
