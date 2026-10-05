/**
 * ConnectHub Home Feed Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Ensure authentication
  const user = await Auth.checkAuth({ requireAuth: true });
  if (!user) return;

  App.populateCommonUI();

  const feedContainer = document.querySelector('.feed-posts-container');
  const inlineComposer = document.querySelector('.home-composer');
  const feedTabs = document.querySelectorAll('.feed-tab');
  const loadMoreBtn = document.querySelector('.load-more-posts-btn');
  const loadMoreWrap = document.querySelector('.load-more-wrap');

  let currentFeedType = 'all'; // 'all' | 'following'
  let currentPage = 1;
  let hasMorePosts = false;
  let isLoading = false;

  // Initialize Inline Composer
  if (inlineComposer) {
    setupInlineComposer();
  }

  // Setup Feed Tabs
  feedTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      feedTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFeedType = tab.dataset.feed;
      loadFeed(true);
    });
  });

  // Setup Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      if (!isLoading && hasMorePosts) {
        loadFeed(false);
      }
    });
  }

  // Listen for posts created via global modal
  window.addEventListener('post:created', (e) => {
    if (e.detail && feedContainer) {
      prependPost(e.detail);
    }
  });

  // Initial load
  loadFeed(true);

  // -------------------------------------------------------------
  // Feed Loading & Rendering
  // -------------------------------------------------------------
  async function loadFeed(reset = false) {
    if (isLoading) return;
    isLoading = true;

    if (reset) {
      currentPage = 1;
      feedContainer.innerHTML = Components.renderSkeletonPost() + Components.renderSkeletonPost();
      if (loadMoreWrap) loadMoreWrap.hidden = true;
    } else {
      if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<div class="spinner"></div> Loading...';
      }
    }

    try {
      const res = await API.posts.getAll({
        page: currentPage,
        limit: 10,
        feed: currentFeedType,
      });

      if (reset) {
        feedContainer.innerHTML = '';
      }

      if (res.posts.length === 0 && reset) {
        const isFollowingFeed = currentFeedType === 'following';
        feedContainer.innerHTML = Components.renderEmptyState({
          title: isFollowingFeed ? 'Your following feed is quiet' : 'No posts in feed yet',
          text: isFollowingFeed
            ? 'Follow more people on the Explore page or switch to the "For You" tab to see posts!'
            : 'Be the first one to create a post and share what is happening!',
          icon: Components.icons.explore,
        });
      } else {
        res.posts.forEach((post) => {
          const card = Components.renderPostCard(post, user);
          feedContainer.appendChild(card);
        });
      }

      hasMorePosts = res.hasMore;
      currentPage += 1;

      if (loadMoreWrap) {
        loadMoreWrap.hidden = !hasMorePosts;
        if (loadMoreBtn) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = 'Load More';
        }
      }
    } catch (err) {
      if (reset) {
        feedContainer.innerHTML = `
          <div class="empty-state error">
            <div class="empty-icon">${Components.icons.close}</div>
            <h3 class="empty-title">Failed to load feed</h3>
            <p class="empty-text">${Components.escapeHtml(err.message)}</p>
            <button class="btn btn-secondary" onclick="location.reload()">Retry</button>
          </div>
        `;
      } else {
        Components.toast(err.message || 'Error loading more posts', 'error');
      }
    } finally {
      isLoading = false;
    }
  }

  function prependPost(post) {
    // If empty state exists, clear it
    const empty = feedContainer.querySelector('.empty-state');
    if (empty) feedContainer.innerHTML = '';

    const card = Components.renderPostCard(post, user);
    feedContainer.prepend(card);
  }

  // -------------------------------------------------------------
  // Inline Composer Implementation
  // -------------------------------------------------------------
  function setupInlineComposer() {
    const avatarContainer = inlineComposer.querySelector('.composer-avatar-slot');
    if (avatarContainer) {
      avatarContainer.innerHTML = Components.getAvatarHtml(user, 'avatar-md');
    }

    const textarea = inlineComposer.querySelector('.composer-textarea');
    const fileInput = inlineComposer.querySelector('.composer-file-input');
    const previewContainer = inlineComposer.querySelector('.composer-preview');
    const previewImg = previewContainer.querySelector('img');
    const previewRemove = inlineComposer.querySelector('.preview-remove');
    const charCounter = inlineComposer.querySelector('.char-counter');
    const submitBtn = inlineComposer.querySelector('.composer-submit');
    const errorEl = inlineComposer.querySelector('.composer-error');

    let selectedFile = null;

    textarea.placeholder = `What's on your mind, ${user.name.split(' ')[0]}?`;

    function updateState() {
      const text = textarea.value.trim();
      const count = textarea.value.length;
      charCounter.textContent = `${count}/500`;

      if (count > 450) charCounter.classList.add('warn');
      else charCounter.classList.remove('warn');

      submitBtn.disabled = text.length === 0 && !selectedFile;
    }

    // Auto-grow textarea
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(260, textarea.scrollHeight) + 'px';
      updateState();
    });

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
        updateState();
      }
    });

    previewRemove.addEventListener('click', () => {
      selectedFile = null;
      fileInput.value = '';
      previewImg.src = '';
      previewContainer.hidden = true;
      updateState();
    });

    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
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
        Components.toast('Post published!', 'success');

        // Reset composer
        textarea.value = '';
        textarea.style.height = 'auto';
        selectedFile = null;
        fileInput.value = '';
        previewImg.src = '';
        previewContainer.hidden = true;
        updateState();

        // Immediately show the new post in the feed
        prependPost(res.post);
      } catch (err) {
        errorEl.textContent = err.message || 'Failed to create post';
        errorEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    });
  }
});
