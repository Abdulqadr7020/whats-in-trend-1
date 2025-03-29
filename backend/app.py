# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from datetime import datetime
import sqlite3
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    if not os.path.exists('trends.db'):
        conn = sqlite3.connect('trends.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS trends
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      keyword TEXT,
                      title TEXT,
                      description TEXT,
                      url TEXT,
                      source TEXT,
                      date TEXT,
                      engagement INTEGER,
                      trend_score REAL)''')
        conn.commit()
        conn.close()

init_db()

# News API configuration (you would replace with your actual API key)
NEWS_API_KEY = 'your_news_api_key_here'
NEWS_API_URL = 'https://newsapi.org/v2/everything'

# Twitter API configuration (example - you would need proper API access)
TWITTER_API_URL = 'https://api.twitter.com/2/tweets/search/recent'

def fetch_news(keyword):
    """Fetch news articles related to the keyword"""
    params = {
        'q': keyword,
        'apiKey': NEWS_API_KEY,
        'pageSize': 10,
        'sortBy': 'popularity',
        'language': 'en'
    }
    
    try:
        response = requests.get(NEWS_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        articles = []
        for article in data.get('articles', []):
            articles.append({
                'title': article.get('title', ''),
                'description': article.get('description', ''),
                'url': article.get('url', ''),
                'source': article.get('source', {}).get('name', 'Unknown'),
                'date': article.get('publishedAt', ''),
                'engagement': 0,  # Placeholder - would come from social metrics
                'trend_score': 0.8  # Placeholder - would be calculated
            })
        return articles
    except requests.exceptions.RequestException as e:
        print(f"Error fetching news: {e}")
        return []

def calculate_trend_scores(articles, keyword):
    """Calculate trend scores based on keyword relevance"""
    if not articles:
        return articles
    
    # Create a list of texts to analyze
    texts = [f"{article['title']} {article['description']}" for article in articles]
    
    # Calculate TF-IDF vectors
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts)
    
    # Calculate similarity to the keyword
    keyword_vector = vectorizer.transform([keyword])
    similarities = cosine_similarity(keyword_vector, tfidf_matrix)
    
    # Update articles with trend scores
    for i, article in enumerate(articles):
        article['trend_score'] = round(similarities[0][i] * 5, 1)  # Scale to 0-5
    
    # Sort by trend score
    articles.sort(key=lambda x: x['trend_score'], reverse=True)
    
    return articles

def store_trends(keyword, trends):
    """Store trends in the database"""
    conn = sqlite3.connect('trends.db')
    c = conn.cursor()
    
    for trend in trends:
        c.execute('''INSERT INTO trends 
                     (keyword, title, description, url, source, date, engagement, trend_score)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                  (keyword, trend['title'], trend['description'], trend['url'],
                   trend['source'], trend['date'], trend['engagement'], trend['trend_score']))
    
    conn.commit()
    conn.close()

@app.route('/api/trends', methods=['GET'])
def get_trends():
    keyword = request.args.get('keyword', '').strip()
    if not keyword:
        return jsonify({'error': 'Keyword is required'}), 400
    
    # Fetch news articles
    news_articles = fetch_news(keyword)
    
    # Calculate trend scores
    trends = calculate_trend_scores(news_articles, keyword)
    
    # Store in database (optional)
    store_trends(keyword, trends)
    
    return jsonify({
        'keyword': keyword,
        'trends': trends
    })

if __name__ == '__main__':
    app.run(debug=True)