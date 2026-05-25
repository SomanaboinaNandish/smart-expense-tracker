const BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 204) return null;
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

export const api = {
  auth: {
    register: (name, email, password) => 
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password }),
      }).then(handleResponse),
      
    login: (email, password) =>
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      }).then(handleResponse),
      
    getProfile: () =>
      fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  expenses: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      return fetch(`${BASE_URL}/expenses?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    get: (id) =>
      fetch(`${BASE_URL}/expenses/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    create: (data) =>
      fetch(`${BASE_URL}/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    update: (id, data) =>
      fetch(`${BASE_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),

    getExportUrl: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      return `${BASE_URL}/expenses/export?${query.toString()}`;
    }
  },

  categories: {
    list: () =>
      fetch(`${BASE_URL}/categories`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  budgets: {
    get: (month) => {
      const url = month ? `${BASE_URL}/budget?month=${month}` : `${BASE_URL}/budget`;
      return fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    createOrUpdate: (data) =>
      fetch(`${BASE_URL}/budget`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
  },

  analytics: {
    getSummary: (month) => {
      const url = month ? `${BASE_URL}/analytics/summary?month=${month}` : `${BASE_URL}/analytics/summary`;
      return fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },
  },

  admin: {
    listUsers: () =>
      fetch(`${BASE_URL}/admin/users`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    getStats: () =>
      fetch(`${BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    deleteUser: (id) =>
      fetch(`${BASE_URL}/admin/user/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),
  }
};
