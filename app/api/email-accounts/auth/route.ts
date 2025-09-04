import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, provider } = body;
    
    // Extract cookies from the incoming request from the browser
    const cookies = request.headers.get('cookie');
    console.log('🔍 [AUTH-URL] Incoming request cookies:', cookies);

    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      backendHeaders['Cookie'] = cookies; // Explicitly forward cookies
    }

    // Use the new dynamic OAuth route
    const response = await fetch(`http://localhost:5000/api/auth/${provider}/url`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({ email }),
    });

    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      if (contentType && contentType.includes('text/html')) {
        console.error('Backend returned HTML instead of JSON');
        return NextResponse.json(
          { 
            error: 'Authentication required. Please log in again.',
            details: 'Backend returned HTML error page'
          }, 
          { status: 401 }
        );
      }
      
      try {
        const error = await response.json();
        return NextResponse.json(error, { status: response.status });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Backend error occurred' },
          { status: response.status }
        );
      }
    }

    try {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: {
          auth_url: data.auth_url,
          provider: data.provider,
          oauth_provider: data.oauth_provider
        }
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON response from backend' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error getting OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
