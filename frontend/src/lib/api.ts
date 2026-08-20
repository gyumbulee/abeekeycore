const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_ROOT = API_URL.replace(/\/api\/?$/, '');

export class ApiError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(message: string, status: number, body: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

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
    throw new ApiError(body.message || 'Request failed', res.status, body);
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
  hp_field_9x2?: string;
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
  hp_field_9x2?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'client' | 'staff' | 'admin';
  last_login_at?: string | null;
}

export interface UpdateProfilePayload {
  name: string;
  phone?: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
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

export interface ContactMessageRecord {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'replied';
  reply_message: string | null;
  replied_at: string | null;
  is_registered_user: boolean;
  created_at: string;
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

export interface ClientAccountDetailed extends ClientAccount {
  created_at: string;
  invoices_count: number;
  quotations_count: number;
  contracts_count: number;
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

export interface CreateQuotationPayload {
  user_id: number;
  title: string;
  amount_total: number;
  currency?: string;
  valid_until?: string;
  items: LineItem[];
}

export interface UpdateQuotationStatusPayload {
  status: PortalQuotation['status'];
}

export interface MarkInvoicePaidPayload {
  payment_method: string;
  reference?: string;
  note?: string;
}

export const adminApi = {
  getLeads: (status?: string) =>
    request<{ data: Lead[] }>(`/admin/leads${status ? `?status=${status}` : ''}`),

  getLead: (id: number) =>
    request<{ data: Lead }>(`/admin/leads/${id}`),

  convertLead: (id: number, payload: ConvertLeadPayload) =>
    request<{ data: PortalQuotation; message: string }>(`/admin/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getClients: () =>
    request<{ data: ClientAccountDetailed[] }>('/admin/clients'),

  getInvoices: () =>
    request<{ data: (Invoice & { user: ClientAccount })[] }>('/admin/invoices'),

  createInvoice: (payload: CreateInvoicePayload) =>
    request<{ data: Invoice & { user: ClientAccount } }>('/admin/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  markInvoicePaid: (id: number, payload: MarkInvoicePaidPayload) =>
    request<{ data: Invoice & { user: ClientAccount } }>(`/admin/invoices/${id}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getQuotations: () =>
    request<{ data: (PortalQuotation & { user: ClientAccount })[] }>('/admin/quotations'),

  createQuotation: (payload: CreateQuotationPayload) =>
    request<{ data: PortalQuotation & { user: ClientAccount } }>('/admin/quotations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateQuotationStatus: (id: number, payload: UpdateQuotationStatusPayload) =>
    request<{ data: PortalQuotation & { user: ClientAccount } }>(`/admin/quotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getContracts: () =>
    request<{ data: (Contract & { user: ClientAccount })[] }>('/admin/contracts'),

  createContract: (payload: CreateContractPayload) =>
    request<{ data: Contract & { user: ClientAccount } }>('/admin/contracts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTransactions: () =>
    request<{ data: (Transaction & { user: ClientAccount })[] }>('/admin/transactions'),

  getDomainOrders: () =>
    request<{ data: (DomainOrder & { user: ClientAccount })[] }>('/admin/domains'),

  getContacts: (status?: string) =>
    request<{ data: ContactMessageRecord[] }>(
      `/admin/contacts${status ? `?status=${status}` : ''}`
    ),

  replyToContact: (id: number, reply: string) =>
    request<{ data: ContactMessageRecord }>(`/admin/contacts/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    }),

  getAdminSupportTickets: (status?: string) =>
    request<{ data: (SupportTicket & { user: ClientAccount })[] }>(
      `/admin/support-tickets${status ? `?status=${status}` : ''}`
    ),

  getAdminSupportTicket: (id: number) =>
    request<{ data: SupportTicket & { user: ClientAccount } }>(`/admin/support-tickets/${id}`),

  replyToSupportTicket: (id: number, message: string, status?: SupportTicket['status']) =>
    request<{ data: SupportTicketMessage }>(`/admin/support-tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, status }),
    }),

  updateSupportTicket: (id: number, payload: { status?: SupportTicket['status']; priority?: SupportTicket['priority'] }) =>
    request<{ data: SupportTicket & { user: ClientAccount } }>(`/admin/support-tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

export interface SecuritySession {
  id: string;
  ip_address: string | null;
  device: string;
  last_active_at: string;
  is_current_device: boolean;
}

export interface SecurityOverview {
  last_login_at: string | null;
  last_login_ip: string | null;
  sessions: SecuritySession[];
}

export interface SupportTicketMessage {
  id: number;
  message: string;
  is_staff: boolean;
  user?: { id: number; name: string; role: string };
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high';
  last_message_at: string | null;
  created_at: string;
  messages?: SupportTicketMessage[];
}

export interface CreateSupportTicketPayload {
  subject: string;
  message: string;
  priority?: SupportTicket['priority'];
}

export const api = {
  getServices: () =>
    request<{ data: { slug: string; name: string; icon: string }[] }>('/services'),

  submitContact: (payload: ContactPayload) =>
    request('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitQuotation: (payload: QuotationPayload) =>
    request('/quotation-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTrainingCourses: () =>
    request<{ data: TrainingCourse[] }>('/training/courses'),

  submitTrainingApplication: (payload: TrainingApplicationPayload) =>
    request('/training/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // --- Auth (Sanctum SPA / cookie-based) ---
  register: async (payload: RegisterPayload) => {
    await getCsrfCookie();

    return request<{
      message: string;
      data: {
        email: string;
        requires_verification: true;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: LoginPayload) => {
    await getCsrfCookie();
    return request<{ data: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verifyOtp: async (email: string, code: string) => {
    await getCsrfCookie();

    return request<{ data: AuthUser }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  resendOtp: (email: string) =>
    request<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ data: AuthUser }>('/auth/me'),

  // --- Client Portal (authenticated) ---
  updateProfile: (payload: UpdateProfilePayload) =>
    request<{ data: AuthUser }>('/portal/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updatePassword: (payload: UpdatePasswordPayload) =>
    request<{ message: string }>('/portal/profile/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getSecurityOverview: () =>
    request<{ data: SecurityOverview }>('/portal/security'),

  logoutOtherSessions: (password: string) =>
    request<{ message: string }>('/portal/security/logout-other-sessions', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getSupportTickets: () =>
    request<{ data: SupportTicket[] }>('/portal/support-tickets'),

  getSupportTicket: (id: number) =>
    request<{ data: SupportTicket }>(`/portal/support-tickets/${id}`),

  createSupportTicket: (payload: CreateSupportTicketPayload) =>
    request<{ data: SupportTicket }>('/portal/support-tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  addSupportTicketMessage: (id: number, message: string) =>
    request<{ data: SupportTicketMessage }>(`/portal/support-tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getInvoices: () =>
    request<{ data: Invoice[] }>('/portal/invoices'),

  getInvoice: (id: number) =>
    request<{ data: Invoice }>(`/portal/invoices/${id}`),

  getPortalQuotations: () =>
    request<{ data: PortalQuotation[] }>('/portal/quotations'),

  getPortalQuotation: (id: number) =>
    request<{ data: PortalQuotation }>(`/portal/quotations/${id}`),

  respondToQuotation: (id: number, decision: 'accepted' | 'declined') =>
    request<{ data: PortalQuotation }>(`/portal/quotations/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),

  getContracts: () =>
    request<{ data: Contract[] }>('/portal/contracts'),

  getContract: (id: number) =>
    request<{ data: Contract }>(`/portal/contracts/${id}`),

  payInvoice: (invoiceId: number) =>
    request<{ data: { payment_link: string; tx_ref: string } }>(
      `/portal/invoices/${invoiceId}/pay`,
      {
        method: 'POST',
      }
    ),

  verifyPayment: (txRef: string) =>
    request<{ data: Transaction }>('/portal/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ tx_ref: txRef }),
    }),

  getTransactions: () =>
    request<{ data: Transaction[] }>('/portal/transactions'),

  getTransaction: (id: number) =>
    request<{ data: Transaction }>(`/portal/transactions/${id}`),

  searchDomains: (query: string) =>
    request<{ data: DomainSearchResult[] }>(
      `/domains/search?query=${encodeURIComponent(query)}`
    ),

  getDomainOrders: () =>
    request<{ data: DomainOrder[] }>('/portal/domains'),

  createDomainOrder: (payload: CreateDomainOrderPayload) =>
    request<{ data: { payment_link: string; tx_ref: string; order: DomainOrder } }>(
      '/portal/domains',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  verifyDomainPayment: (txRef: string) =>
    request<{ data: { transaction: Transaction; order: DomainOrder | null } }>(
      '/portal/domains/verify',
      {
        method: 'POST',
        body: JSON.stringify({ tx_ref: txRef }),
      }
    ),

  payDomainOrder: (orderId: number) =>
    request<{ data: { payment_link: string; tx_ref: string; order: DomainOrder } }>(
      `/portal/domains/${orderId}/pay`,
      {
        method: 'POST',
      }
    ),
};