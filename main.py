from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/")
def home():
    return "SuzyQ server is up."

@app.get("/health")
def health():
    return jsonify(ok=True)
