'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock3,
  Upload,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet } from '@/components/ui/sheet';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { KPICard } from '@/components/dashboard/KPICard';

const supabase = createClient();

type MaintenanceStatus = 'pending' | 'approved' | 'rejected' | 'technician_assigned' | 'in_progress' | 'resolved' | 'cancelled';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

type MaintenanceRequest = {
  id: string;
  organization_id: string;
  asset_id: string;
  raised_by: string;
  assigned_technician_id?: string;
  title: string;
  issue_description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  image_url?: string;
  estimated_cost?: number;
  actual_cost?: number;
  approved_by?: string;
  approved_at?: string;
  started_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  raised_by_profile?: { full_name: string; avatar_url?: string };
  assigned_technician_profile?: { full_name: string; avatar_url?: string };
  asset?: { name: string; asset_tag: string; status: string; image_url?: string };
};

type Asset = {
  id: string;
  name: string;
  asset_tag: string;
  status: string;
};

type Profile = {
  id: string;
  full_name: string;
  role: string;
};

const COLUMN_ORDER: MaintenanceStatus[] = ['pending', 'approved', 'technician_assigned', 'in_progress', 'resolved', 'rejected', 'cancelled'];

const COLUMN_LABELS: Record<MaintenanceStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  technician_assigned: 'Technician Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const COLUMN_COLORS: Record<MaintenanceStatus, string> = {
  pending: 'border-yellow-400',
  approved: 'border-blue-400',
  technician_assigned: 'border-indigo-400',
  in_progress: 'border-purple-400',
  resolved: 'border-green-400',
  rejected: 'border-red-400',
  cancelled: 'border-gray-400',
};

const PRIORITY_COLORS: Record<MaintenancePriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

function NewRequestSheet({
  isOpen,
  onClose,
  assets,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onSuccess: () => void;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    asset_id: '',
    title: '',
    issue_description: '',
    priority: 'medium' as MaintenancePriority,
    image_url: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) return;
    setLoading(true);
    try {
      await supabase.from('maintenance_requests').insert({
        ...form,
        organization_id: profile.organization_id,
        raised_by: profile.id,
        status: 'pending',
      });
      onSuccess();
      onClose();
      setForm({ asset_id: '', title: '', issue_description: '', priority: 'medium', image_url: '' });
    } catch (error) {
      console.error('Error creating request', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="New Maintenance Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Select Asset</label>
          <select
            value={form.asset_id}
            onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
            className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            required
          >
            <option value="">Select asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.asset_tag} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Issue Title</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Issue Description</label>
          <textarea
            rows={4}
            value={form.issue_description}
            onChange={(e) => setForm({ ...form, issue_description: e.target.value })}
            className="w-full rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as MaintenancePriority })}
            className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Upload Image (optional)</label>
          <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
            <p className="text-sm text-[#64748B]">Drag & drop or click to upload</p>
            <Input type="file" className="hidden" />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-premium-gradient hover:opacity-90">
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function MaintenanceDetailSheet({
  request,
  onClose,
  technicians,
  onUpdate,
}: {
  request: MaintenanceRequest;
  onClose: () => void;
  technicians: Profile[];
  onUpdate: () => void;
}) {
  const { profile } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async () => {
    if (!profile?.id) return;
    setActionLoading(true);
    try {
      await Promise.all([
        supabase
          .from('maintenance_requests')
          .update({
            status: 'approved',
            approved_by: profile.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', request.id),
        supabase
          .from('assets')
          .update({ status: 'under_maintenance' })
          .eq('id', request.asset_id),
      ]);
      onUpdate();
      onClose();
    } catch (e) {
      console.error('Error approving request', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTechnician = async (technicianId: string) => {
    setActionLoading(true);
    try {
      await supabase
        .from('maintenance_requests')
        .update({
          status: 'technician_assigned',
          assigned_technician_id: technicianId,
        })
        .eq('id', request.id);
      onUpdate();
      onClose();
    } catch (e) {
      console.error('Error assigning technician', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async (status: MaintenanceStatus) => {
    setActionLoading(true);
    try {
      await supabase
        .from('maintenance_requests')
        .update({
          status,
          started_at: status === 'in_progress' ? new Date().toISOString() : request.started_at,
          resolved_at: status === 'resolved' ? new Date().toISOString() : request.resolved_at,
        })
        .eq('id', request.id);
      if (status === 'resolved') {
        await supabase
          .from('assets')
          .update({ status: 'available' })
          .eq('id', request.asset_id);
      }
      onUpdate();
      onClose();
    } catch (e) {
      console.error('Error updating request', e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Sheet isOpen={true} onClose={onClose} title="Maintenance Request Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">{request.title}</h2>
            <p className="text-[#64748B]">#{request.id.slice(0, 8)}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
            {COLUMN_LABELS[request.status]}
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[#64748B]">Asset</p>
              <p className="font-medium">{request.asset?.name} ({request.asset?.asset_tag})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748B]">Description</p>
              <p>{request.issue_description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748B]">Priority</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}>
                {request.priority}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {request.status === 'pending' && (
            <>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Request
              </Button>
              <Button
                variant="destructive"
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {request.status === 'approved' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <User className="w-4 h-4 mr-2" />
                  Assign Technician
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {technicians.map((tech) => (
                  <DropdownMenuItem
                    key={tech.id}
                    onClick={() => handleAssignTechnician(tech.id)}
                  >
                    {tech.full_name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {request.status === 'technician_assigned' && (
            <Button
              onClick={() => handleStart('in_progress')}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Clock3 className="w-4 h-4 mr-2" />
              Start Work
            </Button>
          )}
          {request.status === 'in_progress' && (
            <Button
              onClick={() => handleStart('resolved')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

export default function MaintenancePage() {
  const { profile } = useAuth();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchData(profile.organization_id);
    }
  }, [profile?.organization_id]);

  const fetchData = async (orgId: string) => {
    setLoading(true);
    try {
      const [requestsRes, assetsRes, techRes] = await Promise.all([
        supabase
          .from('maintenance_requests')
          .select('*, raised_by:raised_by(full_name, avatar_url), technician:assigned_technician_id(full_name, avatar_url), asset:asset_id(name, asset_tag, status, image_url)')
          .eq('organization_id', orgId),
        supabase.from('assets').select('id, name, asset_tag, status').eq('organization_id', orgId),
        supabase.from('profiles').select('id, full_name, role').eq('organization_id', orgId),
      ]);

      setRequests(
        (requestsRes.data?.map((r) => ({
          ...r,
          raised_by_profile: r.raised_by,
          assigned_technician_profile: r.technician,
          asset: r.asset,
        })) || [])
      );
      setAssets(assetsRes.data || []);
      setTechnicians(techRes.data?.filter((p) => p.role === 'technician' || p.role === 'admin' || p.role === 'asset_manager') || []);
    } catch (e) {
      console.error('Error fetching data', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.issue_description.toLowerCase().includes(search.toLowerCase()) ||
      (r.asset?.name && r.asset.name.toLowerCase().includes(search.toLowerCase()))
  );

  const groupedRequests: Record<MaintenanceStatus, MaintenanceRequest[]> = COLUMN_ORDER.reduce(
    (acc, status) => {
      acc[status] = filteredRequests.filter((r) => r.status === status);
      return acc;
    },
    {} as Record<MaintenanceStatus, MaintenanceRequest[]>
  );

  return (
    <PermissionGuard permission="maintenance:view">
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">Maintenance</h1>
              <p className="text-[#64748B]">
                Manage and track all maintenance requests and work orders.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setIsRequestOpen(true)}
                className="bg-premium-gradient hover:opacity-90 text-white rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Request
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Requests"
              value={requests.length}
              icon={List}
              color="#2563EB"
              href="/maintenance"
              isLoading={loading}
            />
            <KPICard
              title="Pending Approval"
              value={requests.filter((r) => r.status === 'pending').length}
              icon={Clock}
              color="#F59E0B"
              href="/maintenance"
              isLoading={loading}
            />
            <KPICard
              title="In Progress"
              value={requests.filter((r) => r.status === 'in_progress' || r.status === 'technician_assigned').length}
              icon={AlertTriangle}
              color="#7C3AED"
              href="/maintenance"
              isLoading={loading}
            />
            <KPICard
              title="Resolved"
              value={requests.filter((r) => r.status === 'resolved').length}
              icon={CheckCircle2}
              color="#16A34A"
              href="/maintenance"
              isLoading={loading}
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-1 flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 border-[#E2E8F0] rounded-xl bg-[#F7F9FC]"
                />
              </div>
              <Button
                variant="ghost"
                className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F7F9FC]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-[#F7F9FC] p-1 rounded-xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('kanban')}
                className={`rounded-lg ${view === 'kanban' ? 'bg-white shadow-sm' : ''}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('table')}
                className={`rounded-lg ${view === 'table' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {view === 'kanban' ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUMN_ORDER.map((status) => (
                <div key={status} className="flex-shrink-0 w-80">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
                      {COLUMN_LABELS[status]}
                      <span className="text-xs bg-[#F7F9FC] px-2 py-0.5 rounded-full">
                        {groupedRequests[status]?.length || 0}
                      </span>
                    </h3>
                  </div>
                  <div
                    className={`space-y-3 border-l-4 ${COLUMN_COLORS[status]} pl-3`}
                  >
                    {groupedRequests[status]?.map((req) => (
                      <Card
                        key={req.id}
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setSelectedRequest(req)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[req.priority]}`}
                            >
                              {req.priority}
                            </span>
                          </div>
                          <h4 className="font-medium text-[#0F172A] mb-1">{req.title}</h4>
                          <p className="text-sm text-[#64748B] mb-2 line-clamp-2">
                            {req.issue_description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-[#64748B]">
                            <span className="font-mono">{req.asset?.asset_tag}</span>
                            {req.assigned_technician_profile?.full_name && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {req.assigned_technician_profile.full_name}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardContent className="p-6">
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <p className="text-[#64748B]">Loading maintenance requests...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-10">
                              No maintenance requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests.map((req) => (
                            <TableRow key={req.id} className="cursor-pointer hover:bg-[#F7F9FC]">
                              <TableCell className="font-mono text-xs text-[#2563EB]">#{req.id.slice(0, 8)}</TableCell>
                              <TableCell className="font-medium">{req.title}</TableCell>
                              <TableCell>{req.asset?.name || '—'}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                                  {COLUMN_LABELS[req.status]}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[req.priority]}`}>
                                  {req.priority}
                                </span>
                              </TableCell>
                              <TableCell>{req.assigned_technician_profile?.full_name || '—'}</TableCell>
                              <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedRequest(req)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        <NewRequestSheet
          isOpen={isRequestOpen}
          onClose={() => setIsRequestOpen(false)}
          assets={assets}
          onSuccess={() => {
            if (profile?.organization_id) fetchData(profile.organization_id);
          }}
        />

        {selectedRequest && (
          <MaintenanceDetailSheet
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            technicians={technicians}
            onUpdate={() => {
              if (profile?.organization_id) fetchData(profile.organization_id);
            }}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
