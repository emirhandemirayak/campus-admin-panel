# Firebase Setup Guide

This guide will help you set up Firebase for your Campus Admin Portal.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "campus-admin-portal")
4. Follow the setup wizard

## Step 2: Enable Services

### Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### Storage (Optional)
1. Go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location
5. Click "Done"

## Step 3: Get Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "campus-admin-web")
6. Copy the configuration object

## Step 4: Set Environment Variables

1. Create a `.env.local` file in your project root:
```bash
# Windows
copy env.example .env.local

# Mac/Linux
cp env.example .env.local
```

2. Edit `.env.local` and replace the placeholder values with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

## Step 5: Create Admin User

1. In Firebase Console, go to "Authentication" > "Users"
2. Click "Add user"
3. Enter admin email and password
4. Go to "Firestore Database"
5. Create a new collection called `admins`
6. Add a document with the admin user's UID as the document ID:
```json
{
  "uid": "admin_user_uid_from_authentication",
  "email": "admin@campus.edu",
  "displayName": "Admin User",
  "role": "admin",
  "permissions": ["manage_users", "moderate_content", "verify_users"]
}
```

## Step 6: Set Up Firestore Collections

Create these collections in your Firestore database:

### users
```json
{
  "id": "user_uid",
  "email": "user@campus.edu",
  "displayName": "Student Name",
  "role": "user",
  "isVerified": false,
  "verificationStatus": "pending",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-01-01T00:00:00Z",
  "studentId": "12345",
  "department": "Computer Science",
  "year": 2024
}
```

### verificationRequests
```json
{
  "id": "request_id",
  "userId": "user_uid",
  "userEmail": "user@campus.edu",
  "userName": "Student Name",
  "studentId": "12345",
  "department": "Computer Science",
  "year": 2024,
  "documentUrl": "https://storage.googleapis.com/...",
  "status": "pending",
  "submittedAt": "2024-01-01T00:00:00Z"
}
```

### content
```json
{
  "id": "content_id",
  "title": "Post Title",
  "content": "Post content...",
  "authorId": "user_uid",
  "authorName": "Student Name",
  "type": "post",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Step 7: Test the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to the local URL (usually http://localhost:3000)
3. Try logging in with your admin credentials

## Troubleshooting

### "Invalid API Key" Error
- Make sure your `.env.local` file exists and has the correct values
- Restart the development server after changing environment variables
- Check that the API key matches your Firebase project

### "Access denied" Error
- Make sure the admin user exists in the `admins` collection
- Verify the UID in the `admins` collection matches the user's UID in Authentication

### Firestore Permission Errors
- Make sure Firestore is in "test mode" for development
- Or set up proper security rules for production

## Security Rules (Production)

For production, you should set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins can read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

Once Firebase is configured:
1. Test the login functionality
2. Add some test data to the collections
3. Explore the dashboard features
4. Customize the admin portal for your specific needs 