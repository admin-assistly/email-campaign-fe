import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'No authorization code received' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/auth/microsoft/callback?${new URLSearchParams({
      code,
      state: state || ''
    })}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing Microsoft OAuth callback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
