#!/usr/bin/env python3
import os
import sys
from flask_backend.app import app

if __name__ == '__main__':
    print("Starting Flask backend server for Android and Chromebook clients...")
    print("Server will be available at: http://0.0.0.0:5001")
    print("Health check: http://0.0.0.0:5001/api/health")
    
    # Initialize database
    with app.app_context():
        from flask_backend.app import db
        db.create_all()
        print("Database initialized successfully")
    
    # Start server
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        use_reloader=False  # Disable reloader for better stability
    )