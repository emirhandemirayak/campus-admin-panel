# Campus Admin Portal

A comprehensive admin portal for managing campus applications, built with React, TypeScript, and Firebase.

## Features

- 🔐 **Admin Authentication** - Secure login system for administrators
- 📊 **Dashboard Overview** - Real-time statistics and metrics
- 👥 **User Management** - Manage and verify user accounts
- 📝 **Content Moderation** - Review and moderate posts/comments
- ✅ **Verification System** - Approve/reject user verification requests
- 🎨 **Modern UI** - Built with Material-UI for a professional look
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Styling**: Emotion (CSS-in-JS)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/emirhandemirayak/campus-admin-panel.git
   cd campus-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

5. **Set up Firebase Security Rules**
   
   In your Firestore database, create the following collections:
   - `users` - User profiles and verification status
   - `admins` - Admin user accounts
   - `verificationRequests` - User verification submissions
   - `content` - Posts, comments, and other content

6. **Create admin user**
   
   In Firebase Authentication, create an admin user account, then add them to the `admins` collection:
   ```javascript
   {
     "uid": "admin_user_uid",
     "email": "admin@campus.edu",
     "displayName": "Admin User",
     "role": "admin",
     "permissions": ["manage_users", "moderate_content", "verify_users"]
   }
   ```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Authentication component
│   └── Dashboard.tsx   # Dashboard overview
├── services/           # Firebase services
│   ├── authService.ts  # Authentication logic
│   ├── userService.ts  # User management
│   └── contentService.ts # Content moderation
├── types/              # TypeScript type definitions
│   └── index.ts
├── firebase/           # Firebase configuration
│   └── config.ts
└── App.tsx            # Main application component
```

## Firebase Collections

### Users Collection
```typescript
{
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'moderator' | 'user';
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  lastLoginAt: Date;
  studentId?: string;
  department?: string;
  year?: number;
}
```

### Verification Requests Collection
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  studentId: string;
  department: string;
  year: number;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}
```

### Content Collection
```typescript
{
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'post' | 'comment' | 'announcement';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: string;
  reportCount?: number;
  moderationNotes?: string;
}
```

## Features in Development

- [ ] User Management Interface
- [ ] Content Moderation Panel
- [ ] Verification Request Review
- [ ] Analytics and Reporting
- [ ] Settings and Configuration
- [ ] Bulk Operations
- [ ] Export Data
- [ ] Email Notifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email admin@campus.edu or create an issue in this repository.
