// ── Base URL ────────────────────────────────────────────
const BASE_URL = '/api/v1';

// ── Types ────────────────────────────────────────────────
export interface ApiError {
  timestamp: string;
  statusCode: number;
  message: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresAt: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  position?: string;
  emailVerified?: boolean;
  type: 'ADMIN' | 'USER' | 'AUTHOR';
  createdAt?: string;
  updatedAt?: string;
}

export interface PostResponse {
  id: number;
  title: string;
  slug: string;
  shortDesc?: string;
  content: string;
  type: 'ARTICLE' | 'NEWS' | 'TUTORIAL' | 'CODE';
  duration?: number;
  views?: number;
  status?: boolean;
  image?: string;
  author?: { id: number; name: string; email: string };
  tags?: { id: number; title: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface TagResponse {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterResponse {
  id: number;
  email: string;
  accepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: 'SYSTEM' | 'COMMENT' | 'LIKE';
  isRead: boolean;
  user?: { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface SettingResponse {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse {
  id: number;
  type: 'ABOUT' | 'CONTACT' | 'PRIVACY_POLICY' | 'TERMS_AND_CONDITIONS';
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return data as T;
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, phone?: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),
};

// ── Users ─────────────────────────────────────────────────
export const usersApi = {
  list: () => request<UserResponse[]>('/users'),
  get: (id: number) => request<UserResponse>(`/users/${id}`),
  create: (body: Partial<UserResponse> & { password: string }) =>
    request<UserResponse>('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<UserResponse> & { password?: string }) =>
    request<UserResponse>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  uploadAvatar: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return upload<UserResponse>(`/users/${id}/avatar`, fd);
  },
  deleteAvatar: (id: number) => request<void>(`/users/${id}/avatar`, { method: 'DELETE' }),
};

// ── Posts ─────────────────────────────────────────────────
export const postsApi = {
  list: () => request<PostResponse[]>('/posts'),
  get: (id: number) => request<PostResponse>(`/posts/${id}`),
  create: (body: {
    title: string; content: string; type: string;
    shortDesc?: string; status?: boolean; authorId?: number; tagIds?: number[];
  }) => request<PostResponse>('/posts', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<{
    title: string; content: string; type: string;
    shortDesc?: string; status?: boolean; authorId?: number; tagIds?: number[];
  }>) => request<PostResponse>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/posts/${id}`, { method: 'DELETE' }),
  uploadImage: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return upload<PostResponse>(`/posts/${id}/image`, fd);
  },
  deleteImage: (id: number) => request<void>(`/posts/${id}/image`, { method: 'DELETE' }),
};

// ── Tags ──────────────────────────────────────────────────
export const tagsApi = {
  list: () => request<TagResponse[]>('/tags'),
  get: (id: number) => request<TagResponse>(`/tags/${id}`),
  create: (title: string) =>
    request<TagResponse>('/tags', { method: 'POST', body: JSON.stringify({ title }) }),
  update: (id: number, title: string) =>
    request<TagResponse>(`/tags/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
  delete: (id: number) => request<void>(`/tags/${id}`, { method: 'DELETE' }),
};

// ── Contacts ──────────────────────────────────────────────
export const contactsApi = {
  list: () => request<ContactResponse[]>('/contacts'),
  get: (id: number) => request<ContactResponse>(`/contacts/${id}`),
  delete: (id: number) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),
};

// ── Newsletters ───────────────────────────────────────────
export const newslettersApi = {
  list: () => request<NewsletterResponse[]>('/newsletters'),
};

// ── Notifications ─────────────────────────────────────────
export const notificationsApi = {
  list: (userId?: number) =>
    request<NotificationResponse[]>(
      userId ? `/notifications?userId=${userId}` : '/notifications'
    ),
  update: (id: number, body: Partial<NotificationResponse>) =>
    request<NotificationResponse>(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (id: number) => request<void>(`/notifications/${id}`, { method: 'DELETE' }),
};

// ── Settings ──────────────────────────────────────────────
export const settingsApi = {
  list: () => request<SettingResponse[]>('/settings'),
  create: (key: string, value: string) =>
    request<SettingResponse>('/settings', { method: 'POST', body: JSON.stringify({ key, value }) }),
  update: (id: number, key: string, value: string) =>
    request<SettingResponse>(`/settings/${id}`, { method: 'PUT', body: JSON.stringify({ key, value }) }),
  delete: (id: number) => request<void>(`/settings/${id}`, { method: 'DELETE' }),
};

// ── Pages ─────────────────────────────────────────────────
export const pagesApi = {
  list: () => request<PageResponse[]>('/pages'),
  get: (id: number) => request<PageResponse>(`/pages/${id}`),
  create: (type: PageResponse['type'], content: string) =>
    request<PageResponse>('/pages', { method: 'POST', body: JSON.stringify({ type, content }) }),
  update: (id: number, type: PageResponse['type'], content: string) =>
    request<PageResponse>(`/pages/${id}`, { method: 'PUT', body: JSON.stringify({ type, content }) }),
  delete: (id: number) => request<void>(`/pages/${id}`, { method: 'DELETE' }),
};
