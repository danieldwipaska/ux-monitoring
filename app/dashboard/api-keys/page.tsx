'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Copy, Check, AlertCircle, Power } from 'lucide-react';
import { format } from 'date-fns';

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch API keys');
      }

      setApiKeys(data.apiKeys);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key');
      }

      setNewlyCreatedKey(data.apiKey);
      setNewKeyName('');
      setShowCreateModal(false);
      fetchApiKeys();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      fetchApiKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      fetchApiKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage API keys for your applications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 mb-1">API Key Created Successfully!</p>
              <p className="text-sm text-green-700">
                Make sure to copy your API key now. You won&apos;t be able to see it again!
              </p>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-green-600 hover:text-green-700"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-200">
            <code className="flex-1 text-sm font-mono text-gray-900 break-all">
              {newlyCreatedKey.key}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey.key)}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm font-medium"
            >
              {copiedKey === newlyCreatedKey.key ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading API keys...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No API keys yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create your first API key
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {apiKeys.map((apiKey) => (
              <div key={apiKey._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apiKey.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        {apiKey.key.substring(0, 20)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Copy API key"
                      >
                        {copiedKey === apiKey.key ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Created: {format(new Date(apiKey.createdAt), 'MMM dd, yyyy')}</span>
                      {apiKey.lastUsed && (
                        <span>Last used: {format(new Date(apiKey.lastUsed), 'MMM dd, yyyy HH:mm')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(apiKey._id, apiKey.isActive)}
                      className={`p-2 rounded-lg transition-all ${
                        apiKey.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={apiKey.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(apiKey._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete API key"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create API Key</h2>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key Name
                </label>
                <input
                  id="keyName"
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="My React App"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Choose a descriptive name to identify this API key
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
