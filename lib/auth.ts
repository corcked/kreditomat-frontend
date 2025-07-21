import { authApi } from './api';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  expires_in: number;
  is_new_user: boolean;
}

export class AuthService {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  static getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_id');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static saveAuth(data: AuthResponse): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_id', data.user_id);
    
    // Save expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
    localStorage.setItem('expires_at', expiresAt.toISOString());
  }

  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('expires_at');
  }

  static isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) return true;
    
    return new Date(expiresAt) <= new Date();
  }

  static async logout(): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      try {
        await authApi.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    this.clearAuth();
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If starts with 998, add +
    if (digits.startsWith('998')) {
      return '+' + digits;
    }
    
    // If starts with 8, replace with +998
    if (digits.startsWith('8') && digits.length === 12) {
      return '+998' + digits.substring(1);
    }
    
    // If just 9 digits (without country code), add +998
    if (digits.length === 9) {
      return '+998' + digits;
    }
    
    return phone;
  }

  static maskPhoneNumber(phone: string): string {
    // Format: +998 90 *** ** 67
    if (phone.length < 7) return phone;
    
    if (phone.startsWith('+998')) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 6)} *** ** ${phone.slice(-2)}`;
    }
    
    return phone;
  }

  static validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return /^\+998\d{9}$/.test(formatted);
  }
}