"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { authService } from '@/services/auth';

type Step = 'email' | 'question' | 'reset';

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.forgotPasswordRequest({
        email: formData.email
      });

      if (response.success && response.data?.question) {
        setSecurityQuestion(response.data.question);
        setEmail(formData.email);
        setCurrentStep('question');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.verifySecurityAnswer({
        securityAnswer: formData.securityAnswer
      });

      if (response.success) {
        setCurrentStep('reset');
      }
    } catch (error: any) {
      setError(error.message || 'Invalid security answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.resetPassword({
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.success) {
        setSuccess(response.message);
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#333333]">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="h-12 border-[#D1D9E4] placeholder:text-[#8B94A3] text-[#333333]"
          required
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full h-12 bg-[#F5F7FA] hover:bg-[#E8ECF0] text-[#333333] border border-[#D1D9E4]"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </Button>
    </form>
  );

  const renderQuestionStep = () => (
    <form onSubmit={handleSecurityAnswerSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[#333333]">Security Question</Label>
        <div className="p-3 bg-gray-50 rounded-md text-[#333333]">
          {securityQuestion}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="securityAnswer" className="text-[#333333]">Your Answer</Label>
        <Input
          id="securityAnswer"
          type="text"
          placeholder="Enter your answer"
          value={formData.securityAnswer}
          onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
          className="h-12 border-[#D1D9E4] placeholder:text-[#8B94A3] text-[#333333]"
          required
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full h-12 bg-[#F5F7FA] hover:bg-[#E8ECF0] text-[#333333] border border-[#D1D9E4]"
        disabled={isLoading}
      >
        {isLoading ? 'Verifying...' : 'Verify Answer'}
      </Button>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handlePasswordReset} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-[#333333]">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="h-12 pr-10 border-[#D1D9E4] placeholder:text-[#8B94A3] text-[#333333]"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B94A3] hover:text-[#333333]"
          >
            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[#333333]">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="h-12 pr-10 border-[#D1D9E4] placeholder:text-[#8B94A3] text-[#333333]"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B94A3] hover:text-[#333333]"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
          {success}
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full h-12 bg-[#F5F7FA] hover:bg-[#E8ECF0] text-[#333333] border border-[#D1D9E4]"
        disabled={isLoading}
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Forgot Password';
      case 'question':
        return 'Security Question';
      case 'reset':
        return 'Reset Password';
      default:
        return 'Forgot Password';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return 'Enter your email address to reset your password';
      case 'question':
        return 'Answer your security question to continue';
      case 'reset':
        return 'Enter your new password';
      default:
        return 'Enter your email address to reset your password';
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="bg-[#1C489C] flex items-center justify-center p-8 lg:p-12">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="w-32 h-32 flex items-center justify-center">
              <ImageWithFallback 
                src="/campaign-logo.png"
                alt="AI Email Campaign Platform" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl text-[#FFFFFF] mb-4">CampaignMaster</h1>
          <p className="text-xl text-[#C3D5F5] mb-12">Smart Email Campaigns Made Simple</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-[#F5F7FA]">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-start mb-4">
                <Link href="/login" className="flex items-center text-[#30C7D5] hover:underline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
              <CardTitle className="text-3xl text-[#333333]">{getStepTitle()}</CardTitle>
              <CardDescription className="text-[#8B94A3]">
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentStep === 'email' && renderEmailStep()}
              {currentStep === 'question' && renderQuestionStep()}
              {currentStep === 'reset' && renderResetStep()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 