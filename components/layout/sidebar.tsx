
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Calendar,
  Wrench,
  FileSearch,
  BarChart3,
  Bell,
  Map,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { hasPermission, type Permission } from '@/lib/permissions/permissions';
import { useToast } from '@/hooks/use-toast';

type MenuItem = {
  title: string;
  href: string;
  icon: any;
  permission: Permission;
};

const menuItems: MenuItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
  { title: 'Organization', href: '/organization', icon: Building2, permission: 'organization:view' },
  { title: 'Assets', href: '/assets', icon: Package, permission: 'assets:view' },
  { title: 'Allocation & Transfer', href: '/allocations', icon: Layers, permission: 'allocations:view' },
  { title: 'Resource Booking', href: '/bookings', icon: Calendar, permission: 'bookings:view' },
  { title: 'Maintenance', href: '/maintenance', icon: Wrench, permission: 'maintenance:view' },
  { title: 'Audit', href: '/audits', icon: FileSearch, permission: 'audits:view' },
  { title: 'Reports & Analytics', href: '/reports', icon: BarChart3, permission: 'reports:view' },
  { title: 'Notifications', href: '/notifications', icon: Bell, permission: 'notifications:view' },
  { title: 'Digital Office Map', href: '/office-map', icon: Map, permission: 'office_map:view' },
  { title: 'AI Assistant', href: '/ai-assistant', icon: Bot, permission: 'ai_assistant:view' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed out successfully' });
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error signing out' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(profile?.role, item.permission)
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-64 items-center justify-center border-r border-[#E2E8F0] bg-white">
        Loading...
      </div>
    );
  }

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-screen border-r border-[#E2E8F0] bg-white shadow-premium transition-all duration-300"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-premium-gradient rounded-xl shadow-premium">
            <div className="w-6 h-6 relative">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="rgba(255,255,255,0.7)" />
              </svg>
            </div>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-premium-gradient tracking-tight">
              AssetFlow
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-[#F7F9FC] text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.title} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-premium-gradient text-white shadow-premium'
                    : 'text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#0F172A]'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">{item.title}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Section */}
      {profile && (
        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F9FC] transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white font-bold">
              {getInitials(profile.full_name)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0F172A] truncate">{profile.full_name}</p>
                <p className="text-xs text-[#64748B] truncate capitalize">{profile.role}</p>
              </div>
            )}
          </div>
          <div className="mt-3 space-y-1">
            <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#64748B] rounded-lg hover:bg-[#F7F9FC] hover:text-[#0F172A] transition-colors">
              <Settings className="w-4 h-4" />
              {!isCollapsed && <span>Settings</span>}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

