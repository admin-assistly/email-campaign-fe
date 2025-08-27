import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [EMAIL-STATUS] Making request to backend...');
    
    // Extract cookies from the incoming request from the browser
    const cookies = request.headers.get('cookie');
    console.log('🔍 [EMAIL-STATUS] Incoming request cookies:', cookies);

    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      backendHeaders['Cookie'] = cookies; // Explicitly forward cookies
    }

    const response = await fetch('http://localhost:5000/api/email-accounts/status', {
      method: 'GET',
      // Remove credentials: 'include' here, as we're manually setting the Cookie header
      headers: backendHeaders,
    });

    console.log('🔍 [EMAIL-STATUS] Response status:', response.status);
    console.log('🔍 [EMAIL-STATUS] Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle different response types
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      if (contentType && contentType.includes('text/html')) {
        // Backend returned HTML error page
        console.error('❌ [EMAIL-STATUS] Backend returned HTML instead of JSON');
        return NextResponse.json(
          { 
            error: 'Authentication required. Please log in again.',
            details: 'Backend returned HTML error page'
          }, 
          { status: 401 }
        );
      }
      
      // Try to parse JSON error
      try {
        const error = await response.json();
        console.error('❌ [EMAIL-STATUS] Backend error:', error);
        return NextResponse.json(error, { status: response.status });
      } catch (parseError) {
        console.error('❌ [EMAIL-STATUS] Failed to parse error JSON:', parseError);
        return NextResponse.json(
          { error: 'Backend error occurred' },
          { status: response.status }
        );
      }
    }

    // Success response
    try {
      const data = await response.json();
      console.log('✅ [EMAIL-STATUS] Success response:', data);
      
      // 🔧 FIX: Forward session cookies from backend to frontend
      const responseHeaders = new Headers();
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        responseHeaders.set('Set-Cookie', setCookieHeader);
      }

      return NextResponse.json(data, { 
        status: 200,
        headers: responseHeaders
      });
    } catch (parseError) {
      console.error('❌ [EMAIL-STATUS] Failed to parse success JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from backend' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [EMAIL-STATUS] Network error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
