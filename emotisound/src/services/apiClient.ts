import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { AuthResponse, User } from '../types';

class ApiClient {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add token to requests
        this.client.interceptors.request.use((config) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        });

        // Load token from localStorage
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            this.token = savedToken;
        }
    }

    // Auth endpoints
    async register(email: string, password: string): Promise<AuthResponse> {
        const response = await this.client.post<AuthResponse>('/auth/register', {
            email,
            password,
        });
        this.setToken(response.data.token);
        return response.data;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await this.client.post<AuthResponse>('/auth/login', {
            email,
            password,
        });
        this.setToken(response.data.token);
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await this.client.post('/auth/logout');
        } finally {
            this.clearToken();
        }
    }

    async getCurrentUser(): Promise<User> {
        const response = await this.client.get<User>('/auth/me');
        return response.data;
    }

    // Preferences endpoints
    async updatePreferences(preferences: Record<string, any>): Promise<User> {
        const response = await this.client.patch<User>('/user/preferences', preferences);
        return response.data;
    }

    async getPreferences(): Promise<any> {
        const response = await this.client.get('/user/preferences');
        return response.data;
    }

    // Analytics endpoints
    async logEmotionEvent(emotion: string, confidence: number): Promise<void> {
        await this.client.post('/analytics/emotion', {
            emotion,
            confidence,
            timestamp: new Date(),
        });
    }

    async getEmotionStats(): Promise<any> {
        const response = await this.client.get('/analytics/stats');
        return response.data;
    }

    async getSessionHistory(): Promise<any[]> {
        const response = await this.client.get('/analytics/sessions');
        return response.data;
    }

    // Token management
    private setToken(token: string): void {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    private clearToken(): void {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    getToken(): string | null {
        return this.token;
    }

    isAuthenticated(): boolean {
        return this.token !== null;
    }
}

export default new ApiClient();
