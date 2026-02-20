'use client';

import { useEffect, useState } from 'react';
import { ANNOUNCEMENT_TARGET } from '@/constants/roles';

interface Announcement {
  _id: string;
  title: string;
  body: string;
  targetRole: string;
  author: { name: string };
  expiresAt?: string;
  createdAt: string;
}

const targetColors: Record<string, string> = {
  all: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
  faculty: 'bg-purple-100 text-purple-700',
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '', targetRole: 'all', expiresAt: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchAnnouncements(); }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    const res = await fetch('/api/announcements?limit=50');
    const data = await res.json();
    setAnnouncements(data.data?.announcements ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { setError('Title and body are required'); return; }
    setError('');
    setSubmitting(true);

    const payload: Record<string, string> = {
      title: form.title,
      body: form.body,
      targetRole: form.targetRole,
    };
    if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!data.success) { setError(data.error || 'Failed to post announcement'); return; }
    setSuccess('Announcement posted successfully!');
    setForm({ title: '', body: '', targetRole: 'all', expiresAt: '' });
    fetchAnnouncements();
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return;
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    fetchAnnouncements();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 text-sm mt-1">Post and manage system-wide announcements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Create form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
            <h2 className="font-semibold text-gray-800 mb-4">New Announcement</h2>

            {error && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text" required value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                <textarea
                  required rows={5} value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write your announcement here…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target Audience</label>
                <div className="flex gap-2">
                  {Object.values(ANNOUNCEMENT_TARGET).map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, targetRole: t }))}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        form.targetRole === t
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {t === 'all' ? '🌐 All' : t === 'student' ? '🎓 Students' : '👨‍🏫 Faculty'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expires At (optional)</label>
                <input
                  type="datetime-local" value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Posting…' : '📢 Post Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* Announcements list */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="font-semibold text-gray-800">Posted Announcements ({announcements.length})</h2>

          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />)
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📢</p>
              <p className="text-sm">No announcements yet.</p>
            </div>
          ) : (
            announcements.map(a => (
              <div key={a._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${targetColors[a.targetRole] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.targetRole === 'all' ? '🌐 All Users' : a.targetRole === 'student' ? '🎓 Students' : '👨‍🏫 Faculty'}
                      </span>
                      {a.expiresAt && (
                        <span className="text-xs text-gray-400">
                          Expires {new Date(a.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.body}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      By {a.author?.name} • {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="text-xs text-red-500 hover:underline font-medium flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}