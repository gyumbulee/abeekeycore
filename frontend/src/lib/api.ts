const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_ROOT = API_URL.replace(/\/api\/?$/, '');

/**
 * Sanctum SPA auth requires this to be called once before register/login
 * (it sets the XSRF-TOKEN cookie that Laravel then expects back on the
 * next POST). Safe to call multiple times.
 */
async function getCsrfCookie(): Promise<void> {
  await fetch(`${API_ROOT}/sanctum/csrf-cookie`, { credentials: 'include' });
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const xsrfToken = typeof document !== 'undefined' ? readCookie('XSRF-TOKEN') : null;

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
}

export interface QuotationPayload {
  client_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  service_interest: string;
  project_summary: string;
  budget_range?: string;
}

export interface TrainingCourse {
  slug: string;
  name: string;
  category: string;
  icon: string;
  level: string;
  description: string;
  featured: boolean;
}

export interface TrainingApplicationPayload {
  full_name: string;
  email: string;
  phone: string;
  course: string;
  learning_goal?: string;
  experience_level?: string;
  preferred_schedule?: string;
  delivery_mode?: string;
  preferred_batch?: string;
  notes?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'staff' | 'admin';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount_total: string;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: LineItem[];
  notes: string | null;
  paid_at: string | null;
}

export interface PortalQuotation {
  id: number;
  quotation_number: string;
  title: string;
  amount_total: string;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  valid_until: string | null;
  items: LineItem[];
}

export interface Contract {
  id: number;
  contract_number: string;
  title: string;
  summary: string | null;
  status: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'terminated';
  start_date: string | null;
  end_date: string | null;
  file_path: string | null;
}

export interface DomainSearchResult {
  domain: string;
  tld: string;
  available: boolean | null; // null = registrar couldn't be reached
  price: number;
  currency: string;
}

export interface Registrant {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string; // ISO 2-letter, e.g. NG
}

export interface CreateDomainOrderPayload {
  domain: string;
  tld: string;
  years: number;
  registrant: Registrant;
}

export interface DomainOrder {
  id: number;
  domain_name: string;
  tld: string;
  years: number;
  sale_price: string;
  currency: string;
  status: 'pending_payment' | 'processing' | 'registered' | 'registration_failed' | 'cancelled';
  connect_reseller_order_id: string | null;
  failure_reason: string | null;
  registered_at: string | null;
  created_at: string;
}

export interface Transaction {
  id: number;
  invoice_id: number | null;
  invoice?: { id: number; invoice_number: string } | null;
  tx_ref: string;
  flw_transaction_id: string | null;
  amount: string;
  currency: string;
  status: 'pending' | 'successful' | 'failed';
  payment_method: string | null;
  receipt_number: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Lead {
  id: number;
  client_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  service_interest: string;
  project_summary: string;
  budget_range: string | null;
  status: 'new' | 'reviewed' | 'quoted' | 'won' | 'lost';
  created_at: string;
}

export interface ConvertLeadPayload {
  title: string;
  amount_total: number;
  currency?: string;
  valid_until?: string;
  items: LineItem[];
}

export interface ClientAccount {
  id: number;
  name: string;
  email: string;
}

export interface CreateInvoicePayload {
  user_id: number;
  issue_date: string;
  due_date: string;
  currency?: string;
  notes?: string;
  items: LineItem[];
}

export interface CreateContractPayload {
  user_id: number;
  title: string;
  summary?: string;
  status?: Contract['status'];
  start_date?: string;
  end_date?: string;
}

export const adminApi = {
  getLeads: (status?: string) =>
    request<{ data: Lead[] }>(`/admin/leads${status ? `?status=${status}` : ''}`),
  getLead: (id: number) => request<{ data: Lead }>(`/admin/leads/${id}`),
  convertLead: (id: number, payload: ConvertLeadPayload) =>
    request<{ data: PortalQuotation; message: string }>(`/admin/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getClients: () => request<{ data: ClientAccount[] }>('/admin/clients'),

  getInvoices: () => request<{ data: (Invoice & { user: ClientAccount })[] }>('/admin/invoices'),
  createInvoice: (payload: CreateInvoicePayload) =>
    request<{ data: Invoice & { user: ClientAccount } }>('/admin/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getContracts: () => request<{ data: (Contract & { user: ClientAccount })[] }>('/admin/contracts'),
  createContract: (payload: CreateContractPayload) =>
    request<{ data: Contract & { user: ClientAccount } }>('/admin/contracts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTransactions: () =>
    request<{ data: (Transaction & { user: ClientAccount })[] }>('/admin/transactions'),

  getDomainOrders: () =>
    request<{ data: (DomainOrder & { user: ClientAccount })[] }>('/admin/domains'),
};

export const api = {
  getServices: () => request<{ data: { slug: string; name: string; icon: string }[] }>('/services'),
  submitContact: (payload: ContactPayload) =>
    request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  submitQuotation: (payload: QuotationPayload) =>
    request('/quotation-requests', { method: 'POST', body: JSON.stringify(payload) }),
  getTrainingCourses: () => request<{ data: TrainingCourse[] }>('/training/courses'),
  submitTrainingApplication: (payload: TrainingApplicationPayload) =>
    request('/training/applications', { method: 'POST', body: JSON.stringify(payload) }),

  // --- Auth (Sanctum SPA / cookie-based) ---
  register: async (payload: RegisterPayload) => {
    await getCsrfCookie();
    return request<{ data: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },
  login: async (payload: LoginPayload) => {
    await getCsrfCookie();
    return request<{ data: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  },
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request<{ data: AuthUser }>('/auth/me'),

  // --- Client Portal (authenticated) ---
  getInvoices: () => request<{ data: Invoice[] }>('/portal/invoices'),
  getInvoice: (id: number) => request<{ data: Invoice }>(`/portal/invoices/${id}`),
  getPortalQuotations: () => request<{ data: PortalQuotation[] }>('/portal/quotations'),
  getPortalQuotation: (id: number) => request<{ data: PortalQuotation }>(`/portal/quotations/${id}`),
  respondToQuotation: (id: number, decision: 'accepted' | 'declined') =>
    request<{ data: PortalQuotation }>(`/portal/quotations/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),
  getContracts: () => request<{ data: Contract[] }>('/portal/contracts'),
  getContract: (id: number) => request<{ data: Contract }>(`/portal/contracts/${id}`),

  payInvoice: (invoiceId: number) =>
    request<{ data: { payment_link: string; tx_ref: string } }>(`/portal/invoices/${invoiceId}/pay`, {
      method: 'POST',
    }),
  verifyPayment: (txRef: string) =>
    request<{ data: Transaction }>('/portal/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ tx_ref: txRef }),
    }),
  getTransactions: () => request<{ data: Transaction[] }>('/portal/transactions'),
  getTransaction: (id: number) => request<{ data: Transaction }>(`/portal/transactions/${id}`),

  searchDomains: (query: string) =>
    request<{ data: DomainSearchResult[] }>(`/domains/search?query=${encodeURIComponent(query)}`),
  getDomainOrders: () => request<{ data: DomainOrder[] }>('/portal/domains'),
  createDomainOrder: (payload: CreateDomainOrderPayload) =>
    request<{ data: { payment_link: string; tx_ref: string; order: DomainOrder } }>('/portal/domains', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyDomainPayment: (txRef: string) =>
    request<{ data: { transaction: Transaction; order: DomainOrder | null } }>('/portal/domains/verify', {
      method: 'POST',
      body: JSON.stringify({ tx_ref: txRef }),
    }),
};
