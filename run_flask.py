#!/usr/bin/env python3
"""
Flask Backend Runner for GitHub Repository Explorer
Compatible with Chromebooks and Android clients
"""

import os
import sys
sys.path.append('flask_backend')

from flask_backend.app import app

if __name__ == '__main__':
    # Set environment variables for development
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('FLASK_DEBUG', '1')
    
    print("🚀 Starting Flask backend server...")
    print("📱 Compatible with Android WebView and Chromebook browsers")
    print("🔗 API endpoints available at: http://0.0.0.0:5001/api/")
    print("💡 Set GITHUB_TOKEN environment variable for API access")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        use_reloader=True
    )