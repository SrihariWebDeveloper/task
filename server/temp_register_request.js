const fetch = globalThis.fetch || require('node-fetch');

async function run() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'debuguser6', email: 'debuguser6@example.com', password: 'password123' })
    });
    const data = await response.text();
    console.log('status=', response.status);
    console.log('body=', data);
  } catch (err) {
    console.error(err);
  }
}

run();