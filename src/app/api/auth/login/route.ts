import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Fetch user from database
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, email, created_at, password_hash')
      .eq('username', username)
      .single();

    if (error || !data) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Password verification using bcrypt
    const isValidPassword = await bcrypt.compare(password, data.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return user data without password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userData } = data;
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
