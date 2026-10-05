/**
 * ConnectHub Explore & Search Page Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await Auth.checkAuth({ requireAuth: true });
  if (!currentUser) return;

  App.populateCommonUI();

  const searchInput = document.querySelector('.explore-search-input');
  const searchClearBtn = document.querySelector('.search-clear');
  const tabs = document.querySelectorAll('.explore-tab');
  const exploreDefaultView = document.querySelector('.explore-default-view');
  const searchResultsView = document.querySelector('.search-results-view');
  const trendingGrid = document.querySelector('.explore-trending-grid');
  const suggestedList = document.querySelector('.explore-suggested-list');
  const usersResultsList = document.querySelector('.search-users-list');
  const postsResultsList = document.querySelector('.search-posts-list');

  let activeTab = 'people'; // 'people' | 'posts'
  let debounceTimeout = null;

  // Check URL query
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';

  if (initialQuery) {
    searchInput.value = initialQuery;
    searchClearBtn.hidden = false;
    performSearch(initialQuery);
  } else {
    loadExploreDiscovery();
  }

  // Clear button
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.hidden = true;
    history.replaceState(null, '', '/explore.html');
    loadExploreDiscovery();
    searchInput.focus();
  });

  // Debounced Search Input
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchClearBtn.hidden = q.length === 0;

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (q) {
        history.replaceState(null, '', `/explore.html?q=${encodeURIComponent(q)}`);
        performSearch(q);
      } else {
        history.replaceState(null, '', '/explore.html');
        loadExploreDiscovery();
      }
    }, 280);
  });

  // Tab Switching
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;

      const q = searchInput.value.trim();
      if (q) {
        performSearch(q);
      }
    });
  });

  // -------------------------------------------------------------
  // Default Discovery View (Trending + Suggested Users)
  // -------------------------------------------------------------
  async function loadExploreDiscovery() {
    exploreDefaultView.hidden = false;
    searchResultsView.hidden = true;

    // Load Trending Grid
    try {
      const res = await API.posts.trending(8);
      if (!res.trends || res.trends.length === 0) {
        trendingGrid.innerHTML = '<p class="text-muted">No trending hashtags found.</p>';
      } else {
        trendingGrid.innerHTML = '';
        res.trends.forEach((t, index) => {
          const card = document.createElement('a');
          card.href = `/explore.html?q=%23${encodeURIComponent(t.tag)}`;
          card.className = 'card trend-card';
          card.innerHTML = `
            <span class="trend-rank">#${index + 1} Trending</span>
            <span class="trend-tag">#${Components.escapeHtml(t.tag)}</span>
            <span class="trend-meta">${t.count} ${t.count === 1 ? 'post' : 'posts'}</span>
          `;
          trendingGrid.appendChild(card);
        });
      }
    } catch {
      trendingGrid.innerHTML = '';
    }

    // Load Suggested Users
    try {
      const res = await API.users.suggestions(6);
      if (!res.users || res.users.length === 0) {
        suggestedList.innerHTML = '<p class="text-muted" style="padding:16px;">No new suggestions right now.</p>';
      } else {
        suggestedList.innerHTML = '';
        res.users.forEach((u) => {
          const card = Components.renderUserCard(u, currentUser);
          suggestedList.appendChild(card);
        });
      }
    } catch {
      suggestedList.innerHTML = '';
    }
  }

  // -------------------------------------------------------------
  // Perform Search
  // -------------------------------------------------------------
  async function performSearch(query) {
    exploreDefaultView.hidden = true;
    searchResultsView.hidden = false;

    if (activeTab === 'people') {
      usersResultsList.hidden = false;
      postsResultsList.hidden = true;
      await searchUsers(query);
    } else {
      usersResultsList.hidden = true;
      postsResultsList.hidden = false;
      await searchPosts(query);
    }
  }

  async function searchUsers(q) {
    usersResultsList.innerHTML = '<div class="spinner-center"><div class="spinner"></div></div>';

    try {
      const res = await API.users.search(q);
      usersResultsList.innerHTML = '';

      if (!res.users || res.users.length === 0) {
        usersResultsList.innerHTML = Components.renderEmptyState({
          title: 'No users found',
          text: `We couldn't find any users matching "${Components.escapeHtml(q)}". Try searching by name or @username.`,
          icon: Components.icons.user,
        });
        return;
      }

      res.users.forEach((user) => {
        const card = Components.renderUserCard(user, currentUser);
        usersResultsList.appendChild(card);
      });
    } catch (err) {
      usersResultsList.innerHTML = `
        <div class="empty-state error"><p class="empty-text">${Components.escapeHtml(err.message)}</p></div>
      `;
    }
  }

  async function searchPosts(q) {
    postsResultsList.innerHTML = Components.renderSkeletonPost() + Components.renderSkeletonPost();

    try {
      const res = await API.posts.search(q);
      postsResultsList.innerHTML = '';

      if (!res.posts || res.posts.length === 0) {
        postsResultsList.innerHTML = Components.renderEmptyState({
          title: 'No posts found',
          text: `No posts found containing "${Components.escapeHtml(q)}". Try searching for topics like #WebDevelopment or keywords.`,
          icon: Components.icons.search,
        });
        return;
      }

      res.posts.forEach((post) => {
        const card = Components.renderPostCard(post, currentUser);
        postsResultsList.appendChild(card);
      });
    } catch (err) {
      postsResultsList.innerHTML = `
        <div class="empty-state error"><p class="empty-text">${Components.escapeHtml(err.message)}</p></div>
      `;
    }
  }
});
