# Firebase Setup Instructions

This document provides step-by-step instructions for connecting your Firebase project to the MEC Canteen Hub application.

## Prerequisites

1. A Firebase account (create one at https://firebase.google.com/ if you don't have one)
2. A Firebase project (create one in the Firebase Console)

## Firebase Configuration

### 1. Get Your Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Click on the gear icon (Project settings) in the left sidebar
4. In the "General" tab, scroll down to the "Your apps" section
5. If you don't have a web app configured, click on the `</>` icon to add one
6. Register your app (you can name it "MEC Canteen Hub")
7. Copy the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 2. Update Firebase Configuration in the App

1. Open the file `src/lib/firebase.ts` in your project
2. Replace the placeholder configuration with your actual Firebase configuration:

```typescript
// TODO: Add your Firebase configuration object here
// You can find this in your Firebase project settings
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 3. Enable Firebase Services

In the Firebase Console, enable the following services:

1. **Firestore Database**
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development) or "Start in production mode" (for production)
   - Choose a location and click "Enable"

2. **Authentication** (Optional, if you want to use Firebase Auth)
   - Go to "Authentication" in the left sidebar
   - Click "Get started"
   - Enable the sign-in methods you want to use (Email/Password, Google, etc.)

3. **Cloud Storage** (Optional, if you want to store images/files)
   - Go to "Storage" in the left sidebar
   - Click "Get started"
   - Follow the setup wizard

## Firestore Database Structure

The app expects the following collections in Firestore:

- `users`: User profiles
- `menu`: Menu items
- `orders`: Order records
- `notifications`: User notifications

The app will automatically create documents in these collections as needed.

## Security Rules

For development, you can use the following basic security rules in Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, you should implement more restrictive rules based on your app's requirements.

## Testing the Connection

1. Start your development server: `npm run dev`
2. Open your browser and navigate to the app
3. Try to perform actions that involve data storage (creating menu items, placing orders, etc.)
4. Check the Firebase Console to see if data is being stored correctly

## Troubleshooting

1. **Firebase not initializing**: Check that your configuration object is correct and all required fields are present
2. **Permission denied errors**: Check your Firestore security rules
3. **Data not saving**: Verify that you're using the correct collection names and document structures

## Next Steps

Once Firebase is connected, you can enhance your app with additional Firebase features:

1. **Authentication**: Implement Firebase Authentication for user login
2. **Real-time updates**: Use Firestore's real-time listeners for live updates
3. **Cloud Functions**: Implement server-side logic with Firebase Cloud Functions
4. **Analytics**: Add Firebase Analytics to track user behavior