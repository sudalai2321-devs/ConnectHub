document.addEventListener('DOMContentLoaded', async () => {
  // If already logged in, redirect to home
  await Auth.checkAuth({ requireAuth: false, redirectIfAuth: true });

  const form = document.getElementById('loginForm');
  const identifierInput = document.getElementById('loginIdentifier');
  const passwordInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('submitBtn');
  const alertEl = document.getElementById('loginAlert');
  const fillDemoBtn = document.getElementById('fillDemoBtn');
  const togglePwdBtn = document.querySelector('.toggle-pwd-btn');

  // Check query params for notices
  const params = new URLSearchParams(window.location.search);
  if (params.get('registered')) {
    alertEl.textContent = 'Account created successfully! Please log in.';
    alertEl.classList.add('success');
    alertEl.hidden = false;
  } else if (params.get('expired')) {
    alertEl.textContent = 'Your session expired. Please log in again.';
    alertEl.hidden = false;
  } else if (params.get('logged_out')) {
    alertEl.textContent = 'You have been logged out.';
    alertEl.classList.add('success');
    alertEl.hidden = false;
  }

  // Toggle password visibility
  if (togglePwdBtn && passwordInput) {
    togglePwdBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
    });
  }

  // Quick Demo Autofill
  if (fillDemoBtn && identifierInput && passwordInput) {
    fillDemoBtn.addEventListener('click', () => {
      identifierInput.value = 'sudalai';
      passwordInput.value = 'Password123';
      alertEl.hidden = true;
    });
  }

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertEl.hidden = true;
      alertEl.classList.remove('success');

      const identifier = identifierInput.value.trim();
      const password = passwordInput.value;

      if (!identifier) {
        alertEl.textContent = 'Please enter your username or email.';
        alertEl.hidden = false;
        identifierInput.focus();
        return;
      }

      if (!password) {
        alertEl.textContent = 'Please enter your password.';
        alertEl.hidden = false;
        passwordInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Signing In...';

      try {
        await Auth.login(identifier, password);
        const redirect = params.get('redirect') || '/index.html';
        window.location.href = redirect;
      } catch (err) {
        alertEl.textContent = err.message || 'Invalid username/email or password';
        alertEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In</span>';
      }
    });
  }
});
