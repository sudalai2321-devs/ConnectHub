# ConnectHub — Full-Stack Mini Social Media Platform

A modern, production-quality mini social media platform where users can register, personalize their profiles, publish posts with photos and hashtags, engage through likes and comments, follow/unfollow other users, send direct messages, and discover trending topics.

Built with **Node.js, Express.js, MongoDB (Mongoose), and Vanilla JavaScript (HTML5/CSS3)**.

---

## 📸 Overview & Features

### 1. User Authentication & Session Security
- **Register**: Full name, unique username, unique email, password (min 8 chars, alphanumeric), and confirm password.
- **Login**: Authenticate with either **Email** or **Username** + password.
- **Security**: Passwords hashed with `bcryptjs` (salt rounds: 12). Tokens signed with `jsonwebtoken` (JWT). Passwords never returned in API responses.
- **Server-Side Session Invalidation**: Logging out increments the user's `tokenVersion`, invalidating previously issued JWTs.
- **Rate Limiting**: Brute-force protection on auth endpoints and API routes.

### 2. User Profiles & Follow System
- **Profiles**: Displays avatar, name, `@username`, bio, location, join date, followers count, following count, and posts count.
- **Edit Profile**: Modal allowing in-place updating of Name, Bio, Location, and Profile Photo (with instant preview).
- **Follow / Unfollow**: Bidirectional atomic follow system. Follower/following counts and button states update dynamically without reloading. Users cannot follow themselves.
- **Followers & Following Modals**: Inspect who follows any user and who they are following.
- **Profile Tabs**: View user's created **Posts** and **Liked Posts**.

### 3. Home Feed & Post Composer
- **Dual Feed Views**: Switch seamlessly between **For You** (all community posts) and **Following** (posts from creators you follow).
- **Composer**: Textarea with character counter (up to 500 characters), file upload (with image preview and remove button), and auto-extracted `#hashtags`.
- **Immediate Feedback**: Newly published posts appear instantly at the top of the feed.
- **Post Actions**:
  - ❤️ **Like / Unlike**: Real-time counter updates, heart animation, persistent in MongoDB. Duplicate likes are prevented.
  - 💬 **Expandable Comments Drawer**: Read comments, write comments, and delete your own comments. Updates post comment count dynamically.
  - 🔗 **Share Link**: One-click URL copying.
  - 🗑️ **Delete Post**: Post authors can delete their own posts (with confirmation modal), cleanly removing attached comments, notifications, and uploaded images.

### 4. Explore & Real-time Search
- **Search**: Debounced live search across users (by name, handle, bio) and posts (by text or `#hashtag`).
- **Trending Hashtags**: Aggregates top trending topics with post counts. Clicking any tag runs an instant hashtag search.
- **Suggested Users**: Recommends popular users you don't follow yet.

### 5. Notifications
- Real-time event notifications generated when someone:
  - Likes your post
  - Comments on your post
  - Starts following you
- Unread badge indicator in navigation bars.
- Clicking an unread notification marks it as read and redirects to the post or profile.
- Filter by All vs Unread, or click "Mark all as read".

### 6. Direct Messaging (Messages)
- Dual-pane layout on desktop / single-pane flow on mobile.
- Conversations list with unread counter badges.
- Message threads with automatic periodic polling and read receipts.
- Direct message button directly on user profile pages.

### 7. Modern UI / UX Design
- **Theme**: Light & Dark mode toggle with preference stored in `localStorage`.
- **Styling**: Clean, premium design inspired by modern social platforms with soft shadows, glassmorphism, rounded cards, and smooth CSS transitions.
- **Fully Responsive**: Breakpoints for Desktop (3 columns), Laptop (compact icons sidebar), Tablet (2 columns), and Mobile (top header, full-width cards, floating Create button, bottom navigation, and slide-over drawer).

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (REST API), Helmet (security headers), CORS, Express Rate Limit, Morgan, Multer (file uploads)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **Frontend**: HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid, Animations), Vanilla JavaScript (ES6+, Fetch API)
- **Zero-Dependency Local Dev**: Includes `mongodb-memory-server` option so the app can run out of the box even without MongoDB pre-installed!

---

## 📁 Project Structure

```text
connecthub/
├── .env.example              # Environment variables template
├── .env                      # Active environment configuration
├── package.json              # NPM manifest & scripts
├── nodemon.json              # Nodemon configuration
├── README.md                 # Project documentation
│
├── client/                   # Frontend assets & HTML pages
│   ├── index.html            # Home feed
│   ├── login.html            # Log in page
│   ├── register.html         # Sign up page
│   ├── profile.html          # User profile page
│   ├── explore.html          # Explore & search page
│   ├── notifications.html    # Notifications page
│   ├── messages.html         # Direct messages page
│   ├── 404.html              # Custom 404 page
│   ├── css/
│   │   ├── style.css         # Design tokens, components, page layout, dark mode
│   │   └── responsive.css    # Responsive breakpoints (desktop, tablet, mobile)
│   └── js/
│       ├── api.js            # Central API client (Fetch wrapper with JWT handling)
│       ├── auth.js           # Session manager & page protection
│       ├── components.js     # Reusable UI elements (cards, modals, toasts, avatars)
│       ├── app.js            # Global bootstrap, navigation, theme toggle, badges
│       ├── feed.js           # Feed logic & inline composer
│       ├── profile.js        # Profile loading, follow/unfollow, edit modal
│       ├── explore.js        # Debounced search & trending logic
│       ├── notifications.js  # Notifications list & read states
│       └── messages.js       # Direct messages thread & conversations
│
├── server/                   # Backend Express application
│   ├── server.js             # Server startup & DB connection
│   ├── app.js                # Express app setup, middlewares & routes
│   ├── config/
│   │   └── db.js             # Mongoose connection (supports Local, Atlas, or embedded)
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt pre-save hook, references)
│   │   ├── Post.js           # Post schema (likes, tags, commentsCount)
│   │   ├── Comment.js        # Comment schema
│   │   ├── Notification.js   # Notification schema
│   │   └── Message.js        # Direct message schema
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & tokenVersion check
│   │   ├── errorMiddleware.js    # Centralized error handler
│   │   ├── validateMiddleware.js # express-validator & ObjectId validators
│   │   └── uploadMiddleware.js   # Multer file upload (5 MB, image validation)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   ├── notificationController.js
│   │   └── messageController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── messageRoutes.js
│   ├── utils/
│   │   ├── ApiError.js       # Typed HTTP error class
│   │   ├── asyncHandler.js   # Wrapper for async controller methods
│   │   ├── token.js          # JWT sign & verify helpers
│   │   ├── serialize.js      # Document sanitization & count calculation
│   │   ├── helpers.js        # Hashtag extractor, pagination, regex sanitizers
│   │   └── notify.js         # Safe notification dispatcher
│   ├── seed/
│   │   ├── seedData.js       # 5 users, 8 posts, comments, likes, follows
│   │   └── seed.js           # CLI database seeder
│   └── uploads/              # Local storage for user-uploaded images
│
└── scripts/
    └── api-smoke-test.js     # Comprehensive end-to-end API test suite
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=memory
JWT_SECRET=connecthub_super_secret_jwt_key_2026_production_ready_signature
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=
```

### MongoDB Options for `MONGO_URI`:
1. **Embedded Database (Zero Setup)**: Set `MONGO_URI=memory`.
   ConnectHub will run an embedded MongoDB server via `mongodb-memory-server` and persist data to `server/.mongo-data/`. No MongoDB installation required!
2. **Local MongoDB**: Set `MONGO_URI=mongodb://127.0.0.1:27017/connecthub`.
3. **MongoDB Atlas (Cloud)**: Set `MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/connecthub?retryWrites=true&w=majority`.

---

## 🚀 Installation & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Populate Demo Data (Optional)
ConnectHub comes with sample data (5 realistic student & developer accounts, 8 posts, comments, follower relationships):
```bash
npm run seed
```
*(Note: If using `MONGO_URI=memory`, seed data is automatically loaded on the first start!)*

### 3. Start the Server
```bash
npm start
```
Or for auto-reloading during development:
```bash
npm run dev
```

### 4. Open in Browser
Visit:
```
http://localhost:5000
```

---

## 🔑 Demo Credentials

You can sign in with any of the seeded accounts using password **`Password123`**:

| Name | Username | Email | Role |
| :--- | :--- | :--- | :--- |
| **Sudalai S** | `sudalai` | `sudalai@connecthub.dev` | IT Student & Developer |
| **Karthik Raj** | `karthikraj` | `karthik@connecthub.dev` | Tech Lead & Full-stack |
| **Priya Nair** | `priyanair` | `priya@connecthub.dev` | UI/UX Designer |
| **Arun Kumar** | `arunkr` | `arun@connecthub.dev` | Open Source Contributor |
| **Sneha Reddy** | `snehareddy` | `sneha@connecthub.dev` | AI & Data Science |

*(Tip: On the login page, click the **"Click to autofill demo login"** button to log in instantly).*

---

## 🧪 Automated Testing

ConnectHub includes an end-to-end API smoke test suite testing authentication, authorization, profile updates, follower relationships, post creation, feeds, likes, comments, notifications, and security protections.

While the server is running, execute:
```bash
npm run test:api
```

---

## 📖 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new user account.
- `POST /api/auth/login` — Sign in with email or username.
- `GET /api/auth/me` — Return current authenticated user profile.
- `POST /api/auth/logout` — Invalidate user session.

### Users (`/api/users`)
- `GET /api/users/:username` — Public profile details with follower counts.
- `PUT /api/users/profile` — Update logged-in user profile (name, bio, location, photo).
- `GET /api/users/search?q=:query` — Search users by name, username, or bio.
- `GET /api/users/suggestions` — Suggested accounts to follow.
- `POST /api/users/:id/follow` — Follow user.
- `DELETE /api/users/:id/follow` — Unfollow user.
- `GET /api/users/:username/followers` — List followers of a user.
- `GET /api/users/:username/following` — List accounts followed by a user.

### Posts (`/api/posts`)
- `GET /api/posts?feed=all|following&page=1&limit=10` — Paginated home feeds.
- `POST /api/posts` — Create a new post (multipart: `content`, optional `image`).
- `GET /api/posts/:id` — Retrieve post by ID.
- `PUT /api/posts/:id` — Edit own post content.
- `DELETE /api/posts/:id` — Delete own post and attached comments/files.
- `POST /api/posts/:id/like` — Like a post.
- `DELETE /api/posts/:id/like` — Unlike a post.
- `GET /api/posts/search?q=:query` — Search posts by text or `#hashtag`.
- `GET /api/posts/trending` — Trending hashtags.

### Comments (`/api/posts/:id/comments`, `/api/comments`)
- `GET /api/posts/:id/comments` — Retrieve comments for a post.
- `POST /api/posts/:id/comments` — Add a new comment.
- `DELETE /api/comments/:id` — Delete own comment.

### Notifications (`/api/notifications`)
- `GET /api/notifications` — List notifications.
- `GET /api/notifications/unread-count` — Count of unread notifications for badge.
- `PUT /api/notifications/:id/read` — Mark notification as read.
- `PUT /api/notifications/read-all` — Mark all notifications as read.

### Messages (`/api/messages`)
- `GET /api/messages/conversations` — Recent conversation list.
- `GET /api/messages/:userId` — Chat history with a user.
- `POST /api/messages/:userId` — Send direct message to a user.

---

## 🛡️ Security Features

1. **Password Hashing**: Strong bcrypt salt rounds (12) prevent rainbow table attacks.
2. **Never Return Passwords**: Passwords and token versions are explicitly hidden using Mongoose `select: false` and schema transforms.
3. **Session Invalidation**: Password/session resets increment `tokenVersion`, instantly revoking all active JWTs.
4. **Ownership Authorization**: Users can only edit their own profile, delete their own posts, and delete their own comments.
5. **No Self-Following**: Validation strictly prevents following oneself.
6. **Rate Limiting**: Throttles brute-force login attempts and spam requests.
7. **HTTP Security Headers**: Powered by Helmet with customized Content Security Policy.
8. **Input Sanitization**: HTML escaping on all user content to prevent Cross-Site Scripting (XSS).

---

## 💡 Troubleshooting

- **Port in use**: If port 5000 is occupied, change `PORT=5001` in `.env`.
- **MongoDB Connection Error**:
  - If you don't have MongoDB installed, simply keep `MONGO_URI=memory` in `.env`.
  - If using local MongoDB, ensure the MongoDB service is started (`net start MongoDB` or `mongod`).
  - If using Atlas, ensure your current IP address is whitelisted in MongoDB Atlas Network Access.
- **Embedded Database Lock**: If you terminate the process abruptly and see a lock error, ensure no background Node process is running, or delete `server/.mongo-data` and restart.
