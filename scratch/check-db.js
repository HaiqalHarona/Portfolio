import PocketBase from 'pocketbase';
const pb = new PocketBase('http://192.168.18.118:8090');

async function run() {
  try {
    const projects = await pb.collection('projects').getFullList();
    console.log('--- projects ---');
    console.log(projects.map(p => ({ id: p.id, title: p.title, type: p.project_type })));
  } catch (e) {
    console.error('Failed to get projects:', e.message);
  }

  try {
    const summaries = await pb.collection('project_summary').getFullList();
    console.log('--- project_summary ---');
    console.log(summaries.map(s => ({ id: s.id, title: s.title, stack: s.stack, github: s.github })));
  } catch (e) {
    console.error('Failed to get summaries:', e.message);
  }
}
run();
