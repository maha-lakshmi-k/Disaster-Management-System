const API_BASE_URL = '/api';

// Active role state managed in memory/localStorage for role switcher
let activeRole = localStorage.getItem('disaster_portal_role') || 'ADMIN';

export const setGlobalRole = (role) => {
  activeRole = role;
  localStorage.setItem('disaster_portal_role', role);
};

export const getGlobalRole = () => activeRole;

const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('disaster_portal_token');

  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': activeRole,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Request failed`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Health
  getHealth: () => fetchAPI('/health'),

  // Auth
  login: (credentials) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => fetchAPI('/auth/me'),

  // Locations
  getLocations: () => fetchAPI('/locations'),

  // Disasters
  getDisasters: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/disasters?${query}`);
  },
  getDisasterById: (id) => fetchAPI(`/disasters/${id}`),
  createDisaster: (data) => fetchAPI('/disasters', { method: 'POST', body: JSON.stringify(data) }),
  updateDisaster: (id, data) => fetchAPI(`/disasters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDisaster: (id) => fetchAPI(`/disasters/${id}`, { method: 'DELETE' }),

  // Shelters
  getShelters: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/shelters?${query}`);
  },
  createShelter: (data) => fetchAPI('/shelters', { method: 'POST', body: JSON.stringify(data) }),
  updateShelter: (id, data) => fetchAPI(`/shelters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Resources
  getResources: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/resources?${query}`);
  },
  createResource: (data) => fetchAPI('/resources', { method: 'POST', body: JSON.stringify(data) }),
  updateResource: (id, data) => fetchAPI(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Rescue Operations
  getRescueOps: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/rescue-operations?${query}`);
  },
  createRescueOp: (data) => fetchAPI('/rescue-operations', { method: 'POST', body: JSON.stringify(data) }),
  updateRescueOp: (id, data) => fetchAPI(`/rescue-operations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Victims
  getVictims: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/victims?${query}`);
  },
  createVictim: (data) => fetchAPI('/victims', { method: 'POST', body: JSON.stringify(data) }),
  updateVictim: (id, data) => fetchAPI(`/victims/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Relief Distributions
  getReliefDistributions: () => fetchAPI('/relief-distributions'),
  createReliefDistribution: (data) => fetchAPI('/relief-distributions', { method: 'POST', body: JSON.stringify(data) }),

  // Emergency Contacts
  getEmergencyContacts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/emergency-contacts?${query}`);
  },

  // Safety Guidelines
  getSafetyGuidelines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/safety-guidelines?${query}`);
  },

  // Notifications
  getNotifications: () => fetchAPI('/notifications'),
  markNotificationRead: (id) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),

  // Dashboard Stats
  getDashboardStats: () => fetchAPI('/dashboard/stats'),

  // Global Search
  globalSearch: (q) => fetchAPI(`/search?q=${encodeURIComponent(q)}`),

  // Reports
  getReports: () => fetchAPI('/reports'),
};
