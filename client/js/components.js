/**
 * ConnectHub UI Components & Helpers
 */
const Components = (() => {
  // SVG Icons
  const icons = {
    home: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    explore: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    bell: `<svg class="icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    message: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    user: `<svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    plus: `<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    heart: `<svg class="icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    comment: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    share: `<svg class="icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
    trash: `<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    edit: `<svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    search: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    dots: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>`,
    arrowLeft: `<svg class="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    close: `<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    image: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    send: `<svg class="icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    sun: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    check: `<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    info: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    logout: `<svg class="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    mapPin: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    calendar: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    menu: `<svg class="icon" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function formatFullDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatTextWithLinks(content) {
    if (!content) return '';
    let text = escapeHtml(content);

    // Hashtags
    text = text.replace(/(^|[^\w&])#([A-Za-z0-9_]{1,50})/g, (match, prefix, tag) => {
      return `${prefix}<a href="/explore.html?q=%23${encodeURIComponent(tag)}" class="post-tag">#${tag}</a>`;
    });

    // Mentions
    text = text.replace(/(^|[^\w&])@([a-z0-9_]{3,20})/gi, (match, prefix, username) => {
      return `${prefix}<a href="/profile.html?user=${encodeURIComponent(username)}" class="post-mention">@${username}</a>`;
    });

    return text;
  }

  function getAvatarHtml(user, sizeClass = 'avatar-md', extraClass = '') {
    if (!user) {
      return `<div class="avatar ${sizeClass} ${extraClass}"><span>?</span></div>`;
    }
    const initial = (user.name || user.username || '?').charAt(0).toUpperCase();
    const hue = Math.abs((user.username || 'user').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 360;

    if (user.profileImage) {
      return `
        <div class="avatar ${sizeClass} ${extraClass}" style="--hue: ${hue}">
          <img src="${escapeHtml(user.profileImage)}" alt="${escapeHtml(user.name || user.username)}" onerror="this.remove()">
          <span>${initial}</span>
        </div>`;
    }
    return `
      <div class="avatar ${sizeClass} ${extraClass}" style="--hue: ${hue}">
        <span>${initial}</span>
      </div>`;
  }

  // Toast System
  let toastContainer = null;
  function toast(message, type = 'info', duration = 3500) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;
    let iconSvg = icons.info;
    if (type === 'success') iconSvg = icons.check;
    if (type === 'error') iconSvg = icons.close;

    toastEl.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('hide');
      setTimeout(() => toastEl.remove(), 260);
    }, duration);
  }

  // Modal System
  function modal({ title = '', body = '', footer = '', size = '', onClose } = {}) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modalEl = document.createElement('div');
    modalEl.className = `modal ${size ? 'modal-' + size : ''}`;

    modalEl.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${escapeHtml(title)}</h3>
        <button class="icon-btn close-modal-btn" aria-label="Close modal">${icons.close}</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;

    backdrop.appendChild(modalEl);
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    function close() {
      backdrop.classList.add('closing');
      setTimeout(() => {
        backdrop.remove();
        document.body.style.overflow = '';
        if (onClose) onClose();
      }, 200);
    }

    modalEl.querySelector('.close-modal-btn').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    return {
      element: modalEl,
      backdrop,
      close,
    };
  }

  function confirm({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Delete', isDanger = true }) {
    return new Promise((resolve) => {
      const footerHtml = `
        <button class="btn btn-secondary btn-cancel">Cancel</button>
        <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} btn-confirm">${escapeHtml(confirmText)}</button>
      `;

      const m = modal({
        title,
        body: `<p class="confirm-text">${escapeHtml(message)}</p>`,
        footer: footerHtml,
        size: 'sm',
        onClose: () => resolve(false),
      });

      m.element.querySelector('.btn-cancel').addEventListener('click', () => {
        m.close();
        resolve(false);
      });

      m.element.querySelector('.btn-confirm').addEventListener('click', () => {
        m.close();
        resolve(true);
      });
    });
  }

  // Render Post Card
  function renderPostCard(post, currentUser) {
    const isOwner = currentUser && post.author && (post.author._id === currentUser._id || post.isOwner);
    const postEl = document.createElement('article');
    postEl.className = 'card post-card';
    postEl.dataset.postId = post._id;

    const authorUrl = `/profile.html?user=${encodeURIComponent(post.author.username)}`;
    const timeFormatted = formatTime(post.createdAt);

    postEl.innerHTML = `
      <div class="post-header">
        <a href="${authorUrl}" class="post-author-link">
          ${getAvatarHtml(post.author, 'avatar-md')}
        </a>
        <div class="post-meta">
          <div class="post-author-line">
            <a href="${authorUrl}" class="post-author-name">${escapeHtml(post.author.name)}</a>
            <span class="post-sub">
              <a href="${authorUrl}">@${escapeHtml(post.author.username)}</a> · <span title="${new Date(post.createdAt).toLocaleString()}">${timeFormatted}</span>
            </span>
            ${post.editedAt ? '<span class="edited-tag">(edited)</span>' : ''}
          </div>
        </div>
        ${
          isOwner
            ? `
          <div class="dropdown">
            <button class="icon-btn post-options-btn" aria-label="Post options">${icons.dots}</button>
            <div class="dropdown-menu" hidden>
              <button class="dropdown-item danger post-delete-btn">${icons.trash} <span>Delete post</span></button>
            </div>
          </div>
        `
            : ''
        }
      </div>

      <div class="post-content">${formatTextWithLinks(post.content)}</div>

      ${
        post.image
          ? `
        <div class="post-image">
          <img src="${escapeHtml(post.image)}" alt="Post attachment" loading="lazy" />
        </div>
      `
          : ''
      }

      <div class="post-actions">
        <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" data-post-id="${post._id}" aria-label="Like post">
          ${icons.heart}
          <span class="likes-count">${post.likesCount || 0}</span>
        </button>

        <button class="action-btn comment-btn" data-post-id="${post._id}" aria-label="View comments">
          ${icons.comment}
          <span class="comments-count">${post.commentsCount || 0}</span>
        </button>

        <div class="action-spacer"></div>

        <button class="action-btn share-btn" aria-label="Share post">
          ${icons.share}
        </button>
      </div>

      <div class="comments-section" hidden>
        <form class="comment-form">
          ${getAvatarHtml(currentUser, 'avatar-sm')}
          <div class="comment-input-wrap">
            <input type="text" class="comment-input" placeholder="Write a comment..." maxlength="300" required />
            <button type="submit" class="send-btn" aria-label="Submit comment">${icons.send}</button>
          </div>
        </form>
        <div class="comment-list-container">
          <div class="spinner-center"><div class="spinner"></div></div>
        </div>
      </div>
    `;

    // Dropdown toggle
    const optionsBtn = postEl.querySelector('.post-options-btn');
    const menu = postEl.querySelector('.dropdown-menu');
    if (optionsBtn && menu) {
      optionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.hidden;
        document.querySelectorAll('.dropdown-menu').forEach((m) => (m.hidden = true));
        menu.hidden = !isHidden;
      });

      const deleteBtn = postEl.querySelector('.post-delete-btn');
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        menu.hidden = true;
        const confirmed = await confirm({
          title: 'Delete Post',
          message: 'Are you sure you want to delete this post? This action cannot be undone.',
          confirmText: 'Delete',
          isDanger: true,
        });

        if (confirmed) {
          try {
            await API.posts.delete(post._id);
            toast('Post deleted', 'success');
            postEl.classList.add('removing');
            setTimeout(() => postEl.remove(), 260);
          } catch (err) {
            toast(err.message || 'Failed to delete post', 'error');
          }
        }
      });
    }

    // Like handler
    const likeBtn = postEl.querySelector('.like-btn');
    const likesCountEl = postEl.querySelector('.likes-count');
    likeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const wasLiked = likeBtn.classList.contains('liked');
      let currentCount = parseInt(likesCountEl.textContent, 10) || 0;

      // Optimistic update
      likeBtn.classList.toggle('liked', !wasLiked);
      likesCountEl.textContent = wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
      if (!wasLiked) {
        likeBtn.classList.add('pop');
        setTimeout(() => likeBtn.classList.remove('pop'), 450);
      }

      try {
        if (wasLiked) {
          const res = await API.posts.unlike(post._id);
          likesCountEl.textContent = res.likesCount;
          likeBtn.classList.toggle('liked', res.isLiked);
        } else {
          const res = await API.posts.like(post._id);
          likesCountEl.textContent = res.likesCount;
          likeBtn.classList.toggle('liked', res.isLiked);
        }
      } catch (err) {
        // Revert on error
        likeBtn.classList.toggle('liked', wasLiked);
        likesCountEl.textContent = currentCount;
        toast(err.message || 'Failed to update like', 'error');
      }
    });

    // Share button handler
    const shareBtn = postEl.querySelector('.share-btn');
    shareBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const shareUrl = `${window.location.origin}/index.html?post=${post._id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast('Post link copied to clipboard!', 'success');
      } else {
        toast(shareUrl, 'info');
      }
    });

    // Comments section toggle
    const commentBtn = postEl.querySelector('.comment-btn');
    const commentsSec = postEl.querySelector('.comments-section');
    const commentsCountEl = postEl.querySelector('.comments-count');
    const commentForm = postEl.querySelector('.comment-form');
    const commentInput = postEl.querySelector('.comment-input');
    const commentListContainer = postEl.querySelector('.comment-list-container');
    let commentsLoaded = false;

    async function loadComments() {
      commentListContainer.innerHTML = '<div class="spinner-center"><div class="spinner"></div></div>';
      try {
        const res = await API.comments.getForPost(post._id);
        commentsLoaded = true;
        renderCommentsList(res.comments);
        commentsCountEl.textContent = res.commentsCount;
      } catch (err) {
        commentListContainer.innerHTML = `<div class="empty-state error"><p class="empty-text">${escapeHtml(err.message)}</p></div>`;
      }
    }

    function renderCommentsList(comments) {
      if (!comments || comments.length === 0) {
        commentListContainer.innerHTML = '<p class="comments-empty">No comments yet. Start the conversation!</p>';
        return;
      }

      const listEl = document.createElement('div');
      listEl.className = 'comment-list';

      comments.forEach((c) => {
        const cEl = document.createElement('div');
        cEl.className = 'comment';
        cEl.dataset.commentId = c._id;
        const isCommentOwner = currentUser && c.author && (c.author._id === currentUser._id || c.isOwner);

        cEl.innerHTML = `
          <a href="/profile.html?user=${encodeURIComponent(c.author.username)}">
            ${getAvatarHtml(c.author, 'avatar-xs')}
          </a>
          <div class="comment-bubble">
            <div class="comment-head">
              <a href="/profile.html?user=${encodeURIComponent(c.author.username)}">
                <strong>${escapeHtml(c.author.name)}</strong>
              </a>
              <span class="text-muted">@${escapeHtml(c.author.username)} · ${formatTime(c.createdAt)}</span>
              ${
                isCommentOwner
                  ? `<button class="comment-delete" title="Delete comment">${icons.trash} <span>Delete</span></button>`
                  : ''
              }
            </div>
            <p class="comment-text">${escapeHtml(c.content)}</p>
          </div>
        `;

        if (isCommentOwner) {
          cEl.querySelector('.comment-delete').addEventListener('click', async () => {
            const confirmed = await confirm({
              title: 'Delete Comment',
              message: 'Are you sure you want to delete this comment?',
              confirmText: 'Delete',
              isDanger: true,
            });

            if (confirmed) {
              try {
                const res = await API.comments.delete(c._id);
                cEl.remove();
                commentsCountEl.textContent = res.commentsCount;
                toast('Comment deleted', 'success');
                if (listEl.children.length === 0) {
                  commentListContainer.innerHTML = '<p class="comments-empty">No comments yet. Start the conversation!</p>';
                }
              } catch (err) {
                toast(err.message || 'Failed to delete comment', 'error');
              }
            }
          });
        }

        listEl.appendChild(cEl);
      });

      commentListContainer.innerHTML = '';
      commentListContainer.appendChild(listEl);
    }

    commentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = commentsSec.hidden;
      commentsSec.hidden = !willOpen;
      commentBtn.classList.toggle('active', willOpen);
      if (willOpen && !commentsLoaded) {
        loadComments();
      }
      if (willOpen) {
        commentInput.focus();
      }
    });

    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      const submitBtn = commentForm.querySelector('.send-btn');
      submitBtn.disabled = true;

      try {
        const res = await API.comments.add(post._id, text);
        commentInput.value = '';
        commentsCountEl.textContent = res.commentsCount;

        // If list has empty placeholder, remove it
        const emptyMsg = commentListContainer.querySelector('.comments-empty');
        if (emptyMsg) emptyMsg.remove();

        let listEl = commentListContainer.querySelector('.comment-list');
        if (!listEl) {
          listEl = document.createElement('div');
          listEl.className = 'comment-list';
          commentListContainer.appendChild(listEl);
        }

        // Append new comment
        const c = res.comment;
        const cEl = document.createElement('div');
        cEl.className = 'comment';
        cEl.dataset.commentId = c._id;
        cEl.innerHTML = `
          <a href="/profile.html?user=${encodeURIComponent(c.author.username)}">
            ${getAvatarHtml(c.author, 'avatar-xs')}
          </a>
          <div class="comment-bubble">
            <div class="comment-head">
              <a href="/profile.html?user=${encodeURIComponent(c.author.username)}">
                <strong>${escapeHtml(c.author.name)}</strong>
              </a>
              <span class="text-muted">@${escapeHtml(c.author.username)} · Just now</span>
              <button class="comment-delete" title="Delete comment">${icons.trash} <span>Delete</span></button>
            </div>
            <p class="comment-text">${escapeHtml(c.content)}</p>
          </div>
        `;

        cEl.querySelector('.comment-delete').addEventListener('click', async () => {
          const confirmed = await confirm({
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment?',
            confirmText: 'Delete',
            isDanger: true,
          });
          if (confirmed) {
            try {
              const delRes = await API.comments.delete(c._id);
              cEl.remove();
              commentsCountEl.textContent = delRes.commentsCount;
              toast('Comment deleted', 'success');
            } catch (err) {
              toast(err.message, 'error');
            }
          }
        });

        listEl.appendChild(cEl);
        toast('Comment added', 'success');
      } catch (err) {
        toast(err.message || 'Failed to add comment', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });

    return postEl;
  }

  // Render User Card (for lists: search results, suggestions, followers)
  function renderUserCard(user, currentUser, onFollowToggle) {
    const cardEl = document.createElement('div');
    cardEl.className = 'user-row';
    cardEl.dataset.userId = user._id;

    const userUrl = `/profile.html?user=${encodeURIComponent(user.username)}`;
    const isMe = currentUser && (user._id === currentUser._id || user.isMe);

    cardEl.innerHTML = `
      <a href="${userUrl}">
        ${getAvatarHtml(user, 'avatar-md')}
      </a>
      <div class="user-row-info">
        <a href="${userUrl}" class="name">${escapeHtml(user.name)}</a>
        <span class="handle">@${escapeHtml(user.username)}</span>
        ${user.bio ? `<p class="bio">${escapeHtml(user.bio)}</p>` : ''}
      </div>
      ${
        !isMe
          ? `
        <button class="btn btn-sm btn-primary btn-follow ${user.isFollowing ? 'is-following' : ''}" data-user-id="${user._id}">
          <span class="label-default">${user.isFollowing ? 'Following' : 'Follow'}</span>
          <span class="label-hover">Unfollow</span>
        </button>
      `
          : ''
      }
    `;

    const followBtn = cardEl.querySelector('.btn-follow');
    if (followBtn) {
      followBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const currentlyFollowing = followBtn.classList.contains('is-following');
        followBtn.disabled = true;

        try {
          if (currentlyFollowing) {
            const res = await API.users.unfollow(user._id);
            followBtn.classList.remove('is-following');
            followBtn.querySelector('.label-default').textContent = 'Follow';
            if (onFollowToggle) onFollowToggle(user._id, false, res);
          } else {
            const res = await API.users.follow(user._id);
            followBtn.classList.add('is-following');
            followBtn.querySelector('.label-default').textContent = 'Following';
            if (onFollowToggle) onFollowToggle(user._id, true, res);
          }
        } catch (err) {
          toast(err.message || 'Failed to update follow status', 'error');
        } finally {
          followBtn.disabled = false;
        }
      });
    }

    return cardEl;
  }

  // Skeleton Card
  function renderSkeletonPost() {
    return `
      <div class="card skeleton-card">
        <div class="sk-row">
          <div class="skeleton sk-circle"></div>
          <div style="flex:1;">
            <div class="skeleton sk-line" style="width: 40%;"></div>
            <div class="skeleton sk-line" style="width: 25%;"></div>
          </div>
        </div>
        <div class="skeleton sk-line" style="width: 90%; margin-top: 14px;"></div>
        <div class="skeleton sk-line" style="width: 70%;"></div>
        <div class="skeleton sk-block"></div>
      </div>
    `;
  }

  // Empty State
  function renderEmptyState({ title = 'Nothing here yet', text = '', icon = icons.explore } = {}) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <h3 class="empty-title">${escapeHtml(title)}</h3>
        ${text ? `<p class="empty-text">${escapeHtml(text)}</p>` : ''}
      </div>
    `;
  }

  return {
    icons,
    escapeHtml,
    formatTime,
    formatFullDate,
    formatTextWithLinks,
    getAvatarHtml,
    toast,
    modal,
    confirm,
    renderPostCard,
    renderUserCard,
    renderSkeletonPost,
    renderEmptyState,
  };
})();

window.Components = Components;

// Global click listener to close open dropdown menus
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach((menu) => (menu.hidden = true));
  }
});
