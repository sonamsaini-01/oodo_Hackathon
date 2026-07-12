/**
 * Supabase Database Type Definitions
 * To generate up-to-date types, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Add your table types here once you have a schema
    };
    Views: {
      // Add your view types here
    };
    Functions: {
      // Add your function types here
    };
    Enums: {
      // Add your enum types here
    };
  };
}
