/**
 * ConnectHub Authentication & Session Manager
 */
const Auth = (() => {
  let currentUser = API.getCurrentUser();

  function isAuthenticated() {
    return !!API.getToken();
  }

  function getUser() {
    return currentUser || API.getCurrentUser();
  }

  function setUser(user) {
    currentUser = user;
    API.setCurrentUser(user);
    window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: user }));
  }

  async function checkAuth({ requireAuth = true, redirectIfAuth = false } = {}) {
    const token = API.getToken();
    const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');

    if (!token) {
      if (requireAuth && !isAuthPage) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login.html?redirect=${returnUrl}`;
        return null;
      }
      return null;
    }

    // Has token: check validity with server
    try {
      const res = await API.auth.getMe();
      setUser(res.user);
      if (redirectIfAuth && isAuthPage) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/index.html';
        window.location.href = redirect;
      }
      return res.user;
    } catch (err) {
      API.clearAuth();
      if (requireAuth && !isAuthPage) {
        window.location.href = `/login.html?expired=1`;
      }
      return null;
    }
  }

  async function login(identifier, password) {
    const res = await API.auth.login({ identifier, password });
    API.setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  async function register(data) {
    const res = await API.auth.register(data);
    API.setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  async function logout() {
    try {
      if (isAuthenticated()) {
        await API.auth.logout().catch(() => {});
      }
    } finally {
      API.clearAuth();
      currentUser = null;
      window.location.href = '/login.html?logged_out=1';
    }
  }

  return {
    isAuthenticated,
    getUser,
    setUser,
    checkAuth,
    login,
    register,
    logout,
  };
})();

window.Auth = Auth;
