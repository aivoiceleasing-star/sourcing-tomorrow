import { useState, useEffect } from 'react';

interface Setting {
  id: number;
  key: string;
  value: string;
  value_type: string;
  label: string;
  section: string;
  sort_order: number;
}

const sectionLabels: Record<string, string> = {
  hero: 'Hero Section',
  about: 'About Page',
  general: 'General / Branding',
  cta: 'Newsletter CTA',
};

const sectionOrder = ['hero', 'general', 'cta', 'about'];

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        setSettings(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  function updateValue(key: string, value: string) {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setDirty(prev => new Set(prev).add(key));
    setSaved(false);
  }

  async function saveAll() {
    if (dirty.size === 0) return;
    setSaving(true);
    try {
      const changes = settings.filter(s => dirty.has(s.key)).map(s => ({ key: s.key, value: s.value }));
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        alert(err.error || 'Save failed');
      } else {
        setDirty(new Set());
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e: any) {
      alert('Save failed: ' + (e.message || 'Unknown error'));
    }
    setSaving(false);
  }

  async function handleUpload(key: string, file: File) {
    setUploading(key);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) {
        updateValue(key, data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    }
    setUploading(null);
  }

  if (loading) return <div className="text-neutral-400">Loading settings...</div>;

  const grouped = sectionOrder
    .map(section => ({
      section,
      label: sectionLabels[section] || section,
      items: settings.filter(s => s.section === section),
    }))
    .filter(g => g.items.length > 0);

  // Any sections not in sectionOrder
  const otherSections = [...new Set(settings.map(s => s.section))].filter(s => !sectionOrder.includes(s));
  for (const section of otherSections) {
    grouped.push({
      section,
      label: sectionLabels[section] || section.charAt(0).toUpperCase() + section.slice(1),
      items: settings.filter(s => s.section === section),
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Edit your site content below. Changes take effect after saving and rebuilding.
        </p>
        <button
          onClick={saveAll}
          disabled={saving || dirty.size === 0}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            dirty.size > 0
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : `Save Changes${dirty.size > 0 ? ` (${dirty.size})` : ''}`}
        </button>
      </div>

      {grouped.map(group => (
        <div key={group.section} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">{group.label}</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {group.items.map(setting => (
              <div key={setting.key} className="px-6 py-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">{setting.label}</label>

                {setting.value_type === 'image' && (
                  <div className="space-y-3">
                    {setting.value && (
                      <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                        <img src={setting.value} alt="Preview" className="max-h-48 w-full object-cover" />
                        <button
                          onClick={() => updateValue(setting.key, '')}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                          title="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={setting.value}
                        onChange={e => updateValue(setting.key, e.target.value)}
                        placeholder="Paste URL or upload"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                        uploading === setting.key ? 'bg-neutral-200 text-neutral-400' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                      }`}>
                        {uploading === setting.key ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading === setting.key}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(setting.key, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {setting.value_type === 'textarea' && (
                  <textarea
                    value={setting.value}
                    onChange={e => updateValue(setting.key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                )}

                {setting.value_type === 'html' && (
                  <textarea
                    value={setting.value}
                    onChange={e => updateValue(setting.key, e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                    placeholder="HTML content..."
                  />
                )}

                {setting.value_type === 'text' && (
                  <input
                    value={setting.value}
                    onChange={e => updateValue(setting.key, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                )}

                {setting.value_type === 'color' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={setting.value || '#000000'}
                      onChange={e => updateValue(setting.key, e.target.value)}
                      className="w-10 h-10 border rounded cursor-pointer"
                    />
                    <input
                      value={setting.value}
                      onChange={e => updateValue(setting.key, e.target.value)}
                      className="w-32 px-3 py-2 border rounded-lg text-sm font-mono"
                      placeholder="#000000"
                    />
                  </div>
                )}

                {dirty.has(setting.key) && (
                  <span className="mt-1 inline-block text-xs text-amber-600">Unsaved</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
