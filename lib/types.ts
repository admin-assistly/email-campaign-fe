// Core application types and interfaces

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User and Authentication
export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  isLoggedIn: boolean;
  user_email?: string;
  user?: User;
}

// Campaign types
export interface Campaign {
  id: number;
  name: string;
  subject: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  file_id?: number;
  status: 'draft' | 'sent' | 'scheduled' | 'cancelled';
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  description?: string;
  created_by: string;
}

export interface UpdateCampaignData {
  name: string;
  subject: string;
  description?: string;
  file_id?: number;
}

// Response types
export interface Response {
  id: number;
  email_id: number;
  parent_response_id?: number;
  responder_email: string;
  body: string;
  subject?: string;
  recipient_email?: string;
  message_id?: string;
  in_reply_to?: string;
  created_at: string;
  updated_at: string;
  status: string;
  children: number[];
}

export interface CreateResponseData {
  email_id: number;
  parent_response_id?: number;
  responder_email: string;
  body: string;
  subject?: string;
  recipient_email?: string;
  message_id?: string;
  in_reply_to?: string;
}

// Conversation thread types
export interface ConversationThread {
  email_id: number;
  campaign_id: number;
  campaign_name: string;
  subject: string;
  recipient_email: string;
  total_responses: number;
  latest_response_time: string;
  root_response_id: number;
  latest_response_id: number;
  conversation: Response[];
}

// File types
export interface File {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignFile {
  id: number;
  campaign_id: number;
  file_id: number;
  created_at: string;
  campaign?: Campaign;
  file?: File;
}

// Metrics types
export interface ClassificationMetrics {
  interested: number;
  not_interested: number;
  interested_later: number;
  total: number;
}

export interface CampaignPerformance {
  campaign_id: number;
  campaign_name: string;
  total_sent: number;
  total_responses: number;
  response_rate: number;
  interested_count: number;
  not_interested_count: number;
  interested_later_count: number;
}

export interface Metrics {
  classifications: ClassificationMetrics;
  campaigns: CampaignPerformance[];
}

// Email account types
export interface EmailAccountStatus {
  is_connected: boolean;
  provider?: string;
  email?: string;
  last_sync?: string;
}

export interface EmailProvider {
  name: string;
  display_name: string;
  oauth_url: string;
}

// AI generation types
export interface AIGenerationRequest {
  campaign_id?: number;
  email_id?: number;
  context?: string;
  prompt?: string;
}

export interface AIGenerationResponse {
  content: string;
  subject?: string;
  suggestions?: string[];
}

// Form validation types
export interface SignupData {
  email: string;
  password: string;
  repeatPassword: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Loading states
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
