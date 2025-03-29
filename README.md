# What's in the Trend

A web application that helps users discover trending topics based on their interests. The app fetches trend data from a local SQLite database.

## Project Structure

- `frontend/`: React.js frontend application
- `backend/`: Node.js backend API

## Setup and Installation

### Windows Instructions

1. Install dependencies for backend:
   ```
   cd backend
   npm install
   ```

2. Install dependencies for frontend:
   ```
   cd frontend
   npm install
   ```

3. Start the backend server (in one terminal):
   ```
   cd backend
   npm run dev
   ```
   
   The server will start on http://localhost:5000

4. Start the frontend development server (in another terminal):
   ```
   cd frontend
   npm start
   ```
   
   The application will open in your browser at http://localhost:3000

## Features

- Search for trending topics using keywords (pre-populated demo data available)
- View recent search history
- Display trending articles with relevance scores
- Modern, responsive UI
- Local SQLite database with pre-populated sample data

## Demo Data

The application comes with pre-populated demo data for the following keywords:

- **AI** - Artificial Intelligence trends and research
- **Bitcoin** - Cryptocurrency market and regulation news
- **Technology** - General tech news including antitrust and quantum computing
- **Climate** - Climate change and green energy news
- **Movies** - Film industry and entertainment news
- **Health** - Medical research and health awareness articles

Simply search for any of these keywords to see relevant trend results.

## API Endpoints

- `GET /api/trends?keyword=<search_term>`: Get trending topics based on the provided keyword
- `POST /api/trends`: Add a new trend to the database (for testing/development)
- `POST /api/reset`: Reset the database with fresh demo data

## Technologies Used

- **Frontend**: React.js, CSS
- **Backend**: Node.js, Express
- **Database**: SQLite
- **NLP**: Natural (node.js NLP library)

## Future Enhancements

- Integration with external APIs like News API (code commented out for now)
- Social media integration for real-time trends
- User accounts and personalized recommendations

## License

© 2023 What's in the Trend. All rights reserved. 