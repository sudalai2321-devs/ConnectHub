document.addEventListener('DOMContentLoaded', async () => {
  await Auth.checkAuth({ requireAuth: false, redirectIfAuth: true });

  const form = document.getElementById('registerForm');
  const nameInput = document.getElementById('regName');
  const usernameInput = document.getElementById('regUsername');
  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');
  const confirmInput = document.getElementById('regConfirmPassword');
  const strengthBar = document.getElementById('pwdStrength');
  const submitBtn = document.getElementById('submitBtn');
  const alertEl = document.getElementById('registerAlert');

  // Password visibility toggles
  document.querySelectorAll('.toggle-pwd-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });
  });

  // Password Strength calculation
  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val) || val.length >= 12) score++;
      strengthBar.setAttribute('data-level', score);
    });
  }

  // Username live format check
  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      usernameInput.value = usernameInput.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertEl.hidden = true;
      document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));

      const name = nameInput.value.trim();
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;

      let hasError = false;

      if (!name || name.length < 2) {
        document.getElementById('nameError').textContent = 'Name must be at least 2 characters.';
        hasError = true;
      }

      if (!username || username.length < 3) {
        document.getElementById('usernameError').textContent = 'Username must be at least 3 characters.';
        hasError = true;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        hasError = true;
      }

      if (!password || password.length < 8) {
        document.getElementById('passwordError').textContent = 'Password must be at least 8 characters.';
        hasError = true;
      } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        document.getElementById('passwordError').textContent = 'Password must contain at least one letter and one number.';
        hasError = true;
      }

      if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match.';
        hasError = true;
      }

      if (hasError) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Creating Account...';

      try {
        await Auth.register({ name, username, email, password, confirmPassword });
        window.location.href = '/index.html';
      } catch (err) {
        alertEl.textContent = err.message || 'Registration failed';
        alertEl.hidden = false;

        if (err.errors && err.errors.length) {
          err.errors.forEach((e) => {
            const errContainer = document.getElementById(`${e.field}Error`);
            if (errContainer) errContainer.textContent = e.message;
          });
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span>';
      }
    });
  }
});
