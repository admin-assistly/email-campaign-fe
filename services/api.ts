// API abstraction layer for Flask backend
// All endpoints go through Next.js API routes for proper authentication
import { config } from '@/lib/config';

// Get current user from session
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/check', {
      credentials: 'include',
    });
    if (!response.ok) {
      console.log('❌ [GET-CURRENT-USER] Auth check failed');
      return null;
    }
    const data = await response.json();
    console.log('🔍 [GET-CURRENT-USER] Auth check result:', data);
    
    if (!data.isLoggedIn) {
      console.log('❌ [GET-CURRENT-USER] User not logged in');
      return null;
    }
    
    const userEmail = data.data?.user_email || null;
    console.log('✅ [GET-CURRENT-USER] User email:', userEmail);
    return userEmail;
  } catch (error) {
    console.error("❌ [GET-CURRENT-USER] Error getting current user:", error);
    return null;
  }
}



// FILES (Uploaded subscriber files)
export async function fetchFiles() {
  const res = await fetch(`/api/files`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch files");
  return res.json();
}

// CAMPAIGNS
export async function fetchCampaigns() {
  const res = await fetch(`/api/campaigns`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch campaigns");
  }
  return res.json();
}



export async function createCampaign(data: { name: string; subject: string; description?: string; created_by: string; }) {
  const res = await fetch(`/api/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create campaign");
  }
  return res.json();
}

export async function updateCampaign(campaignId: number, data: {
  name: string;
  subject: string;
  description?: string;
  file_id?: number;
}) {
  const res = await fetch(`/api/campaigns/${campaignId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update campaign");
  return res.json();
}



export async function sendCampaign(campaignId: number) {
    const res = await fetch(
      `/api/campaigns/send`,
      { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ campaign_id: campaignId }),
      }
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send campaign");
    }
    return res.json();
  }

export async function deleteCampaign(campaignId: number) {
  const res = await fetch(`/api/campaigns/${campaignId}`, {
    method: "DELETE",
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to delete campaign");
  return res.json();
}

// CAMPAIGN FILES (Join table)
export async function fetchCampaignFiles() {
  const res = await fetch(`/api/campaign-files`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch campaign files");
  return res.json();
}



export async function fetchEmailById(emailId: number) {
  const res = await fetch(`/api/emails/${emailId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch email");
  return res.json();
}

// RESPONSES
export async function fetchResponses() {
  const res = await fetch(`/api/responses`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch responses");
  return res.json();
}

export async function fetchResponseById(responseId: string) {
  const res = await fetch(`/api/responses/${responseId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch response");
  return res.json();
}

export async function createResponse(data: {
  email_id: number;
  parent_response_id?: number;
  responder_email: string;
  body: string;
  subject?: string;
  recipient_email?: string;
  message_id?: string;
  in_reply_to?: string;
}) {
  const res = await fetch(`/api/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create response");
  return res.json();
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/upload-file`, {
    method: "POST",
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to upload file");
  return res.json();
}

export async function linkFileToCampaign(fileId: number, campaignId: number) {
  const res = await fetch(`/api/campaigns/link-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ campaign_id: campaignId, file_id: fileId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to link file to campaign");
  }
  return res.json();
}

export async function fetchPresignedUrl(fileId: number) {
  const res = await fetch(
    `/api/files/${fileId}/presigned-url`,
    {
      credentials: 'include',
    }
  );
  if (!res.ok) throw new Error("Failed to get presigned URL");
  return res.json();
}

// METRICS
export async function fetchClassificationMetrics(campaignId?: string) {
  const url = campaignId 
    ? `/api/metrics/classifications?campaign_id=${campaignId}`
    : `/api/metrics/classifications`;
  const res = await fetch(url, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch classification metrics");
  return res.json();
}

export async function fetchCampaignPerformance() {
  const res = await fetch(`/api/metrics/campaign-performance`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error("Failed to fetch campaign performance");
  return res.json();
}

// EMAIL ACCOUNT MANAGEMENT
export async function checkEmailStatus() {
  const res = await fetch('/api/email-accounts/status', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to check email status");
  return res.json();
}

export async function detectEmailProvider(email: string) {
  const res = await fetch('/api/email-accounts/detect-provider', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error("Failed to detect email provider");
  return res.json();
}

export async function getOAuthUrl(email: string) {
  const res = await fetch('/api/email-accounts/oauth-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error("Failed to get OAuth URL");
  return res.json();
}

export async function disconnectEmail() {
  const res = await fetch('/api/email-accounts/disconnect', {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to disconnect email");
  return res.json();
}
