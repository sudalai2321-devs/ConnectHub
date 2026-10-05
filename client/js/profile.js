/**
 * ConnectHub Profile Page Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await Auth.checkAuth({ requireAuth: true });
  if (!currentUser) return;

  App.populateCommonUI();

  const urlParams = new URLSearchParams(window.location.search);
  const targetUsername = urlParams.get('user') || currentUser.username;

  const profileContainer = document.querySelector('.profile-header-container');
  const profilePostsContainer = document.querySelector('.profile-posts-container');
  const tabs = document.querySelectorAll('.profile-tab');

  let profileData = null;
  let activeTab = 'posts'; // 'posts' | 'likes'

  // Load Profile
  await loadProfile();

  // Tab Switching
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      loadTabContent();
    });
  });

  // -------------------------------------------------------------
  // Load Profile Information
  // -------------------------------------------------------------
  async function loadProfile() {
    profileContainer.innerHTML = `
      <div class="card profile-card">
        <div class="profile-cover"></div>
        <div class="profile-body">
          <div class="profile-top">
            <div class="skeleton sk-circle" style="width:110px; height:110px;"></div>
          </div>
          <div class="skeleton sk-line" style="width: 200px; height: 24px; margin-top: 18px;"></div>
          <div class="skeleton sk-line" style="width: 140px; margin-top: 8px;"></div>
          <div class="skeleton sk-line" style="width: 80%; margin-top: 14px;"></div>
        </div>
      </div>
    `;

    try {
      const res = await API.users.getProfile(targetUsername);
      profileData = res.user;
      renderProfileHeader();
      loadTabContent();
    } catch (err) {
      profileContainer.innerHTML = `
        <div class="empty-state error">
          <div class="empty-icon">${Components.icons.close}</div>
          <h3 class="empty-title">User not found</h3>
          <p class="empty-text">The user @${Components.escapeHtml(targetUsername)} does not exist or was removed.</p>
          <a href="/index.html" class="btn btn-primary">Go to Home</a>
        </div>
      `;
      profilePostsContainer.innerHTML = '';
    }
  }

  function renderProfileHeader() {
    const isMe = profileData.isMe || profileData._id === currentUser._id;

    profileContainer.innerHTML = `
      <div class="card profile-card">
        <div class="profile-cover"></div>
        <div class="profile-body">
          <div class="profile-top">
            ${Components.getAvatarHtml(profileData, 'avatar-xl', 'avatar-ring')}
            <div class="profile-buttons">
              ${
                isMe
                  ? `
                <button class="btn btn-secondary edit-profile-btn">
                  ${Components.icons.edit}
                  <span>Edit Profile</span>
                </button>
              `
                  : `
                <a href="/messages.html?user=${profileData._id}" class="btn btn-secondary">
                  ${Components.icons.message}
                  <span>Message</span>
                </a>
                <button class="btn btn-primary btn-follow profile-follow-btn ${profileData.isFollowing ? 'is-following' : ''}">
                  <span class="label-default">${profileData.isFollowing ? 'Following' : 'Follow'}</span>
                  <span class="label-hover">Unfollow</span>
                </button>
              `
              }
            </div>
          </div>

          <h2 class="profile-name">
            ${Components.escapeHtml(profileData.name)}
            ${profileData.followsYou ? '<span class="follows-you">Follows you</span>' : ''}
          </h2>
          <div class="profile-handle">@${Components.escapeHtml(profileData.username)}</div>

          ${profileData.bio ? `<p class="profile-bio">${Components.escapeHtml(profileData.bio)}</p>` : ''}

          <div class="profile-details">
            ${
              profileData.location
                ? `<span>${Components.icons.mapPin} ${Components.escapeHtml(profileData.location)}</span>`
                : ''
            }
            <span>${Components.icons.calendar} Joined ${Components.formatFullDate(profileData.createdAt)}</span>
          </div>

          <div class="profile-stats">
            <button class="stat view-following-btn">
              <strong class="stat-following-count">${profileData.followingCount}</strong> Following
            </button>
            <button class="stat view-followers-btn">
              <strong class="stat-followers-count">${profileData.followersCount}</strong> Followers
            </button>
            <span class="stat">
              <strong>${profileData.postsCount}</strong> Posts
            </span>
          </div>
        </div>
      </div>
    `;

    // Follow / Unfollow button handler
    const followBtn = profileContainer.querySelector('.profile-follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', async () => {
        const currentlyFollowing = followBtn.classList.contains('is-following');
        followBtn.disabled = true;

        try {
          if (currentlyFollowing) {
            const res = await API.users.unfollow(profileData._id);
            followBtn.classList.remove('is-following');
            followBtn.querySelector('.label-default').textContent = 'Follow';
            profileData.followersCount = res.followersCount;
            profileData.isFollowing = false;
          } else {
            const res = await API.users.follow(profileData._id);
            followBtn.classList.add('is-following');
            followBtn.querySelector('.label-default').textContent = 'Following';
            profileData.followersCount = res.followersCount;
            profileData.isFollowing = true;
          }
          // Update follower count on UI
          const countEl = profileContainer.querySelector('.stat-followers-count');
          if (countEl) countEl.textContent = profileData.followersCount;
        } catch (err) {
          Components.toast(err.message || 'Failed to update follow status', 'error');
        } finally {
          followBtn.disabled = false;
        }
      });
    }

    // Edit Profile Modal
    const editBtn = profileContainer.querySelector('.edit-profile-btn');
    if (editBtn) {
      editBtn.addEventListener('click', openEditProfileModal);
    }

    // Followers & Following Modals
    const viewFollowersBtn = profileContainer.querySelector('.view-followers-btn');
    if (viewFollowersBtn) {
      viewFollowersBtn.addEventListener('click', () => openConnectionsModal('followers'));
    }

    const viewFollowingBtn = profileContainer.querySelector('.view-following-btn');
    if (viewFollowingBtn) {
      viewFollowingBtn.addEventListener('click', () => openConnectionsModal('following'));
    }
  }

  // -------------------------------------------------------------
  // Followers / Following Modal
  // -------------------------------------------------------------
  async function openConnectionsModal(type) {
    const isFollowers = type === 'followers';
    const title = isFollowers ? 'Followers' : 'Following';

    const m = Components.modal({
      title,
      body: '<div class="spinner-center"><div class="spinner"></div></div>',
      size: 'sm',
    });

    try {
      const res = isFollowers
        ? await API.users.followers(profileData.username)
        : await API.users.following(profileData.username);

      if (!res.users || res.users.length === 0) {
        m.element.querySelector('.modal-body').innerHTML = `
          <div class="empty-state" style="padding:24px 0;">
            <p class="empty-text">No ${type} yet.</p>
          </div>
        `;
        return;
      }

      const listEl = document.createElement('div');
      listEl.className = 'user-list';
      res.users.forEach((u) => {
        const row = Components.renderUserCard(u, currentUser, (_id, isFollowing, state) => {
          if (isMeViewingSelf()) {
            if (state && state.me) {
              const followingCountEl = profileContainer.querySelector('.stat-following-count');
              if (followingCountEl) followingCountEl.textContent = state.me.followingCount;
            }
          }
        });
        listEl.appendChild(row);
      });

      const body = m.element.querySelector('.modal-body');
      body.innerHTML = '';
      body.appendChild(listEl);
    } catch (err) {
      m.element.querySelector('.modal-body').innerHTML = `
        <div class="empty-state error"><p class="empty-text">${Components.escapeHtml(err.message)}</p></div>
      `;
    }
  }

  function isMeViewingSelf() {
    return profileData && currentUser && (profileData.isMe || profileData._id === currentUser._id);
  }

  // -------------------------------------------------------------
  // Edit Profile Modal
  // -------------------------------------------------------------
  function openEditProfileModal() {
    let selectedFile = null;
    let removeImageFlag = false;

    const modalBody = `
      <form class="edit-profile-form">
        <div class="avatar-edit">
          <div class="avatar-preview-slot">
            ${Components.getAvatarHtml(profileData, 'avatar-lg')}
          </div>
          <div class="avatar-edit-actions">
            <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
              <span>Change Photo</span>
              <input type="file" class="avatar-file-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;" />
            </label>
            ${
              profileData.profileImage
                ? '<button type="button" class="btn btn-ghost btn-sm remove-avatar-btn">Remove</button>'
                : ''
            }
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" class="input edit-name" value="${Components.escapeHtml(profileData.name)}" maxlength="50" required />
        </div>

        <div class="form-group">
          <label class="form-label">Bio <span class="field-hint"><span class="edit-bio-count">${(profileData.bio || '').length}</span>/160</span></label>
          <textarea class="textarea edit-bio" maxlength="160" rows="3" placeholder="Tell the world about yourself...">${Components.escapeHtml(profileData.bio || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" class="input edit-location" value="${Components.escapeHtml(profileData.location || '')}" maxlength="50" placeholder="e.g. San Francisco, CA" />
        </div>

        <div class="form-alert edit-error" hidden></div>
      </form>
    `;

    const footer = `
      <button type="button" class="btn btn-secondary btn-cancel-edit">Cancel</button>
      <button type="button" class="btn btn-primary btn-save-profile">Save Changes</button>
    `;

    const m = Components.modal({
      title: 'Edit Profile',
      body: modalBody,
      footer,
      size: 'md',
    });

    const modalEl = m.element;
    const nameInput = modalEl.querySelector('.edit-name');
    const bioInput = modalEl.querySelector('.edit-bio');
    const bioCount = modalEl.querySelector('.edit-bio-count');
    const locInput = modalEl.querySelector('.edit-location');
    const fileInput = modalEl.querySelector('.avatar-file-input');
    const avatarSlot = modalEl.querySelector('.avatar-preview-slot');
    const removeBtn = modalEl.querySelector('.remove-avatar-btn');
    const errorEl = modalEl.querySelector('.edit-error');
    const saveBtn = modalEl.querySelector('.btn-save-profile');
    const cancelBtn = modalEl.querySelector('.btn-cancel-edit');

    bioInput.addEventListener('input', () => {
      bioCount.textContent = bioInput.value.length;
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
        removeImageFlag = false;
        errorEl.hidden = true;
        const tempUrl = URL.createObjectURL(file);
        avatarSlot.innerHTML = Components.getAvatarHtml({ ...profileData, profileImage: tempUrl }, 'avatar-lg');
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        selectedFile = null;
        removeImageFlag = true;
        fileInput.value = '';
        avatarSlot.innerHTML = Components.getAvatarHtml({ ...profileData, profileImage: '' }, 'avatar-lg');
        removeBtn.remove();
      });
    }

    cancelBtn.addEventListener('click', () => m.close());

    saveBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const bio = bioInput.value.trim();
      const location = locInput.value.trim();

      if (!name) {
        errorEl.textContent = 'Name is required.';
        errorEl.hidden = false;
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<div class="spinner"></div> Saving...';
      errorEl.hidden = true;

      const fd = new FormData();
      fd.append('name', name);
      fd.append('bio', bio);
      fd.append('location', location);
      if (selectedFile) {
        fd.append('profileImage', selectedFile);
      } else if (removeImageFlag) {
        fd.append('removeImage', 'true');
      }

      try {
        const res = await API.users.updateProfile(fd);
        Auth.setUser(res.user);
        profileData = { ...profileData, ...res.user };
        renderProfileHeader();
        m.close();
        Components.toast('Profile updated successfully!', 'success');
      } catch (err) {
        errorEl.textContent = err.message || 'Failed to update profile';
        errorEl.hidden = false;
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    });
  }

  // -------------------------------------------------------------
  // Tab Content (Posts vs Likes)
  // -------------------------------------------------------------
  async function loadTabContent() {
    profilePostsContainer.innerHTML = Components.renderSkeletonPost();

    try {
      const params = {
        limit: 20,
      };

      if (activeTab === 'posts') {
        params.author = profileData._id;
      } else {
        params.likedBy = profileData._id;
      }

      const res = await API.posts.getAll(params);
      profilePostsContainer.innerHTML = '';

      if (res.posts.length === 0) {
        const emptyTitle = activeTab === 'posts' ? 'No posts yet' : 'No liked posts yet';
        const emptyText =
          activeTab === 'posts'
            ? isMeViewingSelf()
              ? 'Share your thoughts and publish your first post!'
              : `@${profileData.username} hasn't published any posts yet.`
            : isMeViewingSelf()
              ? 'Posts that you like will show up here.'
              : `@${profileData.username} hasn't liked any posts yet.`;

        profilePostsContainer.innerHTML = Components.renderEmptyState({
          title: emptyTitle,
          text: emptyText,
          icon: activeTab === 'posts' ? Components.icons.edit : Components.icons.heart,
        });
        return;
      }

      res.posts.forEach((post) => {
        const card = Components.renderPostCard(post, currentUser);
        profilePostsContainer.appendChild(card);
      });
    } catch (err) {
      profilePostsContainer.innerHTML = `
        <div class="empty-state error"><p class="empty-text">${Components.escapeHtml(err.message)}</p></div>
      `;
    }
  }
});
