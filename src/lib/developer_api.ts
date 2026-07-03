// src/lib/developer_api.ts
import { api } from './api';
import type { ApiResponse } from './api';

export interface ApiKeyRecord {
  id: string;
  key_name: string;
  key_prefix: string;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  raw_key?: string; // Only populated on the initial response after creation [2]
}

export interface GetApiKeysResponse {
  keys: ApiKeyRecord[];
}

export interface CreateApiKeyResponse {
  key: ApiKeyRecord;
  message: string;
}

export const developerAPI = {
  /**
   * Retrieves all active API Keys for the authenticated profile.
   */
  listApiKeys: async (): Promise<ApiResponse<ApiKeyRecord[]>> => {
    const token = localStorage.getItem('accessToken');
    // Bypasses double-nesting envelope structures cleanly
    const response = await api<GetApiKeysResponse>('/credits/keys', {
      method: 'GET',
      token,
    });
    return {
      ...response,
      data: response.data?.keys as any // Normalize data directly to an array
    };
  },

  /**
   * Generates a new secure, hashed API Key.
   */
  createApiKey: async (keyName: string): Promise<ApiResponse<CreateApiKeyResponse>> => {
    const token = localStorage.getItem('accessToken');
    return api<CreateApiKeyResponse>('/credits/keys', {
      method: 'POST',
      body: { keyName },
      token,
    });
  },

  /**
   * Revokes and permanently deletes an API Key.
   */
  revokeApiKey: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const token = localStorage.getItem('accessToken');
    return api<{ message: string }>(`/credits/keys/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};