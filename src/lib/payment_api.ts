// src/lib/payment_api.ts

import { api } from './api';
import type { ApiResponse } from './api'; // Type-only import for verbatimModuleSyntax

export interface CheckoutSessionResponse {
  transactionId: string;
  priceId: string;
  email: string;
}

export const paymentAPI = {
  /**
   * Contacts the backend to generate a secure, server-sealed checkout transaction.
   */
  createCheckout: async (priceId: string): Promise<ApiResponse<CheckoutSessionResponse>> => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication is required to initiate a purchase.',
      };
    }

    return api<CheckoutSessionResponse>('/payments/create-checkout', {
      method: 'POST',
      body: { priceId },
      token, // Automatically sends as 'Authorization: Bearer <token>'
    });
  }
};