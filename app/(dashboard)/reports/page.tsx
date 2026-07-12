'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  Printer,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  Wrench,
  DollarSign,
  Calendar,
  Target,
  Activity,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/AuthContext';

const supabase = createClient();

// Color palette for charts
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

export default function ReportsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    dateRange: { from: '', to: '' },
    department: '',
    category: '',
    status: '',
    location: ''
  });

  // Fetch data
  useEffect(() => {
    if (profile?.organization_id) {
      fetchData(profile.organization_id);
    }
  }, [profile?.organization_id]);

  const fetchData = async (orgId: string) => {
    setLoading(true);
    try {
      const [assetsRes, bookingsRes, allocationsRes, maintenanceRes] = await Promise.all([
        supabase.from('assets').select('*').eq('organization_id', orgId),
        supabase.from('bookings').select('*').eq('organization_id', orgId),
        supabase.from('allocations').select('*').eq('organization_id', orgId),
        supabase.from('maintenance_requests').select('*').eq('organization_id', orgId)
      ]);

      setAssets(assetsRes.data || []);
      setBookings(bookingsRes.data || []);
      setAllocations(allocationsRes.data || []);
      setMaintenance(maintenanceRes.data || []);
    } catch (e) {
      console.error('Error fetching report data:', e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Asset utilization trend (demo data for now)
  const utilizationTrendData = useMemo(() => {
    return [
      { month: 'Jan', utilization: 65 },
      { month: 'Feb', utilization: 72 },
      { month: 'Mar', utilization: 68 },
      { month: 'Apr', utilization: 85 },
      { month: 'May', utilization: 80 },
      { month: 'Jun', utilization: 90 }
    ];
  }, []);

  // 2. Assets by lifecycle status
  const lifecycleStatusData = useMemo(() => {
    const statuses = ['available', 'allocated', 'maintenance', 'retired', 'lost'];
    const counts = statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: assets.filter(a => a.status === status).length
    }));
    return counts.filter(c => c.value > 0);
  }, [assets]);

  // 3. Department-wise allocation summary (demo)
  const departmentData = useMemo(() => {
    return [
      { name: 'Engineering', count: 24 },
      { name: 'Sales', count: 18 },
      { name: 'HR', count: 12 },
      { name: 'Finance', count: 15 }
    ];
  }, []);

  // 4. Most-used assets (demo)
  const mostUsedData = useMemo(() => {
    return [
      { name: 'Laptop LT-001', usage: 120 },
      { name: 'Projector PR-003', usage: 98 },
      { name: 'Printer PR-001', usage: 87 },
      { name: 'Desk DSK-012', usage: 75 },
      { name: 'Monitor MON-023', usage: 65 }
    ];
  }, []);

  return (
    <PermissionGuard permission="reports:view">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">Reports & Analytics</h1>
              <p className="text-[#64748B]">
                Generate insights and reports about your assets and operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" className="bg-white border border-[#E2E8F0]">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button className="bg-premium-gradient hover:opacity-90">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-premium mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-[#64748B]">From Date</label>
                  <Input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, from: e.target.value } })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-[#64748B]">To Date</label>
                  <Input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, to: e.target.value } })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-[#64748B]">Department</label>
                  <select
                    className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="engineering">Engineering</option>
                    <option value="sales">Sales</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-[#64748B]">Asset Status</label>
                  <select
                    className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="available">Available</option>
                    <option value="allocated">Allocated</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-[#64748B]">Location</label>
                  <select
                    className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="new-york">New York</option>
                    <option value="london">London</option>
                    <option value="tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => fetchData(profile?.organization_id || '')}
                  className="bg-white border border-[#E2E8F0]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Asset Utilization Trend */}
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Asset Utilization Trend
                </CardTitle>
                <p className="text-sm text-[#64748B]">Monthly average asset utilization percentage</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-[#64748B]">Loading chart...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={utilizationTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" />
                      <YAxis stroke="#64748B" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="utilization" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB' }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 2. Assets by Lifecycle Status */}
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Assets by Lifecycle Status
                </CardTitle>
                <p className="text-sm text-[#64748B]">Distribution of assets across lifecycle stages</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-[#64748B]">Loading chart...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={lifecycleStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {lifecycleStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 3. Department-wise Allocation Summary */}
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Department-wise Allocation
                </CardTitle>
                <p className="text-sm text-[#64748B]">Number of assets allocated per department</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-[#64748B]">Loading chart...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 4. Most Used Assets */}
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Most Used Assets
                </CardTitle>
                <p className="text-sm text-[#64748B]">Assets with highest usage frequency</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-[#64748B]">Loading chart...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      layout="vertical"
                      data={mostUsedData}
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#64748B" />
                      <YAxis dataKey="name" type="category" stroke="#64748B" width={90} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="usage" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </PermissionGuard>
  );
}
