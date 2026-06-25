import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';

// Parse .env if it exists
let pbUrl = '';
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
  
  if (adminEmail && adminPassword) {
    console.log(`Authenticating as admin: ${adminEmail}`);
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log('Authentication successful!');
    } catch (e) {
      console.error('Authentication failed:', e.message);
      process.exit(1);
    }
  } else {
    console.log('No admin email/password provided. Attempting public create (requires Create API Rule to be public)...');
  }

  const testProject = {
    title: 'Extremely Cool Raytracer & WebGPU Engine',
    project_type: 'forfun',
    description: `A custom high-performance WebGPU rasterizer and raytracer built from scratch.

This test project showcases our newly added media embeds capability, allowing you to showcase project demos with YouTube, Vimeo, direct MP4 videos, and animated GIFs without needing to host them directly in PocketBase.

### Key Architectural Highlights
- **Hybrid Rendering Pipeline**: Real-time raytracing coupled with a classic forward/deferred WebGPU rasterizer.
- **Compute Shader Acceleration**: Grid acceleration structures and BVH traversal optimized entirely in WGSL.
- **Dynamic Resource Binding**: Automated bind group layout caching and automatic resource lifetime tracking.
- **Zero-Allocation Render Loop**: Frame-allocated buffer pools to minimize host-side CPU overhead.

Check out the demos below containing high-quality renders and development capture clips!`,
    timeline: 'Jan 2026 - Present',
    tech_stack: JSON.stringify(['Rust', 'WebGPU', 'WGPU', 'WGSL', 'Raytracing']),
    is_featured: true,
    links: JSON.stringify([
      { label: 'Project GitHub repository', url: 'https://github.com/example/webgpu-render-engine' },
      { label: 'Interactive Live Demo', url: 'https://example.com/live-demo' },
      { label: 'Technical Whitepaper (PDF)', url: 'https://example.com/docs' }
    ]),
    github_link: 'https://github.com/example/webgpu-render-engine',
    website_link: 'https://example.com/live-demo',
    cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    video_links: JSON.stringify([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://media.giphy.com/media/3oKIPnAiaMCws8nruU/giphy.gif'
    ]),
    long_form_video_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  };

  try {
    const record = await pb.collection('projects').create(testProject);
    console.log('Test project created successfully!');
    console.log('Record details:', record);
  } catch (e) {
    console.error('Error creating project:', e.message, e.data);
  }
}

run();
