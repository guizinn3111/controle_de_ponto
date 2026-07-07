

const SUPABASE_URL = 'https://zeuanaspaqqbmejvaotz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_d5RMfaXzyXuZ7hI3QbnycQ_D8ZvGruu';

// O CDN do Supabase expõe o objeto global como "supabase" (minúsculo)
const { createClient } = window.supabase;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);