import { z } from 'zod';
import { ALLOWED_SEARCH_FIELDS, ALLOWED_OPERATORS, AllowedSearchField, AllowedOperator } from './allowed-search-fields';

// Zod schema for a single filter
const FilterSchema = z.object({
  field: z.enum(ALLOWED_SEARCH_FIELDS) as z.ZodType<AllowedSearchField>,
  operator: z.enum(ALLOWED_OPERATORS) as z.ZodType<AllowedOperator>,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.array(z.number()), z.null()])
});

// Zod schema for the entire search request/response
export const AssetSearchSchema = z.object({
  entity: z.literal('assets'),
  filters: z.array(FilterSchema),
  sort: z.object({
    field: z.enum(ALLOWED_SEARCH_FIELDS),
    direction: z.enum(['asc', 'desc'])
  }).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  explanation: z.string()
});

export type AssetSearchResult = z.infer<typeof AssetSearchSchema>;
