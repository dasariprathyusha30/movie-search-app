import { useState, useEffect } from "react";
import MovieCard from "./components/MovieCard";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Home Rows state
  const [trendingRow, setTrendingRow] = useState([]);
  const [hollywoodBlockbusters, setHollywoodBlockbusters] = useState([]);
  const [hollywoodOscarWinners, setHollywoodOscarWinners] = useState([]);
  const [animeSeries, setAnimeSeries] = useState([]);
  const [bollywoodHits, setBollywoodHits] = useState([]);
  
  // Hero Carousel State
  const [heroMovies, setHeroMovies] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  
  const [rowsLoading, setRowsLoading] = useState(true);

  // Watchlist & Watched states with local storage caching
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("cine_watchlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [watchedList, setWatchedList] = useState(() => {
    const saved = localStorage.getItem("cine_watched");
    return saved ? JSON.parse(saved) : [];
  });
  const [watchlistMovies, setWatchlistMovies] = useState([]);

  // Genre filtering state
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Detailed Modal states
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedMovieData, setSelectedMovieData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Seasons & Episodes states
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  // Trailer Video Modal states
  const [showTrailer, setShowTrailer] = useState(false);

  const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

  const HERO_IDS = ["tt0468569", "tt1375666", "tt15398776", "tt0816692"]; // Dark Knight, Inception, Oppenheimer, Interstellar

  const GENRES = ["All", "Action", "Adventure", "Sci-Fi", "Drama", "Animation", "Crime"];

  const subCategories = {
    Hollywood: [
      { 
        name: "Blockbusters", 
        ids: [
          "tt0468569", // The Dark Knight
          "tt1375666", // Inception
          "tt0816692", // Interstellar
          "tt0499549", // Avatar
          "tt1630029", // Avatar: The Way of Water
          "tt15239678", // Dune: Part Two
          "tt0133093", // The Matrix
          "tt0120338", // Titanic
          "tt4154796", // Avengers: Endgame
          "tt0080684", // Star Wars V
          "tt0107290", // Jurassic Park
          "tt4633694", // Into the Spider-Verse
          "tt1745960", // Top Gun: Maverick
          "tt0848228", // The Avengers
          "tt1392190", // Mad Max: Fury Road
          "tt0120737"  // Fellowship of the Ring
        ] 
      },
      { 
        name: "Top IMDb Rated", 
        ids: [
          "tt0111161", // Shawshank Redemption
          "tt0068646", // The Godfather
          "tt0110912", // Pulp Fiction
          "tt0109830", // Forrest Gump
          "tt0071562", // The Godfather Part II
          "tt0120815", // Schindler's List
          "tt0082971", // Raiders of the Lost Ark
          "tt0167260", // Return of the King
          "tt0050083", // 12 Angry Men
          "tt0137523", // Fight Club
          "tt0099685", // Goodfellas
          "tt0114369", // Se7en
          "tt0102926", // Silence of the Lambs
          "tt0038650", // It's a Wonderful Life
          "tt0120889", // Saving Private Ryan
          "tt0118799"  // Life Is Beautiful
        ] 
      },
      { 
        name: "Oscar Winners", 
        ids: [
          "tt15398776", // Oppenheimer (2023)
          "tt6751668",  // Parasite (2019)
          "tt6710474",  // Everything Everywhere All at Once (2022)
          "tt0172495",  // Gladiator (2000)
          "tt0120338",  // Titanic (1997)
          "tt0120815",  // Schindler's List (1993)
          "tt0822854",  // No Country for Old Men (2007)
          "tt6966692",  // Green Book (2018)
          "tt0086879",  // Amadeus (1984)
          "tt0112573",  // Braveheart (1995)
          "tt0034583"   // Casablanca (1942)
        ] 
      }
    ],
    Bollywood: [
      { 
        name: "Blockbusters", 
        ids: ["tt15098124", "tt12844910", "tt2338151", "tt5074352", "tt1187043", "tt6791096", "tt1748179", "tt1384144"] 
      }
    ],
    Netflix: [
      { 
        name: "Trending Shows", 
        ids: ["tt3011894", "tt15023008", "tt13443470", "tt6468322", "tt2085059", "tt2707408", "tt9052870", "tt10875696"] 
      }
    ],
    Anime: [
      { 
        name: "Top Series", 
        ids: [
          "tt2590220", // Attack on Titan
          "tt11032374", // Demon Slayer
          "tt0988824", // Naruto: Shippuden
          "tt0209544", // Naruto
          "tt0388629", // One Piece
          "tt12343534", // Jujutsu Kaisen
          "tt0434706", // Bleach
          "tt1947230", // Blade (Marvel Anime)
          "tt0877057", // Death Note
          "tt2009056", // Hunter x Hunter
          "tt1438108", // Fullmetal Alchemist: Brotherhood
          "tt5626028", // My Hero Academia
          "tt0121355", // Dragon Ball Z
          "tt5013056", // One Punch Man
          "tt1910272", // Steins;Gate
          "tt0213338"  // Cowboy Bebop
        ] 
      }
    ]
  };

  const getHighResPoster = (url) => {
    if (!url || url === "N/A") return url;
    // OMDb returns resized 300px posters. Replacing SX300/SX150 with SX1000/SX1200 gives the high-res original master.
    return url.replace(/_SX\d+/, "_SX1000").replace(/_UY\d+/, "_UY1200");
  };

  const fetchRowMovies = async (ids) => {
    try {
      const promises = ids.map(async (id) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
        return res.json();
      });
      const results = await Promise.all(promises);
      const validMovies = results.filter((movie) => movie.Response !== "False");
      return validMovies.map((movie) => ({
        Title: movie.Title,
        Poster: getHighResPoster(movie.Poster),
        Year: movie.Year,
        Type: movie.Type,
        imdbID: movie.imdbID,
        imdbRating: movie.imdbRating,
        Genre: movie.Genre
      }));
    } catch (err) {
      console.error("Error fetching row movies:", err);
      return [];
    }
  };

  const loadNetflixRows = async () => {
    setRowsLoading(true);
    try {
      // Fetch Hero Carousel Movies
      const heroPromises = HERO_IDS.map(async (id) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
        return res.json();
      });
      const heroResults = await Promise.all(heroPromises);
      const filteredHeroes = heroResults.filter((h) => h.Response !== "False").map(h => ({
        ...h,
        Poster: getHighResPoster(h.Poster)
      }));
      setHeroMovies(filteredHeroes);

      // Fetch row categories
      const trendingData = await fetchRowMovies(subCategories.Netflix[0].ids);
      const blockbusterData = await fetchRowMovies(subCategories.Hollywood[0].ids);
      const oscarData = await fetchRowMovies(subCategories.Hollywood[2].ids);
      const animeData = await fetchRowMovies(subCategories.Anime[0].ids);
      const bollywoodData = await fetchRowMovies(subCategories.Bollywood[0].ids);

      setTrendingRow(trendingData);
      setHollywoodBlockbusters(blockbusterData);
      setHollywoodOscarWinners(oscarData);
      setAnimeSeries(animeData);
      setBollywoodHits(bollywoodData);
    } catch (err) {
      console.error("Error loading home rows:", err);
    } finally {
      setRowsLoading(false);
    }
  };

  useEffect(() => {
    loadNetflixRows();
  }, []);

  // Save watchlist & watched lists
  useEffect(() => {
    localStorage.setItem("cine_watchlist", JSON.stringify(watchlist));
    const fetchWatchlistDetails = async () => {
      if (watchlist.length === 0) {
        setWatchlistMovies([]);
        return;
      }
      const data = await fetchRowMovies(watchlist);
      setWatchlistMovies(data);
    };
    fetchWatchlistDetails();
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem("cine_watched", JSON.stringify(watchedList));
  }, [watchedList]);

  // Hero carousel cycling interval
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroMovies]);

  const searchMovies = async () => {
    if (!search) {
      setIsSearchActive(false);
      return;
    }

    setLoading(true);
    setIsSearchActive(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${search}`
      );
      const data = await response.json();

      if (data.Search) {
        const promises = data.Search.map(async (item) => {
          const detail = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}`);
          return detail.json();
        });
        const results = await Promise.all(promises);
        const validSearch = results.filter((movie) => movie.Response !== "False");
        setMovies(validSearch.map((m) => ({
          ...m,
          Poster: getHighResPoster(m.Poster)
        })));
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error("Error searching movies:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchMovies();
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val) {
      setIsSearchActive(false);
      setMovies([]);
    }
  };

  const fetchSeasonEpisodes = async (seriesId, seasonNum) => {
    setSeasonLoading(true);
    setSelectedSeason(seasonNum);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${seriesId}&Season=${seasonNum}`
      );
      const data = await response.json();
      if (data.Episodes) {
        setSeasonEpisodes(data.Episodes);
      } else {
        setSeasonEpisodes([]);
      }
    } catch (err) {
      console.error("Error fetching season episodes:", err);
      setSeasonEpisodes([]);
    } finally {
      setSeasonLoading(false);
    }
  };

  const handleCardClick = async (id) => {
    setSelectedMovieId(id);
    setModalLoading(true);
    setSeasonEpisodes(null);
    setSelectedSeason(null);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`
      );
      const data = await response.json();
      if (data.Response !== "False") {
        data.Poster = getHighResPoster(data.Poster);
      }
      setSelectedMovieData(data);

      if (data.Type === "series" && data.totalSeasons && data.totalSeasons !== "N/A") {
        const total = parseInt(data.totalSeasons, 10);
        if (total > 0) {
          fetchSeasonEpisodes(id, 1);
        }
      }
    } catch (err) {
      console.error("Error fetching movie details:", err);
      setSelectedMovieData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMovieId(null);
    setSelectedMovieData(null);
    setSelectedSeason(null);
    setSeasonEpisodes(null);
  };

  const triggerTrailer = () => {
    setShowTrailer(true);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
  };

  const resetToHome = () => {
    setSearch("");
    setIsSearchActive(false);
    setMovies([]);
    setSelectedGenre("All");
  };

  // Watchlist & Watched Toggle managers
  const toggleWatchlist = (id) => {
    if (watchlist.includes(id)) {
      setWatchlist((prev) => prev.filter((item) => item !== id));
    } else {
      setWatchlist((prev) => [...prev, id]);
    }
  };

  const toggleWatched = (id) => {
    if (watchedList.includes(id)) {
      setWatchedList((prev) => prev.filter((item) => item !== id));
    } else {
      setWatchedList((prev) => [...prev, id]);
    }
  };

  // Surprise Me Random pick trigger
  const handleSurpriseMe = () => {
    const allCategoryIds = [
      ...subCategories.Hollywood[0].ids,
      ...subCategories.Hollywood[1].ids,
      ...subCategories.Hollywood[2].ids,
      ...subCategories.Anime[0].ids,
      ...subCategories.Bollywood[0].ids,
      ...subCategories.Netflix[0].ids
    ];
    // Remove duplicates
    const uniqueIds = Array.from(new Set(allCategoryIds));
    const randomId = uniqueIds[Math.floor(Math.random() * uniqueIds.length)];
    handleCardClick(randomId);
  };

  // Chevron shelf scroll triggers
  const scrollRow = (rowId, direction) => {
    const el = document.getElementById(rowId);
    if (el) {
      const scrollAmt = direction === "left" ? -600 : 600;
      el.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  // Filter movies lists by genre pill selection
  const filterMoviesByGenre = (list) => {
    if (selectedGenre === "All") return list;
    return list.filter((m) => m.Genre && m.Genre.toLowerCase().includes(selectedGenre.toLowerCase()));
  };

  // Get Match Percentage like Netflix
  const getMatchRate = (rating) => {
    const parsed = parseFloat(rating);
    if (isNaN(parsed)) return "94% Match";
    return `${Math.min(99, Math.max(85, Math.round(parsed * 10)))}% Match`;
  };

  // Movie Row Slider Component
  const MovieRow = ({ title, id, movies }) => {
    const filtered = filterMoviesByGenre(movies);
    if (!filtered || filtered.length === 0) return null;
    return (
      <div className="movie-row-wrapper">
        <h2 className="movie-row-title">{title}</h2>
        <div className="movie-row-container">
          <button className="row-nav-btn prev" onClick={() => scrollRow(id, "left")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div className="movie-row-slider" id={id}>
            {filtered.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onClick={handleCardClick}
                inWatchlist={watchlist.includes(movie.imdbID)}
                isWatched={watchedList.includes(movie.imdbID)}
              />
            ))}
          </div>

          <button className="row-nav-btn next" onClick={() => scrollRow(id, "right")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Skeleton Row Component
  const SkeletonRow = () => (
    <div className="skeleton-row">
      <div className="skeleton-title"></div>
      <div className="skeleton-slider">
        {[...Array(6)].map((_, i) => (
          <div className="skeleton-card" key={i}></div>
        ))}
      </div>
    </div>
  );

  const currentHero = heroMovies[activeHeroIndex];

  return (
    <div className="container">
      {/* Navigation Header */}
      <nav className="header-nav">
        <h1 className="brand-title" onClick={resetToHome}>
          <span className="title-white">CINE</span>
          <span className="title-black">•</span>
          <span className="title-orange">PREM</span>
          <span className="title-netflix-red">IU</span>
          <span className="title-orange">M</span>
        </h1>

        <div className="header-right">
          {/* Surprise Me Button */}
          <button className="surprise-btn" onClick={handleSurpriseMe} title="Surprise Me with a random movie">
            🎲 Surprise Me
          </button>

          {/* Watch Tracker Progress Bar */}
          <div className="watched-tracker">
            <div className="tracker-label">
              <span>{watchedList.length}</span> of 50 Watched
            </div>
            <div className="tracker-bar-bg">
              <div 
                className="tracker-bar-fill" 
                style={{ width: `${Math.min(100, (watchedList.length / 50) * 100)}%` }}
              ></div>
            </div>
          </div>

          <form className="search-wrapper-nav" onSubmit={handleSearchSubmit}>
            <div className="search-box-nav">
              <input
                type="text"
                placeholder="Titles, people, genres..."
                value={search}
                onChange={handleSearchChange}
              />
              <button className="search-btn-nav" type="submit">
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </nav>

      {/* Main content switch */}
      {isSearchActive ? (
        /* Search results view */
        <div className="search-results-section">
          <h2>Search Results for "{search}"</h2>
          {loading ? (
            <div className="movie-grid">
              {[...Array(8)].map((_, i) => (
                <div className="skeleton-card" style={{ height: "350px" }} key={i}></div>
              ))}
            </div>
          ) : movies.length > 0 ? (
            <div className="movie-grid">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  onClick={handleCardClick}
                  inWatchlist={watchlist.includes(movie.imdbID)}
                  isWatched={watchedList.includes(movie.imdbID)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📂</span>
              <h3>No Results Found</h3>
              <p>We couldn't locate any movies or series matching your search query. Try another title.</p>
            </div>
          )}
        </div>
      ) : (
        /* Real Netflix Home view */
        <>
          {/* Featured Hero Banner Carousel */}
          {currentHero && (
            <div 
              className="hero-banner"
              style={{ backgroundImage: `url(${currentHero.Poster})` }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <span className="hero-subtitle">Featured Masterpiece</span>
                <h1 className="hero-title">{currentHero.Title}</h1>
                
                <div className="hero-meta">
                  <span className="hero-rating">{getMatchRate(currentHero.imdbRating)}</span>
                  <span className="hero-badge">{currentHero.Rated}</span>
                  <span className="hero-year">{currentHero.Year}</span>
                  <span className="hero-badge">{currentHero.Runtime}</span>
                </div>

                <p className="hero-plot">{currentHero.Plot}</p>

                <div className="hero-buttons">
                  <button className="hero-btn hero-btn-play" onClick={triggerTrailer}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Play Trailer
                  </button>
                  <button className="hero-btn hero-btn-info" onClick={() => handleCardClick(currentHero.imdbID)}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    More Info
                  </button>
                </div>
              </div>

              {/* Slide dots */}
              <div className="hero-carousel-dots">
                {heroMovies.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-dot ${activeHeroIndex === index ? "active" : ""}`}
                    onClick={() => setActiveHeroIndex(index)}
                    title={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sub-Genres Pill Filter Bar */}
          <div className="genre-filter-bar">
            <span className="genre-filter-label">Filter:</span>
            {GENRES.map((genre) => (
              <button
                key={genre}
                className={`genre-pill ${selectedGenre === genre ? "active" : ""}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Rows directory */}
          <div className="rows-section">
            {rowsLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              <>
                {/* Dynamically Loaded Watchlist row */}
                <MovieRow title="My Watchlist" id="watchlist" movies={watchlistMovies} />

                <MovieRow title="Trending Now" id="trending" movies={trendingRow} />
                <MovieRow title="Hollywood Blockbusters" id="hollywood" movies={hollywoodBlockbusters} />
                <MovieRow title="Oscar Winners" id="oscars" movies={hollywoodOscarWinners} />
                <MovieRow title="Top Anime Series" id="anime" movies={animeSeries} />
                <MovieRow title="Bollywood Hits" id="bollywood" movies={bollywoodHits} />
              </>
            )}
          </div>
        </>
      )}

      {/* Movie Details Modal */}
      {selectedMovieId && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {modalLoading ? (
              <div style={{ padding: "80px 40px", textAlign: "center", color: "var(--text-muted)" }}>
                <div className="skeleton-text-1" style={{ width: "40%", margin: "0 auto 20px" }}></div>
                <div className="skeleton-text-2" style={{ width: "70%", margin: "0 auto" }}></div>
              </div>
            ) : selectedMovieData ? (
              <div className="modal-body">
                <div className="modal-poster">
                  {selectedMovieData.Poster !== "N/A" ? (
                    <img src={selectedMovieData.Poster} alt={selectedMovieData.Title} />
                  ) : (
                    <div className="poster-placeholder">
                      <span className="placeholder-icon">🎬</span>
                      <p>{selectedMovieData.Title}</p>
                    </div>
                  )}
                </div>
                <div className="modal-content-details">
                  <h2 className="modal-title">{selectedMovieData.Title}</h2>
                  
                  <div className="modal-meta-row">
                    <span className="modal-badge rating-badge">
                      ⭐ {selectedMovieData.imdbRating || "N/A"}
                    </span>
                    <span className="movie-match">
                      {getMatchRate(selectedMovieData.imdbRating)}
                    </span>
                    <span className="modal-badge">{selectedMovieData.Rated}</span>
                    <span className="modal-badge">{selectedMovieData.Year}</span>
                    <span className="modal-badge">{selectedMovieData.Runtime}</span>
                  </div>

                  {/* Watchlist & Watched action triggers */}
                  <div className="modal-action-row">
                    <button className="modal-btn modal-btn-play" onClick={triggerTrailer}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Play Trailer
                    </button>
                    <button 
                      className={`modal-btn modal-btn-action ${watchlist.includes(selectedMovieData.imdbID) ? "active" : ""}`}
                      onClick={() => toggleWatchlist(selectedMovieData.imdbID)}
                    >
                      {watchlist.includes(selectedMovieData.imdbID) ? "✓ In My List" : "+ My List"}
                    </button>
                    <button 
                      className={`modal-btn modal-btn-action ${watchedList.includes(selectedMovieData.imdbID) ? "watched-active" : ""}`}
                      onClick={() => toggleWatched(selectedMovieData.imdbID)}
                    >
                      {watchedList.includes(selectedMovieData.imdbID) ? "★ Watched" : "Mark Watched"}
                    </button>
                  </div>

                  <div className="modal-section-title">Plot Summary</div>
                  <p className="modal-plot">{selectedMovieData.Plot}</p>

                  <div className="modal-info-list">
                    <div className="info-item">
                      <span className="info-label">Genre</span>
                      <span className="info-value">{selectedMovieData.Genre}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Director</span>
                      <span className="info-value">{selectedMovieData.Director}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Writer</span>
                      <span className="info-value">{selectedMovieData.Writer}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Cast</span>
                      <span className="info-value">{selectedMovieData.Actors}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Language</span>
                      <span className="info-value">{selectedMovieData.Language}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Country</span>
                      <span className="info-value">{selectedMovieData.Country}</span>
                    </div>
                    {selectedMovieData.Metascore && selectedMovieData.Metascore !== "N/A" && (
                      <div className="info-item">
                        <span className="info-label">Metascore</span>
                        <span className="info-value">{selectedMovieData.Metascore} / 100</span>
                      </div>
                    )}
                    {selectedMovieData.BoxOffice && selectedMovieData.BoxOffice !== "N/A" && (
                      <div className="info-item">
                        <span className="info-label">Box Office</span>
                        <span className="info-value">{selectedMovieData.BoxOffice}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Awards</span>
                      <span className="info-value">{selectedMovieData.Awards}</span>
                    </div>
                  </div>

                  {selectedMovieData.Type === "series" && selectedMovieData.totalSeasons && selectedMovieData.totalSeasons !== "N/A" && (
                    <div className="seasons-wrapper">
                      <div className="modal-section-title">Seasons Archive</div>
                      <div className="seasons-tabs">
                        {[...Array(parseInt(selectedMovieData.totalSeasons, 10))].map((_, i) => {
                          const sNum = i + 1;
                          return (
                            <button
                              key={sNum}
                              className={`season-tab-btn ${selectedSeason === sNum ? "active" : ""}`}
                              onClick={() => fetchSeasonEpisodes(selectedMovieId, sNum)}
                            >
                              S{sNum}
                            </button>
                          );
                        })}
                      </div>

                      <div className="episodes-container">
                        {seasonLoading ? (
                          <div className="episode-loader">
                            <div className="skeleton-text-2" style={{ width: "90%", margin: "10px 0" }}></div>
                            <div className="skeleton-text-2" style={{ width: "85%", margin: "10px 0" }}></div>
                          </div>
                        ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
                          <div className="episodes-list">
                            {seasonEpisodes.map((ep) => (
                              <div className="episode-row" key={ep.imdbID}>
                                <span className="episode-number">Ep {ep.Episode}</span>
                                <span className="episode-title" title={ep.Title}>{ep.Title}</span>
                                <span className="episode-rating">⭐ {ep.imdbRating !== "N/A" ? ep.imdbRating : "N/A"}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-episodes">No episodes cataloged for S{selectedSeason}.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                Failed to load movie details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Trailer Modal */}
      {showTrailer && (
        <div className="modal-backdrop" onClick={closeTrailer}>
          <div className="modal-container" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeTrailer}>
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="trailer-iframe-wrapper">
              <iframe 
                src="https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1" 
                title="The Dark Knight Trailer" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© {new Date().getFullYear()} <span>CINE•PREMIUM</span>. All Rights Reserved. Cataloged using OMDB API.</p>
      </footer>
    </div>
  );
}

export default App;