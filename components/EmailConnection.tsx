"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Mail, AlertTriangle, Loader2 } from "lucide-react";
import { getCurrentUser } from "@/services/api";

interface EmailStatus {
  connected: boolean;
  provider_name?: string;
  user_email?: string;
  created_at?: string;
}

const EmailConnection = () => {
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

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

  const connectEmail = async () => {
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
      // Step 1: Detect provider for user's email
      const userEmail = currentUser || localStorage.getItem('userEmail') || 'alekhyag@charterglobal.com';
      
      const detectResponse = await fetch('/api/email-accounts/detect-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });

      if (!detectResponse.ok) {
        const errorData = await detectResponse.json();
        throw new Error(errorData.error || 'Failed to detect email provider');
      }

      const detectData = await detectResponse.json();
      
      if (!detectData.success) {
        throw new Error(detectData.error || 'Failed to detect email provider');
      }

      // Step 2: Get OAuth URL
      const oauthResponse = await fetch('/api/email-accounts/oauth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });

      if (!oauthResponse.ok) {
        const errorData = await oauthResponse.json();
        throw new Error(errorData.error || 'Failed to get OAuth URL');
      }

      const oauthData = await oauthResponse.json();
      
      if (!oauthData.success) {
        throw new Error(oauthData.error || 'Failed to get OAuth URL');
      }

      // Step 3: Redirect to Microsoft OAuth
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
      <CardContent className="space-y-3">
        <p className="text-sm text-orange-700">
          Connect your email account to send campaigns and receive replies.
        </p>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
        
        <Button 
          onClick={connectEmail}
          disabled={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Microsoft Email'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailConnection;
