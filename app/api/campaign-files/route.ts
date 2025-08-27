import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract cookies from the incoming request from the browser
    const cookies = request.headers.get('cookie');
    console.log('🔍 [CAMPAIGN-FILES-GET] Incoming request cookies:', cookies);

    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      backendHeaders['Cookie'] = cookies; // Explicitly forward cookies
    }

    const response = await fetch('http://localhost:5000/api/campaign-files', {
      method: 'GET',
      headers: backendHeaders,
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
      
      // Forward session cookies from backend to frontend
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
      return NextResponse.json(
        { error: 'Invalid JSON response from backend' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching campaign files:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
