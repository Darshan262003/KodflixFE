import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import Signup from './components/Auth/Signup'
import Login from './components/Auth/Login'

function App() {
  const [movies, setMovies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('jwtToken');

  const API_KEY = '6913b556'
  const BASE_URL = 'https://www.omdbapi.com/'

  // Function to enhance image quality
  const enhanceImageQuality = (posterUrl) => {
    if (!posterUrl || posterUrl === 'N/A') return posterUrl;
    
    // Try multiple quality enhancements
    let enhancedUrl = posterUrl;
    
    // Method 1: Replace size parameters
    enhancedUrl = enhancedUrl.replace('SX300', 'SX1000')
                             .replace('SY300', 'SY1500')
                             .replace('SX300', 'SX600')
                             .replace('SX300', 'SX800');
    
    // Method 2: Remove quality limiting parameters
    enhancedUrl = enhancedUrl.replace(/(_V1_).*\.jpg/, '$1_SX1000_CR0,0,1000,1500_AL_.jpg');
    
    return enhancedUrl;
  }

  // Fetch popular movies on component mount
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true)
        // Fetch more popular movies
        const popularTitles = [
          // Featured Movie First
          'Avengers',
          
          // Classic Movies
          'The Dark Knight', 'Inception', 'Interstellar', 'The Godfather', 'Pulp Fiction',
          'Forrest Gump', 'Goodfellas', 'Fight Club', 'The Shawshank Redemption', 'Schindler\'s List',
          'Casablanca', 'The Wizard of Oz', 'Gone with the Wind', 'Lawrence of Arabia',
          
          // Modern Blockbusters
          'Titanic', 'The Matrix', 'Star Wars', 'Jurassic Park',
          'Back to the Future', 'Gladiator', 'The Lord of the Rings', 'The Hobbit',
          
          // Disney/Pixar
          'The Lion King', 'Beauty and the Beast', 'Aladdin', 'Toy Story', 'Finding Nemo',
          'The Incredibles', 'Up', 'WALL-E', 'Inside Out', 'Coco', 'Frozen', 'Moana',
          
          // Marvel Movies
          'Spider-Man', 'Iron Man', 'Black Panther', 'Captain Marvel', 'Doctor Strange',
          'Guardians of the Galaxy', 'Deadpool', 'Ant-Man', 'Thor', 'The Avengers',
          
          // Popular Recent Movies
          'Joker', 'Parasite', 'Dune', 'Top Gun', 'No Time to Die', 'The Batman',
          'Spider-Man No Way Home', 'Avengers Endgame', 'Black Widow', 'Shang-Chi'
        ]
        
        // Process movies in batches to avoid overwhelming the API
        const batchSize = 10
        let allValidMovies = []
        
        for (let i = 0; i < popularTitles.length; i += batchSize) {
          const batch = popularTitles.slice(i, i + batchSize)
          const moviePromises = batch.map(title => 
            axios.get(BASE_URL, {
              params: {
                apikey: API_KEY,
                t: title
              }
            })
          )
          
          const responses = await Promise.all(moviePromises)
          const validMovies = responses
            .map(response => {
              const movie = response.data;
              // Enhance poster quality using the dedicated function
              if (movie.Poster && movie.Poster !== 'N/A') {
                movie.Poster = enhanceImageQuality(movie.Poster);
              }
              return movie;
            })
            .filter(movie => movie.Response === 'True' && movie.Poster !== 'N/A')
          
          allValidMovies = [...allValidMovies, ...validMovies]
          
          // Update state with current movies
          setMovies(allValidMovies)
          if (allValidMovies.length > 0 && !featuredMovie) {
            setFeaturedMovie(allValidMovies[0])
          }
        }
        
        setError(null)
      } catch (err) {
        setError('Failed to fetch movies. Please try again later.')
        console.error('Error fetching movies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularMovies()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    
    try {
      setLoading(true)
      const response = await axios.get(BASE_URL, {
        params: {
          apikey: API_KEY,
          s: searchTerm
        }
      })
      
      if (response.data.Response === 'True') {
        // Fetch detailed info for search results
        const moviesToShow = response.data.Search.slice(0, 20)
        const detailedMovies = await Promise.all(
          moviesToShow.map(async (movie) => {
            const detailResponse = await axios.get(BASE_URL, {
              params: {
                apikey: API_KEY,
                i: movie.imdbID
              }
            })
            return detailResponse.data
          })
        )
        
        const validMovies = detailedMovies
          .map(movie => {
            // Enhance poster quality for search results
            if (movie.Poster && movie.Poster !== 'N/A') {
              movie.Poster = enhanceImageQuality(movie.Poster);
            }
            return movie;
          })
          .filter(movie => movie.Poster !== 'N/A')
        setMovies(validMovies)
        if (validMovies.length > 0) {
          setFeaturedMovie(validMovies[0])
        }
        setError(null)
        setPage(1)
        setHasMore(validMovies.length >= 20)
      } else {
        setError(response.data.Error || 'No movies found')
        setMovies([])
        setFeaturedMovie(null)
        setPage(1)
        setHasMore(false)
      }
    } catch (err) {
      setError('Failed to search movies. Please try again later.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreMovies = async () => {
    if (!hasMore || loading) return
    
    try {
      setLoading(true)
      const response = await axios.get(BASE_URL, {
        params: {
          apikey: API_KEY,
          s: searchTerm || 'movie',
          page: page + 1
        }
      })
      
      if (response.data.Response === 'True') {
        const newMovies = await Promise.all(
          response.data.Search.slice(0, 10).map(async (movie) => {
            const detailResponse = await axios.get(BASE_URL, {
              params: {
                apikey: API_KEY,
                i: movie.imdbID
              }
            })
            return detailResponse.data
          })
        )
        
        const validNewMovies = newMovies
          .map(movie => {
            // Enhance poster quality for loaded movies
            if (movie.Poster && movie.Poster !== 'N/A') {
              movie.Poster = enhanceImageQuality(movie.Poster);
            }
            return movie;
          })
          .filter(movie => movie.Poster !== 'N/A')
        setMovies(prevMovies => [...prevMovies, ...validNewMovies])
        setPage(prevPage => prevPage + 1)
        setHasMore(validNewMovies.length >= 10)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more movies:', err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  // Component to render the main app content
  const MainAppContent = ({
    movies,
    searchTerm,
    featuredMovie,
    loading,
    error,
    page,
    hasMore,
    handleSearch,
    loadMoreMovies
  }) => (
    <div className="netflix-app">
      {/* Navigation Bar */}
      <nav className="netflix-nav">
        <div className="nav-content">
          <h1 className="logo">KODFLIX</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies..."
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
        </div>
      </nav>

      {/* Hero Section - Netflix Style */}
      {featuredMovie && (
        <div className="hero-section">
          <div className="hero-background" style={{ backgroundImage: `url(${featuredMovie.Poster})` }}></div>
          <div className="hero-gradient-overlay"></div>
          <div className="hero-content-container">
            <div className="hero-content">
              <h1 className="hero-title">{featuredMovie.Title}</h1>
              <div className="hero-meta-info">
                <span className="match-score">98% Match</span>
                <span className="hero-year">{featuredMovie.Year}</span>
                <span className="hero-rating">PG-13</span>
                <span className="hero-duration">{featuredMovie.Runtime || 'N/A'}</span>
              </div>
              <div className="hero-genres">
                {featuredMovie.Genre?.split(',').slice(0, 3).map((genre, index) => (
                  <span key={index} className="genre-tag">{genre.trim()}</span>
                ))}
              </div>
              <p className="hero-plot">{featuredMovie.Plot || 'No plot available'}</p>
              <div className="hero-actions">
                <button className="play-button">
                  <span className="play-icon">▶</span>
                  Play
                </button>
                <button className="info-button">
                  <span className="info-icon">ℹ</span>
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading movies...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && movies.length > 0 && (
        <div className="movies-section">
          <h2 className="section-title">Popular Movies ({movies.length}+)</h2>
          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie.imdbID} className="movie-card">
                <div className="movie-poster-container">
                  <img 
                    src={movie.Poster} 
                    alt={movie.Title}
                    className="movie-poster"
                    onError={(e) => {
                      // Fallback to higher quality placeholder
                      e.target.src = 'https://via.placeholder.com/600x900/333/fff?text=No+Image+Available'
                    }}
                  />
                  <div className="movie-overlay">
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.Title}</h3>
                      <p className="movie-year">{movie.Year}</p>
                      <p className="movie-rating">⭐ {movie.imdbRating || 'N/A'}</p>
                      <p className="movie-genre">{movie.Genre?.split(',')[0] || 'Movie'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="load-more-container">
              <button 
                onClick={loadMoreMovies}
                className="load-more-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Movies'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && movies.length === 0 && (
        <div className="no-results">
          <h2>No movies found</h2>
          <p>Try searching for a different movie title</p>
        </div>
      )}

      {/* Footer */}
      <footer className="netflix-footer">
        <p>Data provided by OMDB API • API Key: {API_KEY}</p>
        <p>Kodflix - Your Movie Streaming Experience</p>
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Public routes - for unauthenticated users */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected route - redirects to login if not authenticated */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <MainAppContent 
                movies={movies}
                searchTerm={searchTerm}
                featuredMovie={featuredMovie}
                loading={loading}
                error={error}
                page={page}
                hasMore={hasMore}
                handleSearch={handleSearch}
                loadMoreMovies={loadMoreMovies}
              />
            ) : (
              <Navigate to="/signup" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
