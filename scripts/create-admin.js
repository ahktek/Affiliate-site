const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local file not found at:', envPath);
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    
    let key = trimmed.substring(0, index).trim();
    let val = trimmed.substring(index + 1).trim();
    
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    
    env[key] = val;
  });
  
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing URL or service role key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const adminEmail = 'admin@chronicle.com';
const adminPassword = 'ChronicleAdmin123';
const adminName = 'Chronicle Editor';

async function createAdmin() {
  console.log(`Creating Admin User: ${adminEmail}...`);
  
  try {
    // 1. Create user in auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { display_name: adminName }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`User ${adminEmail} already exists. Promoting to admin...`);
        // Promote existing user
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existing = usersData.users.find(u => u.email === adminEmail);
        if (existing) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', existing.id);
            
          if (profileError) throw profileError;
          console.log(`Successfully promoted existing user to admin!`);
          process.exit(0);
        }
      }
      throw error;
    }
    
    // 2. Profile role is auto-set by DB trigger, but let's confirm it is 'admin'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id);
      
    if (profileError) throw profileError;
    
    console.log('\n=============================================');
    console.log('Admin user successfully created & confirmed!');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message || err);
    process.exit(1);
  }
}

createAdmin();
