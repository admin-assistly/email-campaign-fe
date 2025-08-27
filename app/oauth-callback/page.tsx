"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const success = searchParams.get('success');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`OAuth Error: ${error}`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return;
    }

    if (success === 'true' && provider === 'microsoft') {
      setStatus('success');
      setMessage('Email account connected successfully!');
      
      // Store the connection status
      localStorage.setItem('emailConnected', 'true');
      localStorage.setItem('emailProvider', 'microsoft');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      setStatus('error');
      setMessage('Unknown OAuth response');
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            OAuth Callback
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Connecting...</h3>
              <p className="text-gray-600">{message}</p>
              <p className="text-xs text-gray-500">
                Please wait while we complete the connection...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
              <p className="text-gray-600">{message}</p>
              <p className="text-xs text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Error</h3>
              <p className="text-gray-600">{message}</p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
