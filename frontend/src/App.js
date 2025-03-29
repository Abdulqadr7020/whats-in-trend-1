// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [keyword, setKeyword] = useState('');
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const fetchTrends = async (searchTerm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/trends?keyword=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTrends(data.trends);
      
      // Update recent searches
      if (searchTerm && !recentSearches.includes(searchTerm)) {
        const updatedSearches = [searchTerm, ...recentSearches].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      fetchTrends(keyword);
    }
  };

  const handleRecentSearchClick = (searchTerm) => {
    setKeyword(searchTerm);
    fetchTrends(searchTerm);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>What's in the <span className="highlight">Trend</span></h1>
        <p className="subtitle">Discover what's trending around your interests</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-container">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a keyword (e.g., AI, Bitcoin, Movies...)"
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search Trends'}
            </button>
          </div>
        </form>

        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <p>Recent searches:</p>
            <div className="search-tags">
              {recentSearches.map((search, index) => (
                <span 
                  key={index} 
                  className="search-tag"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  {search}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="trends-container">
            {trends.map((trend, index) => (
              <div key={index} className="trend-card">
                <h3 className="trend-title">{trend.title}</h3>
                <p className="trend-source">{trend.source} • {trend.date}</p>
                <p className="trend-description">{trend.description}</p>
                <a href={trend.url} target="_blank" rel="noopener noreferrer" className="read-more">
                  Read more →
                </a>
                <div className="trend-metrics">
                  <span className="metric">🔥 {trend.engagement}</span>
                  <span className="metric">📈 {trend.trend_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} What's in the Trend. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;