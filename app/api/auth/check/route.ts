import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [AUTH-CHECK] Checking authentication...');
    
    // Extract cookies from the incoming request from the browser
    const cookies = request.headers.get('cookie');
    console.log('🔍 [AUTH-CHECK] Incoming request cookies:', cookies);

    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      backendHeaders['Cookie'] = cookies; // Explicitly forward cookies
    }

    const response = await fetch(`${API_BASE_URL}/check_session`, {
      method: 'GET',
      // Remove credentials: 'include' here, as we're manually setting the Cookie header
      headers: backendHeaders,
    });

    console.log('🔍 [AUTH-CHECK] Response status:', response.status);

    if (!response.ok) {
      console.log('❌ [AUTH-CHECK] Not authenticated');
      return NextResponse.json(
        { isLoggedIn: false, data: null },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('✅ [AUTH-CHECK] Authenticated:', data);
    
    // 🔧 FIX: Forward the session cookie from backend to frontend
    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    return NextResponse.json(data, { 
      status: 200,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('❌ [AUTH-CHECK] Error:', error);
    return NextResponse.json(
      { isLoggedIn: false, data: null },
      { status: 200 }
    );
  }
}
