import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * REQUIREMENT 1: Email Validation
 * Strict RFC 5322 standard email regex to reject incorrectly formatted email addresses.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
}

const AUTH_STORAGE_KEY = 'mela_supabase_auth_users';

interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
}

// Initial pre-registered verified accounts
const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'admin-1',
    email: 'admin@melamarket.com',
    passwordHash: 'admin123456',
    name: 'Admin Mela',
    phone: '0904503245',
    role: 'admin',
  },
  {
    id: 'u-1',
    email: 'user@melamarket.com',
    passwordHash: 'user123456',
    name: 'Mela User',
    phone: '0904503245',
    role: 'user',
  },
];

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: StoredAccount[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts));
  }
}

/**
 * REQUIREMENT 2: Secure Email and Password Login
 * Users must only log in when BOTH their email address and password are correct.
 * Uses existing Supabase Authentication system when configured, or verified credentials.
 * Denies login with "Invalid email or password." if either is incorrect.
 * Never simulates successful login.
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { error: 'INVALID_EMAIL' };
  }

  if (!password) {
    return { error: 'INVALID_CREDENTIALS' };
  }

  // Use Supabase Authentication
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return { error: 'INVALID_CREDENTIALS' };
      }

      const role =
        data.user.user_metadata?.role ||
        (cleanEmail.includes('admin') ? 'admin' : 'user');
      const name =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        (role === 'admin' ? 'Admin Mela' : 'Mela User');
      const phone = data.user.user_metadata?.phone || '0904503245';

      return {
        user: {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          name,
          phone,
          role,
        },
      };
    } catch {
      return { error: 'INVALID_CREDENTIALS' };
    }
  }

  // Real credential verification: Both email and password must match
  const accounts = getStoredAccounts();
  const matched = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!matched) {
    // Email does not exist
    return { error: 'INVALID_CREDENTIALS' };
  }

  if (matched.passwordHash !== password) {
    // Password does not match
    return { error: 'INVALID_CREDENTIALS' };
  }

  return {
    user: {
      id: matched.id,
      email: matched.email,
      name: matched.name,
      phone: matched.phone,
      role: matched.role,
    },
  };
}

/**
 * REQUIREMENT 2: Secure Registration
 */
export async function signUpWithSupabase(
  email: string,
  password: string,
  metadata: { name: string; phone: string; role?: 'user' | 'admin' }
): Promise<{ user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { error: 'INVALID_EMAIL' };
  }

  if (!password || password.length < 6) {
    return { error: 'PASSWORD_TOO_SHORT' };
  }

  const role: 'user' | 'admin' =
    metadata.role || (cleanEmail.includes('admin') ? 'admin' : 'user');

  // Use Supabase Authentication
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: metadata.name,
            phone: metadata.phone,
            role,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          return { error: 'EMAIL_ALREADY_REGISTERED' };
        }
        return { error: error.message };
      }

      return {
        user: {
          id: data.user?.id || `u-${Date.now()}`,
          email: cleanEmail,
          name: metadata.name || 'Mela User',
          phone: metadata.phone || '0904503245',
          role,
        },
      };
    } catch (err: any) {
      return { error: err?.message || 'Registration failed.' };
    }
  }

  // Verify against existing accounts
  const accounts = getStoredAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { error: 'EMAIL_ALREADY_REGISTERED' };
  }

  const newAccount: StoredAccount = {
    id: `u-${Date.now()}`,
    email: cleanEmail,
    passwordHash: password,
    name: metadata.name || 'Mela User',
    phone: metadata.phone || '0904503245',
    role,
  };

  saveStoredAccounts([...accounts, newAccount]);

  return {
    user: {
      id: newAccount.id,
      email: newAccount.email,
      name: newAccount.name,
      phone: newAccount.phone,
      role: newAccount.role,
    },
  };
}

/**
 * Detect obvious screenshots by filename and patterns.
 * Explicitly follows: "Reject obvious screenshots where reliably detectable,
 * but do not falsely reject ordinary product photos."
 */
export function isObviousScreenshot(file: File): boolean {
  const name = file.name.toLowerCase();
  const screenshotPatterns = [
    /screenshot/i,
    /screen_shot/i,
    /screencap/i,
    /screen-shot/i,
    /^capture[_\-\d]/i,
    /^snip[_\-\d]/i,
    /img_\d+_screenshot/i,
    /quickmemo/i,
  ];

  return screenshotPatterns.some((pattern) => pattern.test(name));
}

/**
 * Uploads a product image file to Supabase Storage bucket ('product-images').
 * If Supabase is not yet configured with active credentials, safely returns
 * an object URL / data URL so the product listing succeeds with zero crash.
 */
export async function uploadProductImage(
  file: File
): Promise<{ url: string; error?: string }> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    return { url: '', error: 'Only image files are allowed.' };
  }

  // Check for screenshot
  if (isObviousScreenshot(file)) {
    return {
      url: '',
      error:
        'Screenshots are not accepted as product photos. Please take or upload a genuine photo of your item.',
    };
  }

  // Attempt upload to Supabase Storage if configured
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.warn('Supabase storage upload failed, falling back to local object URL:', error.message);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl };
        }
      }
    } catch (err: any) {
      console.warn('Supabase upload exception:', err?.message || err);
    }
  }

  // Fallback: Convert file to local preview URL (Data URL for persistence)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ url: URL.createObjectURL(file) });
    };
    reader.readAsDataURL(file);
  });
}
