import React from 'react';
import { motion } from 'framer-motion';
import { Card, SectionLabel, Badge } from '../components/ui/primitives';

export default function Tracking() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="text-5xl mb-6">🚛</div>
        <Badge variant="warm" size="md" className="mb-4">Tier 3 — Coming Soon</Badge>
        <h1 className="font-display text-4xl font-bold text-ink mb-4">Live Delivery Tracking</h1>
        <p className="text-ink-muted leading-relaxed">
          Real-time map view of active deliveries — route from origin warehouse to destination,
          live position from tracking events, weather-adjusted ETA, and status updates.
        </p>
        <p className="text-xs text-ink-subtle mt-6">
          Available once Tier 1 & 2 are fully polished.
        </p>
      </motion.div>
    </div>
  );
}
