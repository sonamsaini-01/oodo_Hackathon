'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F9FC] to-white">
      <div className="max-w-4xl mx-auto text-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 bg-premium-gradient rounded-2xl shadow-premium-lg">
              <div className="w-12 h-12 relative">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                  <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="rgba(255,255,255,0.7)" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-[#0F172A] mb-6">
            Welcome to <span className="text-premium-gradient">AssetFlow</span>
          </h1>
          
          <p className="text-xl text-[#64748B] mb-10 max-w-2xl mx-auto">
            The all-in-one enterprise asset and resource management system.
            Streamline your operations with powerful tracking, booking, and analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button className="h-14 bg-premium-gradient hover:opacity-90 text-white rounded-xl px-10 text-lg shadow-premium">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-14 border-[#E2E8F0] text-[#0F172A] rounded-xl px-10 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
