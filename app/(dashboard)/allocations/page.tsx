
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AllocationsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">Allocation & Transfer</h1>
            <p className="text-[#64748B]">Manage asset assignments and transfers between teams.</p>
          </div>
          <Button className="bg-premium-gradient hover:opacity-90 text-white rounded-xl px-4 py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Allocation
          </Button>
        </div>
        <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
          <CardContent className="p-6">
            <p className="text-[#64748B]">Allocations page coming soon...</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
