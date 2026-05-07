import axiosInstance from '../api/Axios';

// Types for API responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  };
}

export interface RegisterResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

class AuthService {

  // ============ AUTHENTICATION METHODS ============

  /**
   * Login user (doctor or patient)
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    const data = response.data;

    // Store token in localStorage
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  /**
   * Register new patient
   */
  async register(patientData: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', patientData);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed, continuing with local cleanup');
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get user profile (protected route test)
   */
  async getProfile(): Promise<any> {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }

  // ============ UTILITY METHODS ============

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Check if current user is doctor
   */
  isDoctor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'DOCTOR';
  }

  /**
   * Check if current user is patient
   */
  isPatient(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'PATIENT';
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
