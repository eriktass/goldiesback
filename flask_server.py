#!/usr/bin/env python3
"""
Simple Flask Backend Server for Android and Chromebook Clients
Optimized for GitHub Repository exploration
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for Android and Chromebook clients

# GitHub API configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
GITHUB_API_BASE = 'https://api.github.com'

def make_github_request(endpoint, params=None):
    """Make request to GitHub API with optional authentication"""
    headers = {'User-Agent': 'GitHub-Explorer/1.0'}
    if GITHUB_TOKEN:
        headers['Authorization'] = f'token {GITHUB_TOKEN}'
    
    url = f"{GITHUB_API_BASE}/{endpoint.lstrip('/')}"
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"GitHub API request failed: {str(e)}")
        return None

@app.route('/api/health')
def health_check():
    """Health check endpoint for Android and Chromebook clients"""
    return jsonify({
        'status': 'healthy',
        'server': 'Flask Python Backend',
        'timestamp': datetime.utcnow().isoformat(),
        'github_token_configured': bool(GITHUB_TOKEN),
        'platform_support': ['Android', 'Chromebook', 'Mobile Web']
    })

@app.route('/api/search/repositories')
def search_repositories():
    """Search GitHub repositories - optimized for mobile clients"""
    query = request.args.get('q', '')
    sort = request.args.get('sort', 'best-match')
    order = request.args.get('order', 'desc')
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 30)), 50)  # Limit for mobile
    
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    # Build GitHub search parameters
    params = {
        'q': query,
        'page': page,
        'per_page': per_page
    }
    
    if sort != 'best-match':
        params['sort'] = sort
        params['order'] = order
    
    # Make request to GitHub API
    data = make_github_request('search/repositories', params)
    
    if not data:
        return jsonify({
            'error': 'Failed to fetch from GitHub API',
            'message': 'Please check your connection or try again later'
        }), 500
    
    # Format response for mobile clients
    repositories = []
    for item in data.get('items', []):
        repo = {
            'id': item.get('id'),
            'name': item.get('name'),
            'full_name': item.get('full_name'),
            'description': item.get('description'),
            'html_url': item.get('html_url'),
            'clone_url': item.get('clone_url'),
            'language': item.get('language'),
            'stargazers_count': item.get('stargazers_count', 0),
            'forks_count': item.get('forks_count', 0),
            'watchers_count': item.get('watchers_count', 0),
            'open_issues_count': item.get('open_issues_count', 0),
            'topics': item.get('topics', []),
            'owner': {
                'login': item.get('owner', {}).get('login', ''),
                'avatar_url': item.get('owner', {}).get('avatar_url', '')
            },
            'created_at': item.get('created_at'),
            'updated_at': item.get('updated_at'),
            'pushed_at': item.get('pushed_at'),
            'private': item.get('private', False),
            'fork': item.get('fork', False),
            'archived': item.get('archived', False),
            'size': item.get('size', 0)
        }
        repositories.append(repo)
    
    return jsonify({
        'total_count': data.get('total_count', 0),
        'incomplete_results': data.get('incomplete_results', False),
        'repositories': repositories
    })

@app.route('/api/repositories/<owner>/<repo>')
def get_repository(owner, repo):
    """Get detailed repository information"""
    data = make_github_request(f'repos/{owner}/{repo}')
    
    if not data:
        return jsonify({'error': 'Repository not found'}), 404
    
    # Format repository data for mobile clients
    repository = {
        'id': data.get('id'),
        'name': data.get('name'),
        'full_name': data.get('full_name'),
        'description': data.get('description'),
        'html_url': data.get('html_url'),
        'clone_url': data.get('clone_url'),
        'ssh_url': data.get('ssh_url'),
        'language': data.get('language'),
        'stargazers_count': data.get('stargazers_count', 0),
        'forks_count': data.get('forks_count', 0),
        'watchers_count': data.get('watchers_count', 0),
        'open_issues_count': data.get('open_issues_count', 0),
        'default_branch': data.get('default_branch', 'main'),
        'topics': data.get('topics', []),
        'owner': {
            'login': data.get('owner', {}).get('login', ''),
            'avatar_url': data.get('owner', {}).get('avatar_url', '')
        },
        'created_at': data.get('created_at'),
        'updated_at': data.get('updated_at'),
        'pushed_at': data.get('pushed_at'),
        'private': data.get('private', False),
        'fork': data.get('fork', False),
        'archived': data.get('archived', False),
        'disabled': data.get('disabled', False),
        'size': data.get('size', 0),
        'license': data.get('license')
    }
    
    return jsonify(repository)

@app.route('/api/repositories/<owner>/<repo>/languages')
def get_repository_languages(owner, repo):
    """Get repository programming languages"""
    data = make_github_request(f'repos/{owner}/{repo}/languages')
    
    if not data:
        return jsonify({'error': 'Languages data not found'}), 404
    
    return jsonify(data)

@app.route('/api/repositories/<owner>/<repo>/contents')
@app.route('/api/repositories/<owner>/<repo>/contents/<path:path>')
def get_repository_contents(owner, repo, path=''):
    """Get repository file contents"""
    endpoint = f'repos/{owner}/{repo}/contents/{path}' if path else f'repos/{owner}/{repo}/contents'
    data = make_github_request(endpoint)
    
    if not data:
        return jsonify({'error': 'Contents not found'}), 404
    
    return jsonify(data)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask Backend Server")
    print("📱 Supporting Android and Chromebook clients")
    print("🌐 Server URL: http://0.0.0.0:5001")
    print("🔍 Search API: http://0.0.0.0:5001/api/search/repositories?q=react")
    print("❤️  Health Check: http://0.0.0.0:5001/api/health")
    
    if not GITHUB_TOKEN:
        print("⚠️  Warning: GITHUB_TOKEN not set - API rate limits will apply")
        print("💡 Set GITHUB_TOKEN environment variable for higher rate limits")
    
    app.run(host='0.0.0.0', port=5001, debug=True)