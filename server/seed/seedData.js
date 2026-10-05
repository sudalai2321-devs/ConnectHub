/**
 * DEVELOPMENT SEED DATA
 * ---------------------
 * Demo users, posts, comments, likes, follows, notifications and messages.
 * This module is only used by `npm run seed` and by the embedded dev database
 * on first start. It is NOT part of the application's runtime logic.
 */
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { extractTags } = require('../utils/helpers');

const DEMO_PASSWORD = 'Password123';

const HOUR = 60 * 60 * 1000;
const ago = (hours) => new Date(Date.now() - hours * HOUR);

const users = [
  {
    key: 'sudalai',
    name: 'Sudalai S',
    username: 'sudalai',
    email: 'sudalai@connecthub.dev',
    bio: 'B.Tech IT Student | Developer | Tech Enthusiast. Building ideas and learning every day. ✨',
    location: 'Tamil Nadu, India',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    joinedHoursAgo: 24 * 270,
  },
  {
    key: 'karthik',
    name: 'Karthik Raj',
    username: 'karthikraj',
    email: 'karthik@connecthub.dev',
    bio: 'Full-stack developer ☕ | Open source contributor | Campus tech lead',
    location: 'Chennai, India',
    profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    joinedHoursAgo: 24 * 300,
  },
  {
    key: 'priya',
    name: 'Priya Nair',
    username: 'priyanair',
    email: 'priya@connecthub.dev',
    bio: 'UI/UX Designer · Creating simple & beautiful experiences 🎨',
    location: 'Kochi, India',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    joinedHoursAgo: 24 * 200,
  },
  {
    key: 'arun',
    name: 'Arun Kumar',
    username: 'arunkr',
    email: 'arun@connecthub.dev',
    bio: 'Developer | Open Source Enthusiast | Coffee-driven coder',
    location: 'Bengaluru, India',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    joinedHoursAgo: 24 * 120,
  },
  {
    key: 'sneha',
    name: 'Sneha Reddy',
    username: 'snehareddy',
    email: 'sneha@connecthub.dev',
    bio: 'Learning | Sharing | Growing · AI & data science student 🤖',
    location: 'Hyderabad, India',
    profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
    joinedHoursAgo: 24 * 90,
  },
];

const posts = [
  {
    key: 'p1',
    author: 'karthik',
    hoursAgo: 2,
    content: 'Beautiful evening at the campus today! 🌇\nGrateful for good friends, great ideas and endless learning. 🚀 #CollegeLife',
    image: 'https://picsum.photos/seed/connecthub-campus/900/560',
  },
  {
    key: 'p2',
    author: 'priya',
    hoursAgo: 6,
    content: 'Working on a new project. Small progress every day! 💻\nConsistency always wins. #WebDevelopment #Design',
    image: 'https://picsum.photos/seed/connecthub-desk/900/560',
  },
  {
    key: 'p3',
    author: 'sudalai',
    hoursAgo: 26,
    content: 'Another day, another step forward! Learning, building and enjoying the journey. ✨ #Productivity',
    image: 'https://picsum.photos/seed/connecthub-journey/900/560',
  },
  {
    key: 'p4',
    author: 'arun',
    hoursAgo: 3,
    content:
      'Just merged my first open source PR into an Express.js middleware library 🎉\nTip for beginners: start with documentation fixes — maintainers love them. #OpenSource #WebDevelopment',
  },
  {
    key: 'p5',
    author: 'sneha',
    hoursAgo: 5,
    content:
      'Trained my first image classifier today — 94% accuracy on the validation set! 🤖 Next step: deploy it behind a REST API with Express. #AIProjects #MachineLearning',
  },
  {
    key: 'p6',
    author: 'karthik',
    hoursAgo: 30,
    content:
      'Hot take: learning vanilla JavaScript deeply before jumping into frameworks makes you a much better developer. Agree? 🤔 #WebDevelopment #JavaScript',
  },
  {
    key: 'p7',
    author: 'priya',
    hoursAgo: 50,
    content: "Design tip of the day 🎨: whitespace isn't empty space — it's breathing room for your content. #Design #UIUX",
  },
  {
    key: 'p8',
    author: 'sneha',
    hoursAgo: 75,
    content:
      'Hackathon weekend with the team! 36 hours, way too much coffee, and one working prototype. ☕🔥 Proud of everyone. #Hackathon #CollegeLife #AIProjects',
    image: 'https://picsum.photos/seed/connecthub-hackathon/900/560',
  },
];

// [follower, following]
const follows = [
  ['sudalai', 'karthik'],
  ['karthik', 'sudalai'],
  ['sudalai', 'priya'],
  ['priya', 'sudalai'],
  ['arun', 'sudalai'],
  ['sneha', 'sudalai'],
  ['karthik', 'priya'],
  ['priya', 'karthik'],
  ['arun', 'karthik'],
  ['sneha', 'priya'],
  ['karthik', 'sneha'],
  ['arun', 'priya'],
];

// post -> users who liked it
const likes = {
  p1: ['sudalai', 'priya', 'arun', 'sneha'],
  p2: ['sudalai', 'karthik', 'sneha'],
  p3: ['karthik', 'priya', 'arun', 'sneha'],
  p4: ['karthik', 'sudalai'],
  p5: ['priya', 'karthik', 'arun'],
  p6: ['arun', 'sneha', 'sudalai'],
  p7: ['karthik', 'sneha'],
  p8: ['sudalai', 'karthik', 'priya', 'arun'],
};

const comments = [
  { post: 'p1', author: 'priya', hoursAgo: 1.8, content: 'Amazing click! Where is this? 😍' },
  { post: 'p1', author: 'sudalai', hoursAgo: 1.2, content: 'Looks beautiful! Miss those campus evenings.' },
  { post: 'p2', author: 'karthik', hoursAgo: 5, content: 'Consistency really is the secret. Keep going! 💪' },
  { post: 'p3', author: 'karthik', hoursAgo: 24, content: 'Proud of your progress, bro! 🔥' },
  { post: 'p3', author: 'sneha', hoursAgo: 20, content: 'This is so motivating. Thanks for sharing!' },
  { post: 'p4', author: 'sudalai', hoursAgo: 2.5, content: 'Congrats Arun! Which library was it?' },
  { post: 'p5', author: 'arun', hoursAgo: 4, content: 'That accuracy is impressive. Which dataset did you use?' },
  { post: 'p6', author: 'priya', hoursAgo: 28, content: 'Totally agree — fundamentals first!' },
  { post: 'p8', author: 'karthik', hoursAgo: 70, content: 'What a weekend that was! Great teamwork 🙌' },
];

const messages = [
  { from: 'karthik', to: 'sudalai', hoursAgo: 4, content: 'Hey! Are you joining the coding club meetup tomorrow?' },
  { from: 'sudalai', to: 'karthik', hoursAgo: 3.8, content: 'Yes, definitely! I will bring my laptop for the demo.' },
  { from: 'karthik', to: 'sudalai', hoursAgo: 3.5, content: 'Perfect 🚀 See you at 4 PM.' },
  { from: 'priya', to: 'sudalai', hoursAgo: 8, content: 'Loved your last post! Want feedback on your portfolio design?' },
];

async function clearDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    Message.deleteMany({}),
  ]);
}

async function seedDatabase({ log = console.log } = {}) {
  await clearDatabase();

  // Users (created through the model so passwords are bcrypt-hashed by the pre-save hook)
  const U = {};
  for (const u of users) {
    const doc = await User.create({
      name: u.name,
      username: u.username,
      email: u.email,
      password: DEMO_PASSWORD,
      bio: u.bio,
      location: u.location,
      profileImage: u.profileImage,
    });
    await User.collection.updateOne({ _id: doc._id }, { $set: { createdAt: ago(u.joinedHoursAgo) } });
    U[u.key] = doc._id;
  }

  // Follow relationships (both sides kept in sync)
  for (const [follower, following] of follows) {
    await User.updateOne({ _id: U[following] }, { $addToSet: { followers: U[follower] } });
    await User.updateOne({ _id: U[follower] }, { $addToSet: { following: U[following] } });
  }

  // Posts (inserted directly so historical timestamps are preserved)
  const P = {};
  const commentCounts = comments.reduce((acc, c) => ({ ...acc, [c.post]: (acc[c.post] || 0) + 1 }), {});
  const postDocs = posts.map((p) => {
    const _id = new mongoose.Types.ObjectId();
    P[p.key] = { _id, author: U[p.author], hoursAgo: p.hoursAgo };
    return {
      _id,
      author: U[p.author],
      content: p.content,
      image: p.image || '',
      likes: (likes[p.key] || []).map((k) => U[k]),
      commentsCount: commentCounts[p.key] || 0,
      tags: extractTags(p.content),
      editedAt: null,
      createdAt: ago(p.hoursAgo),
      updatedAt: ago(p.hoursAgo),
      __v: 0,
    };
  });
  await Post.collection.insertMany(postDocs);

  const commentDocs = comments.map((c) => ({
    _id: new mongoose.Types.ObjectId(),
    post: P[c.post]._id,
    author: U[c.author],
    content: c.content,
    createdAt: ago(c.hoursAgo),
    updatedAt: ago(c.hoursAgo),
    __v: 0,
    _postKey: c.post,
  }));
  await Comment.collection.insertMany(commentDocs.map(({ _postKey, ...doc }) => doc));

  // Notifications derived from the seeded activity
  const notifications = [];
  const push = (recipient, sender, type, extra, hoursAgo, read) => {
    if (String(recipient) === String(sender)) return;
    notifications.push({ recipient, sender, type, post: null, comment: null, ...extra, read, createdAt: ago(hoursAgo), updatedAt: ago(hoursAgo), __v: 0 });
  };
  follows.forEach(([follower, following], i) => push(U[following], U[follower], 'follow', {}, 24 * (i + 2), i > 3));
  Object.entries(likes).forEach(([postKey, likers]) => {
    const p = P[postKey];
    likers.forEach((k, i) => push(p.author, U[k], 'like', { post: p._id }, Math.max(0.2, p.hoursAgo - 0.3 * (i + 1)), p.hoursAgo > 12));
  });
  commentDocs.forEach((c) => {
    const p = P[c._postKey];
    push(p.author, c.author, 'comment', { post: p._id, comment: c._id }, (Date.now() - c.createdAt) / HOUR, false);
  });
  if (notifications.length) await Notification.collection.insertMany(notifications);

  // Direct messages
  await Message.collection.insertMany(
    messages.map((m) => ({
      sender: U[m.from],
      recipient: U[m.to],
      content: m.content,
      read: m.to !== 'sudalai',
      createdAt: ago(m.hoursAgo),
      updatedAt: ago(m.hoursAgo),
      __v: 0,
    }))
  );

  log(
    `🌱 Seeded ${users.length} users, ${posts.length} posts, ${comments.length} comments, ` +
      `${follows.length} follows, ${Object.values(likes).flat().length} likes, ${notifications.length} notifications.`
  );
  log(`   Demo login → username: sudalai  |  password: ${DEMO_PASSWORD}`);
}

/** Seeds only when the database has no users (used by the embedded dev DB). */
async function seedIfEmpty() {
  const count = await User.estimatedDocumentCount();
  if (count === 0) {
    console.log('📦 Empty database detected — loading demo data...');
    await seedDatabase();
  }
}

module.exports = { seedDatabase, seedIfEmpty, clearDatabase, DEMO_PASSWORD };
