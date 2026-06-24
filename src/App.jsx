import { useState } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);

  const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

  const searchMovies = async () => {
    if (!search) return;

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${search}`
    );

    const data = await response.json();

    if (data.Search) {
      setMovies(data.Search);
    } else {
      setMovies([]);
      alert("No movies found");
    }
  };

  return (
    <div className="container">
      <h1>🎬 Movie Search App</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter Movie Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={searchMovies}>
          Search
        </button>
      </div>

      <div className="movie-grid">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.imdbID}>
            <img
              src={movie.Poster}
              alt={movie.Title}
            />

            <h3>{movie.Title}</h3>

            <p>{movie.Year}</p>

            <p>{movie.Type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;