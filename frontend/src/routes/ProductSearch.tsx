import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../api/hooks';
import { Card, Badge, FacilityBadge, Skeleton, SectionLabel, EmptyState } from '../components/ui/primitives';
import type { SearchResult } from '../types';

function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="default" size="sm">{result.product.category}</Badge>
            <Badge variant={result.product.temperature_zone === 'FROZEN' || result.product.temperature_zone === 'COOL' ? 'accent' : 'default'} size="sm">
              {result.product.temperature_zone === 'AMBIENT' ? '🌡 Ambient' :
               result.product.temperature_zone === 'COOL' ? '❄️ Cool' :
               result.product.temperature_zone === 'FROZEN' ? '🧊 Frozen' : '⚗️ Controlled'}
            </Badge>
          </div>
          <h3 className="font-display text-xl font-bold text-ink mb-1">{result.product.name}</h3>
          <p className="text-xs text-ink-subtle font-mono">{result.product.sku}</p>
          <p className="text-sm text-ink-muted mt-2">{result.product.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display text-3xl font-bold text-ink">
            {result.total_available.toLocaleString()}
          </div>
          <div className="text-xs text-ink-subtle">{result.product.unit} available</div>
        </div>
      </div>

      {/* Inventory locations */}
      <div className="border-t border-base-deep pt-4">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Locations ({result.inventory.length})</SectionLabel>
          {result.inventory.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-accent hover:text-accent-dark transition-colors font-medium"
            >
              {expanded ? 'Show less ↑' : `Show all ${result.inventory.length} ↓`}
            </button>
          )}
        </div>
        <div className="space-y-2">
          {(expanded ? result.inventory : result.inventory.slice(0, 2)).map((inv, i) => (
            <motion.div
              key={i}
              initial={expanded && i >= 2 ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between gap-4 bg-base-dark rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FacilityBadge type={inv.warehouse.facility_type} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{inv.warehouse.name}</div>
                  <div className="text-xs text-ink-subtle">{inv.warehouse.city}, {inv.warehouse.state}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-ink">{inv.quantity_available.toLocaleString()} {result.product.unit}</div>
                <div className="text-xs text-ink-subtle font-mono">Bin: {inv.bin_location}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);
  const { data: results, isLoading, isFetching } = useSearch(debouncedQuery);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-base-dark/50 backdrop-blur-md border-b border-base-deep">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <SectionLabel>Staff Tool</SectionLabel>
            <h1 className="font-display text-4xl font-bold text-ink mb-6">Product Search</h1>
            {/* Search input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                  <path d="M15 15l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by product name, SKU, or category..."
                className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-2xl pl-12 pr-4 py-4
                           text-ink text-base placeholder:text-ink-subtle
                           focus:outline-none focus:border-accent transition-colors shadow-card"
                autoFocus
              />
              {isFetching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!debouncedQuery ? (
            <motion.div key="empty-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon="🔎"
                title="Search the network"
                message="Type a product name (e.g. 'wheat', 'potato') or a SKU code to find all locations and available quantities."
              />
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton height="1.5rem" width="50%" className="mb-3" />
                  <Skeleton height="1rem" width="70%" className="mb-2" />
                  <Skeleton height="1rem" width="40%" />
                </Card>
              ))}
            </motion.div>
          ) : !results?.length ? (
            <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                icon="📦"
                title="No results"
                message={`Nothing found for "${debouncedQuery}". Try a different product name or SKU.`}
              />
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="space-y-4">
              <p className="text-sm text-ink-muted mb-4">
                <strong className="text-ink">{results.length}</strong> product{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((result, i) => (
                <motion.div key={result.product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}>
                  <SearchResultCard result={result} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
