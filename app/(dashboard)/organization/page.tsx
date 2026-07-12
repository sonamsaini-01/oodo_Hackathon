
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Download, Upload, Search, MoreHorizontal, Edit, Trash2, Users, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Sheet } from '@/components/ui/sheet';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Tab = 'departments' | 'categories' | 'employees' | 'locations';

const supabase = createClient();

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('departments');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'departments', label: 'Departments' },
    { id: 'categories', label: 'Asset Categories' },
    { id: 'employees', label: 'Employees' },
    { id: 'locations', label: 'Locations & Desks' },
  ];

  return (
    <PermissionGuard permission="organization:manage">
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">
                Organization Setup
              </h1>
              <p className="text-[#64748B]">
                Manage your departments, categories, employees, and locations.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F7F9FC] rounded-xl px-4 py-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Templates
              </Button>
              <Button className="bg-premium-gradient hover:opacity-90 text-white rounded-xl px-6 py-2 flex items-center gap-2 shadow-premium">
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-[#E2E8F0]">
            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
            <CardContent className="p-6">
              {activeTab === 'departments' && <DepartmentsTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'employees' && <EmployeesTab />}
              {activeTab === 'locations' && <LocationsTab />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PermissionGuard>
  );
}

// --- DEPARTMENTS TAB ---

type Department = {
  id: string;
  name: string;
  code: string;
  description?: string;
  parent_department_id?: string;
  department_head_id?: string;
  location_id?: string;
  is_active: boolean;
  employee_count: number;
  asset_count: number;
  parent_department?: { name: string };
  department_head?: { full_name: string };
  location?: { name: string };
};

function DepartmentsTab() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchDepartments(profile.organization_id);
    }
  }, [profile?.organization_id]);

  const fetchDepartments = async (orgId: string) => {
    try {
      const { data } = await supabase
        .from('departments')
        .select(`
          *,
          parent_department:parent_department_id(name),
          department_head:department_head_id(full_name),
          location:location_id(name)
        `)
        .eq('organization_id', orgId);
      setDepartments(data || []);
    } catch (e) {
      console.error('Error fetching departments', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-[#E2E8F0] rounded-xl bg-[#F7F9FC]"
          />
        </div>
        <Button
          onClick={() => {
            setEditingDepartment(null);
            setIsSheetOpen(true);
          }}
          className="bg-premium-gradient hover:opacity-90 text-white rounded-xl px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center"><p className="text-[#64748B]">Loading...</p></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Parent Department</TableHead>
              <TableHead>Head</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-[#64748B]">{dept.code}</TableCell>
                  <TableCell>{dept.parent_department?.name || '—'}</TableCell>
                  <TableCell>{dept.department_head?.full_name || '—'}</TableCell>
                  <TableCell>{dept.location?.name || '—'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-[#0F172A]">
                      <Users className="w-3 h-3 text-[#64748B]" />
                      {dept.employee_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-[#0F172A]">
                      <Package className="w-3 h-3 text-[#64748B]" />
                      {dept.asset_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dept.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DepartmentActions
                      department={dept}
                      onEdit={(d) => {
                        setEditingDepartment(d);
                        setIsSheetOpen(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Department Form Sheet */}
      <DepartmentFormSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        department={editingDepartment}
        onSuccess={() => {
          setIsSheetOpen(false);
          if (profile?.organization_id) fetchDepartments(profile.organization_id);
        }}
        departments={departments}
      />
    </div>
  );
}

function DepartmentActions({
  department,
  onEdit,
}: {
  department: Department;
  onEdit: (d: Department) => void;
}) {
  const { profile } = useAuth();

  const toggleActive = async () => {
    try {
      await supabase
        .from('departments')
        .update({ is_active: !department.is_active })
        .eq('id', department.id);
      if (profile?.organization_id) {
        const { data } = await supabase
          .from('departments')
          .select(`*, parent_department:parent_department_id(name), department_head:department_head_id(full_name), location:location_id(name)`)
          .eq('organization_id', profile.organization_id);
        if (data) {
          // Refresh logic would go here
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(department)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleActive}>
          {department.is_active ? (
            <Trash2 className="w-4 h-4 mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {department.is_active ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DepartmentFormSheet({
  isOpen,
  onClose,
  department,
  onSuccess,
  departments,
}: {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  onSuccess: () => void;
  departments: Department[];
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    parent_department_id: '',
    department_head_id: '',
    location_id: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department) {
      setForm({
        name: department.name,
        code: department.code,
        description: department.description || '',
        parent_department_id: department.parent_department_id || '',
        department_head_id: department.department_head_id || '',
        location_id: department.location_id || '',
        is_active: department.is_active,
      });
    } else {
      setForm({
        name: '',
        code: '',
        description: '',
        parent_department_id: '',
        department_head_id: '',
        location_id: '',
        is_active: true,
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) return;

    setLoading(true);
    try {
      if (department) {
        await supabase
          .from('departments')
          .update(form)
          .eq('id', department.id);
      } else {
        await supabase
          .from('departments')
          .insert({ ...form, organization_id: profile.organization_id });
      }
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={department ? 'Edit Department' : 'Create Department'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Department name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="DEPT-001"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="is_active"
            checked={form.is_active}
            onCheckedChange={(c) => setForm({ ...form, is_active: Boolean(c) })}
          />
          <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-premium-gradient hover:opacity-90">
            {loading ? 'Saving...' : (department ? 'Save' : 'Create')}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

// --- PLACEHOLDERS FOR OTHER TABS ---

function CategoriesTab() {
  return <div className="h-96 flex items-center justify-center"><p className="text-[#64748B]">Asset Categories tab coming soon...</p></div>;
}

function EmployeesTab() {
  return <div className="h-96 flex items-center justify-center"><p className="text-[#64748B]">Employees tab coming soon...</p></div>;
}

function LocationsTab() {
  return <div className="h-96 flex items-center justify-center"><p className="text-[#64748B]">Locations & Desks tab coming soon...</p></div>;
}
