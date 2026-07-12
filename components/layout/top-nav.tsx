'use client';

import { Bell, Search, Plus, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopNav() {
  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white shadow-premium flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#64748B]">
        <Home className="w-4 h-4" />
        <span className="text-[#64748B]">/</span>
        <span className="text-[#0F172A] font-medium">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search assets, employees, resources..."
            className="w-96 pl-10 pr-4 py-2 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
          />
        </div>

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-[#64748B]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full"></span>
        </Button>

        {/* Quick Create Button */}
        <Button className="bg-premium-gradient hover:opacity-90 text-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-premium">
          <Plus className="w-4 h-4" />
          <span>Quick Create</span>
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white font-bold">
            JS
          </div>
        </div>
      </div>
    </header>
  );
}
