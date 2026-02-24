# 🚀 PhMessageApp

> **⚠️ Disclaimer**: This is **NOT** a production-ready application. This project was created solely to demonstrate and showcase my ability to work with **real-time messaging systems**. It is a learning exercise/personal portfolio piece and is not intended to solve real-world problems or be deployed for end-users.

---

## 📚 Tech Stack

| Category       | Technology                                                |
| -------------- | --------------------------------------------------------- |
| **Frontend**   | React 19 + Vite 7                                         |
| **Routing**    | React Router DOM 7                                        |
| **Backend**    | Firebase (Auth + Firestore + Realtime Database + Storage) |
| **Animations** | Framer Motion                                             |
| **Icons**      | React Icons                                               |
| **Styling**    | CSS                                                       |

---

## ✨ Features

### Real-Time Messaging
- **Live message updates** using Firestore's `onSnapshot`
- Instant conversation list updates when new messages arrive
- Real-time message synchronization across clients
- Infinite scroll pagination for loading older messages

### User Presence System
- Real-time online/offline status indicators
- Last seen timestamps
- Presence tracking using Firebase Realtime Database

### Authentication
- Email/Password login and signup
- Google OAuth integration
- Password recovery system
- Automatic user document creation

### Chat Interface
- One-on-one messaging
- Conversation list with last message preview
- Responsive sidebar layout (desktop + mobile)
- Send messages via Enter key or button click
- File sharing (images, videos, documents) via Firebase Storage
- Message type detection (text, image, video, file)
- Animated message transitions with Framer Motion

### Profile Management
- View and edit profile information
- Change profile photo (stored in Firebase Storage)
- Real-time profile updates

### Conversations
- Create new conversations by email
- Pre-built conversation with developer
- Conversation details view
- Participant information display

---

## 🎯 Purpose

This project demonstrates my ability to:
- ✅ Build real-time applications with Firebase/Firestore
- ✅ Implement authentication systems (Email + OAuth)
- ✅ Create reactive UI with React hooks
- ✅ Manage complex state with real-time data streams
- ✅ Work with Firebase Realtime Database for presence
- ✅ Handle file uploads with Firebase Storage
- ✅ Create responsive designs with CSS
- ✅ Add smooth animations with Framer Motion

> **Note**: This is a **portfolio project yet**. It lacks production features like:
> - Security rules optimization
> - Error handling & edge cases
> - Data validation
> - Rate limiting
> - Production deployment configurations

---

## 🛠️ Getting Started

## 💻 Live Demo
[Try PhMessageApp here](https://phmessageapp-6f134.web.app)

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (Auth, Firestore, Realtime Database, Storage)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd phmessageapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```
bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── messageSideBar      # Conversation list sidebar
│   └── privateRoute        # Protected route wrapper
├── pages/
│   ├── home/               # Main chat interface
│   ├── login.jsx           # Login page
│   ├── signUp.jsx          # Signup page
│   ├── profile/            # User profile page
│   └── conversationProfile/  # Conversation details page
├── services/
│   ├── authService.js      # Firebase authentication
│   ├── conversationService.js  # Real-time messaging
│   ├── firebase.js         # Firebase initialization
│   ├── presenceService.js # User presence tracking
│   ├── profileService.js   # User profile management
│   └── userService.js      # User data management
├── routes/                 # App routing configuration
└── assets/                 # Static assets
```

---

## ⚡ Real-Time Implementation Highlights

```javascript
// Live subscription to user's conversations
const unsubscribe = onSnapshot(q, (snapshot) => {
  const conversations = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  callback(conversations);
});

// Real-time messages in a conversation
const unsubscribe = onSnapshot(q, (snapshot) => {
  const msgs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  callback(msgs);
});

Presence tracking in `presenceService.js`:

const userStatusRef = ref(database, `status/${user.uid}`);
onDisconnect(userStatusRef).set(isOffline);
set(userStatusRef, isOnline);

---

## 📄 License

MIT License - Feel free to use this code for learning purposes!

---

## 👤 Author

Created with ❤️ to showcase real-time messaging capabilities.
