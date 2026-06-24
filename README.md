# 🎬 Movie Search App

A modern Movie Search Application built using React.js, Vite, Tailwind CSS, and the OMDb API. Users can search for movies and instantly view movie posters, titles, release years, and movie types in a clean and responsive interface.

## 🌐 Live Demo

https://movie-search-app-rust-five.vercel.app/

---

## 🚀 Features

* Search movies by title
* Fetch real-time movie data from OMDb API
* Display movie posters
* Show movie title, year, and type
* Responsive design for mobile and desktop
* Fast loading with Vite
* Simple and clean user interface

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* JavaScript (ES6+)

### API

* OMDb API

---

## 📂 Project Structure

```text
movie-search-app/
│
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/movie-search-app.git
```

### Navigate to Project

```bash
cd movie-search-app
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

---

## 🔑 API Configuration

Create a `.env` file in the project root:

```env
VITE_OMDB_API_KEY=YOUR_API_KEY
```

Access the API key inside React:

```javascript
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
```

---

## 📸 Application Preview

Users can:

* Search for any movie
* View movie posters
* View release year
* View movie category (movie, series, episode)

---

## 🎯 Future Improvements

* Movie Details Page
* Search History
* Favorites / Watchlist
* Dark Mode
* Pagination
* Loading Spinner
* Better Error Handling
* Trending Movies Section

---

## 🚀 Deployment

This application is deployed on Vercel.

Live URL:

https://movie-search-app-rust-five.vercel.app/

---

## 👨‍💻 Author

Nik

B.Tech AIML Student

Passionate about Web Development, AI/ML, and Full Stack Development.

---

## 📜 License

This project is open source and available under the MIT License.
