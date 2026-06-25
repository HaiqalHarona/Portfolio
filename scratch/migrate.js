import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';

// Parse .env if it exists
let pbUrl = 'http://127.0.0.1:8090';
let adminEmail = '';
let adminPassword = '';

try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        if (key === 'POCKETBASE_URL') pbUrl = val;
        if (key === 'POCKETBASE_ADMIN_EMAIL') adminEmail = val;
        if (key === 'POCKETBASE_ADMIN_PASSWORD') adminPassword = val;
      }
    });
  }
} catch (e) {
  // Ignore
}

// Fallback to command line arguments
const args = process.argv.slice(2);
if (args[0]) adminEmail = args[0];
if (args[1]) adminPassword = args[1];
if (args[2]) pbUrl = args[2];

const pb = new PocketBase(pbUrl);

async function run() {
  console.log(`Connecting to PocketBase at: ${pbUrl}`);
  
  if (!adminEmail || !adminPassword) {
    console.error('Error: POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be provided via .env or command line arguments.');
    process.exit(1);
  }

  console.log(`Authenticating as admin: ${adminEmail}`);
  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('Authentication successful!');
  } catch (e) {
    console.error('Authentication failed:', e.message);
    process.exit(1);
  }

  // Load schemas
  const collections = [];

  const projectsSchemaPath = path.resolve('pb_migrations/projects_schema.json');
  if (fs.existsSync(projectsSchemaPath)) {
    const data = JSON.parse(fs.readFileSync(projectsSchemaPath, 'utf8'));
    collections.push(...(Array.isArray(data) ? data : [data]));
  }

  const summarySchemaPath = path.resolve('pb_migrations/project_summary_schema.json');
  if (fs.existsSync(summarySchemaPath)) {
    const data = JSON.parse(fs.readFileSync(summarySchemaPath, 'utf8'));
    collections.push(...(Array.isArray(data) ? data : [data]));
  }

  if (collections.length === 0) {
    console.error('No collections found in pb_migrations.');
    process.exit(1);
  }

  console.log(`Importing ${collections.length} collections (deleteMissing=false)...`);
  try {
    await pb.collections.import(collections, false);
    console.log('Collections schema migration successful! Existing collections updated.');
  } catch (e) {
    console.error('Migration failed:', e.message, JSON.stringify(e.data || {}));
    process.exit(1);
  }
}

run();
