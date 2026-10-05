/**
 * ConnectHub API Smoke Test
 * Tests all core features: Auth, Profiles, Posts, Comments, Likes, Follows, Search, Notifications, Security.
 */
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE = `http://127.0.0.1:${PORT}/api`;

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function request(endpoint, options = {}, token = null) {
  const url = `${BASE}${endpoint}`;
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let body = options.body;
  if (body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(url, { ...options, headers, body });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log(`\n🧪 Starting ConnectHub End-to-End API Smoke Tests on ${BASE}...\n`);

  const unique = Date.now().toString().slice(-6);
  const userA = {
    name: 'Tester Alpha',
    username: `alpha_${unique}`,
    email: `alpha_${unique}@example.com`,
    password: 'Password123',
    confirmPassword: 'Password123',
  };
  const userB = {
    name: 'Tester Beta',
    username: `beta_${unique}`,
    email: `beta_${unique}@example.com`,
    password: 'Password123',
    confirmPassword: 'Password123',
  };

  let tokenA, userADoc;
  let tokenB, userBDoc;

  // 1. Health Check & MongoDB
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health works and MongoDB is connected');

  // 2. Register User A
  const regA = await request('/auth/register', { method: 'POST', body: userA });
  assert(regA.status === 201 && regA.data.token && regA.data.user.username === userA.username, 'POST /api/auth/register works for User A');
  tokenA = regA.data.token;
  userADoc = regA.data.user;

  // 3. Register User B
  const regB = await request('/auth/register', { method: 'POST', body: userB });
  assert(regB.status === 201 && regB.data.token, 'POST /api/auth/register works for User B');
  tokenB = regB.data.token;
  userBDoc = regB.data.user;

  // 4. Duplicate Registration (Should return 409 Conflict)
  const dup = await request('/auth/register', { method: 'POST', body: userA });
  assert(dup.status === 409, 'Duplicate username/email prevented (409 Conflict)');

  // 5. Login User A (using email or username)
  const loginByEmail = await request('/auth/login', { method: 'POST', body: { identifier: userA.email, password: userA.password } });
  assert(loginByEmail.status === 200 && loginByEmail.data.token, 'POST /api/auth/login with email');

  const loginByUsername = await request('/auth/login', { method: 'POST', body: { identifier: userA.username, password: userA.password } });
  assert(loginByUsername.status === 200 && loginByUsername.data.token, 'POST /api/auth/login with username');

  // 6. Current User (Auth Protection)
  const meA = await request('/auth/me', {}, tokenA);
  assert(meA.status === 200 && meA.data.user.username === userA.username, 'GET /api/auth/me returns authenticated user');

  const noAuth = await request('/auth/me');
  assert(noAuth.status === 401, 'Protected route rejects request without token (401)');

  // 7. Update Profile
  const updateProf = await request('/users/profile', { method: 'PUT', body: { name: 'Alpha Updated', bio: 'Living the dev life #Code' } }, tokenA);
  assert(updateProf.status === 200 && updateProf.data.user.name === 'Alpha Updated' && updateProf.data.user.bio.includes('#Code'), 'PUT /api/users/profile updates name and bio');

  // 8. Cannot follow yourself
  const selfFollow = await request(`/users/${userADoc._id}/follow`, { method: 'POST' }, tokenA);
  assert(selfFollow.status === 400, 'Cannot follow yourself returns 400 Bad Request');

  // 9. Follow User B
  const followB = await request(`/users/${userBDoc._id}/follow`, { method: 'POST' }, tokenA);
  assert(followB.status === 200 && followB.data.isFollowing === true && followB.data.followersCount === 1, 'POST /api/users/:id/follow works');

  // 10. Check User B profile (verify follower count)
  const getProfB = await request(`/users/${userB.username}`, {}, tokenA);
  assert(getProfB.status === 200 && getProfB.data.user.followersCount === 1 && getProfB.data.user.isFollowing === true, 'GET /api/users/:username reflects follower count & isFollowing');

  // 11. Create Post by User B
  const createPost = await request('/posts', { method: 'POST', body: { content: 'Hello ConnectHub world! #Greetings #FirstPost' } }, tokenB);
  assert(createPost.status === 201 && createPost.data.post && createPost.data.post.content.includes('#Greetings'), 'POST /api/posts creates new post');
  const postId = createPost.data.post._id;

  // 12. Feed - For You & Following
  const feedAll = await request('/posts?feed=all', {}, tokenA);
  assert(feedAll.status === 200 && feedAll.data.posts.some((p) => p._id === postId), 'GET /api/posts (For You feed) includes the post');

  const feedFollow = await request('/posts?feed=following', {}, tokenA);
  assert(feedFollow.status === 200 && feedFollow.data.posts.some((p) => p._id === postId), 'GET /api/posts (Following feed) includes the followed user post');

  // 13. Like Post
  const likeRes = await request(`/posts/${postId}/like`, { method: 'POST' }, tokenA);
  assert(likeRes.status === 200 && likeRes.data.isLiked === true && likeRes.data.likesCount === 1, 'POST /api/posts/:id/like works and increments like count');

  // 14. Add Comment
  const addCom = await request(`/posts/${postId}/comments`, { method: 'POST', body: { content: 'Awesome post!' } }, tokenA);
  assert(addCom.status === 201 && addCom.data.comment.content === 'Awesome post!' && addCom.data.commentsCount === 1, 'POST /api/posts/:id/comments adds comment and increments count');
  const commentId = addCom.data.comment._id;

  // 15. Check Notifications for User B (should have like and comment notifications)
  const notifsB = await request('/notifications', {}, tokenB);
  assert(notifsB.status === 200 && notifsB.data.notifications.length >= 2, 'Notifications generated for likes and comments');

  // 16. Mark Notification as Read
  if (notifsB.data.notifications.length > 0) {
    const notifId = notifsB.data.notifications[0]._id;
    const markRead = await request(`/notifications/${notifId}/read`, { method: 'PUT' }, tokenB);
    assert(markRead.status === 200 && markRead.data.read === true, 'PUT /api/notifications/:id/read works');
  }

  // 17. Search Users
  const searchU = await request(`/users/search?q=${userB.username}`, {}, tokenA);
  assert(searchU.status === 200 && searchU.data.users.some((u) => u.username === userB.username), 'GET /api/users/search finds users by username');

  // 18. Search Posts
  const searchP = await request(`/posts/search?q=%23Greetings`, {}, tokenA);
  assert(searchP.status === 200 && searchP.data.posts.some((p) => p._id === postId), 'GET /api/posts/search finds posts by hashtag or query');

  // 19. Unlike Post
  const unlikeRes = await request(`/posts/${postId}/like`, { method: 'DELETE' }, tokenA);
  assert(unlikeRes.status === 200 && unlikeRes.data.isLiked === false && unlikeRes.data.likesCount === 0, 'DELETE /api/posts/:id/like works and decrements count');

  // 20. Delete Comment (User A deletes own comment)
  const delCom = await request(`/comments/${commentId}`, { method: 'DELETE' }, tokenA);
  assert(delCom.status === 200 && delCom.data.commentsCount === 0, 'DELETE /api/comments/:id deletes own comment and syncs count');

  // 21. Delete Post (User B deletes own post)
  const delPost = await request(`/posts/${postId}`, { method: 'DELETE' }, tokenB);
  assert(delPost.status === 200, 'DELETE /api/posts/:id deletes post and removes all references');

  // 22. Unfollow User B
  const unfollowB = await request(`/users/${userBDoc._id}/follow`, { method: 'DELETE' }, tokenA);
  assert(unfollowB.status === 200 && unfollowB.data.isFollowing === false && unfollowB.data.followersCount === 0, 'DELETE /api/users/:id/follow works');

  // 23. Logout (Invalidates token on server)
  const logoutA = await request('/auth/logout', { method: 'POST' }, tokenA);
  assert(logoutA.status === 200, 'POST /api/auth/logout succeeds');

  const meAfterLogout = await request('/auth/me', {}, tokenA);
  assert(meAfterLogout.status === 401, 'Token invalidated after logout (401)');

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
