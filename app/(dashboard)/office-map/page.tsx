'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfficeMapPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">Digital Office Map</h1>
          <p className="text-[#64748B]">
            Visualize your office layout and locate assets in real-time.
          </p>
        </div>

        <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#0F172A]">
              Office Layout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center">
              <p className="text-[#64748B]">Office map placeholder</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
