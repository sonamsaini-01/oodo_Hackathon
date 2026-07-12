
-- AssetFlow Sample Seed Data
-- NOTE: You must first create users in your Supabase Auth panel
-- Then replace the UUIDs below with actual user IDs from auth.users

-- ============================================
-- 1. Create Organization
-- ============================================
INSERT INTO organizations (id, name, code, logo_url, industry, email_domain, address)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'TechFlow Inc.',
  'TECHFLOW',
  'https://example.com/logo.png',
  'Technology',
  'techflow.com',
  '123 Innovation Drive, Tech City, TC 12345'
);

-- ============================================
-- 2. Create Locations
-- ============================================
INSERT INTO locations (id, organization_id, name, building, floor, room, address)
VALUES
  ('loc-001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Headquarters', 'Main Building', '1', '101', '123 Innovation Drive'),
  ('loc-002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Warehouse', 'Warehouse A', 'Ground', 'Storage', '456 Industrial Park');

-- ============================================
-- 3. Create Departments
-- ============================================
INSERT INTO departments (id, organization_id, name, code, description, location_id)
VALUES
  ('dept-001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Executive', 'EXEC', 'Executive Leadership Team', 'loc-001'),
  ('dept-002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Engineering', 'ENG', 'Software Engineering Team', 'loc-001'),
  ('dept-003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Operations', 'OPS', 'Operations Team', 'loc-001');

-- ============================================
-- 4. Create Asset Categories
-- ============================================
INSERT INTO asset_categories (id, organization_id, name, code, description, icon, default_warranty_months)
VALUES
  ('cat-001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Laptops', 'LAP', 'Portable Computers', '💻', 12),
  ('cat-002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Monitors', 'MON', 'Computer Monitors', '🖥️', 24),
  ('cat-003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Office Chairs', 'CHAIR', 'Office Furniture', '🪑', 36),
  ('cat-004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Printers', 'PRN', 'Printing Devices', '🖨️', 12);

-- ============================================
-- 5. Create Desks
-- ============================================
INSERT INTO desks (id, organization_id, location_id, desk_code, label, map_x, map_y, width, height)
VALUES
  ('desk-001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'loc-001', 'D-001', 'Desk 1', 100, 100, 100, 100),
  ('desk-002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'loc-001', 'D-002', 'Desk 2', 220, 100, 100, 100),
  ('desk-003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'loc-001', 'D-003', 'Desk 3', 340, 100, 100, 100);

-- ============================================
-- 6. Create Assets
-- ============================================
INSERT INTO assets (id, organization_id, asset_tag, name, category_id, serial_number, description, acquisition_date, acquisition_cost, warranty_expiry_date, condition, status, department_id, location_id, desk_id, manufacturer, model)
VALUES
  ('asset-001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AF-0001', 'MacBook Pro 16"', 'cat-001', 'SN123456789', 'Development Laptop', '2023-01-15', 2499.99, '2024-01-15', 'excellent', 'available', 'dept-002', 'loc-001', NULL, 'Apple', 'MacBook Pro 16" 2023'),
  ('asset-002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AF-0002', 'Dell XPS 15', 'cat-001', 'SN987654321', 'Development Laptop', '2023-02-20', 1899.99, '2024-02-20', 'good', 'available', 'dept-002', 'loc-001', NULL, 'Dell', 'XPS 15'),
  ('asset-003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AF-0003', 'LG 4K Monitor', 'cat-002', 'SN456789123', '4K Ultra HD Monitor', '2023-03-10', 499.99, '2025-03-10', 'new', 'available', 'dept-002', 'loc-001', 'desk-001', 'LG', '27UL850-W'),
  ('asset-004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AF-0004', 'Herman Miller Aeron', 'cat-003', 'SN789123456', 'Ergonomic Office Chair', '2022-06-01', 1299.00, '2025-06-01', 'good', 'available', 'dept-001', 'loc-001', 'desk-002', 'Herman Miller', 'Aeron Chair'),
  ('asset-005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AF-0005', 'HP LaserJet Pro', 'cat-004', 'SN321654987', 'Office Printer', '2023-04-05', 299.99, '2024-04-05', 'excellent', 'available', 'dept-003', 'loc-001', NULL, 'HP', 'LaserJet Pro MFP');

-- ============================================
-- IMPORTANT:
-- To complete the seed data, you must:
-- 1. Create users in your Supabase Auth dashboard
-- 2. Copy their user IDs from auth.users
-- 3. Uncomment and update the following sections with real UUIDs
-- ============================================

/*
-- ============================================
-- Example: Create Profiles (replace with real user UUIDs)
-- ============================================
INSERT INTO profiles (id, organization_id, full_name, email, employee_code, phone, role, department_id, job_title)
VALUES
  ('your-admin-user-id-here', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John Doe', 'john@techflow.com', 'EMP-001', '+1-555-123-4567', 'admin', 'dept-001', 'CEO'),
  ('your-asset-manager-id-here', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jane Smith', 'jane@techflow.com', 'EMP-002', '+1-555-234-5678', 'asset_manager', 'dept-003', 'Asset Manager'),
  ('your-engineer-id-here', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bob Johnson', 'bob@techflow.com', 'EMP-003', '+1-555-345-6789', 'employee', 'dept-002', 'Software Engineer');
*/

