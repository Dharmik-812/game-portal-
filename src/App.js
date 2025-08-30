import React, { useState, useEffect, useRef, memo } from "react";
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


// Enhanced Particle Background
const ParticleBackground = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50; // Reduced from original count

    // Throttle animation frame
    let lastDraw = 0;
    const FRAME_RATE = 30; // Cap at 30fps for performance

    const animate = (timestamp) => {
      if (timestamp - lastDraw < 1000 / FRAME_RATE) {
        requestAnimationFrame(animate);
        return;
      }
      lastDraw = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add subtle gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, 'rgba(15, 15, 35, 0.1)');
      gradient.addColorStop(1, 'rgba(5, 5, 15, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.angle = 0;
        this.pulseSpeed = Math.random() * 0.05 + 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.pulseSpeed;
        this.size = 2 + Math.sin(this.angle) * 2;

        if (this.x > canvas.width + 10 || this.x < -10) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height + 10 || this.y < -10) {
          this.speedY = -this.speedY;
        }
      }

      draw() {
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections between particles
        particles.forEach(particle => {
          const dx = this.x - particle.x;
          const dy = this.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            const alpha = 1 - distance / 120;
            ctx.strokeStyle = `hsla(${Math.random() * 360}, 80%, 70%, ${alpha * 0.4})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(particle.x, particle.y);
            ctx.stroke();
          }
        });
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    init();
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-background"></canvas>;
});


// Floating Elements with more variety
const FloatingElements = memo(() => {
  return (
    <div className="floating-elements">
      {[...Array(6)].map((_, i) => ( // Reduced from 12+ elements
        <div
          key={i}
          className="floating-element"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${20 + Math.random() * 20}s`,
            fontSize: `${Math.random() * 20 + 15}px`,
            filter: `hue-rotate(${Math.random() * 360}deg)`
          }}
        >
          {['🎮', '👾', '🕹️', '🎯', '🎲', '🃏', '🧩', '🌌', '🚀', '🌟', '⚡', '🔮', '🎨', '🎪', '🌈'][i % 15]}
        </div>
      ))}
    </div>
  );
});


// Animated Text with more effects
const AnimatedText = ({ text, delay = 0, className = "", effect = "typing" }) => {
  const [animatedText, setAnimatedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (effect === "typing" && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setAnimatedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50 + delay);

      return () => clearTimeout(timeout);
    } else if (effect === "fadeIn") {
      setAnimatedText(text);
    }
  }, [currentIndex, text, delay, effect]);

  return <span className={`${className} ${effect}-effect`}>{animatedText}</span>;
};


// Animated Cursor Trail
const CursorTrail = () => {
  const trailRef = useRef(null);

  useEffect(() => {
    const trail = trailRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const updateTrail = () => {
      // Easing function for smooth following
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;

      if (trail) {
        trail.style.left = `${trailX}px`;
        trail.style.top = `${trailY}px`;
      }

      requestAnimationFrame(updateTrail);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    updateTrail();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div ref={trailRef} className="cursor-trail"></div>
      <div className="cursor-trail-particles"></div>
    </>
  );
};


// Hover Effects Provider
const HoverEffects = () => {
  useEffect(() => {
    const addHoverEffects = () => {
      // Add ripple effect to buttons
      const buttons = document.querySelectorAll('button, .game-card, .genre-filter');
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function (e) {
          const x = e.offsetX;
          const y = e.offsetY;

          const ripple = document.createElement('span');
          ripple.classList.add('ripple-effect');
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;

          this.appendChild(ripple);

          setTimeout(() => {
            ripple.remove();
          }, 1000);
        });
      });
    };

    addHoverEffects();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
};


const GameCard = memo(function GameCard({ game, onSelect, isSelected, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      // Staggered animation for cards with more dynamic effect
      cardRef.current.style.animationDelay = `${index * 0.07}s`;

      // Parallax effect on mouse move
      const handleMouseMove = (e) => {
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;

        card.style.transform = `
          perspective(1000px) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg) 
          translateZ(10px)
        `;
      };

      const handleMouseLeave = () => {
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      };

      cardRef.current.addEventListener('mousemove', handleMouseMove);
      cardRef.current.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        if (cardRef.current) {
          cardRef.current.removeEventListener('mousemove', handleMouseMove);
          cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`game-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(game)}
    >
      <div className="game-image-container">
        <img src={game.img} alt={game.name}
          onError={(e) => {
            e.target.src = `https://placehold.co/300x200/5e3cb5/white?text=${encodeURIComponent(game.name)}`;
          }}
        />
        <div className="game-hover-effect">
          <span className="play-button">▶</span>
        </div>
        <div className="game-gradient-overlay"></div>
        <div className="game-shine"></div>
      </div>
      <div className="game-info">
        <h3>{game.name}</h3>
        <span className="game-genre">{game.genre}</span>
      </div>
      <div className="game-sparkle"></div>
      <div className="game-particles"></div>
    </div>
  );
});


function GenreFilter({ genres, selectedGenre, onSelect }) {
  return (
    <div className="genre-filters">
      {genres.map(genre => (
        <button
          key={genre}
          className={`genre-filter ${selectedGenre === genre ? "active" : ""}`}
          onClick={() => onSelect(genre)}
        >
          <span className="filter-text">{genre}</span>
          <span className="filter-underline"></span>
          <span className="filter-glow"></span>
        </button>
      ))}
    </div>
  );
}


function GameView({ game, onClose, isOpen }) {
  if (!isOpen) return null;


  return (
    <div className="game-view-overlay">
      <div className="game-view-backdrop"></div>
      <div className="game-view-container">
        <div className="game-view-header">
          <h2>{game.name}</h2>
          <button className="close-game-btn" onClick={onClose}>
            <span>✕</span>
            <div className="close-btn-glow"></div>
          </button>
        </div>
        <div className="game-frame-container">
          <iframe
            src={game.url}
            title={game.name}
            allowFullScreen
          />
        </div>
        <div className="game-view-particles"></div>
      </div>
    </div>
  );
}


function ThemeToggle({ theme, toggleTheme }) {
  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <div className={`toggle-track ${theme}`}>
        <div className="toggle-thumb">
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
        <div className="toggle-glow"></div>
      </div>
      <span className="theme-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
      <div className="theme-toggle-particles"></div>
    </div>
  );
}


function AuthModal({ onClose, onLogin, mode, setMode }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'signup') {
      if (!username.trim()) newErrors.username = "Username is required";
      else if (username.length < 3) newErrors.username = "Username must be at least 3 characters";

      if (!dob) newErrors.dob = "Date of birth is required";
      else {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 13) newErrors.dob = "You must be at least 13 years old";
      }

      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === 'login') {
      onLogin({ username: email.split('@')[0], email, dob: "2000-01-01" });
    } else {
      onLogin({ username, email, dob });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-backdrop"></div>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span></span>
          <span></span>
        </button>

        <div className="modal-header">
          <h2><AnimatedText text={mode === 'login' ? 'ACCESS PORTAL' : 'CREATE ACCOUNT'} effect="fadeIn" /></h2>
          <p><AnimatedText text={mode === 'login' ? 'Login to unlock the full experience' : 'Join our gaming community'} effect="fadeIn" delay={300} /></p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'signup' && (
            <div className="input-field">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={errors.username ? 'error' : ''}
              />
              <label>Username</label>
              <div className="input-underline"></div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
          )}

          <div className="input-field">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            <label>Email</label>
            <div className="input-underline"></div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-field">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
            />
            <label>Password</label>
            <div className="input-underline"></div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {mode === 'signup' && (
            <>
              <div className="input-field">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <label>Confirm Password</label>
                <div className="input-underline"></div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <div className="input-field">
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className={errors.dob ? 'error' : ''}
                />
                <label>Date of Birth</label>
                <div className="input-underline"></div>
                {errors.dob && <span className="error-text">{errors.dob}</span>}
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            <span>{mode === 'login' ? 'CONNECT' : 'REGISTER'}</span>
            <div className="btn-sparkle"></div>
            <div className="btn-particles"></div>
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {mode === 'login' ? "New to Nexus? " : "Already have an account? "}
            <span onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setErrors({});
            }}>
              {mode === 'login' ? 'Create account' : 'Login'}
            </span>
          </p>
        </div>

        <div className="modal-particles"></div>
      </div>
    </div>
  );
}


function App() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, alphabetical
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [achievements, setAchievements] = useState({});


  const filteredGames = games.filter(game => {
    const matchGenre = selectedGenre === "All" || game.genre === selectedGenre;
    return matchGenre && game.name.toLowerCase().includes(searchText.toLowerCase());
  });


  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // Add theme change animation
    document.documentElement.classList.add('theme-changing');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-changing');
    }, 1000);
  };


  const toggleFavorite = (game) => {
    if (favorites.find(f => f.name === game.name)) {
      setFavorites(favorites.filter(f => f.name !== game.name));
    } else {
      setFavorites([...favorites, game]);
    }
  };

  const trackGamePlay = (game) => {
    const now = new Date();
    setGameHistory([
      { game, playedAt: now.toISOString() },
      ...gameHistory.slice(0, 19)
    ]);
  };

  const sortGames = (games) => {
    switch (sortBy) {
      case 'newest':
        return [...games].sort((a, b) => b.releaseDate - a.releaseDate);
      case 'alphabetical':
        return [...games].sort((a, b) => a.name.localeCompare(b.name));
      case 'popular':
      default:
        return games;
    }
  };


  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);

    // Add page load animation
    document.body.classList.add('page-loading');

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.remove('page-loading');
      document.body.classList.add('page-loaded');
    }, 2500);

    return () => clearTimeout(timer);
  }, [theme]);


  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-spinner">
            <div className="loader-orb"></div>
          </div>
          <div className="loader-text">
            <AnimatedText text="Initializing Nexus Gaming Portal..." delay={0} />
          </div>
          <div className="loader-particles"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="container">
      {/* Enhanced Animated Background */}
      <ParticleBackground />
      <FloatingElements />
      <CursorTrail />
      <HoverEffects />

      {/* Animated Background Shapes */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo">
            <div className="logo-icon">🎮</div>
            <div className="logo-orb"></div>
            <div className="logo-pulse"></div>
          </div>
          <h1 className="portal-title">
            <AnimatedText text="NEXUS" delay={0} />
            <AnimatedText text="GAMES" delay={400} className="title-part" />
          </h1>
        </div>

        <div className="nav-actions">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {user ? (
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
                <div className="user-status"></div>
                <div className="user-glow"></div>
              </div>
              <span className="welcome">Hi, {user.username}</span>
              <button onClick={() => setUser(null)} className="logout-btn">
                <span>Logout</span>
                <div className="btn-glow"></div>
              </button>
            </div>
          ) : (
            <button onClick={() => { setShowAuth(true); setAuthMode('login'); }} className="login-btn">
              <span>Login</span>
              <div className="btn-glow"></div>
              <div className="btn-particles"></div>
            </button>
          )}
        </div>
      </nav>


      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2>
              <AnimatedText text="Play Free Online Games" delay={200} effect="fadeIn" />
            </h2>
            <p>
              <AnimatedText text="Discover the best web games across all genres" delay={600} effect="fadeIn" />
            </p>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search games..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">🔍</div>
              <div className="search-glow"></div>
            </div>
          </div>
          <div className="hero-particles"></div>
        </section>


        {/* Genre Filters */}
        <section className="genre-section">
          <h3>Popular Categories</h3>
          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            onSelect={setSelectedGenre}
          />
        </section>


        {/* Games Grid */}
        <section className="games-section">
          <div className="section-header">
            <h3>{selectedGenre === "All" ? "All Games" : selectedGenre + " Games"}</h3>
            <span className="games-count">{filteredGames.length} games</span>
          </div>

          <div className="games-grid">
            {filteredGames.map((game, index) => (
              <GameCard
                key={game.name}
                game={game}
                onSelect={setSelectedGame}
                isSelected={selectedGame?.name === game.name}
                index={index}
              />
            ))}
          </div>
        </section>
      </main>


      {/* Game View Overlay */}
      <GameView
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        isOpen={!!selectedGame}
      />


      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={setUser}
          mode={authMode}
          setMode={setAuthMode}
        />
      )}


      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>NEXUS GAMES © 2023 | Play Free Online Games</p>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Support</a>
          </div>
        </div>
        <div className="footer-particles"></div>
      </footer>
    </div>
  );
}
export default App;