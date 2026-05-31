require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

supabase.auth.signUp({ 
  email: 'test_user123@pokemon-day.com', 
  password: 'password123' 
}).then(res => {
  console.log("Signup Result:", res.error ? res.error.message : "Success: " + res.data.user.email);
}).catch(console.error);
