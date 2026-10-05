/**
 * ConnectHub Notifications Page Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await Auth.checkAuth({ requireAuth: true });
  if (!currentUser) return;

  App.populateCommonUI();

  const container = document.querySelector('.notifications-list-container');
  const tabs = document.querySelectorAll('.notif-filter-tab');
  const markAllBtn = document.querySelector('.mark-all-read-btn');

  let activeFilter = 'all'; // 'all' | 'unread'

  // Mark all as read
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      try {
        await API.notifications.markAllRead();
        Components.toast('All notifications marked as read', 'success');
        document.querySelectorAll('.notification-item.unread').forEach((item) => {
          item.classList.remove('unread');
        });
        App.updateNotificationBadges();
      } catch (err) {
        Components.toast(err.message || 'Failed to mark notifications as read', 'error');
      }
    });
  }

  // Filter tabs
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      loadNotifications();
    });
  });

  // Load notifications
  loadNotifications();

  async function loadNotifications() {
    container.innerHTML = '<div class="spinner-center"><div class="spinner"></div></div>';

    try {
      const res = await API.notifications.getAll({
        unread: activeFilter === 'unread',
      });

      container.innerHTML = '';

      if (!res.notifications || res.notifications.length === 0) {
        container.innerHTML = Components.renderEmptyState({
          title: activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet',
          text:
            activeFilter === 'unread'
              ? 'You are all caught up! Check back later.'
              : 'When someone likes your posts, comments, or follows you, you will see notifications here.',
          icon: Components.icons.bell,
        });
        return;
      }

      res.notifications.forEach((n) => {
        const item = renderNotificationItem(n);
        container.appendChild(item);
      });
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state error"><p class="empty-text">${Components.escapeHtml(err.message)}</p></div>
      `;
    }
  }

  function renderNotificationItem(n) {
    const itemEl = document.createElement('div');
    itemEl.className = `notification-item ${!n.read ? 'unread' : ''}`;
    itemEl.dataset.id = n._id;

    let iconType = 'like';
    let iconSvg = Components.icons.heart;
    let actionText = 'liked your post';

    if (n.type === 'comment') {
      iconType = 'comment';
      iconSvg = Components.icons.comment;
      actionText = 'commented on your post';
    } else if (n.type === 'follow') {
      iconType = 'follow';
      iconSvg = Components.icons.user;
      actionText = 'started following you';
    }

    const sender = n.sender || { name: 'Someone', username: 'user' };

    itemEl.innerHTML = `
      <div class="notif-icon ${iconType}">
        ${iconSvg}
      </div>
      <div class="notif-body">
        <div class="notif-top">
          <a href="/profile.html?user=${encodeURIComponent(sender.username)}">
            ${Components.getAvatarHtml(sender, 'avatar-xs')}
          </a>
          <span class="type-pill">${n.type}</span>
        </div>
        <div class="notif-text">
          <a href="/profile.html?user=${encodeURIComponent(sender.username)}">
            <strong>${Components.escapeHtml(sender.name)}</strong>
          </a>
          ${actionText}
        </div>
        ${
          n.comment && n.comment.content
            ? `<div class="notif-snippet">"${Components.escapeHtml(n.comment.content)}"</div>`
            : ''
        }
        ${
          n.post && n.post.content && n.type === 'like'
            ? `<div class="notif-snippet">${Components.escapeHtml(n.post.content)}</div>`
            : ''
        }
        <div class="notif-time">${Components.formatTime(n.createdAt)}</div>
      </div>
    `;

    // Click handler: mark as read and navigate
    itemEl.addEventListener('click', async (e) => {
      // If clicking directly on user link, let default handle
      if (e.target.closest('a')) return;

      if (!n.read) {
        try {
          await API.notifications.markRead(n._id);
          itemEl.classList.remove('unread');
          App.updateNotificationBadges();
        } catch {
          // Ignore
        }
      }

      if (n.type === 'follow') {
        window.location.href = `/profile.html?user=${encodeURIComponent(sender.username)}`;
      } else if (n.post && n.post._id) {
        window.location.href = `/index.html?post=${n.post._id}`;
      }
    });

    return itemEl;
  }
});
