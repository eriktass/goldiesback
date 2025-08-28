from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)

# GitHub API configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
GITHUB_API_BASE = 'https://api.github.com'

# Database Models
class Repository(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.Integer, unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    html_url = db.Column(db.String(500), nullable=False)
    clone_url = db.Column(db.String(500), nullable=False)
    ssh_url = db.Column(db.String(500), nullable=False)
    language = db.Column(db.String(100))
    stars_count = db.Column(db.Integer, default=0)
    forks_count = db.Column(db.Integer, default=0)
    watchers_count = db.Column(db.Integer, default=0)
    open_issues_count = db.Column(db.Integer, default=0)
    default_branch = db.Column(db.String(100), default='main')
    topics = db.Column(db.JSON)
    owner_login = db.Column(db.String(255), nullable=False)
    owner_avatar_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    pushed_at = db.Column(db.DateTime)
    is_private = db.Column(db.Boolean, default=False)
    is_fork = db.Column(db.Boolean, default=False)
    archived = db.Column(db.Boolean, default=False)
    disabled = db.Column(db.Boolean, default=False)
    size = db.Column(db.Integer, default=0)
    license_name = db.Column(db.String(100))
    license_spdx_id = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.github_id,
            'name': self.name,
            'full_name': self.full_name,
            'description': self.description,
            'html_url': self.html_url,
            'clone_url': self.clone_url,
            'ssh_url': self.ssh_url,
            'language': self.language,
            'stargazers_count': self.stars_count,
            'forks_count': self.forks_count,
            'watchers_count': self.watchers_count,
            'open_issues_count': self.open_issues_count,
            'default_branch': self.default_branch,
            'topics': self.topics or [],
            'owner': {
                'login': self.owner_login,
                'avatar_url': self.owner_avatar_url
            },
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'pushed_at': self.pushed_at.isoformat() if self.pushed_at else None,
            'private': self.is_private,
            'fork': self.is_fork,
            'archived': self.archived,
            'disabled': self.disabled,
            'size': self.size,
            'license': {
                'name': self.license_name,
                'spdx_id': self.license_spdx_id
            } if self.license_name else None
        }

class SearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(500), nullable=False)
    results_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper functions
def make_github_request(endpoint, params=None):
    """Make authenticated request to GitHub API"""
    headers = {}
    if GITHUB_TOKEN:
        headers['Authorization'] = f'token {GITHUB_TOKEN}'
    
    url = f"{GITHUB_API_BASE}/{endpoint.lstrip('/')}"
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        app.logger.error(f"GitHub API request failed: {str(e)}")
        return None

def save_repository_to_db(repo_data):
    """Save or update repository data in database"""
    repo = Repository.query.filter_by(github_id=repo_data['id']).first()
    
    if not repo:
        repo = Repository(github_id=repo_data['id'])
    
    # Update repository fields
    repo.name = repo_data.get('name', '')
    repo.full_name = repo_data.get('full_name', '')
    repo.description = repo_data.get('description', '')
    repo.html_url = repo_data.get('html_url', '')
    repo.clone_url = repo_data.get('clone_url', '')
    repo.ssh_url = repo_data.get('ssh_url', '')
    repo.language = repo_data.get('language')
    repo.stars_count = repo_data.get('stargazers_count', 0)
    repo.forks_count = repo_data.get('forks_count', 0)
    repo.watchers_count = repo_data.get('watchers_count', 0)
    repo.open_issues_count = repo_data.get('open_issues_count', 0)
    repo.default_branch = repo_data.get('default_branch', 'main')
    repo.topics = repo_data.get('topics', [])
    repo.owner_login = repo_data.get('owner', {}).get('login', '')
    repo.owner_avatar_url = repo_data.get('owner', {}).get('avatar_url', '')
    repo.is_private = repo_data.get('private', False)
    repo.is_fork = repo_data.get('fork', False)
    repo.archived = repo_data.get('archived', False)
    repo.disabled = repo_data.get('disabled', False)
    repo.size = repo_data.get('size', 0)
    
    # Handle dates
    if repo_data.get('created_at'):
        repo.created_at = datetime.fromisoformat(repo_data['created_at'].replace('Z', '+00:00'))
    if repo_data.get('updated_at'):
        repo.updated_at = datetime.fromisoformat(repo_data['updated_at'].replace('Z', '+00:00'))
    if repo_data.get('pushed_at'):
        repo.pushed_at = datetime.fromisoformat(repo_data['pushed_at'].replace('Z', '+00:00'))
    
    # Handle license
    if repo_data.get('license'):
        repo.license_name = repo_data['license'].get('name')
        repo.license_spdx_id = repo_data['license'].get('spdx_id')
    
    db.session.add(repo)
    return repo

# API Routes
@app.route('/api/search/repositories')
def search_repositories():
    query = request.args.get('q', '')
    sort = request.args.get('sort', 'best-match')
    order = request.args.get('order', 'desc')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 30))
    
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    # Search GitHub API
    params = {
        'q': query,
        'sort': sort if sort != 'best-match' else None,
        'order': order,
        'page': page,
        'per_page': per_page
    }
    
    data = make_github_request('search/repositories', params)
    
    if not data:
        return jsonify({'error': 'Failed to fetch from GitHub API'}), 500
    
    # Save search history
    search_record = SearchHistory(
        query=query,
        results_count=data.get('total_count', 0)
    )
    db.session.add(search_record)
    
    # Save repositories to database
    repositories = []
    for item in data.get('items', []):
        repo = save_repository_to_db(item)
        repositories.append(repo.to_dict())
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Database error: {str(e)}")
    
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
    
    # Save to database
    repository = save_repository_to_db(data)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Database error: {str(e)}")
    
    return jsonify(repository.to_dict())

@app.route('/api/repositories/<owner>/<repo>/contents')
@app.route('/api/repositories/<owner>/<repo>/contents/<path:path>')
def get_repository_contents(owner, repo, path=''):
    """Get repository file contents"""
    endpoint = f'repos/{owner}/{repo}/contents/{path}' if path else f'repos/{owner}/{repo}/contents'
    data = make_github_request(endpoint)
    
    if not data:
        return jsonify({'error': 'Contents not found'}), 404
    
    return jsonify(data)

@app.route('/api/repositories/<owner>/<repo>/languages')
def get_repository_languages(owner, repo):
    """Get repository programming languages"""
    data = make_github_request(f'repos/{owner}/{repo}/languages')
    
    if not data:
        return jsonify({'error': 'Languages data not found'}), 404
    
    return jsonify(data)

@app.route('/api/repositories/<owner>/<repo>/traffic/views')
def get_repository_views(owner, repo):
    """Get repository view traffic"""
    data = make_github_request(f'repos/{owner}/{repo}/traffic/views')
    
    if not data:
        return jsonify({'error': 'Traffic data not available'}), 404
    
    return jsonify(data)

@app.route('/api/repositories/<owner>/<repo>/traffic/clones')
def get_repository_clones(owner, repo):
    """Get repository clone traffic"""
    data = make_github_request(f'repos/{owner}/{repo}/traffic/clones')
    
    if not data:
        return jsonify({'error': 'Traffic data not available'}), 404
    
    return jsonify(data)

@app.route('/api/search/history')
def get_search_history():
    """Get recent search history"""
    searches = SearchHistory.query.order_by(SearchHistory.created_at.desc()).limit(20).all()
    
    return jsonify([{
        'id': search.id,
        'query': search.query,
        'results_count': search.results_count,
        'created_at': search.created_at.isoformat()
    } for search in searches])

@app.route('/api/repositories/saved')
def get_saved_repositories():
    """Get repositories saved in database"""
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 30))
    language = request.args.get('language')
    
    query = Repository.query
    
    if language:
        query = query.filter(Repository.language.ilike(f'%{language}%'))
    
    repositories = query.order_by(Repository.stars_count.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'repositories': [repo.to_dict() for repo in repositories.items],
        'total': repositories.total,
        'pages': repositories.pages,
        'current_page': page
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'github_token_configured': bool(GITHUB_TOKEN)
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# CLI commands
@app.cli.command()
def init_db():
    """Initialize the database"""
    db.create_all()
    print("Database initialized!")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Run in development mode
    app.run(host='0.0.0.0', port=5001, debug=True)