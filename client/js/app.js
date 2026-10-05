/**
 * ConnectHub Application Bootstrap & Global UI Controls
 */
const App = (() => {
  // Theme Management
  function initTheme() {
    const saved = localStorage.getItem('ch_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    updateThemeSwitches(isDark);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = !current;
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('ch_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('ch_theme', 'light');
    }
    updateThemeSwitches(next);
  }

  function updateThemeSwitches(isDark) {
    document.querySelectorAll('.theme-switch-btn').forEach((btn) => {
      btn.setAttribute('aria-checked', isDark ? 'true' : 'false');
    });
  }

  // Mobile Drawer
  function setupDrawer() {
    const drawerBackdrop = document.querySelector('.drawer-backdrop');
    const openBtns = document.querySelectorAll('.open-drawer-btn');
    const closeBtns = document.querySelectorAll('.close-drawer-btn');

    if (!drawerBackdrop) return;

    openBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        drawerBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        drawerBackdrop.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    drawerBackdrop.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) {
        drawerBackdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Global Composer Modal (triggered by "+ Create Post" buttons)
  function openCreatePostModal(onPostCreated) {
    const user = Auth.getUser();
    if (!user) return;

    const modalBody = `
      <div class="composer-modal-content">
        <div class="composer-row" style="display:flex; gap:12px;">
          ${Components.getAvatarHtml(user, 'avatar-md')}
          <div class="composer-body" style="flex:1;">
            <textarea class="composer-textarea modal-post-content" placeholder="What's on your mind, ${Components.escapeHtml(user.name.split(' ')[0])}?" rows="3" maxlength="500"></textarea>
            
            <div class="composer-preview modal-preview" hidden>
              <img src="" alt="Preview" />
              <button type="button" class="preview-remove modal-preview-remove" aria-label="Remove image">${Components.icons.close}</button>
            </div>

            <div class="composer-footer" style="margin-top:12px;">
              <div class="composer-tools">
                <label class="tool-btn" style="cursor:pointer;">
                  ${Components.icons.image}
                  <span class="tool-label">Photo</span>
                  <input type="file" class="modal-file-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;" />
                </label>
              </div>
              <div class="composer-actions">
                <span class="char-counter modal-char-counter">0/500</span>
                <button type="button" class="btn btn-primary modal-submit-post" disabled>Post</button>
              </div>
            </div>
            <div class="composer-error modal-error" hidden></div>
          </div>
        </div>
      </div>
    `;

    const m = Components.modal({
      title: 'Create Post',
      body: modalBody,
      size: 'md',
    });

    const modalEl = m.element;
    const textarea = modalEl.querySelector('.modal-post-content');
    const fileInput = modalEl.querySelector('.modal-file-input');
    const previewContainer = modalEl.querySelector('.modal-preview');
    const previewImg = previewContainer.querySelector('img');
    const previewRemove = modalEl.querySelector('.modal-preview-remove');
    const charCounter = modalEl.querySelector('.modal-char-counter');
    const submitBtn = modalEl.querySelector('.modal-submit-post');
    const errorEl = modalEl.querySelector('.modal-error');

    let selectedFile = null;

    function validateState() {
      const text = textarea.value.trim();
      const count = textarea.value.length;
      charCounter.textContent = `${count}/500`;

      if (count > 450) charCounter.classList.add('warn');
      else charCounter.classList.remove('warn');

      submitBtn.disabled = text.length === 0 && !selectedFile;
    }

    textarea.addEventListener('input', validateState);

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
          errorEl.textContent = 'Image must be 5 MB or smaller.';
          errorEl.hidden = false;
          fileInput.value = '';
          return;
        }
        selectedFile = file;
        previewImg.src = URL.createObjectURL(file);
        previewContainer.hidden = false;
        errorEl.hidden = true;
        validateState();
      }
    });

    previewRemove.addEventListener('click', () => {
      selectedFile = null;
      fileInput.value = '';
      previewImg.src = '';
      previewContainer.hidden = true;
      validateState();
    });

    submitBtn.addEventListener('click', async () => {
      const content = textarea.value.trim();
      if (!content && !selectedFile) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div>';
      errorEl.hidden = true;

      const fd = new FormData();
      if (content) fd.append('content', content);
      if (selectedFile) fd.append('image', selectedFile);

      try {
        const res = await API.posts.create(fd);
        Components.toast('Post published successfully!', 'success');
        m.close();
        if (onPostCreated) {
          onPostCreated(res.post);
        } else if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
          // If on home feed, reload or dispatch
          window.dispatchEvent(new CustomEvent('post:created', { detail: res.post }));
        } else {
          window.location.href = '/index.html';
        }
      } catch (err) {
        errorEl.textContent = err.message || 'Failed to publish post';
        errorEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    });

    setTimeout(() => textarea.focus(), 150);
  }

  // Populate dynamic UI elements (user chip, badges, widgets)
  async function populateCommonUI() {
    const user = Auth.getUser();
    if (!user) return;

    // User Chips
    document.querySelectorAll('.user-chip-container').forEach((el) => {
      el.innerHTML = `
        <a href="/profile.html?user=${encodeURIComponent(user.username)}" class="user-chip">
          ${Components.getAvatarHtml(user, 'avatar-md')}
          <div class="user-chip-info">
            <strong>${Components.escapeHtml(user.name)}</strong>
            <span>@${Components.escapeHtml(user.username)}</span>
          </div>
        </a>
      `;
    });

    // Drawer user header
    document.querySelectorAll('.drawer-user-container').forEach((el) => {
      el.innerHTML = `
        <a href="/profile.html?user=${encodeURIComponent(user.username)}" class="drawer-user">
          ${Components.getAvatarHtml(user, 'avatar-md')}
          <div class="info">
            <strong>${Components.escapeHtml(user.name)}</strong>
            <span class="text-muted" style="display:block; font-size:0.86rem;">@${Components.escapeHtml(user.username)}</span>
            <div class="stats">
              <span><strong>${user.followingCount || 0}</strong> Following</span> · 
              <span><strong>${user.followersCount || 0}</strong> Followers</span>
            </div>
          </div>
        </a>
      `;
    });

    // Logout buttons
    document.querySelectorAll('.logout-trigger').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const ok = await Components.confirm({
          title: 'Log Out',
          message: 'Are you sure you want to log out of ConnectHub?',
          confirmText: 'Log Out',
          isDanger: true,
        });
        if (ok) {
          Auth.logout();
        }
      });
    });

    // Create Post Triggers
    document.querySelectorAll('.create-post-trigger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCreatePostModal();
      });
    });

    // Search bar submit
    document.querySelectorAll('.global-search-input').forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (val) {
            window.location.href = `/explore.html?q=${encodeURIComponent(val)}`;
          }
        }
      });
    });

    // Rightbar Widgets: Suggestions & Trending
    loadSidebarWidgets();

    // Notification badge update
    updateNotificationBadges();
  }

  async function updateNotificationBadges() {
    if (!Auth.isAuthenticated()) return;
    try {
      const res = await API.notifications.getUnreadCount();
      const count = res.count || 0;
      document.querySelectorAll('.notif-badge').forEach((el) => {
        if (count > 0) {
          el.textContent = count > 99 ? '99+' : count;
          el.hidden = false;
        } else {
          el.hidden = true;
        }
      });
    } catch {
      // Ignore background badge error
    }
  }

  async function loadSidebarWidgets() {
    const suggestionsContainer = document.querySelector('.widget-suggestions-list');
    const trendingContainer = document.querySelector('.widget-trending-list');

    if (suggestionsContainer) {
      try {
        const res = await API.users.suggestions(4);
        if (!res.users || res.users.length === 0) {
          suggestionsContainer.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No new suggestions right now.</p>';
        } else {
          suggestionsContainer.innerHTML = '';
          const currentUser = Auth.getUser();
          res.users.forEach((u) => {
            const row = Components.renderUserCard(u, currentUser, () => {
              // Refresh suggestions if user was followed
            });
            suggestionsContainer.appendChild(row);
          });
        }
      } catch {
        suggestionsContainer.innerHTML = '';
      }
    }

    if (trendingContainer) {
      try {
        const res = await API.posts.trending(5);
        if (!res.trends || res.trends.length === 0) {
          trendingContainer.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No trending tags yet.</p>';
        } else {
          trendingContainer.innerHTML = '';
          res.trends.forEach((t) => {
            const a = document.createElement('a');
            a.href = `/explore.html?q=%23${encodeURIComponent(t.tag)}`;
            a.className = 'trend-item';
            a.innerHTML = `
              <div class="trend-meta">Trending in Tech</div>
              <div class="trend-tag">#${Components.escapeHtml(t.tag)}</div>
              <div class="trend-meta">${t.count} ${t.count === 1 ? 'post' : 'posts'}</div>
            `;
            trendingContainer.appendChild(a);
          });
        }
      } catch {
        trendingContainer.innerHTML = '';
      }
    }
  }

  // Active navigation link highlighting
  function highlightActiveNav() {
    const current = window.location.pathname.replace(/^\//, '').split('.')[0] || 'index';
    document.querySelectorAll('.nav-link, .bn-item').forEach((link) => {
      const page = link.dataset.page;
      if (page === current || (current === '' && page === 'index')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function init() {
    initTheme();
    highlightActiveNav();
    setupDrawer();

    // Theme toggles
    document.querySelectorAll('.theme-toggle-row, .theme-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });

    // Populate common UI when auth changes or loads
    window.addEventListener('auth:user-changed', populateCommonUI);

    // Periodic badge polling every 30s
    setInterval(updateNotificationBadges, 30000);
  }

  return {
    init,
    initTheme,
    toggleTheme,
    populateCommonUI,
    openCreatePostModal,
    updateNotificationBadges,
  };
})();

window.App = App;
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
