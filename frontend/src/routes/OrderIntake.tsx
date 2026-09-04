import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateOrder } from '../api/hooks';
import { Button, Card, Badge, CapacityBar, FacilityBadge, SectionLabel } from '../components/ui/primitives';
import type { OrderLineItem, OrderResponse } from '../types';

interface LineItem extends OrderLineItem {
  id: string;
}

function newLine(): LineItem {
  return { id: crypto.randomUUID(), sku: '', quantity: 0 };
}

function FeasibilityMeter({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-success' : score >= 60 ? 'bg-warm' : 'bg-alert';
  const label = score >= 85 ? 'Excellent' : score >= 60 ? 'Good' : 'Limited';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-base-deep rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`}
             style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-ink-muted w-16 text-right">{score}/100 · {label}</span>
    </div>
  );
}

function OrderResults({ result }: { result: OrderResponse }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center text-success-dark">
          ✓
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Order Matched</h3>
          <p className="text-xs text-ink-subtle font-mono">#{result.order.id}</p>
        </div>
        <Badge variant="success" size="md" className="ml-auto">{result.order.status}</Badge>
      </div>

      <SectionLabel>Fulfillment Decisions (per line item)</SectionLabel>
      <div className="space-y-8 mt-2">
        {result.fulfillment.map((item, idx) => (
          <div key={item.product_id} className="border-t border-border pt-6 first:border-0 first:pt-0">
            <div className="mb-4">
              <h4 className="font-display text-lg font-bold text-ink">Item: {item.sku}</h4>
              <p className="text-xs text-ink-subtle">Requested: {item.requested_quantity} MT</p>
            </div>
            
            <div className="space-y-4">
              {[item.top_pick, ...item.alternatives].filter(Boolean).map((candidate, i) => {
                if (!candidate) return null;
                const isWinner = i === 0;
                const score = Math.max(0, Math.min(100, candidate.score || 0));
                
                // Determine if weather impacted the ETA heavily
                const hasWeatherDelay = candidate.weather_adjusted_eta_minutes && candidate.duration_minutes && 
                                       candidate.weather_adjusted_eta_minutes > candidate.duration_minutes + 10;
                
                return (
                  <motion.div
                    key={candidate.warehouse_id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.1 + i * 0.08 }}
                  >
                    <Card className={`p-5 ${isWinner ? 'border-accent/40 shadow-accent/20 bg-card/95' : 'opacity-80'}`}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0
                            ${isWinner ? 'bg-accent text-base-dark shadow-accent' : 'bg-base-deep text-ink-muted'}
                          `}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {isWinner && <Badge variant="accent">Top Pick</Badge>}
                              {!candidate.can_fully_fulfill && <Badge variant="alert">Partial Stock</Badge>}
                            </div>
                            <h4 className="font-display text-lg font-bold text-ink">{candidate.warehouse_name}</h4>
                            <p className="text-xs text-ink-subtle">{candidate.warehouse_code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-ink">{candidate.available_quantity.toLocaleString()} MT</div>
                          <div className="text-xs text-ink-subtle">Available</div>
                        </div>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-base-dark/50 rounded-lg p-3 text-center border border-border">
                          <div className="font-display text-base font-bold text-ink">
                            {candidate.distance_km ? `${candidate.distance_km.toFixed(1)} km` : 'N/A'}
                          </div>
                          <div className="text-xs text-ink-subtle mt-0.5">Driving Distance</div>
                        </div>
                        <div className={`rounded-lg p-3 text-center border ${hasWeatherDelay ? 'bg-alert-light/10 border-alert/30' : 'bg-base-dark/50 border-border'}`}>
                          <div className={`font-display text-base font-bold ${hasWeatherDelay ? 'text-alert' : 'text-ink'}`}>
                            {candidate.weather_adjusted_eta_minutes ? `${Math.round(candidate.weather_adjusted_eta_minutes / 60)}h ${Math.round(candidate.weather_adjusted_eta_minutes % 60)}m` : 'N/A'}
                          </div>
                          <div className="text-xs text-ink-subtle mt-0.5 flex justify-center items-center gap-1">
                            ETA {hasWeatherDelay && <span title="Inflated due to weather">⚠️</span>}
                          </div>
                        </div>
                      </div>

                      {/* Feasibility */}
                      <div className="mb-3">
                        <FeasibilityMeter score={score} />
                      </div>

                      {candidate.reason && (
                        <div className="mt-3 bg-base border border-base-deep rounded-md p-2.5">
                          <p className="text-xs text-ink-muted italic flex items-start gap-2">
                            <span className="text-accent mt-0.5">↳</span> "{candidate.reason}"
                          </p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderIntake() {
  const [lines, setLines] = useState<LineItem[]>([newLine()]);
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<OrderResponse | null>(null);

  const { mutate: createOrder, isPending, error } = useCreateOrder();

  const addLine = () => setLines(prev => [...prev, newLine()]);
  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));
  const updateLine = (id: string, field: 'sku' | 'quantity', value: string | number) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter(l => l.sku.trim() && l.quantity > 0);
    if (!validLines.length || !destination.trim()) return;

    createOrder(
      { line_items: validLines.map(({ sku, quantity }) => ({ sku, quantity })), delivery_address: destination, notes },
      { onSuccess: (data) => { setResult(data); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
    );
  };

  const reset = () => { setResult(null); setLines([newLine()]); setDestination(''); setNotes(''); };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-base-dark/50 backdrop-blur-md border-b border-base-deep">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <SectionLabel>Logistics</SectionLabel>
            <h1 className="font-display text-4xl font-bold text-ink">Order Intake</h1>
            <p className="text-ink-muted mt-2">Submit SKUs and quantities to receive ranked warehouse matches.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6 flex justify-end">
                <Button variant="ghost" size="sm" onClick={reset}>← New Order</Button>
              </div>
              <Card className="p-6">
                <OrderResults result={result} />
              </Card>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <form onSubmit={handleSubmit}>
                <Card className="p-6 mb-6">
                  <h2 className="font-display text-xl font-bold text-ink mb-5">Line Items</h2>
                  <div className="space-y-3">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr,120px,40px] gap-3 px-1">
                      <span className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">SKU / Product</span>
                      <span className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">Quantity (MT)</span>
                      <span />
                    </div>
                    {lines.map((line, i) => (
                      <motion.div
                        key={line.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-[1fr,120px,40px] gap-3 items-center"
                      >
                        <input
                          type="text"
                          value={line.sku}
                          onChange={e => updateLine(line.id, 'sku', e.target.value)}
                          placeholder={`e.g. WHT-PNJ-001`}
                          className="w-full bg-base-dark border border-base-deep rounded-lg px-3 py-2.5 text-sm
                                     text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent
                                     font-mono transition-colors"
                          required
                        />
                        <input
                          type="number"
                          value={line.quantity || ''}
                          onChange={e => updateLine(line.id, 'quantity', Number(e.target.value))}
                          placeholder="0"
                          min="1"
                          className="w-full bg-base-dark border border-base-deep rounded-lg px-3 py-2.5 text-sm
                                     text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent
                                     transition-colors text-right"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length === 1}
                          className="w-8 h-8 rounded-lg hover:bg-alert-light hover:text-alert-dark
                                     disabled:opacity-20 disabled:cursor-not-allowed
                                     flex items-center justify-center text-ink-subtle transition-all"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={addLine}
                            icon={<span className="text-lg leading-none">+</span>}>
                      Add line item
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 mb-6">
                  <h2 className="font-display text-xl font-bold text-ink mb-5">Delivery Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider block mb-1.5">
                        Delivery Address *
                      </label>
                      <textarea
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        placeholder="Full delivery address including city and PIN code"
                        rows={3}
                        className="w-full bg-base-dark border border-base-deep rounded-lg px-3 py-2.5 text-sm
                                   text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent
                                   transition-colors resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wider block mb-1.5">
                        Notes (optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Special handling instructions, preferred delivery window..."
                        rows={2}
                        className="w-full bg-base-dark border border-base-deep rounded-lg px-3 py-2.5 text-sm
                                   text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent
                                   transition-colors resize-none"
                      />
                    </div>
                  </div>
                </Card>

                {error && (
                  <div className="bg-alert-light border border-alert-light rounded-lg px-4 py-3 text-sm text-alert-dark mb-4">
                    Failed to process order. Please try again.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isPending}
                  className="w-full"
                >
                  {isPending ? 'Matching warehouses...' : 'Find Matching Warehouses →'}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
