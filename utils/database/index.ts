import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, 
                                        process.env.SUPABASE_SERVICE_ROLE_KEY as string);

export async function createRequest(values: {user_id: string, prompt_tokens: number, completion_tokens?: number, model: string, status?: 'initiated' | 'succeeded' | 'failed'}) {
  const { data, error } = await supabase
    .from('requests')
    .insert(values)
    .select('*')
    .single();

  if (error) throw error;

  return data;
}

export async function updateRequest(id: number, updates: {user_id?: string, prompt_tokens?: number, completion_tokens?: number, model?: string, status?: 'initiated' | 'succeeded' | 'failed'} ) {
    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id);
  
    if (error) throw error;
  
    return data;
  }