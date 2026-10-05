/**
 * Serializers convert Mongoose documents into safe, front-end friendly JSON.
 * Passwords, token versions and raw follower/like arrays are never exposed.
 */

const idEq = (a, b) => a != null && b != null && String(a) === String(b);
const includesId = (arr = [], id) => Array.isArray(arr) && arr.some((x) => idEq(x && x._id ? x._id : x, id));

/** Minimal public user representation used inside posts, comments, notifications. */
function publicUser(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    profileImage: user.profileImage || '',
    bio: user.bio || '',
  };
}

/** User card for lists (search results, suggestions, followers). */
function userCard(user, viewer) {
  if (!user) return null;
  return {
    ...publicUser(user),
    followersCount: Array.isArray(user.followers) ? user.followers.length : user.followersCount || 0,
    isFollowing: viewer ? includesId(viewer.following, user._id) : false,
    isMe: viewer ? idEq(viewer._id, user._id) : false,
  };
}

/** Full profile representation. */
function profile(user, viewer, postsCount = 0) {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio || '',
    location: user.location || '',
    profileImage: user.profileImage || '',
    createdAt: user.createdAt,
    followersCount: (user.followers || []).length,
    followingCount: (user.following || []).length,
    postsCount,
    isMe: viewer ? idEq(viewer._id, user._id) : false,
    isFollowing: viewer ? includesId(user.followers, viewer._id) : false,
    followsYou: viewer ? includesId(user.following, viewer._id) : false,
  };
}

/** Private representation of the logged-in user (includes email). */
function selfUser(user, postsCount = 0) {
  return { ...profile(user, user, postsCount), email: user.email };
}

function post(p, viewerId) {
  if (!p) return null;
  const likes = p.likes || [];
  return {
    _id: p._id,
    author: publicUser(p.author),
    content: p.content || '',
    image: p.image || '',
    tags: p.tags || [],
    likesCount: likes.length,
    commentsCount: p.commentsCount || 0,
    isLiked: viewerId ? includesId(likes, viewerId) : false,
    isOwner: viewerId ? idEq(p.author && p.author._id ? p.author._id : p.author, viewerId) : false,
    editedAt: p.editedAt || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function comment(c, viewerId) {
  if (!c) return null;
  return {
    _id: c._id,
    post: c.post && c.post._id ? c.post._id : c.post,
    author: publicUser(c.author),
    content: c.content,
    isOwner: viewerId ? idEq(c.author && c.author._id ? c.author._id : c.author, viewerId) : false,
    createdAt: c.createdAt,
  };
}

function notification(n) {
  return {
    _id: n._id,
    type: n.type,
    sender: publicUser(n.sender),
    post: n.post ? { _id: n.post._id, content: (n.post.content || '').slice(0, 120), image: n.post.image || '' } : null,
    comment: n.comment ? { _id: n.comment._id, content: (n.comment.content || '').slice(0, 120) } : null,
    read: !!n.read,
    createdAt: n.createdAt,
  };
}

function message(m, viewerId) {
  return {
    _id: m._id,
    sender: m.sender,
    recipient: m.recipient,
    content: m.content,
    read: !!m.read,
    isMine: idEq(m.sender, viewerId),
    createdAt: m.createdAt,
  };
}

module.exports = { idEq, includesId, publicUser, userCard, profile, selfUser, post, comment, notification, message };
