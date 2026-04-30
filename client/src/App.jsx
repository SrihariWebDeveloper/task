import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const operations = [
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'reverse', label: 'Reverse String' },
  { value: 'word_count', label: 'Word Count' }
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('task_auth_token') || '');
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [taskForm, setTaskForm] = useState({ title: '', input: '', operation: 'uppercase' });

  const headers = useMemo(() => {
    const base = { 'Content-Type': 'application/json' };
    if (token) base.Authorization = `Bearer ${token}`;
    return base;
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`http://localhost:5000${path}`, {
      headers,
      ...options
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || 'Request failed');
    return body;
  };

  const setAuthToken = (value) => {
    setToken(value);
    if (value) {
      localStorage.setItem('task_auth_token', value);
    } else {
      localStorage.removeItem('task_auth_token');
      setTasks([]);
      setProfile(null);
    }
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = JSON.stringify({
        username: authForm.username,
        email: authForm.email,
        password: authForm.password
      });
      const data = await apiRequest(path, { method: 'POST', body });
      setAuthToken(data.token);
      setAuthForm({ username: '', email: '', password: '' });
      setMessage('Authenticated successfully.');
      await fetchTasks();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await apiRequest('/api/tasks');
      setTasks(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const created = await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskForm)
      });
      await apiRequest(`/api/tasks/${created._id}/run`, { method: 'POST' });
      setTaskForm({ title: '', input: '', operation: 'uppercase' });
      setMessage('Task created and queued for processing.');
      await fetchTasks();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId, action) => {
    setLoading(true);
    setMessage('');
    try {
      if (action === 'run') {
        await apiRequest(`/api/tasks/${taskId}/run`, { method: 'POST' });
        setMessage('Task queued for processing.');
      }
      if (action === 'delete') {
        await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
        setMessage('Task deleted');
      }
      await fetchTasks();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
          <h1 className="text-3xl font-semibold mb-6 text-center">AI Task Platform</h1>
          <div className="mb-6 flex gap-2 text-sm">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-4 py-3 ${mode === 'login' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'}`}>
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-xl px-4 py-3 ${mode === 'register' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'}`}>
              Register
            </button>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'register' && (
              <label className="block">
                <span className="text-sm text-slate-300">Username</span>
                <input
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  placeholder="Your name"
                />
              </label>
            )}
            <label className="block">
              <span className="text-sm text-slate-300">Email</span>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                placeholder="name@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Password</span>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? 'Working…' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
            {message && <p className="mt-3 text-center text-sm text-rose-400">{message}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">AI Task Processing</h1>
            <p className="mt-2 text-slate-400">Create tasks, queue them for background processing, and review logs/results.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAuthToken(''); setMode('login'); }}
              className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700">
              Logout
            </button>
            <button
              onClick={fetchTasks}
              className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Refresh tasks
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/40">
            <div>
              <h2 className="text-2xl font-semibold">Create a new AI task</h2>
              <p className="mt-2 text-slate-400">Enter a title, paste the input, choose an operation, then create and queue the task.</p>
            </div>
            <form className="space-y-4" onSubmit={handleTaskCreate}>
              <label className="block text-sm text-slate-300">
                Task title
                <input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  placeholder="Summarize text"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Input text
                <textarea
                  value={taskForm.input}
                  onChange={(e) => setTaskForm({ ...taskForm, input: e.target.value })}
                  required
                  rows="5"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  placeholder="Enter text to process"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Operation
                <select
                  value={taskForm.operation}
                  onChange={(e) => setTaskForm({ ...taskForm, operation: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500">
                  {operations.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Queueing task…' : 'Create and Run Task'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/40">
            <h2 className="text-2xl font-semibold">Usage notes</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>Created tasks are stored in MongoDB and sent to Redis for background processing.</p>
              <p>The worker handles uppercase, lowercase, reverse string, and word count operations.</p>
              <p>Task details refresh after any create/run/delete action.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Task history</h2>
              <p className="mt-1 text-slate-400">View status, logs, and results for queued tasks.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">{tasks.length} tasks</span>
          </div>

          {message && <p className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/5 p-4 text-sm text-rose-300">{message}</p>}

          <div className="mt-6 space-y-4">
            {tasks.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-slate-500">No tasks found yet. Create one to begin.</div>
            )}
            {tasks.map((task) => (
              <div key={task._id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{task.title || 'Untitled task'}</h3>
                    <p className="mt-1 text-slate-500">{task.operation.replace('_', ' ')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded-full px-3 py-1 ${task.status === 'success' ? 'bg-emerald-500/15 text-emerald-300' : task.status === 'failed' ? 'bg-rose-500/15 text-rose-300' : task.status === 'running' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700 text-slate-200'}`}>
                      {task.status}
                    </span>
                    <button
                      onClick={() => handleTaskAction(task._id, 'run')}
                      disabled={task.status === 'running'}
                      className="rounded-2xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
                      Run
                    </button>
                    <button
                      onClick={() => handleTaskAction(task._id, 'delete')}
                      className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-950 p-4">
                    <h4 className="text-sm uppercase tracking-[0.2em] text-slate-400">Input</h4>
                    <pre className="mt-3 whitespace-pre-wrap wrap-break-word text-sm text-slate-200">{task.input}</pre>
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-4">
                    <h4 className="text-sm uppercase tracking-[0.2em] text-slate-400">Result</h4>
                    <p className="mt-3 text-sm text-slate-200">{task.result || 'Pending result...'}</p>
                    <h4 className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-400">Logs</h4>
                    <p className="mt-3 text-sm text-slate-200">{task.logs || 'No logs yet.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;

