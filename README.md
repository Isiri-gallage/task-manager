# 📋 Task Manager 

A full-stack, cloud-powered task management application built with React and Firebase. Features user authentication, real-time data synchronization, recurring tasks, drag-and-drop functionality, and comprehensive analytics.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://isiri-gallage.github.io/task-manager/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0+-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 🔐 Authentication & Security
- Secure user authentication with Firebase Auth
- Email/password registration and login
- Private, user-specific task storage
- Session persistence across devices

### 📝 Task Management
- Create, read, update, and delete tasks
- Double-click to edit tasks inline
- Drag and drop to reorder tasks
- Mark tasks as complete/incomplete
- Bulk task operations

### 🎯 Organization Features
- **Priority Levels:** High, Medium, Low with color coding
- **Due Dates:** Set deadlines with overdue detection
- **Categories/Tags:** Organize tasks by project or type
- **Recurring Tasks:** Automatic task regeneration (Daily, Weekly, Monthly)
- **Smart Filters:** Filter by status, priority, or overdue

### 🔍 Advanced Functionality
- **Real-time Search:** Instant task filtering by name or category
- **Drag & Drop:** Intuitive task reordering with @dnd-kit
- **Statistics Dashboard:** Visual analytics of productivity
- **Export Options:** Download tasks as CSV, JSON, or PDF
- **Dark Mode:** Eye-friendly theme with system preference detection

### ☁️ Cloud Features
- **Multi-device Sync:** Access tasks from any device
- **Real-time Updates:** Instant synchronization across sessions
- **Cloud Storage:** Secure Firebase Firestore database
- **Offline Support:** Tasks cached locally for offline access

---

## 🚀 Demo

**Live Application:** [https://isiri-gallage.github.io/task-manager/](https://isiri-gallage.github.io/task-manager/)

### Demo Account (Optional)
You can create your own account or use:
- Email: `demo@taskmanager.com`
- Password: `demo123456`

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **JavaScript ES6+** - Programming language
- **CSS3** - Styling with modern features
- **@dnd-kit** - Drag and drop functionality
- **jsPDF** - PDF generation
- **Font Awesome** - Icon library

### Backend & Services
- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Hosting** - Cloud deployment

### Tools & Deployment
- **Git & GitHub** - Version control
- **GitHub Pages** - Static hosting
- **npm** - Package management
- **VS Code** - Development environment

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Clone Repository
```bash
git clone https://github.com/Isiri-gallage/task-manager.git
cd task-manager
```

### Install Dependencies
```bash
npm install
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)

2. Enable Firestore Database:
   - Go to **Firestore Database** → **Create Database**
   - Start in **test mode** (for development)

3. Enable Authentication:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**

4. Get your Firebase config:
   - Go to **Project Settings** → **Your apps**
   - Click **Web app** icon
   - Copy the configuration object

5. Create `src/firebase.js` and add your config:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

### Run Development Server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

### Deploy to GitHub Pages
```bash
npm run deploy
```

### Build for Production
```bash
npm run build
```

The optimized build will be in the `build/` folder.

---

## 📁 Project Structure

```
task-manager/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── App.js                 # Main application component
│   │   ├── Auth.js                # Authentication component
│   │   ├── TaskInput.js           # Task creation form
│   │   ├── TaskList.js            # Task list container
│   │   ├── TaskItem.js            # Individual task component
│   │   ├── FilterButtons.js       # Filter controls
│   │   ├── SearchBar.js           # Search functionality
│   │   ├── Statistics.js          # Analytics dashboard
│   │   └── ExportButtons.js       # Export functionality
│   ├── styles/
│   │   ├── App.css
│   │   ├── Auth.css
│   │   ├── TaskInput.css
│   │   ├── TaskItem.css
│   │   ├── TaskList.css
│   │   ├── FilterButtons.css
│   │   ├── SearchBar.css
│   │   ├── Statistics.css
│   │   └── ExportButtons.css
│   ├── firebase.js               # Firebase configuration
│   ├── index.js                  # Entry point
│   └── index.css                 # Global styles
├── package.json
├── README.md
└── .gitignore
```

---

## 🎯 Key Features Explained

### Recurring Tasks
When a recurring task is marked complete, the app automatically:
1. Marks the current task as completed
2. Creates a new task with the next due date
3. Maintains all other properties (priority, category, etc.)

**Example:**
- Task: "Morning workout" (Due: Today, Recurring: Daily)
- Mark complete → New task created with tomorrow's date

### Drag & Drop
Built with @dnd-kit for smooth, accessible reordering:
- Click and hold any task
- Drag to desired position
- Release to drop
- Order persists across sessions

### Export Functionality
Export your tasks in multiple formats:
- **CSV:** For spreadsheet analysis
- **JSON:** For data backup or migration
- **PDF:** For professional reports with statistics

### Smart Filters
- **All:** Show all tasks
- **Active:** Only incomplete tasks
- **Completed:** Only finished tasks
- **High/Medium/Low:** Filter by priority
- **Overdue:** Tasks past their due date

---

## 🔒 Security

- User authentication required for all operations
- Firestore security rules ensure users can only access their own data
- Password requirements enforced (minimum 6 characters)
- Session tokens managed securely by Firebase Auth

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 🐛 Known Issues

- PDF export may have formatting issues with very long task names
- Drag and drop doesn't work on some mobile browsers
- Dark mode preference not synced across devices (localStorage only)

---

## 🔮 Future Enhancements

- [ ] Task sharing and collaboration
- [ ] Subtasks and nested tasks
- [ ] Task templates
- [ ] Email notifications for due tasks
- [ ] Browser notifications
- [ ] Task comments and notes
- [ ] File attachments
- [ ] Calendar view
- [ ] Team workspaces
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Test thoroughly before submitting PR
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Isiri-gallage](https://github.com/Isiri-gallage)
- LinkedIn: [Isiri Gallage](www.linkedin.com/in/isiri-gallage)
- Email: isirigallage2002@gmail.com

---


## 📊 Project Stats

- **Lines of Code:** ~2,500+
- **Components:** 9
- **Features:** 15+
- **Development Time:** 6-8 hours
- **Last Updated:** November 2025

---

## 💡 Lessons Learned

Building this project taught me:
- Full-stack application architecture
- Firebase integration and real-time databases
- React hooks and state management
- User authentication and security
- Modern UI/UX principles
- Production deployment workflows

---


<p align="center">
  Made by Isiri Gallage
</p>

