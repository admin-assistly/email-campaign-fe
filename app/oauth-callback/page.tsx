"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (success === 'true') {
      setStatus('success');
      setMessage(`${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Email'} account connected successfully!`);
      
      // Update localStorage
      localStorage.setItem('emailConnected', 'true');
      localStorage.setItem('emailProvider', provider || 'microsoft');
      if (emailParam) {
        localStorage.setItem('userEmail', emailParam);
      }
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } else {
      setStatus('error');
      setMessage(error || 'Failed to connect email account. Please try again.');
      
      // Clear localStorage on error
      localStorage.removeItem('emailConnected');
      localStorage.removeItem('emailProvider');
    }
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push('/dashboard');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'processing' && <Loader2 className="h-6 w-6 animate-spin text-blue-600" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
            Email Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'processing' && (
            <div className="text-center space-y-2">
              <p className="text-gray-600">Processing your email connection...</p>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Success!</span>
              </div>
              <p className="text-gray-700">{message}</p>
              {email && (
                <p className="text-sm text-gray-600">
                  Connected: <span className="font-medium">{email}</span>
                </p>
              )}
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard Now
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Connection Failed</span>
              </div>
              <p className="text-gray-700">{message}</p>
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
