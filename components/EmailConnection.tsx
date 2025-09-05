"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Mail, AlertTriangle, Loader2, Globe, Shield, Key } from "lucide-react";
import { getCurrentUser } from "@/services/api";

interface EmailStatus {
  connected: boolean;
  provider_name?: string;
  user_email?: string;
  created_at?: string;
}

interface ProviderInfo {
  name: string;
  oauth_provider: string;
  auth_methods: string[];
  requires_manual_config?: boolean;
}

const EmailConnection = () => {
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [authMethod, setAuthMethod] = useState('oauth2');
  const [password, setPassword] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

  // Check email connection status on component mount
  useEffect(() => {
    checkEmailStatus();
    loadCurrentUser();
    checkConnectionStatus();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      // Store user email in localStorage for OAuth flow
      if (user) {
        localStorage.setItem('userEmail', user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/email-accounts/status', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setEmailStatus(data.data);
        // Update localStorage with backend status
        if (data.data.connected) {
          localStorage.setItem('emailConnected', 'true');
          localStorage.setItem('emailProvider', data.data.provider_name || 'microsoft');
        } else {
          localStorage.removeItem('emailConnected');
          localStorage.removeItem('emailProvider');
        }
      }
    } catch (error) {
      console.error('Error checking email status:', error);
    }
  };

  // Check connection status from localStorage
  const checkConnectionStatus = () => {
    const isConnected = localStorage.getItem('emailConnected') === 'true';
    const provider = localStorage.getItem('emailProvider');
    const userEmail = localStorage.getItem('userEmail');
    
    if (isConnected && provider && userEmail) {
      setEmailStatus({
        connected: true,
        provider_name: provider,
        user_email: userEmail,
        created_at: new Date().toISOString()
      });
    }
  };

  // Add authentication check function
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.log('❌ [AUTH-CHECK] Auth check failed');
        return false;
      }
      
      const data = await response.json();
      console.log('🔍 [AUTH-CHECK] Auth check result:', data);
      
      if (!data.isLoggedIn) {
        console.log('❌ [AUTH-CHECK] User not logged in');
        return false;
      }
      
      console.log('✅ [AUTH-CHECK] User is authenticated');
      return true;
    } catch (error) {
      console.error('❌ [AUTH-CHECK] Auth check error:', error);
      return false;
    }
  };

  const detectProvider = async (email: string) => {
    try {
      const detectResponse = await fetch('/api/email-accounts/detect-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      if (!detectResponse.ok) {
        const errorData = await detectResponse.json();
        throw new Error(errorData.error || 'Failed to detect email provider');
      }

      const detectData = await detectResponse.json();
      
      if (!detectData.success) {
        throw new Error(detectData.error || 'Failed to detect email provider');
      }

      setProviderInfo({
        name: detectData.data.provider_name,
        oauth_provider: detectData.data.oauth_provider,
        auth_methods: detectData.data.auth_methods || ['oauth2'],
        requires_manual_config: detectData.data.requires_manual_config
      });

      // Set default auth method
      if (detectData.data.auth_methods && detectData.data.auth_methods.length > 0) {
        setAuthMethod(detectData.data.auth_methods[0]);
      }

      return detectData.data;
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  const testConnection = async () => {
    if (!emailInput || !authMethod) return;

    setTestingConnection(true);
    setError(null);

    try {
      const response = await fetch('/api/email-accounts/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: emailInput, 
          auth_method: authMethod,
          password: authMethod !== 'oauth2' ? password : undefined
        })
      });

      const data = await response.json();
      
      if (data.success && data.data.success) {
        setError(null);
        alert(`✅ Connection successful! ${data.data.message}`);
      } else {
        setError(data.data?.message || 'Connection test failed');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const connectEmail = async () => {
    if (!emailInput || !providerInfo) return;

    setLoading(true);
    setError(null);

    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      setError('Please log in first');
      setLoading(false);
      return;
    }

    try {
      // Get OAuth URL for the detected provider
      const oauthResponse = await fetch('/api/email-accounts/oauth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: emailInput,
          provider: providerInfo.oauth_provider
        })
      });

      if (!oauthResponse.ok) {
        const errorData = await oauthResponse.json();
        throw new Error(errorData.error || 'Failed to get OAuth URL');
      }

      const oauthData = await oauthResponse.json();
      
      if (!oauthData.success) {
        throw new Error(oauthData.error || 'Failed to get OAuth URL');
      }

      // Redirect to OAuth
      window.location.href = oauthData.data.auth_url;

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-accounts/disconnect', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect email');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEmailStatus({ connected: false });
        // Clear localStorage
        localStorage.removeItem('emailConnected');
        localStorage.removeItem('emailProvider');
      } else {
        throw new Error(data.error || 'Failed to disconnect email');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (emailStatus?.connected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Email Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-green-700">
                <span className="font-medium">Provider:</span> {emailStatus.provider_name}
              </p>
              <p className="text-sm text-green-700">
                <span className="font-medium">Email:</span> {emailStatus.user_email}
              </p>
              <p className="text-sm text-green-700">
                <span className="font-medium">Connected:</span> {emailStatus.created_at ? 
                  new Date(emailStatus.created_at).toLocaleDateString() : 'Unknown'
                }
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </div>
          <Button 
            onClick={disconnectEmail}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect Email'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Mail className="h-5 w-5" />
          Connect Your Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-orange-700">
          Connect your email account to send campaigns and receive replies. 
          Supports Gmail, Outlook, Yahoo, and any custom domain.
        </p>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {!showConnectionForm ? (
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setEmailInput(currentUser || '');
                setShowConnectionForm(true);
                if (currentUser) {
                  detectProvider(currentUser);
                }
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              Connect Email Account
            </Button>
            
            <p className="text-xs text-orange-600">
              We'll automatically detect your email provider and guide you through the connection process.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@domain.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setProviderInfo(null);
                }}
                onBlur={() => {
                  if (emailInput) {
                    detectProvider(emailInput);
                  }
                }}
              />
            </div>

            {/* Provider Info */}
            {providerInfo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Detected Provider: {providerInfo.name}
                  </span>
                </div>
                
                {providerInfo.requires_manual_config && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-700">
                      Custom domain detected. May require manual configuration.
                    </span>
                  </div>
                )}

                {/* Auth Method Selection */}
                <div className="space-y-2">
                  <Label htmlFor="auth-method">Authentication Method</Label>
                  <Select value={authMethod} onValueChange={setAuthMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerInfo.auth_methods.includes('oauth2') && (
                        <SelectItem value="oauth2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            OAuth2 (Recommended)
                          </div>
                        </SelectItem>
                      )}
                      {providerInfo.auth_methods.includes('app_password') && (
                        <SelectItem value="app_password">
                          <div className="flex items-center gap-2">
                            <Key className="h-3 w-3" />
                            App Password
                          </div>
                        </SelectItem>
                      )}
                      {providerInfo.auth_methods.includes('basic_auth') && (
                        <SelectItem value="basic_auth">
                          <div className="flex items-center gap-2">
                            <Key className="h-3 w-3" />
                            Username/Password
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Password Input for non-OAuth methods */}
                {authMethod !== 'oauth2' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {authMethod === 'app_password' ? 'App Password' : 'Password'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={authMethod === 'app_password' ? 'Enter app password' : 'Enter password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {authMethod === 'app_password' && (
                      <p className="text-xs text-blue-600">
                        Generate an app password from your email provider's security settings.
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {authMethod !== 'oauth2' && (
                    <Button
                      onClick={testConnection}
                      disabled={testingConnection || !emailInput || !password}
                      variant="outline"
                      size="sm"
                    >
                      {testingConnection ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={connectEmail}
                    disabled={loading || !emailInput || (authMethod !== 'oauth2' && !password)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      authMethod === 'oauth2' ? 'Connect with OAuth' : 'Connect'
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setShowConnectionForm(false);
                setEmailInput('');
                setProviderInfo(null);
                setError(null);
              }}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailConnection;
