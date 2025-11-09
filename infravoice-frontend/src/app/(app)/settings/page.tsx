'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  expires_at?: string;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  
  // UI state
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, load API keys from backend
    // For now, using mock data
    setApiKeys([
      {
        id: '1',
        name: 'Production Key',
        key: 'sk_live_*********************xyz',
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
      }
    ]);
  }, []);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to create key
      const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const apiKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: newKey,
        created_at: new Date().toISOString(),
      };

      setApiKeys([...apiKeys, apiKey]);
      setShowNewKey(newKey);
      setNewKeyName('');
      setSuccess('API key created successfully! Make sure to copy it now.');
    } catch (err: any) {
      setError('Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Call API to delete key
      setApiKeys(apiKeys.filter(k => k.id !== id));
      setSuccess('API key deleted successfully');
    } catch (err: any) {
      setError('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'security', label: 'Security', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { id: 'api-keys', label: 'API Keys', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg> },
    { id: 'subscription', label: 'Subscription', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent rounded-none pb-3 px-4"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Button onClick={handleUpdateProfile} variant="default" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Button onClick={handleChangePassword} variant="default" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">API Keys</h3>
                <p className="text-gray-600 mb-6">
                  Create and manage API keys for programmatic access to InfraVoice.
                </p>

                {/* New API Key */}
                {showNewKey && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 mb-2">API Key Created!</h4>
                        <p className="text-sm text-green-700 mb-3">
                          Make sure to copy your API key now. You won't be able to see it again!
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-4 py-2 rounded-lg border border-green-300 font-mono text-sm">
                            {showNewKey}
                          </code>
                          <Button onClick={() => copyToClipboard(showNewKey)} variant="outline" size="sm">
                            Copy
                          </Button>
                        </div>
                      </div>
                      <button onClick={() => setShowNewKey(null)} className="text-green-600 hover:text-green-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Create New Key Form */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Create New API Key</h4>
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production Key, Development Key"
                      className="flex-1"
                    />
                    <Button onClick={handleCreateApiKey} variant="default" disabled={isLoading}>
                      Create Key
                    </Button>
                  </div>
                </div>

                {/* Existing Keys */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Your API Keys</h4>
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No API keys yet. Create one to get started.</p>
                    </div>
                  ) : (
                    apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="font-semibold text-gray-900">{apiKey.name}</h5>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center font-mono">
                                <span className="mr-2">Key:</span>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{apiKey.key}</code>
                                <button
                                  onClick={() => copyToClipboard(apiKey.key)}
                                  className="ml-2 text-teal-600 hover:text-teal-700"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                              <div>Created: {new Date(apiKey.created_at).toLocaleDateString()}</div>
                              {apiKey.last_used && (
                                <div>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                          <Button onClick={() => handleDeleteApiKey(apiKey.id)} variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Subscription & Usage</h3>

                {/* Current Plan */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-teal-900">
                        {user?.subscription_tier?.toUpperCase() || 'FREE'} Plan
                      </h4>
                      <p className="text-teal-700">Your current subscription tier</p>
                    </div>
                    <Button variant="default">Upgrade Plan</Button>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">API Usage</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">API Calls</span>
                          <span className="font-semibold text-gray-900">
                            {user?.api_calls_used || 0} / {user?.api_quota || 1000}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${((user?.api_calls_used || 0) / (user?.api_quota || 1000)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Resets on the 1st of each month
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Account Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Active</span>
                        <Badge variant={user?.is_active ? 'default' : 'destructive'}>
                          {user?.is_active ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email Verified</span>
                        <Badge variant={user?.is_verified ? 'default' : 'secondary'}>
                          {user?.is_verified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>
                      {user?.created_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member Since</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
