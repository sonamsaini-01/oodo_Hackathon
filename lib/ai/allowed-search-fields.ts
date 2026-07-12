export const ALLOWED_SEARCH_FIELDS = [
  'asset_tag',
  'name',
  'manufacturer',
  'model',
  'serial_number',
  'category',
  'status',
  'condition',
  'department',
  'assigned_employee',
  'location',
  'acquisition_date',
  'warranty_expiry_date',
  'next_maintenance_date',
  'expected_retirement_date',
  'is_shared',
  'is_bookable'
] as const;

export type AllowedSearchField = typeof ALLOWED_SEARCH_FIELDS[number];

export const ALLOWED_OPERATORS = [
  'equals',
  'not_equals',
  'contains',
  'in',
  'before',
  'after',
  'between',
  'is_null',
  'is_not_null',
  'within_days',
  'within_next_month'
] as const;

export type AllowedOperator = typeof ALLOWED_OPERATORS[number];
