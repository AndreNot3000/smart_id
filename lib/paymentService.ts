// Payment API Service Layer
import { getApiUrl } from './config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('accessToken');
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  type: string;
  transactionType: 'credit' | 'debit';
  status: string;
  description: string | null;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paymentService = {
  // Get wallet balance
  getWalletBalance: async (): Promise<{ wallet: Wallet }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/wallet'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleApiError(response);
  },

  // Top up wallet
  topUpWallet: async (amount: number): Promise<{
    message: string;
    reference: string;
    authorizationUrl: string;
    accessCode: string;
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/wallet/topup'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    return handleApiError(response);
  },

  // Verify payment
  verifyPayment: async (reference: string): Promise<{
    message: string;
    status: string;
    amount: number;
    reference: string;
    newBalance: number;
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl(`/api/payments/verify/${reference}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleApiError(response);
  },

  // Pay for service
  payForService: async (
    serviceType: 'cafeteria' | 'library_fine' | 'hostel' | 'transport' | 'other',
    amount: number,
    description?: string
  ): Promise<{
    message: string;
    reference: string;
    amount: number;
    serviceType: string;
    newBalance: number;
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/service/pay'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceType, amount, description }),
    });

    return handleApiError(response);
  },

  // Get transaction history
  getTransactionHistory: async (page: number = 1, limit: number = 20): Promise<TransactionHistory> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(
      getApiUrl(`/api/payments/history?page=${page}&limit=${limit}`),
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return handleApiError(response);
  },

  // Format currency
  formatCurrency: (amount: number, currency: string = 'NGN'): string => {
    const safeAmount = amount || 0;
    if (currency === 'NGN') {
      return `₦${safeAmount.toLocaleString()}`;
    }
    return `${currency} ${safeAmount.toLocaleString()}`;
  },

  // Get transaction type color
  getTransactionColor: (type: 'credit' | 'debit'): string => {
    return type === 'credit' ? 'text-green-400' : 'text-red-400';
  },

  // Get transaction icon
  getTransactionIcon: (type: string): string => {
    const icons: Record<string, string> = {
      wallet_topup: '💰',
      cafeteria: '🍽️',
      library_fine: '📚',
      hostel: '🏠',
      transport: '🚌',
      other: '💳',
    };
    return icons[type] || '💳';
  },
};
