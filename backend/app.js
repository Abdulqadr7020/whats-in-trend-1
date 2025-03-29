require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const natural = require('natural');
const { TfIdf } = natural;


const app = express();
app.use(cors());
app.use(express.json());

// Database initialization with sample data
function initDb() {
  const dbPath = path.join(__dirname, 'trends.db');
  
  // Delete the database file if it exists to force recreation
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log('Existing database deleted for fresh initialization');
    } catch (err) {
      console.error('Error deleting existing database:', err);
    }
  }
  
  const db = new sqlite3.Database(dbPath);
  
  // Add our sample data regardless
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT,
      title TEXT,
      description TEXT,
      url TEXT,
      source TEXT,
      date TEXT,
      engagement INTEGER,
      trend_score REAL
    )`);
    
    // Always insert sample data to ensure it's in the database
    const sampleData = [
      // AI sample data
      {
        keyword: 'AI',
        title: 'The Future of AI in 2023',
        description: 'Artificial Intelligence is evolving rapidly with new breakthroughs in machine learning and neural networks.',
        url: 'https://example.com/ai-future',
        source: 'Tech Today',
        date: '2023-03-15T14:30:00Z',
        engagement: 1200,
        trend_score: 4.8
      },
      {
        keyword: 'AI',
        title: 'How AI is Transforming Healthcare',
        description: 'AI applications in healthcare are revolutionizing diagnostics, treatment plans, and patient care.',
        url: 'https://example.com/ai-healthcare',
        source: 'Health Tech',
        date: '2023-03-10T09:15:00Z',
        engagement: 980,
        trend_score: 4.5
      },
      {
        keyword: 'AI',
        title: 'Ethical Concerns in AI Development',
        description: 'As AI becomes more advanced, experts raise concerns about ethics, bias, and accountability.',
        url: 'https://example.com/ai-ethics',
        source: 'Tech Ethics',
        date: '2023-03-08T16:45:00Z',
        engagement: 850,
        trend_score: 4.2
      },
      {
        keyword: 'AI',
        title: 'AI in Business: Automation and Analytics',
        description: 'Companies are leveraging AI to automate processes and gain deeper insights from data analytics.',
        url: 'https://example.com/ai-business',
        source: 'Business Insider',
        date: '2023-03-12T11:20:00Z',
        engagement: 720,
        trend_score: 3.9
      },
      {
        keyword: 'AI',
        title: 'The Latest Developments in AI Research',
        description: 'Research institutions worldwide are pushing the boundaries of what AI can accomplish.',
        url: 'https://example.com/ai-research',
        source: 'Science Daily',
        date: '2023-03-14T10:30:00Z',
        engagement: 650,
        trend_score: 3.7
      },
      
      // Bitcoin sample data
      {
        keyword: 'Bitcoin',
        title: 'Bitcoin Surges Past $60,000 Again',
        description: 'The cryptocurrency market sees a major rally as Bitcoin reaches new heights following institutional adoption.',
        url: 'https://example.com/bitcoin-surge',
        source: 'Crypto News',
        date: '2023-03-18T08:45:00Z',
        engagement: 1500,
        trend_score: 4.9
      },
      {
        keyword: 'Bitcoin',
        title: 'Regulatory Challenges for Bitcoin in 2023',
        description: 'Governments worldwide are scrambling to create new regulations for cryptocurrencies as Bitcoin adoption grows.',
        url: 'https://example.com/bitcoin-regulation',
        source: 'Financial Times',
        date: '2023-03-14T12:30:00Z',
        engagement: 920,
        trend_score: 4.3
      },
      {
        keyword: 'Bitcoin',
        title: 'Bitcoin Mining and Environmental Concerns',
        description: 'Environmental activists raise concerns about the energy consumption of Bitcoin mining operations.',
        url: 'https://example.com/bitcoin-environment',
        source: 'Green Tech',
        date: '2023-03-12T15:20:00Z',
        engagement: 780,
        trend_score: 4.0
      },
      
      // Technology sample data
      {
        keyword: 'Technology',
        title: 'Tech Giants Face New Antitrust Regulations',
        description: 'Major technology companies are under scrutiny as new antitrust laws are being proposed.',
        url: 'https://example.com/tech-antitrust',
        source: 'Tech Policy',
        date: '2023-03-17T10:15:00Z',
        engagement: 1050,
        trend_score: 4.6
      },
      {
        keyword: 'Technology',
        title: 'The Rise of Quantum Computing',
        description: 'Quantum computing advancements are accelerating, promising to revolutionize cryptography and complex problem-solving.',
        url: 'https://example.com/quantum-computing',
        source: 'Science Tech',
        date: '2023-03-15T09:30:00Z',
        engagement: 890,
        trend_score: 4.4
      },
      
      // Climate sample data
      {
        keyword: 'Climate',
        title: 'New Climate Change Report Shows Alarming Trends',
        description: 'Scientists publish comprehensive data on accelerating climate change impacts around the world.',
        url: 'https://example.com/climate-report',
        source: 'Environmental News',
        date: '2023-03-16T14:10:00Z',
        engagement: 1350,
        trend_score: 4.7
      },
      {
        keyword: 'Climate',
        title: 'Green Energy Investments Reach Record High',
        description: 'Global investments in renewable energy sources have reached unprecedented levels as countries commit to climate goals.',
        url: 'https://example.com/green-energy',
        source: 'Clean Energy Today',
        date: '2023-03-13T11:45:00Z',
        engagement: 920,
        trend_score: 4.3
      },
      
      // Movies sample data
      {
        keyword: 'Movies',
        title: 'Summer Blockbusters Expected to Break Box Office Records',
        description: 'Hollywood prepares for a record-breaking summer season with highly anticipated franchise releases.',
        url: 'https://example.com/summer-movies',
        source: 'Entertainment Weekly',
        date: '2023-03-18T16:30:00Z',
        engagement: 880,
        trend_score: 4.2
      },
      {
        keyword: 'Movies',
        title: 'Streaming Services Changing Film Distribution Models',
        description: 'Major studios are rethinking their distribution strategies as streaming platforms gain more influence.',
        url: 'https://example.com/streaming-movies',
        source: 'Film Industry News',
        date: '2023-03-15T13:20:00Z',
        engagement: 750,
        trend_score: 3.8
      },
      
      // Health sample data
      {
        keyword: 'Health',
        title: 'New Breakthrough in Cancer Research',
        description: 'Scientists discover promising new treatment approach for aggressive cancer types with fewer side effects.',
        url: 'https://example.com/cancer-research',
        source: 'Medical Journal',
        date: '2023-03-17T09:20:00Z',
        engagement: 1100,
        trend_score: 4.6
      },
      {
        keyword: 'Health',
        title: 'Mental Health Awareness Grows Worldwide',
        description: 'Global initiatives promote mental health awareness and reduce stigma around seeking treatment.',
        url: 'https://example.com/mental-health',
        source: 'Health Daily',
        date: '2023-03-14T15:40:00Z',
        engagement: 950,
        trend_score: 4.4
      }
    ];
    
    const stmt = db.prepare(`INSERT INTO trends 
      (keyword, title, description, url, source, date, engagement, trend_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      
    sampleData.forEach(item => {
      stmt.run(
        item.keyword,
        item.title,
        item.description,
        item.url,
        item.source,
        item.date,
        item.engagement,
        item.trend_score
      );
    });
    
    stmt.finalize();
    console.log('Sample data inserted into the database');
  });
  
  return db;
}

const db = initDb();

// News API configuration (commented out for now)
// const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your_news_api_key_here';
// const NEWS_API_URL = 'https://newsapi.org/v2/everything';

/**
 * Get trends from the database
 * @param {string} keyword - The search keyword
 * @returns {Promise<Array>} - Array of trends
 */
async function getTrendsFromDb(keyword) {
  return new Promise((resolve, reject) => {
    console.log(`Searching for keyword: "${keyword}"`);
    
    db.all(
      `SELECT * FROM trends WHERE LOWER(keyword) = LOWER(?) OR 
       LOWER(title) LIKE LOWER(?) OR 
       LOWER(description) LIKE LOWER(?)
       ORDER BY trend_score DESC`,
      [keyword, `%${keyword}%`, `%${keyword}%`],
      (err, rows) => {
        if (err) {
          console.error(`Error fetching trends: ${err.message}`);
          reject(err);
        } else {
          console.log(`Found ${rows?.length || 0} results for "${keyword}"`);
          resolve(rows || []);
        }
      }
    );
  });
}

/**
 * Calculate trend scores based on keyword relevance using TF-IDF
 * @param {Array} articles - Array of news articles
 * @param {string} keyword - The search keyword
 * @returns {Array} - Articles with calculated trend scores
 */
function calculateTrendScores(articles, keyword) {
  if (!articles || articles.length === 0) {
    return articles;
  }
  
  // Create TF-IDF instance
  const tfidf = new TfIdf();
  
  // Add all article texts to the corpus
  articles.forEach((article, i) => {
    const text = `${article.title} ${article.description}`;
    tfidf.addDocument(text);
  });
  
  // Calculate similarity scores
  articles.forEach((article, i) => {
    let score = 0;
    tfidf.tfidfs(keyword, (j, measure) => {
      if (i === j) {
        score = measure;
      }
    });
    
    // Normalize score to 0-5 scale
    article.trend_score = parseFloat((Math.min(score, 10) / 2).toFixed(1));
  });
  
  // Sort by trend score
  return articles.sort((a, b) => b.trend_score - a.trend_score);
}

// API endpoint
app.get('/api/trends', async (req, res) => {
  const keyword = req.query.keyword?.trim();
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }
  
  try {
    // Get trends from the database instead of fetching from API
    const trends = await getTrendsFromDb(keyword);
    
    // If no results found, return empty array with a message
    if (trends.length === 0) {
      return res.json({
        keyword,
        trends: [],
        message: 'No trends found for this keyword'
      });
    }
    
    return res.json({
      keyword,
      trends
    });
  } catch (error) {
    console.error(`Error processing trends: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to add a new trend (for testing)
app.post('/api/trends', (req, res) => {
  const { keyword, title, description, url, source, date, engagement, trend_score } = req.body;
  
  if (!keyword || !title) {
    return res.status(400).json({ error: 'Keyword and title are required' });
  }
  
  const stmt = db.prepare(`INSERT INTO trends 
    (keyword, title, description, url, source, date, engagement, trend_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    
  stmt.run(
    keyword,
    title,
    description || '',
    url || '',
    source || 'Unknown',
    date || new Date().toISOString(),
    engagement || 0,
    trend_score || 3.0,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        id: this.lastID,
        message: 'Trend added successfully'
      });
    }
  );
  
  stmt.finalize();
});

// Reset endpoint - clears database and reloads demo data
app.post('/api/reset', (req, res) => {
  try {
    // Delete all records from the trends table
    db.run('DELETE FROM trends', (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Sample data to reload
      const sampleData = [
        // AI sample data
        {
          keyword: 'AI',
          title: 'The Future of AI in 2023',
          description: 'Artificial Intelligence is evolving rapidly with new breakthroughs in machine learning and neural networks.',
          url: 'https://example.com/ai-future',
          source: 'Tech Today',
          date: '2023-03-15T14:30:00Z',
          engagement: 1200,
          trend_score: 4.8
        },
        // ... include all the other sample data items here ...
        {
          keyword: 'Health',
          title: 'Mental Health Awareness Grows Worldwide',
          description: 'Global initiatives promote mental health awareness and reduce stigma around seeking treatment.',
          url: 'https://example.com/mental-health',
          source: 'Health Daily',
          date: '2023-03-14T15:40:00Z',
          engagement: 950,
          trend_score: 4.4
        }
      ];
      
      const stmt = db.prepare(`INSERT INTO trends 
        (keyword, title, description, url, source, date, engagement, trend_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        
      sampleData.forEach(item => {
        stmt.run(
          item.keyword,
          item.title,
          item.description,
          item.url,
          item.source,
          item.date,
          item.engagement,
          item.trend_score
        );
      });
      
      stmt.finalize();
      
      res.json({
        message: 'Database reset successfully with demo data'
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to see what's in the database
app.get('/api/debug/trends', (req, res) => {
  db.all('SELECT * FROM trends', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Group by keyword for better visualization
    const groupedByKeyword = {};
    rows.forEach(row => {
      if (!groupedByKeyword[row.keyword]) {
        groupedByKeyword[row.keyword] = [];
      }
      groupedByKeyword[row.keyword].push(row);
    });
    
    res.json({
      total: rows.length,
      keywords: Object.keys(groupedByKeyword),
      data: groupedByKeyword
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 