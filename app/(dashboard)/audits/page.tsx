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
  CheckCircle2,
  AlertTriangle,
  XCircle,
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

type AuditStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'closed';

type AuditCycle = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: AuditStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  instructions: string;
  scope_type: 'department' | 'location' | 'assets';
  scope_ids: string[];
};

type Profile = {
  id: string;
  full_name: string;
  role: string;
};

export default function AuditsPage() {
  const { profile } = useAuth();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditCycle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchAudits(profile.organization_id);
    }
  }, [profile?.organization_id]);

  const fetchAudits = async (orgId: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_cycles')
        .select('*')
        .eq('organization_id', orgId);
      setAudits(data || []);
    } catch (e) {
      console.error('Error fetching audits:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAudits = audits.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PermissionGuard permission="audits:view">
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">Audits</h1>
              <p className="text-[#64748B]">
                Manage audit cycles and track asset verifications.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-premium-gradient hover:opacity-90 text-white rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Audit Cycle
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Audits"
              value={audits.length}
              icon={List}
              color="#2563EB"
              href="/audits"
              isLoading={loading}
            />
            <KPICard
              title="Scheduled"
              value={audits.filter((a) => a.status === 'scheduled').length}
              icon={Clock}
              color="#F59E0B"
              href="/audits"
              isLoading={loading}
            />
            <KPICard
              title="In Progress"
              value={audits.filter((a) => a.status === 'in_progress').length}
              icon={AlertTriangle}
              color="#7C3AED"
              href="/audits"
              isLoading={loading}
            />
            <KPICard
              title="Closed"
              value={audits.filter((a) => a.status === 'closed').length}
              icon={CheckCircle2}
              color="#16A34A"
              href="/audits"
              isLoading={loading}
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-1 flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  placeholder="Search audit cycles..."
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
                onClick={() => setView('table')}
                className={`rounded-lg ${view === 'table' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('grid')}
                className={`rounded-lg ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {view === 'table' ? (
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardContent className="p-6">
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <p className="text-[#64748B]">Loading audits...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAudits.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-10">
                              No audit cycles found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAudits.map((audit) => (
                            <TableRow
                              key={audit.id}
                              className="cursor-pointer hover:bg-[#F7F9FC]"
                            >
                              <TableCell className="font-medium">{audit.title}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}
                                >
                                  {audit.status}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(audit.start_date).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(audit.end_date).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(audit.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedAudit(audit);
                                        setIsDetailOpen(true);
                                      }}
                                    >
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? (
                <div className="col-span-full h-96 flex items-center justify-center">
                  <p className="text-[#64748B]">Loading audits...</p>
                </div>
              ) : filteredAudits.length === 0 ? (
                <div className="col-span-full h-64 flex items-center justify-center">
                  <p className="text-[#64748B]">No audit cycles found</p>
                </div>
              ) : (
                filteredAudits.map((audit) => (
                  <Card
                    key={audit.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      setSelectedAudit(audit);
                      setIsDetailOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}
                        >
                          {audit.status}
                        </span>
                      </div>
                      <h3 className="font-medium text-[#0F172A] mb-1">{audit.title}</h3>
                      <p className="text-sm text-[#64748B] mb-2 line-clamp-2">
                        {audit.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#64748B]">
                        <span>{new Date(audit.start_date).toLocaleDateString()}</span>
                        <span>{new Date(audit.end_date).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </motion.div>

        {isCreateOpen && (
          <NewAuditSheet
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={() => {
              if (profile?.organization_id) fetchAudits(profile.organization_id);
            }}
          />
        )}

        {selectedAudit && isDetailOpen && (
          <AuditDetailSheet
            audit={selectedAudit}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedAudit(null);
            }}
            onUpdate={() => {
              if (profile?.organization_id) fetchAudits(profile.organization_id);
            }}
          />
        )}
      </div>
    </PermissionGuard>
  );
}

function NewAuditSheet({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    instructions: '',
    scope_type: 'department' as 'department' | 'location' | 'assets',
    scope_ids: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id || !profile?.id) return;

    setLoading(true);
    try {
      await supabase.from('audit_cycles').insert({
        ...form,
        organization_id: profile.organization_id,
        created_by: profile.id,
        status: 'draft',
      });

      onSuccess();
      onClose();
    } catch (e) {
      console.error('Error creating audit cycle:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="New Audit Cycle">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Audit cycle title"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            placeholder="Brief description of the audit cycle"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Instructions</label>
          <textarea
            rows={5}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="w-full rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            placeholder="Instructions for auditors"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-premium-gradient hover:opacity-90">
            {loading ? 'Creating...' : 'Create Audit Cycle'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function AuditDetailSheet({
  audit,
  onClose,
  onUpdate,
}: {
  audit: AuditCycle;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'audit-items' | 'discrepancies'>('details');
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditItems(audit.id);
  }, [audit.id]);

  const fetchAuditItems = async (auditCycleId: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_items')
        .select('*, asset:asset_id(*), auditor:auditor_id(*)')
        .eq('audit_cycle_id', auditCycleId);
      setAuditItems(data || []);
    } catch (e) {
      console.error('Error fetching audit items:', e);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      case 'damaged':
        return 'bg-orange-100 text-orange-800';
      case 'wrong_location':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sheet isOpen={true} onClose={onClose} title={audit.title}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-[#E2E8F0] pb-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`text-sm font-medium pb-2 border-b-2 ${
              activeTab === 'details'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('audit-items')}
            className={`text-sm font-medium pb-2 border-b-2 ${
              activeTab === 'audit-items'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            Audit Items
          </button>
          <button
            onClick={() => setActiveTab('discrepancies')}
            className={`text-sm font-medium pb-2 border-b-2 ${
              activeTab === 'discrepancies'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B]'
            }`}
          >
            Discrepancies
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audit Cycle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-[#64748B]">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      audit.status === 'draft'
                        ? 'bg-gray-100 text-gray-800'
                        : audit.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : audit.status === 'in_progress'
                        ? 'bg-purple-100 text-purple-800'
                        : audit.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {audit.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">Title</p>
                  <p className="font-medium">{audit.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">Description</p>
                  <p>{audit.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#64748B]">Start Date</p>
                    <p>{new Date(audit.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#64748B]">End Date</p>
                    <p>{new Date(audit.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#64748B]">Instructions</p>
                  <p>{audit.instructions}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[#64748B]">Total Items</p>
                  <p className="text-2xl font-bold">{auditItems.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[#64748B]">Verified</p>
                  <p className="text-2xl font-bold">{auditItems.filter(i => i.verification_status === 'verified').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[#64748B]">Missing</p>
                  <p className="text-2xl font-bold">{auditItems.filter(i => i.verification_status === 'missing').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-[#64748B]">Discrepancies</p>
                  <p className="text-2xl font-bold">{auditItems.filter(i => i.verification_status !== 'pending' && i.verification_status !== 'verified').length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'audit-items' && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Tag</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Expected Location</TableHead>
                      <TableHead>Verification Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          Loading audit items...
                        </TableCell>
                      </TableRow>
                    ) : auditItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          No audit items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm text-[#2563EB]">{item.asset?.asset_tag}</TableCell>
                          <TableCell className="font-medium">{item.asset?.name}</TableCell>
                          <TableCell>{item.expected_location || '—'}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(item.verification_status)}`}
                            >
                              {item.verification_status}
                            </span>
                          </TableCell>
                          <TableCell>{item.updated_at ? new Date(item.updated_at).toLocaleString() : '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'discrepancies' && (
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-[#64748B]">Loading discrepancies...</p>
                </div>
              ) : auditItems.filter(i => i.verification_status !== 'pending' && i.verification_status !== 'verified').length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-[#64748B]">No discrepancies found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditItems
                    .filter(i => i.verification_status !== 'pending' && i.verification_status !== 'verified')
                    .map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {item.asset?.asset_tag} - {item.asset?.name}
                              </h4>
                              <p className="text-sm text-[#64748B]">
                                Status:{' '}
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(item.verification_status)}`}
                                >
                                  {item.verification_status}
                                </span>
                              </p>
                            </div>
                            {item.auditor?.full_name && (
                              <p className="text-sm text-[#64748B]">
                                Auditor: {item.auditor.full_name}
                              </p>
                            )}
                          </div>
                          {item.notes && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-[#64748B]">Notes</p>
                              <p className="text-sm">{item.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Sheet>
  );
}
