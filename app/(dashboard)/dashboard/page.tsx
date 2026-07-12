
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Box,
  Users,
  Calendar,
  Wrench,
  ArrowRight,
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { KPICard, KPICardSkeleton } from '@/components/dashboard/KPICard';

const supabase = createClient();

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export default function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [kpis, setKpis] = useState<any>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [overdueCount, setOverdueCount] = useState(0);
  const [overdueLoading, setOverdueLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchKPIs(profile.organization_id);
      fetchRecentActivities(profile.organization_id);
      fetchOverdueReturns(profile.organization_id);
    }
  }, [profile?.organization_id]);

  const fetchKPIs = async (orgId: string) => {
    try {
      setKpisLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_kpis', { org_id: orgId });
      if (error) throw error;
      setKpis(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setKpisLoading(false);
    }
  };

  const fetchRecentActivities = async (orgId: string) => {
    try {
      setActivitiesLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchOverdueReturns = async (orgId: string) => {
    try {
      setOverdueLoading(true);
      const { count, error } = await supabase
        .from('asset_allocations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'overdue');
      if (error) throw error;
      setOverdueCount(count || 0);
    } catch (error) {
      console.error('Error fetching overdue returns:', error);
    } finally {
      setOverdueLoading(false);
    }
  };

  const kpiItems = [
    {
      title: 'Total Assets',
      key: 'total_assets',
      icon: Package,
      color: '#2563EB',
      href: '/assets',
    },
    {
      title: 'Available Assets',
      key: 'available_assets',
      icon: Box,
      color: '#16A34A',
      href: '/assets',
    },
    {
      title: 'Allocated Assets',
      key: 'allocated_assets',
      icon: Users,
      color: '#7C3AED',
      href: '/allocations',
    },
    {
      title: 'Under Maintenance',
      key: 'under_maintenance',
      icon: Wrench,
      color: '#F59E0B',
      href: '/maintenance',
    },
    {
      title: 'Active Bookings',
      key: 'active_bookings',
      icon: Calendar,
      color: '#06B6D4',
      href: '/bookings',
    },
    {
      title: 'Pending Transfers',
      key: 'pending_transfers',
      icon: ArrowRight,
      color: '#DC2626',
      href: '/allocations',
    },
    {
      title: 'Upcoming Returns',
      key: 'upcoming_returns',
      icon: CheckCircle2,
      color: '#8B5CF6',
      href: '/allocations',
    },
    {
      title: 'Overdue Returns',
      key: 'overdue_allocations',
      icon: AlertCircle,
      color: '#EF4444',
      href: '/allocations',
    },
  ];

  const quickActions = [
    { title: 'Register Asset', icon: Package, href: '/assets', color: '#2563EB' },
    { title: 'Allocate Asset', icon: Users, href: '/allocations', color: '#7C3AED' },
    { title: 'Book Resource', icon: Calendar, href: '/bookings', color: '#06B6D4' },
    { title: 'Raise Maintenance', icon: Wrench, href: '/maintenance', color: '#F59E0B' },
    { title: 'Start Audit', icon: BarChart3, href: '/audits', color: '#16A34A' },
    { title: 'Import Assets', icon: Package, href: '/assets', color: '#8B5CF6' },
  ];

  const upcomingItems = [
    { type: 'return', title: 'MacBook Pro 16"', dueDate: 'Today, 5:00 PM', priority: 'high' },
    { type: 'maintenance', title: 'Printer Service', dueDate: 'Tomorrow', priority: 'medium' },
    { type: 'booking', title: 'Conference Room A', dueDate: 'Tomorrow, 10:00 AM', priority: 'low' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-[#64748B] mb-1">
              {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
              {profile?.organization_id && ' at '}
              <span className="font-medium text-[#0F172A]">
                TechFlow Inc.
              </span>
            </p>
            <p className="text-sm text-[#64748B]">{formatDate(new Date())}</p>
          </div>

          {/* Quick Create Button */}
          <div className="flex gap-3">
            <Button className="bg-premium-gradient hover:opacity-90 text-white rounded-xl shadow-premium">
              <Plus className="w-4 h-4 mr-2" />
              Quick Create
            </Button>
          </div>
        </div>

        {/* Overdue Alert Banner */}
        {!overdueLoading && overdueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4 shadow-premium"
          >
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                {overdueCount} asset{overdueCount > 1 ? 's are' : ' is'} overdue for return
              </h3>
              <p className="text-red-700 text-sm">
                Please follow up with the respective employees.
              </p>
            </div>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => (window.location.href = '/allocations')}
            >
              View All
            </Button>
          </motion.div>
        )}

        {/* KPI Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpiItems.map((item, index) => (
            <div key={item.key} style={{ transitionDelay: `${index * 0.1}s` }}>
              {kpisLoading ? (
                <KPICardSkeleton />
              ) : (
                <KPICard
                  title={item.title}
                  value={kpis?.[item.key] || 0}
                  icon={item.icon}
                  color={item.color}
                  href={item.href}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Quick Actions */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-premium lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#0F172A]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col items-center p-4 rounded-xl bg-[#F7F9FC] hover:bg-[#2563EB]5 transition-all duration-200"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium text-[#0F172A]">
                    {action.title}
                  </span>
                </motion.a>
              ))}
            </CardContent>
          </Card>

          {/* Charts (Placeholder) */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-premium lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#0F172A]">
                Asset Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-48 bg-gradient-to-br from-[#F7F9FC] to-white rounded-xl flex items-center justify-center">
                  <div className="text-center text-[#64748B]">
                    <PieChart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Asset Status (Donut)</p>
                  </div>
                </div>
                <div className="h-48 bg-gradient-to-br from-[#F7F9FC] to-white rounded-xl flex items-center justify-center">
                  <div className="text-center text-[#64748B]">
                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Department Allocations (Bar)</p>
                  </div>
                </div>
                <div className="h-48 bg-gradient-to-br from-[#F7F9FC] to-white rounded-xl flex items-center justify-center">
                  <div className="text-center text-[#64748B]">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Maintenance Frequency (Line)</p>
                  </div>
                </div>
                <div className="h-48 bg-gradient-to-br from-[#F7F9FC] to-white rounded-xl flex items-center justify-center">
                  <div className="text-center text-[#64748B]">
                    <Box className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Asset Condition Distribution</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid: Recent Activity & Upcoming */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#0F172A]">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-[#E2E8F0] animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-[#E2E8F0] rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-[#E2E8F0] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F7F9FC] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#2563EB]15 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-[#2563EB]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0F172A]">
                            {activity.action || 'Activity recorded'}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#64748B] text-center py-8">No recent activity</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Panel */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#0F172A]">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F7F9FC] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">{item.title}</p>
                      <p className="text-xs text-[#64748B]">{item.dueDate}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.priority}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

