/**
 * Base Repository - Common CRUD operations and utilities
 */

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

export interface RepositoryOptions {
  userId?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number | null;
  hasMore: boolean;
}

export class BaseRepository<TTable extends TableName> {
  protected tableName: TTable;
  protected supabase = getSupabaseClient();
  protected isDemoMode = !isSupabaseConfigured;

  constructor(tableName: TTable) {
    this.tableName = tableName;
  }

  protected getClient() {
    return this.supabase;
  }

  protected async executeQuery<T>(
    query: Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: Error | null }> {
    if (this.isDemoMode) {
      return { data: null, error: new Error('Demo mode: Supabase not configured') };
    }

    try {
      const result = await query;
      if (result.error) {
        return { data: null, error: new Error(result.error.message) };
      }
      return { data: result.data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
  }

  // Find by ID
  async findById(id: string): Promise<Row<TTable> | null> {
    const { data, error } = await this.executeQuery(
      this.supabase.from(this.tableName).select('*').eq('id', id).single()
    );
    if (error || !data) return null;
    return data as Row<TTable>;
  }

  // Find by user ID (for user-scoped tables)
  async findByUserId(userId: string, options: QueryOptions = {}): Promise<Row<TTable>[]> {
    let query = this.supabase.from(this.tableName).select('*').eq('user_id', userId);

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 100) - 1);
    }

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as Row<TTable>[];
  }

  // Find one by user ID and filter
  async findOneByUserId(userId: string, filters: Record<string, any>): Promise<Row<TTable> | null> {
    let query = this.supabase.from(this.tableName).select('*').eq('user_id', userId);
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await this.executeQuery(query.single());
    if (error || !data) return null;
    return data as Row<TTable>;
  }

  // Create
  async create(record: Insert<TTable>): Promise<Row<TTable> | null> {
    const { data, error } = await this.executeQuery(
      this.supabase.from(this.tableName).insert(record).select().single()
    );
    if (error || !data) return null;
    return data as Row<TTable>;
  }

  // Create multiple
  async createMany(records: Insert<TTable>[]): Promise<Row<TTable>[]> {
    const { data, error } = await this.executeQuery(
      this.supabase.from(this.tableName).insert(records).select()
    );
    if (error || !data) return [];
    return data as Row<TTable>[];
  }

  // Update
  async update(id: string, updates: Update<TTable>): Promise<Row<TTable> | null> {
    const { data, error } = await this.executeQuery(
      this.supabase.from(this.tableName).update(updates).eq('id', id).select().single()
    );
    if (error || !data) return null;
    return data as Row<TTable>;
  }

  // Update by user ID
  async updateByUserId(userId: string, filters: Record<string, any>, updates: Update<TTable>): Promise<Row<TTable> | null> {
    let query = this.supabase.from(this.tableName).update(updates).eq('user_id', userId);
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await this.executeQuery(query.select().single());
    if (error || !data) return null;
    return data as Row<TTable>;
  }

  // Delete
  async delete(id: string): Promise<boolean> {
    const { error } = await this.executeQuery(
      this.supabase.from(this.tableName).delete().eq('id', id)
    );
    return !error;
  }

  // Delete by user ID
  async deleteByUserId(userId: string, filters: Record<string, any>): Promise<boolean> {
    let query = this.supabase.from(this.tableName).delete().eq('user_id', userId);
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { error } = await this.executeQuery(query);
    return !error;
  }

  // Count
  async count(userId?: string, filters?: Record<string, any>): Promise<number> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { count, error } = await this.executeQuery(query);
    if (error) return 0;
    return count ?? 0;
  }

  // Paginated query
  async findPaginated(userId: string, options: QueryOptions = {}): Promise<PaginatedResult<Row<TTable>>> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await this.executeQuery(query);
    if (error || !data) return { data: [], count: null, hasMore: false };

    return {
      data: data as Row<TTable>[],
      count,
      hasMore: count !== null && offset + limit < count,
    };
  }
}