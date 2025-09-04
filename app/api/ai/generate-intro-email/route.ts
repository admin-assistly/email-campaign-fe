import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie');
    console.log('🔍 [AI-GENERATE-INTRO] Incoming request cookies:', cookies);

    const body = await request.json();
    console.log('📝 [AI-GENERATE-INTRO] Request body:', body);

    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookies) {
      backendHeaders['Cookie'] = cookies;
    }

    const response = await fetch(`${API_BASE_URL}/generate-intro-email`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(body),
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
    console.error('Error generating intro email:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
