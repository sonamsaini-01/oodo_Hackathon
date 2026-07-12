
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SetupOrganizationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-white rounded-2xl p-8 shadow-premium-lg border border-[#E2E8F0] text-center"
      >
        <div className="w-20 h-20 bg-premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="rgba(255,255,255,0.7)" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#0F172A] mb-4">Organization Setup</h1>
        <p className="text-[#64748B] mb-8">
          To set up a new organization, please contact our sales or support team.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-[#0F172A] mb-2">Email us</h3>
            <a href="mailto:support@assetflow.com" className="text-[#2563EB] hover:underline">
              support@assetflow.com
            </a>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-[#0F172A] mb-2">Call us</h3>
            <p className="text-[#64748B]">+1 (555) 123-4567</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/login" className="text-[#2563EB] font-medium hover:underline">
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

