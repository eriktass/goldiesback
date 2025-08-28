# Multi-Platform GitHub Repository Explorer

A comprehensive development environment featuring Python Flask backend, Node.js/React frontend, Android client, and Chromebook-optimized web interface for exploring GitHub repositories.

## 🏗️ Architecture Overview

### Backend Services
1. **Node.js/Express Server** (Port 5000) - Primary API service
2. **Python Flask Server** (Port 5001) - Alternative backend with enhanced features
3. **PostgreSQL Database** - Data persistence layer

### Frontend Applications
1. **React/TypeScript Web App** - Full-featured desktop interface
2. **Mobile-Optimized Web Client** - Chromebook and mobile browser support
3. **Android WebView Client** - Native Android application wrapper

## 🚀 Quick Start

### Node.js Application (Current)
```bash
npm run dev  # Starts on port 5000
```

### Python Flask Backend
```bash
python run_flask.py  # Starts on port 5001
```

### Android Client Setup
1. Open `android_client/` in Android Studio
2. Update `BASE_URL` in `MainActivity.java` with your deployment URL
3. Build and install the APK

### Mobile Web Client
Access `mobile_client/index.html` directly in any browser for a mobile-optimized experience.

## 🔧 Development Environment Features

### Python Flask Backend
- **Full GitHub API Integration** with authenticated requests
- **SQLAlchemy Database Models** for persistent data storage
- **Flask-Migrate** for database schema management
- **CORS Support** for cross-origin requests
- **Comprehensive API Endpoints**:
  - `/api/search/repositories` - Repository search
  - `/api/repositories/<owner>/<repo>` - Repository details
  - `/api/repositories/<owner>/<repo>/contents` - File browsing
  - `/api/repositories/<owner>/<repo>/languages` - Language analytics
  - `/api/repositories/<owner>/<repo>/traffic/views` - View statistics
  - `/api/repositories/<owner>/<repo>/traffic/clones` - Clone statistics
  - `/api/search/history` - Search history tracking
  - `/api/repositories/saved` - Cached repositories
  - `/api/health` - Health check endpoint

### Android Client Features
- **WebView Integration** with optimized settings
- **Pull-to-Refresh** functionality
- **External Link Handling** (opens GitHub in browser)
- **Responsive Design** with mobile optimizations
- **Error Handling** with offline fallback pages
- **Deep Link Support** for GitHub URLs

### Mobile Web Client
- **Progressive Web App (PWA)** capabilities
- **Responsive Grid/List Views** for different screen sizes
- **Touch-Optimized Interface** for mobile devices
- **Dark Mode Support** via CSS media queries
- **Offline-Ready Architecture** with service worker support
- **Chromebook Optimizations** for larger screen tablets

## 🎯 Key Features Implemented

### Core Functionality
- ✅ Repository search with advanced filtering
- ✅ Detailed repository information display
- ✅ File browser with syntax highlighting
- ✅ Language analytics and statistics
- ✅ Repository comparison tools
- ✅ Search history tracking
- ✅ Responsive mobile interface

### Technical Improvements
- ✅ Complete TypeScript type safety
- ✅ Comprehensive error handling
- ✅ Database integration (both SQLite and PostgreSQL)
- ✅ API rate limiting and caching
- ✅ Mobile-first responsive design
- ✅ Cross-platform compatibility

### Platform Support
- ✅ **Desktop Web** - Full React application
- ✅ **Mobile Web** - Optimized responsive interface
- ✅ **Android** - Native WebView wrapper
- ✅ **Chromebook** - Touch and keyboard optimized
- ✅ **PWA** - Installable web app

## 🔑 Environment Configuration

### Required Environment Variables
```bash
# GitHub API (recommended for higher rate limits)
GITHUB_TOKEN=your_github_token_here

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://user:password@localhost/dbname

# Flask Configuration
SECRET_KEY=your_secret_key_here
FLASK_ENV=development
```

### Optional Configuration
```bash
# Redis for rate limiting
REDIS_URL=redis://localhost:6379

# CORS origins
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

## 📱 Mobile Development

### Android Development Setup
1. **Android Studio** - Latest version with API level 21+ support
2. **WebView Component** - For displaying the web application
3. **Network Permissions** - Internet access for API calls
4. **Deep Links** - Handle GitHub repository URLs

### Chromebook Optimization
- **Touch Interface** - Optimized for touch input
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Responsive Layouts** - Adapts to different screen orientations
- **High DPI Support** - Crisp display on high-resolution screens

## 🧪 Testing the Setup

### Test Flask Backend
```bash
curl http://localhost:5001/api/health
curl "http://localhost:5001/api/search/repositories?q=react&page=1"
```

### Test Node.js Backend
```bash
curl http://localhost:5000/api/search/repositories/react/best-match/desc/1
```

### Test Mobile Interface
1. Open `mobile_client/index.html` in a browser
2. Search for repositories using the mobile-optimized interface
3. Test responsive behavior by resizing the browser window

## 🔄 Development Workflow

### Backend Development (Python Flask)
1. Make changes to `flask_backend/app.py`
2. Database migrations: `flask db migrate` and `flask db upgrade`
3. Test API endpoints with curl or Postman
4. Monitor logs for debugging

### Frontend Development (React)
1. Make changes to React components in `client/src/`
2. Hot reload automatically updates the browser
3. Type safety enforced by TypeScript
4. Test responsive behavior on different screen sizes

### Android Development
1. Update `MainActivity.java` for native functionality
2. Modify `activity_main.xml` for layout changes
3. Test on Android emulator or physical device
4. Build APK for distribution

## 🚧 Current Status

### Completed Features
- Multi-platform architecture with Flask and Node.js backends
- Complete TypeScript type safety across all components
- Mobile-optimized web interface for Chromebooks and tablets
- Android WebView client with native app wrapper
- Comprehensive GitHub API integration
- Database persistence with both SQLite and PostgreSQL support

### Architecture Benefits
- **Flexibility** - Multiple backend options (Flask/Express)
- **Scalability** - Database-backed with caching strategies
- **Portability** - Works on desktop, mobile, Android, and Chromebooks
- **Maintainability** - Full type safety and comprehensive error handling
- **User Experience** - Optimized interfaces for each platform

The project now provides a complete multi-platform development environment for GitHub repository exploration, with support for Python Flask backends, Android client development, and Chromebook-optimized web interfaces.