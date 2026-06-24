import React from "react";

function MovieCard({ movie, onClick, inWatchlist, isWatched }) {
  const hasPoster = movie.Poster && movie.Poster !== "N/A";

  return (
    <div className="movie-card" onClick={() => onClick(movie.imdbID)}>
      <div className="movie-poster-wrapper">
        <div className="poster-overlay"></div>
        
        {hasPoster ? (
          <img
            src={movie.Poster}
            alt={movie.Title}
            loading="lazy"
          />
        ) : (
          <div className="poster-placeholder">
            <span className="placeholder-icon">🎬</span>
            <p>{movie.Title}</p>
          </div>
        )}

        <div className="card-badges">
          {movie.imdbRating && movie.imdbRating !== "N/A" && (
            <span className="badge-rating">⭐ {movie.imdbRating}</span>
          )}
          {isWatched && (
            <span className="badge-watched" title="Watched">✓</span>
          )}
          {inWatchlist && (
            <span className="badge-watchlist" title="In Watchlist">+</span>
          )}
          <span className="badge-year">{movie.Year}</span>
        </div>
      </div>

      <div className="movie-details">
        <h3>{movie.Title}</h3>
        
        <div className="movie-meta-bottom">
          <span className="view-btn">
            View Details
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;