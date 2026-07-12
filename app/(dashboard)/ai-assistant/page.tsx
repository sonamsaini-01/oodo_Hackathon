'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AiAssistantPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">AI Assistant</h1>
          <p className="text-[#64748B]">
            Get help with asset management using our AI-powered assistant.
          </p>
        </div>

        <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#0F172A]">
              Chat with AssetFlow AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center">
              <p className="text-[#64748B]">AI assistant placeholder</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
