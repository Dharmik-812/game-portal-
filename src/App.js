import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";


const GAMES = [
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
// Custom hook for theme management
const useTheme = () => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // Add theme change animation
    document.documentElement.classList.add('theme-changing');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-changing');
    }, 1000);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
};

// Custom hook for game filtering
const useGameFilter = (games) => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchText, setSearchText] = useState("");

  const genres = useMemo(() =>
    ["All", ...Array.from(new Set(games.map(g => g.genre)))],
    [games]
  );

  const filteredGames = useMemo(() =>
    games.filter(game => {
      const matchGenre = selectedGenre === "All" || game.genre === selectedGenre;
      return matchGenre && game.name.toLowerCase().includes(searchText.toLowerCase());
    }),
    [games, selectedGenre, searchText]
  );

  return {
    selectedGenre,
    setSelectedGenre,
    searchText,
    setSearchText,
    genres,
    filteredGames
  };
};

// Custom hook for user data management
const useUserData = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('gameFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [gameHistory, setGameHistory] = useState(() => {
    const savedHistory = localStorage.getItem('gameHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [achievements, setAchievements] = useState(() => {
    const savedAchievements = localStorage.getItem('gameAchievements');
    return savedAchievements ? JSON.parse(savedAchievements) : {};
  });
  const [gameStats, setGameStats] = useState(() => {
    const saved = localStorage.getItem('gameStats');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeTimers, setActiveTimers] = useState({});
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const getAchievementIcon = useCallback((id) => {
    const icons = {
      first_favorite: '❤️',
      favorite_collector: '🌟',
      favorite_enthusiast: '🏆',
      first_play: '🎮',
      gaming_rookie: '🎯',
      gaming_enthusiast: '🎪',
      gaming_veteran: '👑'
    };
    return icons[id] || '🎨';
  }, []);

  const toggleFavorite = useCallback((game) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(f => f.name === game.name);
      const newFavorites = isFavorite
        ? prevFavorites.filter(f => f.name !== game.name)
        : [...prevFavorites, { ...game, addedAt: new Date().toISOString() }];

      // Save to localStorage with metadata
      localStorage.setItem('gameFavorites', JSON.stringify(newFavorites));

      // Show toast notification
      const message = isFavorite ? `${game.name} removed from favorites` : `${game.name} added to favorites`;
      showNotification(message, isFavorite ? 'info' : 'success');

      // Check for achievements
      if (!isFavorite) {
        checkFavoriteAchievements(newFavorites.length);
      }

      return newFavorites;
    });
  }, [showNotification]);

  const trackGamePlay = useCallback((game) => {
    const startTime = new Date();
    const playRecord = {
      game: game.name,
      genre: game.genre,
      playedAt: startTime.toISOString(),
      startTime: startTime.toISOString(),
      sessionId: Math.random().toString(36).substr(2, 9)
    };

    setGameHistory(prevHistory => {
      const newHistory = [playRecord, ...prevHistory];
      localStorage.setItem('gameHistory', JSON.stringify(newHistory));

      // Update game statistics
      updateGameStats(game.name, game.genre);

      return newHistory;
    });

    // Start session timer
    const sessionTimer = setInterval(() => {
      updateSessionDuration(playRecord.sessionId);
    }, 1000);

    // Store session timer for cleanup
    setActiveTimers(prev => ({ ...prev, [playRecord.sessionId]: sessionTimer }));

    // Check for achievements
    checkPlayAchievements(gameHistory.length + 1);
  }, [gameHistory.length]);

  const updateSessionDuration = useCallback((sessionId) => {
    setGameHistory(prevHistory => {
      const updatedHistory = prevHistory.map(record => {
        if (record.sessionId === sessionId) {
          const duration = new Date() - new Date(record.startTime);
          return { ...record, duration };
        }
        return record;
      });
      localStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  const updateGameStats = useCallback((gameName, genre) => {
    setGameStats(prevStats => {
      const gameKey = `game_${gameName.toLowerCase().replace(/\s+/g, '_')}`;
      const newStats = {
        ...prevStats,
        [gameKey]: {
          playCount: (prevStats[gameKey]?.playCount || 0) + 1,
          lastPlayed: new Date().toISOString(),
          genre
        }
      };
      localStorage.setItem('gameStats', JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const checkFavoriteAchievements = useCallback((favCount) => {
    const achievements = {
      first_favorite: { count: 1, title: 'First Favorite Added!' },
      favorite_collector: { count: 5, title: 'Favorite Collector' },
      favorite_enthusiast: { count: 10, title: 'Favorite Enthusiast' }
    };

    Object.entries(achievements).forEach(([id, data]) => {
      if (favCount === data.count) {
        unlockAchievement(id, data.title);
      }
    });
  }, []);

  const checkPlayAchievements = useCallback((playCount) => {
    const achievements = {
      first_play: { count: 1, title: 'First Game Played!' },
      gaming_rookie: { count: 5, title: 'Gaming Rookie' },
      gaming_enthusiast: { count: 10, title: 'Gaming Enthusiast' },
      gaming_veteran: { count: 25, title: 'Gaming Veteran' }
    };

    Object.entries(achievements).forEach(([id, data]) => {
      if (playCount === data.count) {
        unlockAchievement(id, data.title);
      }
    });
  }, []);

  const unlockAchievement = useCallback((id, title) => {
    setAchievements(prevAchievements => {
      if (prevAchievements[id]) return prevAchievements;

      const newAchievements = {
        ...prevAchievements,
        [id]: {
          title,
          unlockedAt: new Date().toISOString(),
          icon: getAchievementIcon(id)
        }
      };

      localStorage.setItem('gameAchievements', JSON.stringify(newAchievements));

      // Show achievement notification
      showNotification(`🏆 Achievement Unlocked: ${title}`, 'achievement');

      return newAchievements;
    });
  }, [getAchievementIcon, showNotification]);

  return {
    user,
    setUser,
    favorites,
    gameHistory,
    achievements,
    gameStats,
    activeTimers,
    notifications,
    showNotification,
    toggleFavorite,
    trackGamePlay
  };
};

// Optimized Particle Background with reduced particles
const ParticleBackground = React.memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const particleCount = 30; // Increased from 30
    const connectionDistance = 150; // Increased from 100
    const maxConnections = 20; // New: limit connections per particle

    class Particle {
      constructor() {
        this.reset();
        // Random starting position
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
      }

      reset() {
        // Dynamic speed based on position
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 3 + 2; // Slightly larger particles
        this.color = `hsl(${Math.random() * 60 + 230}, 80%, 60%)`; // Blue-purple range
        this.angle = Math.random() * Math.PI * 2;
        this.orbitSpeed = (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? 1 : -1);
        this.orbitRadius = Math.random() * 3;
        this.lastConnections = []; // Track recent connections
      }

      update() {
        // Orbital motion
        this.angle += this.orbitSpeed;
        const orbitX = Math.cos(this.angle) * this.orbitRadius;
        const orbitY = Math.sin(this.angle) * this.orbitRadius;

        this.x += this.speedX + orbitX;
        this.y += this.speedY + orbitY;

        // Bounce off edges with random speed change
        if (this.x > canvas.width || this.x < 0) {
          this.speedX *= -1;
          this.speedX += (Math.random() - 0.5) * 0.4;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY *= -1;
          this.speedY += (Math.random() - 0.5) * 0.4;
        }

        // Keep speed in check
        const maxSpeed = 2;
        this.speedX = Math.max(Math.min(this.speedX, maxSpeed), -maxSpeed);
        this.speedY = Math.max(Math.min(this.speedY, maxSpeed), -maxSpeed);
      }

      draw(ctx, particles) {
        // Draw particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Reset connections for this frame
        this.lastConnections = [];

        // Draw connections to nearby particles
        for (let particle of particles) {
          if (particle === this || this.lastConnections.length >= maxConnections) continue;

          const dx = this.x - particle.x;
          const dy = this.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            // Check if other particle still has connection slots
            if (particle.lastConnections.length >= maxConnections) continue;

            const alpha = Math.max(0.2, 1 - (distance / connectionDistance));
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${Math.random() * 60 + 230}, 80%, 60%, ${alpha})`;
            ctx.lineWidth = Math.max(0.5, (1 - distance / connectionDistance) * 2);

            // Create curved lines
            const midX = (this.x + particle.x) / 2;
            const midY = (this.y + particle.y) / 2;
            const offset = Math.sin(Date.now() * 0.001 + distance) * 20;

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(
              midX + offset,
              midY + offset,
              particle.x,
              particle.y
            );
            ctx.stroke();

            // Track connection
            this.lastConnections.push(particle);
            particle.lastConnections.push(this);

            // Add glow effect to connections
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 15, 35, 0.2)'; // Reduced opacity for trailing effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx, particles);
      });

      // Occasionally reset random particles for more dynamic movement
      if (Math.random() < 0.01) {
        const randomParticle = particles[Math.floor(Math.random() * particles.length)];
        randomParticle.reset();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-background" aria-hidden="true" />;
});

ParticleBackground.displayName = 'ParticleBackground';

// Optimized Floating Elements with fewer elements
const FloatingElements = React.memo(() => {
  const emojis = ['🎮', '👾', '🕹️', '🎯', '🎲'];

  return (
    <div className="floating-elements" aria-hidden="true">
      {[...Array(8)].map((_, i) => ( // Reduced from 15 to 8
        <div
          key={i}
          className="floating-element"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`, // Reduced delay
            animationDuration: `${15 + Math.random() * 15}s`, // Reduced duration
            fontSize: `${Math.random() * 15 + 10}px`, // Smaller elements
          }}
        >
          {emojis[i % 5]}
        </div>
      ))}
    </div>
  );
});

FloatingElements.displayName = 'FloatingElements';

// Animated Text with more effects
const AnimatedText = React.memo(({ text, delay = 0, className = "", effect = "typing" }) => {
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
});

AnimatedText.displayName = 'AnimatedText';

// Simplified Cursor Trail (removed for performance)
const CursorTrail = React.memo(() => {
  return null; // Disabled for performance
});

CursorTrail.displayName = 'CursorTrail';

// Hover Effects Provider
const HoverEffects = React.memo(() => {
  useEffect(() => {
    const addHoverEffects = () => {
      // Add ripple effect to buttons
      const buttons = document.querySelectorAll('button, .genre-filter');
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
});

HoverEffects.displayName = 'HoverEffects';

// GameCard Component with reduced effects
const GameCard = React.memo(({ game, onSelect, isSelected, index, isFavorite, onToggleFavorite, user }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Staggered animation for cards with more dynamic effect
    cardRef.current.style.animationDelay = `${index * 0.07}s`;

    // Only add parallax effect on larger screens
    if (window.innerWidth > 768) {
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
        if (cardRef.current) {
          cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        }
      };

      const cardElement = cardRef.current;
      cardElement.addEventListener('mousemove', handleMouseMove);
      cardElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        if (cardElement) {
          cardElement.removeEventListener('mousemove', handleMouseMove);
          cardElement.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [index]);

  const handleClick = useCallback(() => {
    onSelect(game);
  }, [onSelect, game]);

  const handleImageError = useCallback((e) => {
    e.target.src = `https://placehold.co/300x200/5e3cb5/white?text=${encodeURIComponent(game.name)}`;
  }, [game.name]);

  return (
    <div
      ref={cardRef}
      className={`game-card ${isSelected ? "selected" : ""} ${isFavorite ? "favorite" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Play ${game.name}, ${game.genre} game`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
          e.preventDefault();
        }
      }}
    >
      <div className="game-image-container">
        <img
          src={game.img}
          alt={game.name}
          onError={handleImageError}
          loading="lazy"
        />
        <div className="game-hover-effect">
          <span className="play-button">▶</span>
        </div>
        <div className="game-gradient-overlay"></div>
      </div>
      <div className="game-info">
        <h3>{game.name}</h3>
        <span className="game-genre">{game.genre}</span>
      </div>
      {user && (
        <button
          className="favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game);
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}
    </div>
  );
});

GameCard.displayName = 'GameCard';

// GenreFilter Component
const GenreFilter = React.memo(({ genres, selectedGenre, onSelect }) => {
  const handleClick = useCallback((genre) => {
    onSelect(genre);
  }, [onSelect]);

  return (
    <div className="genre-filters">
      {genres.map(genre => (
        <button
          key={genre}
          className={`genre-filter ${selectedGenre === genre ? "active" : ""}`}
          onClick={() => handleClick(genre)}
          aria-pressed={selectedGenre === genre}
        >
          <span className="filter-text">{genre}</span>
        </button>
      ))}
    </div>
  );
});

GenreFilter.displayName = 'GenreFilter';

// GameView Component
const GameView = React.memo(({ game, onClose, isOpen, trackGamePlay }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && game) {
      trackGamePlay(game);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, game, onClose, trackGamePlay]);

  if (!isOpen) return null;

  return (
    <div className="game-view-overlay">
      <div className="game-view-backdrop"></div>
      <div className="game-view-container">
        <div className="game-view-header">
          <h2>{game.name}</h2>
          <button
            className="close-game-btn"
            onClick={onClose}
            aria-label="Close game"
          >
            <span>✕</span>
          </button>
        </div>
        <div className="game-frame-container">
          <iframe
            src={game.url}
            title={game.name}
            allowFullScreen
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
});

GameView.displayName = 'GameView';

// ThemeToggle Component
const ThemeToggle = React.memo(({ theme, toggleTheme }) => {
  const handleClick = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <div
      className="theme-toggle"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
          e.preventDefault();
        }
      }}
    >
      <div className={`toggle-track ${theme}`}>
        <div className="toggle-thumb">
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
      <span className="theme-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

// AuthModal Component
const AuthModal = React.memo(({ onClose, onLogin, mode, setMode }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
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
  }, [mode, username, email, password, confirmPassword, dob]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === 'login') {
      onLogin({ username: email.split('@')[0], email, dob: "2000-01-01" });
    } else {
      onLogin({ username, email, dob });
    }

    onClose();
  }, [validateForm, mode, onLogin, onClose, email, username, dob]);

  const handleModeSwitch = useCallback(() => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
  }, [mode, setMode]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-backdrop"></div>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
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
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              <label>Username</label>
              <div className="input-underline"></div>
              {errors.username && <span id="username-error" className="error-text">{errors.username}</span>}
            </div>
          )}

          <div className="input-field">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            <label>Email</label>
            <div className="input-underline"></div>
            {errors.email && <span id="email-error" className="error-text">{errors.email}</span>}
          </div>

          <div className="input-field">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <label>Password</label>
            <div className="input-underline"></div>
            {errors.password && <span id="password-error" className="error-text">{errors.password}</span>}
          </div>

          {mode === 'signup' && (
            <>
              <div className="input-field">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                <label>Confirm Password</label>
                <div className="input-underline"></div>
                {errors.confirmPassword && <span id="confirm-password-error" className="error-text">{errors.confirmPassword}</span>}
              </div>

              <div className="input-field">
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className={errors.dob ? 'error' : ''}
                  aria-invalid={!!errors.dob}
                  aria-describedby={errors.dob ? 'dob-error' : undefined}
                />
                <label>Date of Birth</label>
                <div className="input-underline"></div>
                {errors.dob && <span id="dob-error" className="error-text">{errors.dob}</span>}
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            <span>{mode === 'login' ? 'CONNECT' : 'REGISTER'}</span>
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {mode === 'login' ? "New to Portal? " : "Already have an account? "}
            <span onClick={handleModeSwitch} role="button" tabIndex={0}>
              {mode === 'login' ? 'Create account' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
});

AuthModal.displayName = 'AuthModal';

// StatsPanel Component
const StatsPanel = React.memo(({ gameStats, gameHistory, favorites, achievements }) => {
  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h3>Your Gaming Stats</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🎮</span>
            <span className="stat-value">{gameHistory.length}</span>
            <span className="stat-label">Games Played</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{favorites.length}</span>
            <span className="stat-label">Favorites</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{Object.keys(achievements).length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';

// PlayerProfile Component
const PlayerProfile = React.memo(({ user, gameHistory, favorites, achievements }) => {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="player-profile">
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'history' && (
          <div className="history-list">
            {gameHistory.slice(0, 10).map((record, index) => (
              <div key={index} className="history-item">
                <img src={GAMES.find(g => g.name === record.game)?.img} alt={record.game} />
                <div className="history-info">
                  <h4>{record.game}</h4>
                  <span>{new Date(record.playedAt).toLocaleDateString()}</span>
                </div>
                <span className="play-duration">
                  {Math.floor((record.duration || 0) / 1000 / 60)}m
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="favorites-grid">
            {favorites.slice(0, 12).map((game, index) => (
              <div key={index} className="favorite-item">
                <img src={game.img} alt={game.name} />
                <h4>{game.name}</h4>
                <span>{new Date(game.addedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-grid">
            {Object.entries(achievements).map(([id, achievement]) => (
              <div key={id} className="achievement-item">
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

PlayerProfile.displayName = 'PlayerProfile';

// LoadingScreen Component
const LoadingScreen = React.memo(({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-screen">
      <div className="loader">
        <div className="loader-spinner">
          <div className="loader-orb"></div>
        </div>
        <div className="loader-text">
          <AnimatedText text="Initializing Gaming Portal..." delay={0} />
        </div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

// Notification Component
const NotificationContainer = React.memo(({ notifications }) => {
  return (
    <div className="notification-container">
      {notifications.map(({ id, message, type }) => (
        <div key={id} className={`notification ${type}`}>
          <span className="notification-message">{message}</span>
        </div>
      ))}
    </div>
  );
});

NotificationContainer.displayName = 'NotificationContainer';

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedGame, setSelectedGame] = useState(null);
  const [sortBy, setSortBy] = useState('popular');

  const { theme, toggleTheme } = useTheme();
  const { selectedGenre, setSelectedGenre, searchText, setSearchText, genres, filteredGames } = useGameFilter(GAMES);
  const { user, setUser, favorites, gameHistory, achievements, gameStats, notifications, showNotification, toggleFavorite, trackGamePlay } = useUserData();

  const sortGames = useCallback((games) => {
    const sortedGames = [...games];

    switch (sortBy) {
      case 'newest':
        return sortedGames.sort((a, b) => {
          const aHistory = gameHistory.find(h => h.game === a.name);
          const bHistory = gameHistory.find(h => h.game === b.name);
          return (bHistory?.playedAt || '').localeCompare(aHistory?.playedAt || '');
        });

      case 'alphabetical':
        return sortedGames.sort((a, b) => a.name.localeCompare(b.name));

      case 'favorites':
        return sortedGames.sort((a, b) => {
          const aFav = favorites.some(f => f.name === a.name);
          const bFav = favorites.some(f => f.name === b.name);
          if (aFav === bFav) {
            // If both are favorites or both aren't, sort by play count
            const aPlays = gameHistory.filter(h => h.game === a.name).length;
            const bPlays = gameHistory.filter(h => h.game === b.name).length;
            return bPlays - aPlays;
          }
          return bFav - aFav;
        });

      case 'popular':
      default:
        return sortedGames.sort((a, b) => {
          const aStats = gameStats[`game_${a.name.toLowerCase().replace(/\s+/g, '_')}`] || {};
          const bStats = gameStats[`game_${b.name.toLowerCase().replace(/\s+/g, '_')}`] || {};
          return (bStats.playCount || 0) - (aStats.playCount || 0);
        });

      case 'trending':
        const now = new Date();
        return sortedGames.sort((a, b) => {
          const aRecent = gameHistory.filter(h => h.game === a.name &&
            new Date(h.playedAt) > new Date(now - 24 * 60 * 60 * 1000)).length;
          const bRecent = gameHistory.filter(h => h.game === b.name &&
            new Date(h.playedAt) > new Date(now - 24 * 60 * 60 * 1000)).length;
          return bRecent - aRecent;
        });
    }
  }, [sortBy, gameHistory, favorites, gameStats]);

  const sortedGames = useMemo(() => sortGames(filteredGames), [sortGames, filteredGames]);

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
    }, 2000);

    return () => clearTimeout(timer);
  }, [theme]);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    showNotification(`Welcome back, ${userData.username}!`, 'success');
  }, [setUser, showNotification]);

  const handleLogout = useCallback(() => {
    setUser(null);
    showNotification('Logged out successfully', 'info');
  }, [setUser, showNotification]);

  const handleGameSelect = useCallback((game) => {
    setSelectedGame(game);
  }, []);

  const handleGameClose = useCallback(() => {
    setSelectedGame(null);
  }, []);

  const handleAuthShow = useCallback((mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  }, []);

  const handleAuthClose = useCallback(() => {
    setShowAuth(false);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
  }, [setSearchText]);

  return (
    <div className="container">
      {/* Enhanced Animated Background */}
      <ParticleBackground />
      <FloatingElements />
      <CursorTrail />
      <HoverEffects />

      {/* Loading Screen */}
      <LoadingScreen isLoading={isLoading} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo">
            <div className="logo-icon">🎮</div>
          </div>
          <h1 className="portal-title">
            <AnimatedText text="GAME" delay={0} />
            <AnimatedText text="PORTAL" delay={400} className="title-part" />
          </h1>
        </div>

        <div className="nav-actions">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {user ? (
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
                <div className="user-status"></div>
              </div>
              <span className="welcome">Hi, {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button onClick={() => handleAuthShow('login')} className="login-btn">
              <span>Login</span>
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
                onChange={handleSearchChange}
                className="search-input"
                aria-label="Search games"
              />
              <div className="search-icon">🔍</div>
            </div>
          </div>
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

        {/* Sort Options */}
        <div className="sort-options">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="alphabetical">A-Z</option>
            <option value="favorites">Favorites</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        {/* Games Grid */}
        <section className="games-section">
          <div className="section-header">
            <h3>{selectedGenre === "All" ? "All Games" : selectedGenre + " Games"}</h3>
            <span className="games-count">{sortedGames.length} games</span>
          </div>

          <div className="games-grid">
            {sortedGames.map((game, index) => (
              <GameCard
                key={game.name}
                game={game}
                onSelect={handleGameSelect}
                isSelected={selectedGame?.name === game.name}
                index={index}
                isFavorite={favorites.some(f => f.name === game.name)}
                onToggleFavorite={toggleFavorite}
                user={user}
              />
            ))}
          </div>
        </section>

        {/* Stats Panel */}
        {user && (
          <>
            <StatsPanel
              gameStats={gameStats}
              gameHistory={gameHistory}
              favorites={favorites}
              achievements={achievements}
            />
            <PlayerProfile
              user={user}
              gameHistory={gameHistory}
              favorites={favorites}
              achievements={achievements}
            />
          </>
        )}
      </main>

      {/* Game View Overlay */}
      <GameView
        game={selectedGame}
        onClose={handleGameClose}
        isOpen={!!selectedGame}
        trackGamePlay={trackGamePlay}
      />

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={handleAuthClose}
          onLogin={handleLogin}
          mode={authMode}
          setMode={setAuthMode}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>GAME PORTAL © 2023 | Play Free Online Games</p>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>

      {/* Notifications */}
      <NotificationContainer notifications={notifications} />
    </div>
  );
}

export default App;