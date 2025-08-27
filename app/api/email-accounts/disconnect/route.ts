import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function POST(request: NextRequest) {
  try {
    // Extract cookies from the incoming request from the browser
    const cookies = request.headers.get('cookie');
    console.log('🔍 [DISCONNECT] Incoming request cookies:', cookies);

    const backendHeaders: HeadersInit = {};

    if (cookies) {
      backendHeaders['Cookie'] = cookies; // Explicitly forward cookies
    }

    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/email-accounts/disconnect`, {
      method: 'POST',
      // Remove credentials: 'include' here, as we're manually setting the Cookie header
      headers: backendHeaders,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error disconnecting email account:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
