import React, { useState } from "react";
import "./App.css";

const games = [
  { name: "Kour.io", url: "https://kour.io/", img: "/download.jfif", genre: "FPS" },
  { name: "Slope 3D", url: "https://storage.y8.com/y8-studio/unity/joll/slope/?key=9757549&value=80527", img: "/slope3.png", genre: "Arcade" },
  { name: "Krunker", url: "https://krunker.io/", img: "/krunker.jfif", genre: "FPS" },
  { name: "Chrome Dino", url: "https://codingwith-adam.github.io/dino-game/index.html", img: "/dino.png", genre: "Platformer" },
  { name: "Flappy Bird", url: "https://flappybird.io/", img: "https://upload.wikimedia.org/wikipedia/en/0/0a/Flappy_Bird_icon.png", genre: "Arcade" },
  { name: "Snake", url: "https://www.snakegame.net/", img: "/snake.png", genre: "Arcade" },
  { name: "Minecraft Classic", url: "https://classic.minecraft.net/", img: "/minecraft.png", genre: "Sandbox" },
  { name: "Pac-Man", url: "https://funhtml5games.com?play=pacman", img: "/pacman.png", genre: "Arcade" },


  { name: "Slither.io", url: "https://slither.io/", img: "/slither.jfif", genre: "IO" },
  { name: "Drift.io", url: "https://drift.io/", img: "/drift.avif", genre: "IO" },
  { name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", img: "/wordle.PNG", genre: "Word" },


  { name: "Chess", url: "https://playpager.com/embed/chess/index.html", img: "/chess.PNG", genre: "Board" },
  { name: "Checkers", url: "https://playpager.com/embed/checkers/index.html", img: "/checkers.PNG", genre: "Board" },
  { name: "Othello", url: "https://playpager.com/embed/reversi/index.html", img: "/othello.PNG", genre: "Board" },
  { name: "Solitaire", url: "https://playpager.com/embed/solitaire/index.html", img: "/solitaire.PNG", genre: "Card" },
  { name: "Falling Cubes", url: "https://playpager.com/embed/cubes/index.html", img: "/tet.jfif", genre: "Puzzle" },


];

const genres = ["All", ...Array.from(new Set(games.map(g => g.genre)))];

function GameCard({ game, onSelect }) {
  return (
    <div className="game-card" onClick={() => onSelect(game.url)}>
      <img src={game.img} alt={game.name} />
      <p>{game.name}</p>
    </div>
  );
}

function GenreCard({ genre, active, onSelect }) {
  const colors = {
    FPS: "genre-fps",
    Arcade: "genre-arcade",
    Platformer: "genre-platformer",
    Sandbox: "genre-sandbox",
    All: "genre-all",
    IO: "genre-io",
    Word: "genre-word",
    Board: "genre-board",
  };
  return (
    <div
      className={`genre-card ${colors[genre] || "genre-default"} ${active ? "active" : ""}`}
      onClick={() => onSelect(genre)}
    >
      <p>{genre}</p>
    </div>
  );
}

function LoginModal({ onClose, onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && email && password && dob) {
      onLogin({ username, email, dob });
      onClose();
    } else {
      alert("Please fill all fields");
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <label>Date of Birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
          <button type="submit" className="submit-btn">Login</button>
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);

  const filteredGames = games.filter(game => {
    const matchGenre = selectedGenre === "All" || game.genre === selectedGenre;
    return matchGenre && game.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="portal-title">🎮 Game Portal</h1>
        <div className="nav-actions">
          {user && <span className="welcome">Hi, {user.username} 👋</span>}
          {user ? (
            <button onClick={() => setUser(null)} className="logout-btn">Logout</button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="login-btn">Login</button>
          )}
        </div>
      </nav>

      <div className="sidebar-main-content">
        {/* Sidebar */}
        <div className="genres-container">
          <div className="side-portal-title-inside">🎮 Game Portal</div>
          <button
            className="genres-label-btn"
            onClick={() => setIsGenresOpen(!isGenresOpen)}
            style={{ zIndex: 3, position: "relative" }}
          >
            GENRES {isGenresOpen ? "↑" : "↓"}
          </button>
          {isGenresOpen && (
            <div className="genres-slide-overlay-vertical">
              {genres.map(genre => (
                <GenreCard
                  key={genre}
                  genre={genre}
                  active={genre === selectedGenre}
                  onSelect={(g) => {
                    setSelectedGenre(g);
                    setSelectedGame(null);
                    setIsGenresOpen(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="content-area">
          <div className="game-view">
            {selectedGame ? (
              <iframe src={selectedGame} allowFullScreen title="Game Frame" />
            ) : (
              <p>Select a game to start</p>
            )}
          </div>
          <div className="game-list">
            <input
              type="text"
              className="search-bar"
              placeholder="Search Games..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            {filteredGames.length > 0 ? (
              filteredGames.map(game => (
                <GameCard key={game.name} game={game} onSelect={setSelectedGame} />
              ))
            ) : (
              <p style={{ padding: "10px", color: "#555" }}>
                No games found for "{searchText}" in "{selectedGenre}"
              </p>
            )}
          </div>
        </div>
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={userData => setUser(userData)}
        />
      )}
    </div>
  );
}

export default App;
