// js/supabase.js
const SUPABASE_URL = 'https://zgaaubntvmdhygtjdmkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYWF1Ym50dm1kaHlndGpkbWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjU5MDMsImV4cCI6MjA2NDA0MTkwM30.Kye4jS1DBAL8afBNVKP_4XMdA2lvC8Nl6_EqD4Y8OBE'; 

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);