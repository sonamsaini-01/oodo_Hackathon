
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Upload,
  QrCode,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
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
import { KPICard, KPICardSkeleton } from '@/components/dashboard/KPICard';
import { SmartAssetSearch } from '@/components/ai/smart-asset-search';
import { AssetSearchResult } from '@/lib/ai/asset-search-schema';

const supabase = createClient();

type Asset = {
  id: string;
  asset_tag: string;
  name: string;
  category_id: string;
  serial_number?: string;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'damaged' | 'unusable';
  status: 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed';
  location_id?: string;
  department_id?: string;
  assigned_employee_id?: string;
  image_url?: string;
  manufacturer?: string;
  model?: string;
};

type AssetCategory = {
  id: string;
  name: string;
  icon?: string;
};

export default function AssetsPage() {
  const { profile } = useAuth();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [smartSearchAssets, setSmartSearchAssets] = useState<any[] | null>(null);
  const [smartSearchResult, setSmartSearchResult] = useState<AssetSearchResult | null>(null);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchAssetsAndCategories(profile.organization_id);
    }
  }, [profile?.organization_id]);

  const fetchAssetsAndCategories = async (orgId: string) => {
    try {
      const [assetsRes, categoriesRes] = await Promise.all([
        supabase.from('assets').select('*').eq('organization_id', orgId),
        supabase.from('asset_categories').select('id, name').eq('organization_id', orgId),
      ]);
      setAssets(assetsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (e) {
      console.error('Error fetching data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSearchResults = (searchAssets: any[], search: AssetSearchResult) => {
    setSmartSearchAssets(searchAssets);
    setSmartSearchResult(search);
  };

  const filteredAssets = smartSearchAssets && smartSearchAssets.length > 0 
    ? smartSearchAssets 
    : assets.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
          (a.serial_number && a.serial_number.toLowerCase().includes(search.toLowerCase())) ||
          (a.manufacturer && a.manufacturer.toLowerCase().includes(search.toLowerCase())) ||
          (a.model && a.model.toLowerCase().includes(search.toLowerCase()))
      );

  return (
    <PermissionGuard permission="assets:view">
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">Assets</h1>
              <p className="text-[#64748B]">
                Manage and track all your company assets in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsRegisterOpen(true)}
                className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F7F9FC]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
              <Button
                variant="ghost"
                className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F7F9FC]"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR
              </Button>
              <Button
                onClick={() => setIsRegisterOpen(true)}
                className="bg-premium-gradient hover:opacity-90 text-white rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Register Asset
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Assets"
              value={assets.length}
              icon={LayoutGrid}
              color="#2563EB"
              href="/assets"
              isLoading={loading}
            />
            <KPICard
              title="Available"
              value={assets.filter((a) => a.status === 'available').length}
              icon={List}
              color="#16A34A"
              href="/assets"
              isLoading={loading}
            />
            <KPICard
              title="Allocated"
              value={assets.filter((a) => a.status === 'allocated').length}
              icon={List}
              color="#7C3AED"
              href="/assets"
              isLoading={loading}
            />
            <KPICard
              title="Under Maintenance"
              value={assets.filter((a) => a.status === 'under_maintenance').length}
              icon={List}
              color="#F59E0B"
              href="/assets"
              isLoading={loading}
            />
          </div>

          {/* Smart AI Search */}
          <Card className="mb-6 border-2 border-dashed border-blue-200">
            <CardContent className="pt-6">
              <SmartAssetSearch onResults={handleSmartSearchResults} />
            </CardContent>
          </Card>

          {/* Toolbar: Search, Filters, View Toggle */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-1 flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  placeholder="Search by asset tag, name, serial..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 border-[#E2E8F0] rounded-xl bg-[#F7F9FC]"
                />
              </div>
              {/* Filters */}
              <Button
                variant="ghost"
                className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F7F9FC]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-[#F7F9FC] p-1 rounded-xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('table')}
                className={`rounded-lg ${
                  view === 'table' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('grid')}
                className={`rounded-lg ${
                  view === 'grid' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content: Table or Grid */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
            <CardContent className="p-6">
              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-[#64748B]">Loading assets...</p>
                </div>
              ) : view === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12" />
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-10">
                            No assets found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell>
                              {asset.image_url ? (
                                <img
                                  src={asset.image_url}
                                  alt={asset.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#F7F9FC] flex items-center justify-center">
                                  <LayoutGrid className="w-5 h-5 text-[#64748B]" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-[#2563EB]">
                              {asset.asset_tag}
                            </TableCell>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell>
                              {categories.find((c) => c.id === asset.category_id)?.name || '—'}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  asset.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : asset.status === 'allocated'
                                    ? 'bg-blue-100 text-blue-800'
                                    : asset.status === 'under_maintenance'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {asset.status.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize">{asset.condition}</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Asset
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
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
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAssets.length === 0 ? (
                    <div className="col-span-full h-64 flex items-center justify-center">
                      <p className="text-[#64748B]">No assets found</p>
                    </div>
                  ) : (
                    filteredAssets.map((asset) => (
                      <Card
                        key={asset.id}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                      >
                        <div className="h-40 bg-[#F7F9FC] flex items-center justify-center">
                          {asset.image_url ? (
                            <img
                              src={asset.image_url}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <LayoutGrid className="w-12 h-12 text-[#64748B]" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-mono text-xs text-[#2563EB]">{asset.asset_tag}</p>
                              <h3 className="font-medium text-[#0F172A]">{asset.name}</h3>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                asset.status === 'available'
                                  ? 'bg-green-100 text-green-800'
                                  : asset.status === 'allocated'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {asset.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-[#64748B]">
                            {categories.find((c) => c.id === asset.category_id)?.name}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Asset Registration Sheet */}
        <AssetRegistrationForm
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          categories={categories}
          onSuccess={() => {
            if (profile?.organization_id) fetchAssetsAndCategories(profile.organization_id);
          }}
        />
      </div>
    </PermissionGuard>
  );
}

// --- Asset Registration Form ---
function AssetRegistrationForm({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: AssetCategory[];
  onSuccess: () => void;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    acquisition_date: '',
    acquisition_cost: '',
    warranty_expiry_date: '',
    condition: 'new' as Asset['condition'],
    location_id: '',
    department_id: '',
    is_shared: false,
    is_bookable: false,
    expected_retirement_date: '',
    next_maintenance_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) return;

    setLoading(true);
    try {
      // Generate Asset Tag
      const { data: tagData, error: tagErr } = await supabase.rpc(
        'generate_asset_tag',
        { org_id: profile.organization_id, prefix: 'AF' }
      );

      if (tagErr) throw tagErr;

      const asset_tag = tagData || `AF-0001`;

      // Insert Asset
      const { error: assetErr } = await supabase.from('assets').insert({
        ...form,
        organization_id: profile.organization_id,
        asset_tag,
        created_by: profile.id,
        status: 'available',
        acquisition_cost: form.acquisition_cost ? parseFloat(form.acquisition_cost) : null,
      });

      if (assetErr) throw assetErr;

      // Insert Status History
      await supabase.from('asset_status_history').insert({
        organization_id: profile.organization_id,
        asset_id: null, // will need to get the asset id
        previous_status: null,
        new_status: 'available',
        changed_by: profile.id,
        reason: 'Asset registered',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error registering asset', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Register New Asset">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Asset name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Manufacturer</label>
            <Input
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              placeholder="Manufacturer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Model</label>
            <Input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Model"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Serial Number</label>
            <Input
              value={form.serial_number}
              onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              placeholder="Serial number"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Acquisition Date</label>
            <Input
              type="date"
              value={form.acquisition_date}
              onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Acquisition Cost</label>
            <Input
              type="number"
              step="0.01"
              value={form.acquisition_cost}
              onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Warranty Expiry</label>
            <Input
              type="date"
              value={form.warranty_expiry_date}
              onChange={(e) => setForm({ ...form, warranty_expiry_date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
              className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            >
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
              <option value="unusable">Unusable</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Next Maintenance Date</label>
            <Input
              type="date"
              value={form.next_maintenance_date}
              onChange={(e) => setForm({ ...form, next_maintenance_date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Expected Retirement Date</label>
            <Input
              type="date"
              value={form.expected_retirement_date}
              onChange={(e) => setForm({ ...form, expected_retirement_date: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_shared}
              onChange={(e) => setForm({ ...form, is_shared: e.target.checked })}
            />
            <span className="text-sm">Shared Resource</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_bookable}
              onChange={(e) => setForm({ ...form, is_bookable: e.target.checked })}
            />
            <span className="text-sm">Bookable</span>
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            placeholder="Add a description..."
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-premium-gradient hover:opacity-90"
          >
            {loading ? 'Registering...' : 'Register Asset'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
