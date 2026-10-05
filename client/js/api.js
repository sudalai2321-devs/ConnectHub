/**
 * ConnectHub API client
 * Handles authentication headers, error wrapping, and all REST endpoints.
 */
const API = (() => {
  const BASE_URL = '/api';

  function getToken() {
    return localStorage.getItem('ch_token');
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem('ch_token', token);
    } else {
      localStorage.removeItem('ch_token');
    }
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem('ch_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem('ch_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ch_user');
    }
  }

  function clearAuth() {
    localStorage.removeItem('ch_token');
    localStorage.removeItem('ch_user');
  }

  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = options.headers || {};
    const token = getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is NOT FormData, set application/json
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    options.headers = headers;

    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));

      if (!res.ok) {
        if (res.status === 401) {
          clearAuth();
          // If on a protected page, redirect to login
          const currentPath = window.location.pathname;
          if (!currentPath.endsWith('login.html') && !currentPath.endsWith('register.html')) {
            window.location.href = `/login.html?expired=1&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          }
        }
        const err = new Error(data.message || 'Request failed');
        err.status = res.status;
        err.errors = data.errors || [];
        throw err;
      }

      return data;
    } catch (err) {
      if (!err.status && err.message.includes('Failed to fetch')) {
        err.message = 'Network error. Please check your connection or server status.';
      }
      throw err;
    }
  }

  return {
    getToken,
    setToken,
    getCurrentUser,
    setCurrentUser,
    clearAuth,

    // Auth
    auth: {
      register: (body) => request('/auth/register', { method: 'POST', body }),
      login: (body) => request('/auth/login', { method: 'POST', body }),
      getMe: () => request('/auth/me'),
      logout: () => request('/auth/logout', { method: 'POST' }),
    },

    // Users
    users: {
      getProfile: (username) => request(`/users/${encodeURIComponent(username)}`),
      updateProfile: (formData) => request('/users/profile', { method: 'PUT', body: formData }),
      search: (q, limit = 20) => request(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`),
      suggestions: (limit = 5) => request(`/users/suggestions?limit=${limit}`),
      follow: (id) => request(`/users/${id}/follow`, { method: 'POST' }),
      unfollow: (id) => request(`/users/${id}/follow`, { method: 'DELETE' }),
      followers: (username) => request(`/users/${encodeURIComponent(username)}/followers`),
      following: (username) => request(`/users/${encodeURIComponent(username)}/following`),
    },

    // Posts
    posts: {
      getAll: ({ page = 1, limit = 10, feed, author, likedBy } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (feed) params.append('feed', feed);
        if (author) params.append('author', author);
        if (likedBy) params.append('likedBy', likedBy);
        return request(`/posts?${params.toString()}`);
      },
      getById: (id) => request(`/posts/${id}`),
      create: (formData) => request('/posts', { method: 'POST', body: formData }),
      update: (id, body) => request(`/posts/${id}`, { method: 'PUT', body }),
      delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
      like: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
      unlike: (id) => request(`/posts/${id}/like`, { method: 'DELETE' }),
      search: (q, page = 1) => request(`/posts/search?q=${encodeURIComponent(q)}&page=${page}`),
      trending: (limit = 6) => request(`/posts/trending?limit=${limit}`),
    },

    // Comments
    comments: {
      getForPost: (postId) => request(`/posts/${postId}/comments`),
      add: (postId, content) => request(`/posts/${postId}/comments`, { method: 'POST', body: { content } }),
      delete: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
    },

    // Notifications
    notifications: {
      getAll: ({ page = 1, unread } = {}) => {
        const params = new URLSearchParams({ page });
        if (unread) params.append('unread', 'true');
        return request(`/notifications?${params.toString()}`);
      },
      getUnreadCount: () => request('/notifications/unread-count'),
      markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
      markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
    },

    // Messages
    messages: {
      getConversations: () => request('/messages/conversations'),
      getUnreadCount: () => request('/messages/unread-count'),
      getThread: (userId, after) => {
        const params = after ? `?after=${encodeURIComponent(after)}` : '';
        return request(`/messages/${userId}${params}`);
      },
      send: (userId, content) => request(`/messages/${userId}`, { method: 'POST', body: { content } }),
    },
  };
})();

window.API = API;
