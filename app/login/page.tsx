"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Shield, Users, BarChart3, Sparkles, Zap, Send, MousePointer } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { authService } from '@/services/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Redirect to dashboard or main app
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
          
          {/* Visual Feature Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-xl mb-3 mx-auto w-16 h-16 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-[#FFFFFF]" />
              </div>
              <p className="text-[#FFFFFF]">AI Writing</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-xl mb-3 mx-auto w-16 h-16 flex items-center justify-center backdrop-blur-sm">
                <Send className="w-8 h-8 text-[#FFFFFF]" />
              </div>
              <p className="text-[#FFFFFF]">Auto Send</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-xl mb-3 mx-auto w-16 h-16 flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-8 h-8 text-[#FFFFFF]" />
              </div>
              <p className="text-[#FFFFFF]">Track Results</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-xl mb-3 mx-auto w-16 h-16 flex items-center justify-center backdrop-blur-sm">
                <MousePointer className="w-8 h-8 text-[#FFFFFF]" />
              </div>
              <p className="text-[#FFFFFF]">Easy Setup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-[#F5F7FA]">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl text-[#333333]">Welcome Back</CardTitle>
              <CardDescription className="text-[#8B94A3]">
                Continue your email journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Login */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full h-12 border-[#D1D9E4] hover:bg-gray-50 text-[#333333]">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <Button variant="outline" className="w-full h-12 border-[#D1D9E4] hover:bg-gray-50 text-[#333333]">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[#8B94A3]">Or use email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#333333]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 border-[#D1D9E4] placeholder:text-[#8B94A3] text-[#333333]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#333333]">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 pr-10 border-[#D1D9E4] placeholder:text-[#8B94A3] text-[#333333]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B94A3] hover:text-[#333333]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                    />
                    <Label htmlFor="remember" className="text-sm text-[#8B94A3]">Remember me</Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-[#30C7D5] hover:underline">
                    Forgot password?
                  </Link>
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
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-[#8B94A3]">
              New here?{' '}
              <Link href="/signup" className="text-[#30C7D5] hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {/* Trust Icons */}
          <div className="mt-8 flex justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#333333]" />
              <span className="text-xs text-[#8B94A3]">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#333333]" />
              <span className="text-xs text-[#8B94A3]">Trusted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-[#333333]" />
              <span className="text-xs text-[#8B94A3]">Fast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 