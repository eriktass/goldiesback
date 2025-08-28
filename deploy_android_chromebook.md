# Android & Chromebook Deployment Guide

## Flask Python Backend Setup

### 1. Start Flask Server
```bash
python flask_server.py
```

The server runs on port 5001 with these endpoints:
- Health: `http://localhost:5001/api/health`
- Search: `http://localhost:5001/api/search/repositories?q=python`
- Repository details: `http://localhost:5001/api/repositories/owner/repo`

### 2. Test Backend API
```bash
# Test health check
curl http://localhost:5001/api/health

# Test repository search
curl "http://localhost:5001/api/search/repositories?q=flask&per_page=5"
```

## Android Client Setup

### 1. Project Structure
```
android_client/
├── MainActivity.java          # Main WebView activity
├── activity_main.xml         # Layout with WebView and refresh
├── AndroidManifest.xml       # Permissions and settings
└── build.gradle             # Dependencies and build config
```

### 2. Build Android App
1. Open `android_client/` in Android Studio
2. Update `BASE_URL` in `MainActivity.java` with your deployment URL
3. Build APK: `Build → Generate Signed Bundle/APK`
4. Install on Android device or emulator

### 3. Key Features
- **WebView Integration**: Displays the mobile web interface
- **Pull-to-Refresh**: Swipe down to reload content
- **External Links**: GitHub URLs open in external browser
- **Error Handling**: Offline fallback when network fails
- **Deep Links**: Handle GitHub repository URLs

## Chromebook Web Client

### 1. Mobile-Optimized Interface
The `mobile_client/index.html` provides:
- **Responsive Design**: Adapts to different screen sizes
- **Touch Optimized**: Large buttons and touch targets
- **Keyboard Navigation**: Full keyboard support for Chromebooks
- **Dark Mode**: Automatic dark/light mode switching
- **PWA Support**: Can be installed as a web app

### 2. Deploy to Chromebook
1. Copy `mobile_client/index.html` to web server
2. Update API_BASE URL to point to Flask backend
3. Access via Chrome browser on Chromebook
4. Install as PWA: `Chrome Menu → Install App`

## Deployment to Replit

### 1. Flask Backend Deployment
```python
# In flask_server.py, the server is configured for production:
app.run(host='0.0.0.0', port=5001, debug=True)
```

### 2. Environment Variables
Set these in Replit Secrets:
```
GITHUB_TOKEN=your_github_personal_access_token
```

### 3. Public URLs
- Main app: `https://your-repl-name.replit.app`
- Flask API: `https://your-repl-name.replit.app:5001/api`

## Testing the Complete Setup

### 1. Backend Health Check
```python
python -c "
from flask_server import app
with app.test_client() as client:
    response = client.get('/api/health')
    print('Status:', response.status_code, response.get_json())
"
```

### 2. Search Functionality
```python
python -c "
from flask_server import app
with app.test_client() as client:
    response = client.get('/api/search/repositories?q=android&per_page=3')
    data = response.get_json()
    print('Found', len(data['repositories']), 'Android repositories')
"
```

### 3. Mobile Interface Test
1. Open `mobile_client/index.html` in browser
2. Search for repositories
3. Test responsive behavior
4. Verify touch interactions work properly

## Production Considerations

### 1. Security
- Set proper CORS origins for production
- Use environment variables for API keys
- Enable HTTPS for production deployment

### 2. Performance
- Implement caching for GitHub API responses
- Optimize images and assets for mobile
- Use CDN for static assets

### 3. Mobile Optimization
- Implement service worker for offline support
- Add touch gestures and haptic feedback
- Optimize for different screen densities

## Troubleshooting

### Common Issues
1. **CORS errors**: Check Flask CORS configuration
2. **API rate limits**: Set GITHUB_TOKEN environment variable
3. **Network timeouts**: Implement retry logic
4. **Android WebView issues**: Check minimum SDK version

### Debug Commands
```bash
# Check Flask server logs
python flask_server.py

# Test API endpoints
curl -v http://localhost:5001/api/health

# Check Android logs
adb logcat | grep WebView
```

The setup provides a complete development environment for Android and Chromebook clients with a robust Python Flask backend.