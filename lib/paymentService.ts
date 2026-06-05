// Payment API Service Layer
import { getApiUrl } from './config';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('accessToken');
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    const msg = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`;
    const err = new Error(msg) as Error & {
      currentBalance?: number;
      required?: number;
      shortfall?: number;
      details?: unknown;
    };
    if (error.currentBalance != null) err.currentBalance = error.currentBalance;
    if (error.required != null) err.required = error.required;
    if (error.shortfall != null) err.shortfall = error.shortfall;
    if (error.details) err.details = error.details;
    throw err;
  }
  return response.json();
};

export interface DedicatedAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankSlug: string | null;
  status: 'active' | 'pending';
  assignedAt: string | null;
  isMock?: boolean;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  isActive: boolean;
  dedicatedAccount?: DedicatedAccount | null;
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  type: string;
  transactionType: 'credit' | 'debit';
  status: string;
  description: string | null;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
}

export interface PayableCatalogItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  fixedAmount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  allowCustomAmount: boolean;
  isSystem?: boolean;
}

export interface PendingTopUp {
  reference: string;
  amount: number;
  createdAt: string;
}

export type HistoryFilter = 'all' | 'credit' | 'debit' | 'pending';

export const paymentService = {
  getWalletBalance: async (): Promise<{ wallet: Wallet }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/wallet'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleApiError(response);
  },

  getPendingTopUps: async (): Promise<{ pending: PendingTopUp[] }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/pending'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleApiError(response);
  },

  getCatalog: async (): Promise<{ items: PayableCatalogItem[] }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/catalog'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleApiError(response);
  },

  payCatalogItem: async (
    itemId: string,
    amount?: number,
    note?: string
  ): Promise<{
    message: string;
    reference: string;
    amount: number;
    newBalance: number;
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl(`/api/payments/catalog/${itemId}/pay`), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, note }),
    });
    return handleApiError(response);
  },

  provisionWalletAccount: async (params: {
    bvn?: string;
    accountNumber?: string;
    bankCode?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{
    message: string;
    dedicatedAccount: DedicatedAccount & { paystackCustomerCode?: string };
    wallet: Wallet;
    pending: boolean;
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/wallet/account'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data.error || 'Failed to get account number';
      const e = new Error(msg) as Error & { requiresBvn?: boolean; requiresProfile?: boolean };
      if (data.requiresBvn) e.requiresBvn = true;
      if (data.requiresProfile) e.requiresProfile = true;
      throw e;
    }
    return data;
  },

  simulateMockTransfer: async (amount: number): Promise<{
    message: string;
    amount: number;
    reference: string;
    newBalance: number;
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/wallet/mock-transfer'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    return handleApiError(response);
  },

  topUpWallet: async (amount: number) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/wallet/topup'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    return handleApiError(response) as Promise<{
      message: string;
      reference: string;
      authorizationUrl: string;
      accessCode: string;
    }>;
  },

  verifyPayment: async (reference: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl(`/api/payments/verify/${reference}`), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleApiError(response) as Promise<{
      message: string;
      status: string;
      amount: number;
      reference: string;
      newBalance: number;
    }>;
  },

  payForService: async (
    serviceType: string,
    amount: number,
    description?: string
  ) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/payments/service/pay'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceType, amount, description }),
    });

    return handleApiError(response) as Promise<{
      message: string;
      reference: string;
      amount: number;
      serviceType: string;
      newBalance: number;
    }>;
  },

  getTransactionHistory: async (
    page: number = 1,
    limit: number = 20,
    filter: HistoryFilter = 'all'
  ) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter !== 'all') q.set('filter', filter);

    const response = await fetch(getApiUrl(`/api/payments/history?${q}`), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return handleApiError(response) as Promise<{
      transactions: Transaction[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>;
  },

  formatCurrency: (amount: number, currency: string = 'NGN'): string => {
    const safeAmount = amount || 0;
    if (currency === 'NGN') {
      return `₦${safeAmount.toLocaleString()}`;
    }
    return `${currency} ${safeAmount.toLocaleString()}`;
  },

  getTransactionColor: (type: 'credit' | 'debit'): string => {
    return type === 'credit' ? 'text-green-400' : 'text-red-400';
  },

  getTransactionIcon: (type: string): string => {
    const icons: Record<string, string> = {
      wallet_topup: '💰',
      tuition: '🎓',
      school_fees: '🎓',
      departmental_dues: '🏛️',
      cafeteria: '🍽️',
      library_fine: '📚',
      hostel: '🏠',
      transport: '🚌',
      other: '💳',
    };
    return icons[type] || '💳';
  },

  copyReference: (reference: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      return navigator.clipboard.writeText(reference);
    }
    return Promise.resolve();
  },
};
