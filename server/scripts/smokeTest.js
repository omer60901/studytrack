const base = process.env.BASE || 'http://localhost:5000';

const fetchJson = async (path, opts = {}) => {
  const res = await fetch(`${base}${path}`, opts);
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) { data = text; }
  return { status: res.status, ok: res.ok, data };
};

const run = async () => {
  console.log('Smoke test base:', base);

  const ping = await fetchJson('/api/ping');
  console.log('/api/ping', ping.status, ping.data?.message || ping.data);

  // Register a temporary user
  const timestamp = Date.now();
  const email = `smoke+${timestamp}@example.com`;
  const password = 'Test1234!';

  const reg = await fetchJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke Test', email, password })
  });
  console.log('/api/auth/register', reg.status);

  const login = await fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('/api/auth/login', login.status);

  if (!login.ok) {
    console.error('Login failed, aborting smoke tests');
    process.exit(2);
  }

  const token = login.data.token;
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const tasks = await fetchJson('/api/tasks', { headers: authHeaders });
  console.log('/api/tasks GET', tasks.status);

  const analytics = await fetchJson('/api/analytics/summary', { headers: authHeaders });
  console.log('/api/analytics/summary', analytics.status);

  const planner = await fetchJson('/api/planner', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ input: 'Review chapter 5 and practice problems' })
  });
  console.log('/api/planner POST', planner.status);

  const ok = ping.ok && login.ok && tasks.ok && analytics.ok && planner.ok;
  if (ok) {
    console.log('Smoke tests passed');
    process.exit(0);
  }
  console.error('Smoke tests failed');
  process.exit(1);
};

run().catch((err) => { console.error(err); process.exit(3); });
