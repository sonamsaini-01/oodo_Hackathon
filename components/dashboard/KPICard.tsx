
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
  change?: string;
  href?: string;
  isLoading?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  color = '#2563EB',
  change,
  href,
  isLoading = false,
}: KPICardProps) {
  const content = (
    <Card className="rounded-2xl border-[#E2E8F0] shadow-premium hover:shadow-premium-lg transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-[#64748B]">
            {title}
          </CardTitle>
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" style={{ color }} />
            ) : (
              <Icon className="w-5 h-5" style={{ color }} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-[#E2E8F0] rounded-md animate-pulse" />
            {change && <div className="h-4 w-1/2 bg-[#E2E8F0] rounded-md animate-pulse" />}
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-[#0F172A] mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {change && <p className="text-sm text-[#64748B]">{change}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {content}
    </motion.div>
  );
}

export function KPICardSkeleton() {
  return (
    <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-[#E2E8F0] rounded-md animate-pulse" />
          <div className="w-9 h-9 bg-[#E2E8F0] rounded-xl animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-8 w-3/4 bg-[#E2E8F0] rounded-md animate-pulse" />
          <div className="h-4 w-1/2 bg-[#E2E8F0] rounded-md animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

