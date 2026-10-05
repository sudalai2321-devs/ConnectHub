/**
 * ConnectHub Direct Messaging Page Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await Auth.checkAuth({ requireAuth: true });
  if (!currentUser) return;

  App.populateCommonUI();

  const layout = document.querySelector('.messages-layout');
  const conversationsContainer = document.querySelector('.conversation-list');
  const chatPane = document.querySelector('.chat-pane');
  const chatBackBtn = document.querySelector('.chat-back-btn');
  const chatHeaderUser = document.querySelector('.chat-header-user');
  const chatMessagesList = document.querySelector('.chat-messages');
  const messageForm = document.querySelector('.message-form');
  const messageInput = document.querySelector('.message-input');
  const sendBtn = messageForm ? messageForm.querySelector('.send-btn') : null;

  let activeUserId = null;
  let activeUser = null;
  let pollInterval = null;

  // Mobile Back Button
  if (chatBackBtn) {
    chatBackBtn.addEventListener('click', () => {
      layout.classList.remove('show-chat');
      activeUserId = null;
      if (pollInterval) clearInterval(pollInterval);
    });
  }

  // Load conversations list
  await loadConversations();

  // Check URL query for direct message target: ?user=<userId>
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get('user');
  if (targetUserId) {
    openChat(targetUserId);
  }

  // Form submit
  if (messageForm) {
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = messageInput.value.trim();
      if (!text || !activeUserId) return;

      sendBtn.disabled = true;

      try {
        const res = await API.messages.send(activeUserId, text);
        messageInput.value = '';
        appendMessage(res.message);
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
        loadConversations(); // refresh conversations snippet
      } catch (err) {
        Components.toast(err.message || 'Failed to send message', 'error');
      } finally {
        sendBtn.disabled = false;
        messageInput.focus();
      }
    });
  }

  // -------------------------------------------------------------
  // Conversations List
  // -------------------------------------------------------------
  async function loadConversations() {
    try {
      const res = await API.messages.getConversations();
      if (!res.conversations || res.conversations.length === 0) {
        conversationsContainer.innerHTML = `
          <div class="empty-state" style="padding:28px 12px;">
            <p class="empty-text">No conversations yet.<br>Click "Message" on someone's profile to start chatting!</p>
          </div>
        `;
        return;
      }

      conversationsContainer.innerHTML = '';
      res.conversations.forEach((conv) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `conversation-item ${conv.user._id === activeUserId ? 'active' : ''} ${conv.unread > 0 ? 'has-unread' : ''}`;
        item.dataset.userId = conv.user._id;

        item.innerHTML = `
          ${Components.getAvatarHtml(conv.user, 'avatar-md')}
          <div class="conversation-info">
            <div class="top">
              <strong>${Components.escapeHtml(conv.user.name)}</strong>
              <span class="time">${Components.formatTime(conv.lastMessage.createdAt)}</span>
            </div>
            <span class="preview">${Components.escapeHtml(conv.lastMessage.content)}</span>
          </div>
          ${conv.unread > 0 ? `<div class="unread-dot">${conv.unread}</div>` : ''}
        `;

        item.addEventListener('click', () => {
          openChat(conv.user._id);
        });

        conversationsContainer.appendChild(item);
      });
    } catch (err) {
      conversationsContainer.innerHTML = `
        <div class="empty-state error"><p class="empty-text">${Components.escapeHtml(err.message)}</p></div>
      `;
    }
  }

  // -------------------------------------------------------------
  // Open Thread
  // -------------------------------------------------------------
  async function openChat(userId) {
    activeUserId = userId;
    layout.classList.add('show-chat');

    // Highlight active conversation item
    document.querySelectorAll('.conversation-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.userId === userId);
      if (item.dataset.userId === userId) {
        item.classList.remove('has-unread');
        const dot = item.querySelector('.unread-dot');
        if (dot) dot.remove();
      }
    });

    chatMessagesList.innerHTML = '<div class="spinner-center"><div class="spinner"></div></div>';

    try {
      const res = await API.messages.getThread(userId);
      activeUser = res.user;

      // Update Header
      chatHeaderUser.innerHTML = `
        <a href="/profile.html?user=${encodeURIComponent(activeUser.username)}" style="display:flex; align-items:center; gap:10px;">
          ${Components.getAvatarHtml(activeUser, 'avatar-sm')}
          <div class="info">
            <strong>${Components.escapeHtml(activeUser.name)}</strong>
            <span>@${Components.escapeHtml(activeUser.username)}</span>
          </div>
        </a>
      `;

      // Render Messages
      chatMessagesList.innerHTML = '';
      if (!res.messages || res.messages.length === 0) {
        chatMessagesList.innerHTML = `
          <div class="chat-empty">
            <p class="text-muted">No messages yet. Send a greeting to start the conversation!</p>
          </div>
        `;
      } else {
        res.messages.forEach((msg) => appendMessage(msg));
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
      }

      if (messageInput) {
        messageInput.disabled = false;
        messageInput.focus();
      }

      // Start polling for new messages in this thread every 5s
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(pollNewMessages, 5000);
    } catch (err) {
      chatMessagesList.innerHTML = `
        <div class="empty-state error"><p class="empty-text">${Components.escapeHtml(err.message)}</p></div>
      `;
    }
  }

  async function pollNewMessages() {
    if (!activeUserId) return;
    const lastMsgEl = chatMessagesList.querySelector('.msg:last-child');
    const after = lastMsgEl ? lastMsgEl.dataset.time : null;

    try {
      const res = await API.messages.getThread(activeUserId, after);
      if (res.messages && res.messages.length > 0) {
        // Remove empty state if present
        const empty = chatMessagesList.querySelector('.chat-empty');
        if (empty) empty.remove();

        res.messages.forEach((m) => appendMessage(m));
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
      }
    } catch {
      // Ignore background poll errors
    }
  }

  function appendMessage(m) {
    const isMine = m.isMine || m.sender === currentUser._id;
    const msgEl = document.createElement('div');
    msgEl.className = `msg ${isMine ? 'mine' : ''}`;
    msgEl.dataset.time = m.createdAt;
    msgEl.dataset.id = m._id;

    msgEl.innerHTML = `
      ${Components.escapeHtml(m.content)}
      <span class="msg-time">${Components.formatTime(m.createdAt)}</span>
    `;

    chatMessagesList.appendChild(msgEl);
  }

  // Cleanup on exit
  window.addEventListener('beforeunload', () => {
    if (pollInterval) clearInterval(pollInterval);
  });
});
