# Church Mate - React Native Mobile App

A mobile application for Myanmar churches featuring offline Bible reading, real-time hymn search, and church bulletin functionality.

## 🚀 Features

- **📖 Offline Bible Reader**: Fast, offline-first Bible reading with book/chapter navigation
- **🎵 Hymn Search**: Real-time hymn search with Firebase Firestore and offline persistence
- **📰 Church Bulletin**: Weekly announcements and events from your church
- **🌐 Myanmar Font Support**: Proper rendering of Myanmar/Hakha text
- **📱 Cross-Platform**: Works on iOS, Android, and Web

## 🛠️ Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Database**: 
  - SQLite (`expo-sqlite`) for offline Bible data
  - Firebase Firestore for hymns and bulletins
- **Navigation**: React Navigation (Bottom Tabs)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- (Optional) Android Studio or Xcode for native builds

## 🔧 Installation

1. **Clone or navigate to the project**:
   ```bash
   cd church-mate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase config
   - Update `src/config/firebase.ts` with your credentials

4. **Prepare Bible Data** (Optional):
   - Place your `Hakha Bible_(HCL).xml` file in the project root
   - Run the XML parser script (see below)
   - Or use the sample data that's included

## 🏃 Running the App

### Development Mode

```bash
# Start Expo development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS (macOS only)
npx expo run:ios

# Run on Web
npx expo start --web
```

### Using Expo Go App

1. Install Expo Go on your mobile device
2. Run `npx expo start`
3. Scan the QR code with your device

## 📚 Bible Data Setup

### Using Your XML File

1. Place `Hakha Bible_(HCL).xml` in the project root
2. Run the parser script:
   ```bash
   npm run parse-bible
   ```

### XML Structure Expected

```xml
<bible>
  <b n="Genesis">
    <c n="1">
      <v n="1">In the beginning...</v>
      <v n="2">And the earth was...</v>
    </c>
  </b>
</bible>
```

## 🔥 Firebase Setup

### Firestore Collections

#### Hymns Collection (`hymns`)
```javascript
{
  number: 1,
  title: "Amazing Grace",
  lyrics: "Amazing grace, how sweet the sound...",
  category: "Praise"
}
```

#### Bulletins Collection (`bulletins`)
```javascript
{
  title: "Sunday Service",
  description: "Join us for worship at 10 AM",
  date: Timestamp,
  category: "announcement", // or "event", "prayer", "general"
  priority: "high" // or "medium", "low"
}
```

### Firestore Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
  }
}
```

## 📁 Project Structure

```
church-mate/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── BibleReader.tsx
│   │   ├── HymnList.tsx
│   │   └── BulletinBoard.tsx
│   ├── screens/          # Screen components
│   │   ├── BibleScreen.tsx
│   │   ├── HymnScreen.tsx
│   │   └── BulletinScreen.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── BottomTabNavigator.tsx
│   ├── database/         # SQLite database layer
│   │   ├── schema.ts
│   │   └── BibleDatabase.ts
│   ├── services/         # Firebase services
│   │   ├── HymnService.ts
│   │   └── BulletinService.ts
│   ├── config/           # App configuration
│   │   └── firebase.ts
│   ├── utils/            # Utility functions
│   │   ├── xmlParser.ts
│   │   └── firstLaunch.ts
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts
│   └── styles/           # Theme and styling
│       └── theme.ts
├── assets/               # Images, fonts, etc.
├── App.tsx              # Root component
└── package.json
```

## 🎨 Customization

### Theme

Edit `src/styles/theme.ts` to customize colors, typography, and spacing.

### Myanmar Fonts

1. Add your Myanmar font files to `assets/fonts/`
2. Update `src/styles/theme.ts` with the font family name
3. Load fonts in `App.tsx` using `expo-font`

## 🐛 Troubleshooting

### Database Issues

If the Bible data isn't loading:
1. Clear app data
2. Uninstall and reinstall the app
3. Check console logs for errors

### Firebase Connection

If hymns/bulletins aren't loading:
1. Verify Firebase config in `src/config/firebase.ts`
2. Check Firestore rules
3. Ensure internet connection for first load

## 📝 TODO

- [ ] Add Bible search functionality
- [ ] Implement bookmarks and highlights
- [ ] Add dark mode support
- [ ] Offline hymn caching
- [ ] Push notifications for bulletins
- [ ] User authentication
- [ ] Favorite hymns

## 📄 License

MIT License - feel free to use this for your church!

## 🙏 Credits

Built with ❤️ for Myanmar churches
