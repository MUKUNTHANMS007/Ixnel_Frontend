const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data: ApiResponse<T> = await res.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`API Fetch Error [${endpoint}]:`, err);
    return { 
      success: false, 
      error: err.name === 'AbortError' ? 'Request timed out' : 'Network error. Is the server running?' 
    };
  }
}
