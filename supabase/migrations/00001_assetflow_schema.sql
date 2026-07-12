
-- AssetFlow Database Schema
-- This file can be pasted directly into Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'asset_manager',
  'department_head',
  'employee',
  'auditor',
  'technician'
);

CREATE TYPE asset_status AS ENUM (
  'available',
  'allocated',
  'reserved',
  'under_maintenance',
  'lost',
  'retired',
  'disposed'
);

CREATE TYPE asset_condition AS ENUM (
  'new',
  'excellent',
  'good',
  'fair',
  'damaged',
  'unusable'
);

CREATE TYPE allocation_status AS ENUM (
  'active',
  'returned',
  'overdue',
  'cancelled'
);

CREATE TYPE transfer_status AS ENUM (
  'requested',
  'approved',
  'rejected',
  'completed',
  'cancelled'
);

CREATE TYPE booking_status AS ENUM (
  'upcoming',
  'ongoing',
  'completed',
  'cancelled'
);

CREATE TYPE maintenance_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'technician_assigned',
  'in_progress',
  'resolved',
  'cancelled'
);

CREATE TYPE maintenance_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE audit_status AS ENUM (
  'draft',
  'scheduled',
  'in_progress',
  'completed',
  'closed'
);

CREATE TYPE audit_verification AS ENUM (
  'pending',
  'verified',
  'missing',
  'damaged',
  'wrong_location'
);

CREATE TYPE notification_type AS ENUM (
  'asset_assigned',
  'transfer_requested',
  'transfer_approved',
  'transfer_rejected',
  'maintenance_requested',
  'maintenance_approved',
  'maintenance_rejected',
  'booking_confirmed',
  'booking_cancelled',
  'booking_reminder',
  'overdue_return',
  'audit_assigned',
  'audit_discrepancy',
  'general'
);

-- ============================================
-- TABLES
-- ============================================

-- 1. organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  industry TEXT,
  email_domain TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  department_head_id UUID,
  location_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 3. locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  room TEXT,
  address TEXT,
  map_position_x NUMERIC,
  map_position_y NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. profiles (references auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  employee_code TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'employee',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  job_title TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, employee_code)
);

-- Add foreign key to departments.department_head_id after profiles exists
ALTER TABLE departments
ADD CONSTRAINT fk_departments_head FOREIGN KEY (department_head_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Add foreign key to departments.location_id after locations exists
ALTER TABLE departments
ADD CONSTRAINT fk_departments_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- 5. asset_categories
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_warranty_months INTEGER DEFAULT 12,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 6. desks
CREATE TABLE desks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  desk_code TEXT NOT NULL,
  label TEXT,
  assigned_employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  map_x NUMERIC NOT NULL,
  map_y NUMERIC NOT NULL,
  width NUMERIC DEFAULT 100,
  height NUMERIC DEFAULT 100,
  qr_code_value TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, desk_code)
);

-- 7. assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_tag TEXT NOT NULL,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE CASCADE,
  serial_number TEXT,
  description TEXT,
  acquisition_date DATE,
  acquisition_cost NUMERIC,
  warranty_expiry_date DATE,
  condition asset_condition NOT NULL DEFAULT 'good',
  status asset_status NOT NULL DEFAULT 'available',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  desk_id UUID REFERENCES desks(id) ON DELETE SET NULL,
  assigned_employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  is_bookable BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  document_url TEXT,
  qr_code_value TEXT,
  manufacturer TEXT,
  model TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  expected_retirement_date DATE,
  next_maintenance_date DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, asset_tag),
  UNIQUE(organization_id, serial_number)
);

-- 8. asset_allocations
CREATE TABLE asset_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  allocated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  actual_return_date DATE,
  check_out_condition asset_condition NOT NULL,
  check_out_notes TEXT,
  check_in_condition asset_condition,
  check_in_notes TEXT,
  status allocation_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((employee_id IS NOT NULL AND department_id IS NULL) OR (employee_id IS NULL AND department_id IS NOT NULL) OR (employee_id IS NOT NULL AND department_id IS NOT NULL))
);

-- 9. transfer_requests
CREATE TABLE transfer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  current_allocation_id UUID REFERENCES asset_allocations(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  from_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  to_employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  to_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status transfer_status NOT NULL DEFAULT 'requested',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((to_employee_id IS NOT NULL AND to_department_id IS NULL) OR (to_employee_id IS NULL AND to_department_id IS NOT NULL))
);

-- 10. resource_bookings
CREATE TABLE resource_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  booked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  purpose TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'upcoming',
  attendee_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_time &gt; start_time)
);

-- 11. maintenance_requests
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  priority maintenance_priority NOT NULL DEFAULT 'medium',
  status maintenance_status NOT NULL DEFAULT 'pending',
  image_url TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. audit_cycles
CREATE TABLE audit_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status audit_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. audit_assignments
CREATE TABLE audit_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_cycle_id UUID NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
  auditor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. audit_items
CREATE TABLE audit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_cycle_id UUID NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  expected_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  actual_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  verification_status audit_verification NOT NULL DEFAULT 'pending',
  notes TEXT,
  evidence_url TEXT,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ
);

-- 15. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. activity_logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. asset_status_history
CREATE TABLE asset_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  previous_status asset_status,
  new_status asset_status NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. saved_ai_queries
CREATE TABLE saved_ai_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  generated_filters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. chatbot_conversations
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. chatbot_messages
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_name TEXT,
  tool_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- organizations
CREATE INDEX idx_organizations_code ON organizations(code);

-- profiles
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department_id ON profiles(department_id);

-- departments
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX idx_departments_head_id ON departments(department_head_id);

-- locations
CREATE INDEX idx_locations_organization_id ON locations(organization_id);

-- asset_categories
CREATE INDEX idx_asset_categories_organization_id ON asset_categories(organization_id);

-- desks
CREATE INDEX idx_desks_organization_id ON desks(organization_id);
CREATE INDEX idx_desks_location_id ON desks(location_id);
CREATE INDEX idx_desks_assigned_employee_id ON desks(assigned_employee_id);

-- assets
CREATE INDEX idx_assets_organization_id ON assets(organization_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_condition ON assets(condition);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_department_id ON assets(department_id);
CREATE INDEX idx_assets_location_id ON assets(location_id);
CREATE INDEX idx_assets_assigned_employee_id ON assets(assigned_employee_id);
CREATE INDEX idx_assets_asset_tag ON assets(organization_id, asset_tag);

-- asset_allocations
CREATE INDEX idx_asset_allocations_organization_id ON asset_allocations(organization_id);
CREATE INDEX idx_asset_allocations_asset_id ON asset_allocations(asset_id);
CREATE INDEX idx_asset_allocations_status ON asset_allocations(status);
CREATE INDEX idx_asset_allocations_employee_id ON asset_allocations(employee_id);
CREATE INDEX idx_asset_allocations_department_id ON asset_allocations(department_id);

-- transfer_requests
CREATE INDEX idx_transfer_requests_organization_id ON transfer_requests(organization_id);
CREATE INDEX idx_transfer_requests_asset_id ON transfer_requests(asset_id);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);

-- resource_bookings
CREATE INDEX idx_resource_bookings_organization_id ON resource_bookings(organization_id);
CREATE INDEX idx_resource_bookings_asset_id ON resource_bookings(asset_id);
CREATE INDEX idx_resource_bookings_status ON resource_bookings(status);
CREATE INDEX idx_resource_bookings_time ON resource_bookings(asset_id, start_time, end_time);

-- maintenance_requests
CREATE INDEX idx_maintenance_requests_organization_id ON maintenance_requests(organization_id);
CREATE INDEX idx_maintenance_requests_asset_id ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX idx_maintenance_requests_technician ON maintenance_requests(assigned_technician_id);

-- audit_cycles
CREATE INDEX idx_audit_cycles_organization_id ON audit_cycles(organization_id);
CREATE INDEX idx_audit_cycles_status ON audit_cycles(status);
CREATE INDEX idx_audit_cycles_department_id ON audit_cycles(department_id);

-- audit_assignments
CREATE INDEX idx_audit_assignments_audit_cycle_id ON audit_assignments(audit_cycle_id);
CREATE INDEX idx_audit_assignments_auditor_id ON audit_assignments(auditor_id);

-- audit_items
CREATE INDEX idx_audit_items_audit_cycle_id ON audit_items(audit_cycle_id);
CREATE INDEX idx_audit_items_asset_id ON audit_items(asset_id);
CREATE INDEX idx_audit_items_verification_status ON audit_items(verification_status);

-- notifications
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- activity_logs
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- asset_status_history
CREATE INDEX idx_asset_status_history_asset_id ON asset_status_history(asset_id);

-- chatbot_conversations
CREATE INDEX idx_chatbot_conversations_organization_id ON chatbot_conversations(organization_id);
CREATE INDEX idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);

-- chatbot_messages
CREATE INDEX idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track asset status changes
CREATE OR REPLACE FUNCTION log_asset_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO asset_status_history (
      organization_id,
      asset_id,
      previous_status,
      new_status,
      changed_by,
      reason
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      'Status updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_allocations_updated_at BEFORE UPDATE ON asset_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_bookings_updated_at BEFORE UPDATE ON resource_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_conversations_updated_at BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Asset status history trigger
CREATE TRIGGER trigger_asset_status_change AFTER UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION log_asset_status_change();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION current_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM profiles
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
DECLARE
  u_role user_role;
BEGIN
  SELECT role INTO u_role
  FROM profiles
  WHERE id = auth.uid();
  RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is asset manager
CREATE OR REPLACE FUNCTION is_asset_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_user_role() = 'asset_manager' OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is department head
CREATE OR REPLACE FUNCTION is_department_head()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_user_role() = 'department_head' OR is_admin() OR is_asset_manager();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if profile belongs to a specific department
CREATE OR REPLACE FUNCTION belongs_to_department(dep_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_dep_id UUID;
BEGIN
  SELECT department_id INTO user_dep_id
  FROM profiles
  WHERE id = auth.uid();
  RETURN user_dep_id = dep_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CUSTOM FUNCTIONS
-- ============================================

-- Function to auto-generate asset tags like AF-0001
CREATE OR REPLACE FUNCTION generate_asset_tag(org_id UUID, prefix TEXT DEFAULT 'AF')
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  asset_tag TEXT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(asset_tag FROM '[0-9]+')::INTEGER), 0) + 1
  INTO next_num
  FROM assets
  WHERE organization_id = org_id;
  
  asset_tag := prefix || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN asset_tag;
END;
$$ LANGUAGE plpgsql;

-- Function to identify overdue allocations
CREATE OR REPLACE FUNCTION mark_overdue_allocations()
RETURNS VOID AS $$
BEGIN
  UPDATE asset_allocations
  SET status = 'overdue'
  WHERE status = 'active'
    AND expected_return_date IS NOT NULL
    AND expected_return_date &lt; CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to update booking statuses
CREATE OR REPLACE FUNCTION update_booking_statuses()
RETURNS VOID AS $$
BEGIN
  -- Mark as ongoing
  UPDATE resource_bookings
  SET status = 'ongoing'
  WHERE status = 'upcoming'
    AND start_time &lt;= NOW()
    AND end_time &gt; NOW();

  -- Mark as completed
  UPDATE resource_bookings
  SET status = 'completed'
  WHERE status IN ('upcoming', 'ongoing')
    AND end_time &lt;= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(org_id UUID)
RETURNS TABLE(
  total_assets BIGINT,
  available_assets BIGINT,
  allocated_assets BIGINT,
  under_maintenance BIGINT,
  active_bookings BIGINT,
  pending_transfers BIGINT,
  upcoming_returns BIGINT,
  overdue_allocations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM assets WHERE organization_id = org_id) AS total_assets,
    (SELECT COUNT(*) FROM assets WHERE organization_id = org_id AND status = 'available') AS available_assets,
    (SELECT COUNT(*) FROM assets WHERE organization_id = org_id AND status = 'allocated') AS allocated_assets,
    (SELECT COUNT(*) FROM assets WHERE organization_id = org_id AND status = 'under_maintenance') AS under_maintenance,
    (SELECT COUNT(*) FROM resource_bookings WHERE organization_id = org_id AND status = 'ongoing') AS active_bookings,
    (SELECT COUNT(*) FROM transfer_requests WHERE organization_id = org_id AND status = 'requested') AS pending_transfers,
    (SELECT COUNT(*) FROM asset_allocations WHERE organization_id = org_id AND status = 'active' AND expected_return_date >= CURRENT_DATE) AS upcoming_returns,
    (SELECT COUNT(*) FROM asset_allocations WHERE organization_id = org_id AND status = 'overdue') AS overdue_allocations;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CONSTRAINT: Single active allocation per asset
-- ============================================

CREATE UNIQUE INDEX idx_single_active_allocation ON asset_allocations(asset_id)
WHERE status = 'active';

-- ============================================
-- CONSTRAINT: No overlapping bookings
-- ============================================

CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM resource_bookings
    WHERE asset_id = NEW.asset_id
      AND status IN ('upcoming', 'ongoing')
      AND id != COALESCE(NEW.id, uuid_nil())
      AND NEW.start_time &lt; end_time
      AND NEW.end_time &gt; start_time
  ) THEN
    RAISE EXCEPTION 'Booking overlaps with existing booking for this asset';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_overlap BEFORE INSERT OR UPDATE ON resource_bookings
  FOR EACH ROW EXECUTE FUNCTION check_booking_overlap();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE desks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: organizations
-- ============================================
CREATE POLICY "Users can view their organization"
  ON organizations
  FOR SELECT
  USING (id = current_organization_id());

-- ============================================
-- RLS POLICIES: profiles
-- ============================================
CREATE POLICY "Users can view profiles in their organization"
  ON profiles
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles"
  ON profiles
  FOR ALL
  USING (is_admin() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: departments
-- ============================================
CREATE POLICY "Users can view departments in their organization"
  ON departments
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Admins and asset managers can manage departments"
  ON departments
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: locations
-- ============================================
CREATE POLICY "Users can view locations in their organization"
  ON locations
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Admins and asset managers can manage locations"
  ON locations
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: asset_categories
-- ============================================
CREATE POLICY "Users can view asset categories in their organization"
  ON asset_categories
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Admins and asset managers can manage categories"
  ON asset_categories
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: desks
-- ============================================
CREATE POLICY "Users can view desks in their organization"
  ON desks
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Admins and asset managers can manage desks"
  ON desks
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: assets
-- ============================================
CREATE POLICY "Users can view assets in their organization"
  ON assets
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Admins and asset managers can manage assets"
  ON assets
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: asset_allocations
-- ============================================
CREATE POLICY "Users can view allocations in their organization"
  ON asset_allocations
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Users can view their own allocations"
  ON asset_allocations
  FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Admins and asset managers can manage allocations"
  ON asset_allocations
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

CREATE POLICY "Users can create transfer/return requests"
  ON asset_allocations
  FOR INSERT
  WITH CHECK (organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: transfer_requests
-- ============================================
CREATE POLICY "Users can view transfers in their organization"
  ON transfer_requests
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Users can create transfer requests"
  ON transfer_requests
  FOR INSERT
  WITH CHECK (requested_by = auth.uid() AND organization_id = current_organization_id());

CREATE POLICY "Admins and asset managers can manage transfers"
  ON transfer_requests
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: resource_bookings
-- ============================================
CREATE POLICY "Users can view bookings in their organization"
  ON resource_bookings
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Users can create bookings"
  ON resource_bookings
  FOR INSERT
  WITH CHECK (booked_by = auth.uid() AND organization_id = current_organization_id());

CREATE POLICY "Users can update their own bookings"
  ON resource_bookings
  FOR UPDATE
  USING (booked_by = auth.uid());

CREATE POLICY "Admins and asset managers can manage bookings"
  ON resource_bookings
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: maintenance_requests
-- ============================================
CREATE POLICY "Users can view maintenance in their organization"
  ON maintenance_requests
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Users can create maintenance requests"
  ON maintenance_requests
  FOR INSERT
  WITH CHECK (raised_by = auth.uid() AND organization_id = current_organization_id());

CREATE POLICY "Technicians can update assigned maintenance"
  ON maintenance_requests
  FOR UPDATE
  USING (assigned_technician_id = auth.uid());

CREATE POLICY "Admins and asset managers can manage maintenance"
  ON maintenance_requests
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: audit_cycles
-- ============================================
CREATE POLICY "Users can view audit cycles in their organization"
  ON audit_cycles
  FOR SELECT
  USING (organization_id = current_organization_id());

CREATE POLICY "Admins and asset managers can manage audit cycles"
  ON audit_cycles
  FOR ALL
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: audit_assignments
-- ============================================
CREATE POLICY "Users can view audit assignments"
  ON audit_assignments
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audit_cycles ac
    WHERE ac.id = audit_assignments.audit_cycle_id
      AND ac.organization_id = current_organization_id()
  ));

CREATE POLICY "Auditors can view their own assignments"
  ON audit_assignments
  FOR SELECT
  USING (auditor_id = auth.uid());

CREATE POLICY "Admins and asset managers can manage assignments"
  ON audit_assignments
  FOR ALL
  USING (is_asset_manager());

-- ============================================
-- RLS POLICIES: audit_items
-- ============================================
CREATE POLICY "Users can view audit items"
  ON audit_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audit_cycles ac
    WHERE ac.id = audit_items.audit_cycle_id
      AND ac.organization_id = current_organization_id()
  ));

CREATE POLICY "Auditors can update assigned audit items"
  ON audit_items
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM audit_assignments aa
    WHERE aa.audit_cycle_id = audit_items.audit_cycle_id
      AND aa.auditor_id = auth.uid()
  ));

CREATE POLICY "Admins and asset managers can manage audit items"
  ON audit_items
  FOR ALL
  USING (is_asset_manager());

-- ============================================
-- RLS POLICIES: notifications
-- ============================================
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark their notifications read"
  ON notifications
  FOR UPDATE
  USING (recipient_id = auth.uid());

-- ============================================
-- RLS POLICIES: activity_logs
-- ============================================
CREATE POLICY "Admins and asset managers can view activity logs"
  ON activity_logs
  FOR SELECT
  USING (is_asset_manager() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: asset_status_history
-- ============================================
CREATE POLICY "Users can view asset status history"
  ON asset_status_history
  FOR SELECT
  USING (organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: saved_ai_queries
-- ============================================
CREATE POLICY "Users can view their own saved queries"
  ON saved_ai_queries
  FOR ALL
  USING (user_id = auth.uid() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: chatbot_conversations
-- ============================================
CREATE POLICY "Users can view their own conversations"
  ON chatbot_conversations
  FOR ALL
  USING (user_id = auth.uid() AND organization_id = current_organization_id());

-- ============================================
-- RLS POLICIES: chatbot_messages
-- ============================================
CREATE POLICY "Users can view messages in their conversations"
  ON chatbot_messages
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM chatbot_conversations cc
    WHERE cc.id = chatbot_messages.conversation_id
      AND cc.user_id = auth.uid()
  ));

