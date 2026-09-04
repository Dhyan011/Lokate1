import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../components/ui/primitives';

export default function Vendors() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="text-5xl mb-6">🏢</div>
        <Badge variant="warm" size="md" className="mb-4">Tier 3 — Coming Soon</Badge>
        <h1 className="font-display text-4xl font-bold text-ink mb-4">Vendor Directory</h1>
        <p className="text-ink-muted leading-relaxed">
          Searchable and filterable directory of all warehouse operators — contact info,
          certifications, states covered, and linked products.
        </p>
        <p className="text-xs text-ink-subtle mt-6">
          Available once Tier 1 & 2 are fully polished.
        </p>
      </motion.div>
    </div>
  );
}
