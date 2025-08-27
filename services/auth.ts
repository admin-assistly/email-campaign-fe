// Authentication service for connecting to Flask backend
import { config } from '@/lib/config';

const API_BASE_URL = config.api.baseUrl;

interface SignupData {
  email: string;
  password: string;
  repeatPassword: string;
  securityQuestion: string;
  securityAnswer: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

interface VerifySecurityAnswerData {
  securityAnswer: string;
}

interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for session cookies
      ...options,
    };

    

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

     
      
      return data;
    } catch (error) {
      
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Signup
  async signup(data: SignupData): Promise<ApiResponse> {
    return this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Login
  async login(data: LoginData): Promise<ApiResponse<{ user_email: string }>> {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Logout
  async logout(): Promise<ApiResponse> {
    return this.makeRequest('/logout', {
      method: 'POST',
    });
  }

  // Check session
  async checkSession(): Promise<ApiResponse<{ isLoggedIn: boolean; user_email?: string }>> {
    return this.makeRequest('/check_session', {
      method: 'GET',
    });
  }

  // Forgot password request
  async forgotPasswordRequest(data: ForgotPasswordData): Promise<ApiResponse<{ question: string }>> {
    return this.makeRequest('/forgot_password_request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Verify security answer
  async verifySecurityAnswer(data: VerifySecurityAnswerData): Promise<ApiResponse> {
    return this.makeRequest('/verify_security_answer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    return this.makeRequest('/reset_password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
export type { SignupData, LoginData, ForgotPasswordData, VerifySecurityAnswerData, ResetPasswordData, ApiResponse }; 