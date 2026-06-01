// src/lib/payment_service.ts

import { initializePaddle } from '@paddle/paddle-js'; // Runtime value-level import
import type { Paddle } from '@paddle/paddle-js'; // Type-only import for verbatimModuleSyntax
import { paymentAPI } from './payment_api';

let paddleInstance: Paddle | undefined;

// Active success callback reference to bridge initializePaddle and openCheckout [1.2.4]
let activeSuccessCallback: (() => void) | undefined;

// Track if the transaction completed successfully in this session [1.2.4]
let isCompleted = false;

export const paymentService = {
  /**
   * Initializes the Paddle.js SDK globally with centralized event listeners
   */
  init: async (): Promise<Paddle> => {
    if (paddleInstance) return paddleInstance;

    const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '';
    const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox';

    if (!token) {
      console.warn('[paymentService] WARNING: VITE_PADDLE_CLIENT_TOKEN is not set.');
    }

    // Initialize Paddle.js client-side SDK with global event listeners
    const initializedInstance = await initializePaddle({
      token,
      environment: environment as 'sandbox' | 'production',
      eventCallback: (event) => {
        // Paddle.js uses 'event.name' to describe the event name [1.1.2]
        if (event.name === 'checkout.completed') {
          console.log('[paymentService] Webhook transaction completed inside iframe.');
          isCompleted = true; // Set completed flag [1.1.2]
        }
        
        if (event.name === 'checkout.closed') {
          console.log('[paymentService] Checkout overlay closed.');
          // Only fire the Success Modal after the payment window is fully closed and out of the way [1.2.4]
          if (isCompleted && activeSuccessCallback) {
            isCompleted = false; // Reset flag for next session
            activeSuccessCallback();
          }
        }
      }
    });

    if (!initializedInstance) {
      throw new Error('Paddle.js initialization returned undefined');
    }

    paddleInstance = initializedInstance;
    return paddleInstance;
  },

  /**
   * Generates a transaction and opens the Paddle checkout overlay.
   */
  openCheckout: async (priceId: string, onSuccess?: () => void): Promise<void> => {
    try {
      // 1. Fetch secure transaction details from backend
      const response = await paymentAPI.createCheckout(priceId);

      // Save the callback globally so the single global eventCallback can invoke it [1.2.4]
      activeSuccessCallback = onSuccess;

      // Diagnostic log to verify body properties
      console.log('[paymentService] api response.data:', response.data);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate checkout session.');
      }

      // 2. Ensure Paddle.js is initialized
      const paddle = await paymentService.init();

      // 3. Open the secure overlay using the sealed transactionId
      paddle.Checkout.open({
        transactionId: response.data.transactionId,
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
        }
      });
    } catch (error) {
      console.error('[paymentService][openCheckout] Error:', error);
      throw error;
    }
  }
};