# Church Mate - Modern Church Companion App

<div align="center">

![Church Mate](https://img.shields.io/badge/Platform-React%20Native-blue)
![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green)

**A comprehensive offline-first mobile application designed to enhance the spiritual life of church members**

[Features](#-features) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 📖 About

Church Mate is a feature-rich React Native mobile application built specifically for Myanmar churches. It provides seamless access to spiritual resources including a multi-language Bible, hymn collection, church bulletins, and administrative tools—all with robust offline support and modern dark mode interface.

### 🎯 Key Highlights

- **100% Offline-First**: Full Bible and hymns accessible without internet
- **Multi-Language Support**: Myanmar and Hakha Chin translations
- **Modern UI/UX**: Beautiful dark mode with smooth transitions
- **Admin Dashboard**: Complete church management system
- **Real-time Sync**: Firebase-powered cloud synchronization
- **Cross-Platform**: iOS, Android, and Web support

---

## ✨ Features

### 📚 Bible Module

<table>
<tr>
<td width="50%">

**Core Features**
- Dual language support (Myanmar & Hakha Chin)
- 66 books with full chapter navigation
- 30,000+ verses stored locally in SQLite
- Instant offline access with zero latency

</td>
<td width="50%">

**Advanced Features**
- Full-text search with keyword highlighting
- Bookmark management with notes
- Verse-level highlighting in search results
- Direct navigation from search to chapter

</td>
</tr>
</table>

### 🎵 Hymn Collection

- **Searchable Database**: Find hymns by title, number, or lyrics
- **Offline Storage**: Access complete hymn library without internet
- **Firebase Sync**: Cloud backup across devices
- **Admin Management**: Add, edit, and organize hymns

### 📰 Bulletin Board

- **Real-time Announcements**: Church news and events
- **Smart Categorization**: Events, prayers, announcements, general
- **Priority System**: High/medium/low importance levels
- **Rich Content**: Support for formatted text and dates

### 👥 User Management & Authentication

- **Secure Login**: Firebase email/password authentication
- **User Profiles**: Customizable member profiles
- **Role-Based Access**: Admin and member permissions
- **Profile Management**: Update personal information and settings

### 🎨 Dark Mode

- **3 Theme Modes**: Light, Dark, and System auto-detect
- **Persistent Preference**: Remembers user choice via AsyncStorage
- **Complete Coverage**: All screens and components themed
- **Smooth Transitions**: Instant theme switching without reload

### 🔧 Admin Dashboard

- **User Management**: View, promote, and manage church members
- **Content Management**: Add/edit hymns and bulletins
- **Church Settings**: Customize church name and theme colors
- **Activity Logs**: Track administrative actions
- **Quick Actions**: Streamlined access to common tasks

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript 5.3
- **Navigation**: React Navigation v6 (Bottom Tabs + Stack)
- **State Management**: React Context API
- **UI Components**: Custom components with theme system

### Backend & Database
- **Cloud Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Local Database**: SQLite (expo-sqlite)
- **Storage**: AsyncStorage for preferences

### Development Tools
- **Build Tool**: Expo CLI
- **Version Control**: Git & GitHub
- **Code Quality**: TypeScript strict mode
- **Package Manager**: npm

---

## 🚀 Installation

### Prerequisites

```bash
Node.js >= 16.0.0
npm >= 8.0.0
Expo CLI (installed globally)
```

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Joseph1997-eng/churchmateV2.git
cd churchmateV2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config
   - Update `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. **Start development server**
```bash
npx expo start
```

5. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator (macOS only)

---

## 📱 Usage

### First Launch

1. **Bible Import**: On first launch, the app automatically imports Bible data
2. **Create Account**: Sign up with email and password
3. **Explore Features**: Navigate through Bible, Hymns, and Bulletins

### Admin Setup

To create an admin account:

1. Sign up normally through the app
2. Access Firestore Console
3. Find your user document in `users` collection
4. Set `role: 'admin'`
5. Restart the app to see Admin tab

---

## 📂 Project Structure

```
church-mate/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BibleReader.tsx
│   │   ├── HymnList.tsx
│   │   ├── BulletinBoard.tsx
│   │   └── ErrorBoundary.tsx
│   ├── screens/             # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── bible/          # Bible-related screens
│   │   └── admin/          # Admin screens
│   ├── navigation/          # Navigation configuration
│   │   ├── BottomTabNavigator.tsx
│   │   ├── BibleNavigator.tsx
│   │   └── AdminNavigator.tsx
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── database/            # SQLite database layer
│   │   ├── BibleDatabase.ts
│   │   └── schema.ts
│   ├── services/            # Firebase services
│   │   ├── AuthService.ts
│   │   ├── HymnService.ts
│   │   ├── BulletinService.ts
│   │   └── BookmarkService.ts
│   ├── utils/               # Utility functions
│   │   ├── xmlParser.ts
│   │   └── bibleParser.ts
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   ├── styles/              # Theme and styling
│   │   └── theme.ts
│   └── config/              # App configuration
│       └── firebase.ts
├── assets/                  # Static assets
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
└── package.json
```

---

## 🎨 Customization

### Theme Colors

Edit `src/styles/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#4A90E2',      // Your church's primary color
    secondary: '#7B68EE',    // Secondary accent color
    // ... more colors
  }
};
```

### Church Settings

Admins can customize:
- Church name
- Primary and secondary colors
- Logo and icon (coming soon)

---

## 🔐 Firebase Setup

### Firestore Collections

#### `users`
```javascript
{
  id: "user_id",
  email: "user@example.com",
  name: "John Doe",
  role: "user" | "admin",
  createdAt: Timestamp,
  photoURL: "optional_url"
}
```

#### `hymns`
```javascript
{
  id: "hymn_id",
  number: 1,
  title: "Amazing Grace",
  lyrics: "Full hymn lyrics...",
  category: "Praise",
  createdAt: Timestamp
}
```

#### `bulletins`
```javascript
{
  id: "bulletin_id",
  title: "Sunday Service",
  description: "Join us for worship...",
  category: "announcement" | "event" | "prayer" | "general",
  priority: "high" | "medium" | "low",
  date: Timestamp,
  createdAt: Timestamp,
  createdBy: "user_id"
}
```

#### `bookmarks`
```javascript
{
  id: "bookmark_id",
  userId: "user_id",
  bookId: 1000,
  bookName: "Genesis",
  chapter: 1,
  verse: 1,
  text: "In the beginning...",
  note: "Optional note",
  createdAt: Timestamp
}
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Everyone can read hymns and bulletins
    match /hymns/{hymnId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /bulletins/{bulletinId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can manage their own bookmarks
    match /bookmarks/{bookmarkId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🐛 Troubleshooting

### Bible Data Not Loading

1. Clear app data and restart
2. Check console logs for errors
3. Verify SQLite database initialization
4. Ensure XML file is properly formatted

### Firebase Connection Issues

1. Verify Firebase config in `src/config/firebase.ts`
2. Check internet connection
3. Ensure Firestore rules allow read access
4. Check Firebase Console for quota limits

### Dark Mode Not Working

1. Clear AsyncStorage: Settings → Clear App Data
2. Restart the app
3. Toggle theme manually from any screen header

---

## 🚀 Deployment

### Building for Production

```bash
# Android APK
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### OTA Updates

Over-the-air updates allow you to push JavaScript changes without app store approval:

```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

---

## 📊 Current Status

### ✅ Completed Features
- [x] Multi-language Bible (Myanmar & Hakha)
- [x] Bible search with keyword highlighting
- [x] Bookmark system with notes
- [x] Hymn collection with search
- [x] Bulletin board with categories
- [x] User authentication
- [x] Admin dashboard
- [x] Dark mode (3 themes)
- [x] Offline-first architecture

### 🚧 In Progress
- [ ] OTA Updates implementation
- [ ] Logo upload feature
- [ ] Push notifications

### 📋 Planned Features
- [ ] Bible highlights with colors
- [ ] Hymn favorites
- [ ] Export bookmarks
- [ ] Multi-device sync
- [ ] App analytics

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for Myanmar churches
- Bible translations: Myanmar Bible Society
- Hakha Chin translation: Hakha Chin Christian community
- Icons: Expo vector-icons
- UI inspiration: Modern mobile design patterns

---

## 📞 Support

For support, email [josephsaimonn@gmail.com] or open an issue in this repository.

---

<div align="center">

**Made with ❤️ by [Joseph](https://github.com/Joseph1997-eng)**

⭐ Star this repo if you find it helpful!

</div>
