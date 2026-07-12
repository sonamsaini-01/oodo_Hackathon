import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AssetSearchSchema } from '@/lib/ai/asset-search-schema';
import { AllowedSearchField, AllowedOperator } from '@/lib/ai/allowed-search-fields';

// For now, we'll mock the AI response since we don't have a real AI service
// In production, this would use OpenAI, Anthropic, etc.
function mockAIResponse(query: string) {
  // Simple mock responses based on keywords
  if (query.toLowerCase().includes('dell') && query.toLowerCase().includes('hr')) {
    return {
      entity: 'assets',
      filters: [
        { field: 'manufacturer', operator: 'equals', value: 'Dell' },
        { field: 'department', operator: 'equals', value: 'HR' },
        { field: 'next_maintenance_date', operator: 'within_next_month', value: true }
      ],
      sort: { field: 'next_maintenance_date', direction: 'asc' },
      limit: 50,
      explanation: 'Dell laptops in HR with maintenance scheduled next month.'
    };
  }

  if (query.toLowerCase().includes('projector') && query.toLowerCase().includes('available')) {
    return {
      entity: 'assets',
      filters: [
        { field: 'category', operator: 'equals', value: 'Projector' },
        { field: 'status', operator: 'equals', value: 'available' },
        { field: 'location', operator: 'contains', value: 'second' }
      ],
      limit: 50,
      explanation: 'Available projectors on the second floor.'
    };
  }

  // Default mock response
  return {
    entity: 'assets',
    filters: [],
    limit: 50,
    explanation: 'Showing all assets.'
  };
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user and organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 1-3: Get structured output from AI (mock for now)
    const aiResult = mockAIResponse(query);

    // Step 4: Validate AI's output using Zod schema
    const validatedResult = AssetSearchSchema.parse(aiResult);

    // Step 5-6: Build Supabase query
    let dbQuery = supabase
      .from('assets')
      .select('*, department:department_id(*), assigned_user:assigned_to(*)')
      .eq('organization_id', user.id); // Replace with actual organization id from user profile in production

    // Apply filters
    for (const filter of validatedResult.filters) {
      const { field, operator, value } = filter;

      switch (operator) {
        case 'equals':
          dbQuery = dbQuery.eq(field as string, value);
          break;
        case 'not_equals':
          dbQuery = dbQuery.neq(field as string, value);
          break;
        case 'contains':
          dbQuery = dbQuery.ilike(field as string, `%${value}%`);
          break;
        case 'in':
          dbQuery = dbQuery.in(field as string, value as string[]);
          break;
        case 'before':
          dbQuery = dbQuery.lt(field as string, value);
          break;
        case 'after':
          dbQuery = dbQuery.gt(field as string, value);
          break;
        case 'between':
          const [start, end] = value as [string, string];
          dbQuery = dbQuery.gte(field as string, start).lte(field as string, end);
          break;
        case 'is_null':
          dbQuery = dbQuery.is(field as string, null);
          break;
        case 'is_not_null':
          dbQuery = dbQuery.not(field as string, null);
          break;
        case 'within_next_month':
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          dbQuery = dbQuery.gte(field as string, now.toISOString()).lte(field as string, nextMonth.toISOString());
          break;
      }
    }

    // Apply sort
    if (validatedResult.sort) {
      dbQuery = dbQuery.order(validatedResult.sort.field, {
        ascending: validatedResult.sort.direction === 'asc'
      });
    }

    // Apply limit
    dbQuery = dbQuery.limit(validatedResult.limit);

    // Execute query
    const { data: assets, error } = await dbQuery;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }

    return NextResponse.json({
      search: validatedResult,
      assets
    });
  } catch (error) {
    console.error('Asset search error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
