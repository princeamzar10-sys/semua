import { SupabaseClient } from '@supabase/supabase-js'

// Generic fuzzy "find by name" lookup used by the AI tool executors
// (create/update/delete actions that reference a record by name rather than id).
// `entityLabel` controls the exact wording of the not-found error (e.g. "Task", "Transaction"),
// preserving each call site's original error message text.
export async function findByName<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  column: string,
  userId: string,
  name: string,
  entityLabel: string,
  select = 'id'
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('user_id', userId)
    .ilike(column, `%${name}%`)
    .limit(1)

  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error(`${entityLabel} "${name}" not found`)
  return data[0] as unknown as T
}
