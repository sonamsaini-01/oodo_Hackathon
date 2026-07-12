'use client';

import React, { useState } from 'react';
import { Sparkles, X, Search, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetSearchResult } from '@/lib/ai/asset-search-schema';

interface SmartAssetSearchProps {
  onResults: (assets: any[], search: AssetSearchResult) => void;
}

const EXAMPLE_QUERIES = [
  "Show all Dell laptops in HR that need maintenance next month.",
  "Find available projectors on the second floor.",
  "Which assets assigned to Priya are overdue?",
  "Show damaged furniture in the Engineering department.",
  "List vehicles with warranty expiring within 60 days."
];

const RECENT_QUERIES = [
  "Dell laptops in need of maintenance",
  "Available projectors on second floor",
  "Assets assigned to Priya"
];

export function SmartAssetSearch({ onResults }: SmartAssetSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<AssetSearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/asset-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResult(data.search);
      onResults(data.assets, data.search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const handleRemoveFilter = (index: number) => {
    if (!searchResult) return;
    const newFilters = [...searchResult.filters];
    newFilters.splice(index, 1);
    const newSearch = { ...searchResult, filters: newFilters };
    setSearchResult(newSearch);
    // Re-run search with updated filters
    handleSearch({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleClearAll = () => {
    setSearchResult(null);
    setQuery("");
    setError(null);
    onResults([], {
      entity: 'assets',
      filters: [],
      limit: 50,
      explanation: 'Showing all assets'
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="space-y-2">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500 hidden sm:block">AI Search</span>
          </div>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your assets in plain English..."
            className="pl-24 pr-10 h-12 text-base border-2 border-[#E2E8F0] focus:border-blue-500 rounded-xl shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </form>

        {/* Example Queries */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.slice(0, 3).map((example, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(example)}
              className="text-xs text-gray-500 bg-[#F7F9FC] px-3 py-1.5 rounded-full border border-[#E2E8F0] hover:bg-white hover:text-gray-700 transition-colors"
            >
              “{example}”
            </button>
          ))}
        </div>
      </div>

      {/* Recent Queries */}
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          {RECENT_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(q)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {q}
              {i < RECENT_QUERIES.length - 1 ? ' • ' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-red-500">⚠️</div>
            <div>
              <p className="font-medium text-red-900">Search Failed</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interpreted Filters */}
      {searchResult && searchResult.filters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              Interpreting: “{searchResult.explanation}”
            </p>
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 px-3 text-xs">
              Clear All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchResult.filters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm border border-blue-200"
              >
                <span>
                  {filter.field} {filter.operator} {String(filter.value)}
                </span>
                <button
                  onClick={() => handleRemoveFilter(index)}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
