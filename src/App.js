import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";
import AuthModal from "./AuthModal";

// Moved games data to a separate file (would be imported in a real project)
const GAMES = [
  { name: "Kour.io", url: "https://kour.io/", img: "/download.jfif", genre: "FPS" },
  { name: "Slope 3D", url: "https://storage.y8.com/y8-studio/unity/joll/slope/?key=9757549&value=80527", img: "/slope3.png", genre: "Arcade" },
  { name: "Krunker", url: "https://krunker.io/", img: "/krunker.PNG", genre: "FPS" },
  { name: "Chrome Dino", url: "https://codingwith-adam.github.io/dino-game/index.html", img: "/dino.png", genre: "Platformer" },
  { name: "Flappy Bird", url: "https://flappybird.io/", img: "https://upload.wikimedia.org/wikipedia/en/0/0a/Flappy_Bird_icon.png", genre: "Arcade" },
  { name: "Snake", url: "https://www.snakegame.net/", img: "/snake.png", genre: "Arcade" },
  { name: "Minecraft Classic", url: "https://classic.minecraft.net/", img: "/minecraft.png", genre: "Sandbox" },
  { name: "Pac-Man", url: "https://funhtml5games.com?play=pacman", img: "/pacman.png", genre: "Arcade" },
  { name: "Slither.io", url: "https://slither.io/", img: "/sli.PNG", genre: "IO" },
  { name: "Drift.io", url: "https://drift.io/", img: "/drift.avif", genre: "IO" },
  { name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", img: "/wordle.PNG", genre: "Word" },
  { name: "Chess", url: "https://playpager.com/embed/chess/index.html", img: "/chess.PNG", genre: "Board" },
  { name: "Checkers", url: "https://playpager.com/embed/checkers/index.html", img: "/checkers.PNG", genre: "Board" },
  { name: "Othello", url: "https://playpager.com/embed/reversi/index.html", img: "/othello.PNG", genre: "Board" },
  { name: "Solitaire", url: "https://playpager.com/embed/solitaire/index.html", img: "/solitaire.PNG", genre: "Card" },
  { name: "Falling Cubes", url: "https://playpager.com/embed/cubes/index.html", img: "/tet.jfif", genre: "Puzzle" },

  { name: "Hextris", url: "https://hextris.io/?utm_source=chatgpt.com", img: "/hextrix.PNG", genre: "Arcade" },
  { name: "N Game (v2)", url: "https://www.thewayoftheninja.org/nv2.html", img: "/nv2.PNG", genre: "Platformer" },
  { name: "Celeste Classic", url: "https://maddymakesgamesinc.itch.io/celesteclassic?utm_source=chatgpt.com", img: "/celeste.PNG", genre: "Platformer" },
  { name: "Line Rider", url: "https://www.linerider.com/", img: "/linerider.PNG", genre: "Sandbox" },
  { name: "Townscaper", url: "https://oskarstalberg.com/Townscaper/", img: "/townscaper.PNG", genre: "Sandbox" },
  { name: "Sandspiel", url: "https://sandspiel.club/", img: "/sands.png", genre: "Sandbox" },
  { name: "OvO", url: "https://www.mortgagecalculator.org/money-games/ovo/", img: "/ovo.PNG", genre: "Platformer" },
  { name: "Agar.io", url: "https://agar.io/#ffa", img: "/agar.PNG", genre: "IO" },
  { name: "Diep.io", url: "https://diep.io/", img: "/diep.PNG", genre: "IO" },
  { name: "MooMoo.io", url: "https://moomoo.io/?server=singapore:PW", img: "/moomoo.PNG", genre: "IO" },
  { name: "Zombs.io", url: "https://zombs.io/", img: "/zombs.PNG", genre: "IO" },
  { name: "Starblast.io", url: "https://starblast.io/#7134", img: "/starblast.PNG", genre: "IO" },
  { name: "Run 3", url: "https://run3.io", img: "/run3.PNG", genre: "Platformer" },
];

// Custom hook for theme management
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference or respect device preference
    const savedTheme = localStorage.getItem('theme');
    const devicePrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (devicePrefersDark ? 'dark' : 'light');
  });

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
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
      const matchSearch = game.name.toLowerCase().includes(searchText.toLowerCase());
      return matchGenre && matchSearch;
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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gameUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

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

  const [notifications, setNotifications] = useState([]);
  const activeTimersRef = useRef({});
  const currentSessionIdRef = useRef(null);

  const showNotification = useCallback((message, type = 'info') => {
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

      localStorage.setItem('gameFavorites', JSON.stringify(newFavorites));

      const message = isFavorite ?
        `${game.name} removed from favorites` :
        `${game.name} added to favorites`;

      showNotification(message, isFavorite ? 'info' : 'success');

      if (!isFavorite) {
        checkFavoriteAchievements(newFavorites.length);
      }

      return newFavorites;
    });
  }, [showNotification]);

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

  const trackGamePlay = useCallback((game) => {
    const startTime = new Date();
    const sessionId = Math.random().toString(36).substr(2, 9);

    const playRecord = {
      game: game.name,
      genre: game.genre,
      playedAt: startTime.toISOString(),
      startTime: startTime.toISOString(),
      sessionId,
      duration: 0
    };

    setGameHistory(prevHistory => {
      const newHistory = [playRecord, ...prevHistory.slice(0, 99)]; // Keep only last 100 records
      localStorage.setItem('gameHistory', JSON.stringify(newHistory));
      updateGameStats(game.name, game.genre);
      return newHistory;
    });

    // Start session timer
    const sessionTimer = setInterval(() => {
      setGameHistory(prevHistory => {
        const updatedHistory = prevHistory.map(record => {
          if (record.sessionId === sessionId) {
            const duration = Math.floor((new Date() - new Date(record.startTime)) / 1000); // Convert to seconds
            return { ...record, duration };
          }
          return record;
        });
        localStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }, 1000);

    // Store session timer for cleanup
    activeTimersRef.current[sessionId] = sessionTimer;
    currentSessionIdRef.current = sessionId;

    // Check for achievements
    checkPlayAchievements(gameHistory.length + 1);
  }, [gameHistory.length, updateGameStats]);

  const endCurrentSession = useCallback(() => {
    const sessionId = currentSessionIdRef.current;
    if (!sessionId) return;
    const timer = activeTimersRef.current[sessionId];
    if (timer) {
      clearInterval(timer);
      delete activeTimersRef.current[sessionId];
    }
    currentSessionIdRef.current = null;
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(activeTimersRef.current).forEach(timer => {
        clearInterval(timer);
      });
    };
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
      showNotification(`🏆 Achievement Unlocked: ${title}`, 'achievement');

      return newAchievements;
    });
  }, [getAchievementIcon, showNotification]);

  const loginUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('gameUser', JSON.stringify(userData));
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem('gameUser');

    // Clear active timers
    Object.values(activeTimersRef.current).forEach(timer => {
      clearInterval(timer);
    });
    activeTimersRef.current = {};
    currentSessionIdRef.current = null;
  }, []);

  const resetAllStats = useCallback(() => {
    endCurrentSession();
    setGameHistory([]);
    setAchievements({});
    setGameStats({});
    localStorage.removeItem('gameHistory');
    localStorage.removeItem('gameAchievements');
    localStorage.removeItem('gameStats');
    showNotification('Your stats have been reset', 'info');
  }, [endCurrentSession, showNotification]);

  return {
    user,
    loginUser,
    logoutUser,
    favorites,
    gameHistory,
    achievements,
    gameStats,
    notifications,
    showNotification,
    toggleFavorite,
    trackGamePlay,
    endCurrentSession,
    resetAllStats
  };
};

// Custom hook for particle settings
function useParticleSettings() {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const [particleCount, setParticleCount] = useState(() => {
    const saved = localStorage.getItem('particleCount');
    return saved ? clamp(Number(saved), 10, 120) : 45;
  });
  const [connectionDistance, setConnectionDistance] = useState(() => {
    const saved = localStorage.getItem('connectionDistance');
    return saved ? clamp(Number(saved), 60, 350) : 170;
  });
  const [maxConnections, setMaxConnections] = useState(() => {
    const saved = localStorage.getItem('maxConnections');
    return saved ? clamp(Number(saved), 1, 30) : 20;
  });
  const [cursorRange, setCursorRange] = useState(() => {
    const saved = localStorage.getItem('cursorRange');
    return saved ? clamp(Number(saved), 30, 200) : 80;
  });
  const [cursorInteraction, setCursorInteraction] = useState(() => {
    const saved = localStorage.getItem('cursorInteraction');
    return saved ? clamp(Number(saved), -3, 3) : 1;
  });

  // New advanced settings
  const [minSize, setMinSize] = useState(() => {
    const saved = localStorage.getItem('minSize');
    return saved ? clamp(Number(saved), 1, 6) : 2;
  });
  const [maxSize, setMaxSize] = useState(() => {
    const saved = localStorage.getItem('maxSize');
    return saved ? clamp(Number(saved), 3, 10) : 5;
  });
  const [speed, setSpeed] = useState(() => {
    const saved = localStorage.getItem('particleSpeed');
    return saved ? clamp(Number(saved), 0.2, 2.5) : 1.0;
  });
  const [particleColor, setParticleColor] = useState(() => localStorage.getItem('particleColor') || '#7a8cff');
  const [lineColor, setLineColor] = useState(() => localStorage.getItem('lineColor') || '#7a8cff');
  const [dynamicHue, setDynamicHue] = useState(() => {
    const saved = localStorage.getItem('dynamicHue');
    return saved ? saved === 'true' : true;
  });
  const [safeMode, setSafeMode] = useState(() => {
    const saved = localStorage.getItem('particleSafeMode');
    return saved ? saved === 'true' : true;
  });
  const [particlesEnabled, setParticlesEnabled] = useState(() => {
    const saved = localStorage.getItem('particlesEnabled');
    return saved ? saved === 'true' : true;
  });

  // Persist settings
  useEffect(() => { localStorage.setItem('particleCount', String(particleCount)); }, [particleCount]);
  useEffect(() => { localStorage.setItem('connectionDistance', String(connectionDistance)); }, [connectionDistance]);
  useEffect(() => { localStorage.setItem('maxConnections', String(maxConnections)); }, [maxConnections]);
  useEffect(() => { localStorage.setItem('cursorRange', String(cursorRange)); }, [cursorRange]);
  useEffect(() => { localStorage.setItem('cursorInteraction', String(cursorInteraction)); }, [cursorInteraction]);
  useEffect(() => { localStorage.setItem('minSize', String(minSize)); }, [minSize]);
  useEffect(() => { localStorage.setItem('maxSize', String(maxSize)); }, [maxSize]);
  useEffect(() => { localStorage.setItem('particleSpeed', String(speed)); }, [speed]);
  useEffect(() => { localStorage.setItem('particleColor', particleColor); }, [particleColor]);
  useEffect(() => { localStorage.setItem('lineColor', lineColor); }, [lineColor]);
  useEffect(() => { localStorage.setItem('dynamicHue', String(dynamicHue)); }, [dynamicHue]);
  useEffect(() => { localStorage.setItem('particleSafeMode', String(safeMode)); }, [safeMode]);
  useEffect(() => { localStorage.setItem('particlesEnabled', String(particlesEnabled)); }, [particlesEnabled]);

  const resetToDefaults = () => {
    setParticleCount(45);
    setConnectionDistance(170);
    setMaxConnections(20);
    setCursorRange(80);
    setMinSize(2);
    setMaxSize(5);
    setSpeed(1.0);
    setParticleColor('#7a8cff');
    setLineColor('#7a8cff');
    setDynamicHue(true);
    setSafeMode(true);
    setParticlesEnabled(true);
  };

  return {
    // values
    particleCount, setParticleCount,
    connectionDistance, setConnectionDistance,
    maxConnections, setMaxConnections,
    cursorRange, setCursorRange,
    cursorInteraction, setCursorInteraction,
    minSize, setMinSize,
    maxSize, setMaxSize,
    speed, setSpeed,
    particleColor, setParticleColor,
    lineColor, setLineColor,
    dynamicHue, setDynamicHue,
    safeMode, setSafeMode,
    particlesEnabled, setParticlesEnabled,
    resetToDefaults,
  };
}

// Optimized Particle Background with performance improvements
const ParticleBackground = React.memo(({
  particleCount = 45,
  connectionDistance = 170,
  maxConnections = 20,
  cursorRange = 80,
  cursorInteraction = 1,
  minSize = 2,
  maxSize = 5,
  speed = 1.0,
  particleColor = '#7a8cff',
  lineColor = '#7a8cff',
  dynamicHue = true,
  safeMode = true,
  onAutoTuned,
}) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef(0);
  const particlesRef = useRef([]);
  const fpsRef = useRef({ last: performance.now(), acc: 0, frames: 0, avg: 60 });
  const effectiveRef = useRef({ particleCount, connectionDistance, maxConnections });
  const hueShiftRef = useRef(0);

  // Particle class definition
  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }

    reset() {
      const s = Math.max(0.2, speed);
      this.speedX = (Math.random() - 0.5) * 1.5 * s;
      this.speedY = (Math.random() - 0.5) * 1.5 * s;
      const minS = Math.min(minSize, maxSize);
      const maxS = Math.max(minSize, maxSize);
      this.size = Math.random() * (maxS - minS) + minS;
      this.baseHue = Math.random() * 60 + 230;
      const hue = (this.baseHue + hueShiftRef.current) % 360;
      this.color = dynamicHue ? `hsl(${hue}, 80%, 60%)` : particleColor;
      this.angle = Math.random() * Math.PI * 2;
      this.orbitSpeed = (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? 1 : -1);
      this.orbitRadius = Math.random() * 3;
      this.lastConnections = [];
    }

    update(mouse, cursorRange, cursorInteraction) {
      // Parallax/repulsion from mouse
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < cursorRange && dist > 0) {
        const force = cursorInteraction * 1.5;
        this.x += dx / dist * force;
        this.y += dy / dist * force;
      }

      // Orbital motion
      this.angle += this.orbitSpeed;
      const orbitX = Math.cos(this.angle) * this.orbitRadius;
      const orbitY = Math.sin(this.angle) * this.orbitRadius;
      this.x += this.speedX + orbitX;
      this.y += this.speedY + orbitY;

      // Bounce off edges
      if (this.x > this.canvas.width || this.x < 0) this.speedX *= -1;
      if (this.y > this.canvas.height || this.y < 0) this.speedY *= -1;
    }

    draw(ctx, particles, maxConnections, connectionDistance) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      this.lastConnections = [];

      for (let particle of particles) {
        if (particle === this || this.lastConnections.length >= maxConnections) continue;

        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance && particle.lastConnections.length < maxConnections) {
          const alpha = Math.max(0.15, 1 - (distance / connectionDistance));
          ctx.beginPath();
          const hue = (this.baseHue + particle.baseHue + hueShiftRef.current) / 2 % 360;
          ctx.strokeStyle = dynamicHue
            ? `hsla(${hue}, 80%, 60%, ${alpha})`
            : `${lineColor}${lineColor.length === 4 || lineColor.length === 7 ? (alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, '0') : '') : ''}`;
          ctx.lineWidth = Math.max(0.5, (1 - distance / connectionDistance) * 2);

          const midX = (this.x + particle.x) / 2;
          const midY = (this.y + particle.y) / 2;
          const offset = Math.sin(Date.now() * 0.001 + distance) * 20;

          ctx.moveTo(this.x, this.y);
          ctx.quadraticCurveTo(
            midX + offset,
            midY + offset,
            particle.x,
            particle.y
          );

          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
          ctx.stroke();
          ctx.shadowBlur = 0;

          this.lastConnections.push(particle);
          particle.lastConnections.push(this);
        }
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const init = () => {
      particlesRef.current = [];
      effectiveRef.current = {
        particleCount: safeMode ? Math.min(particleCount, 90) : particleCount,
        connectionDistance: safeMode ? Math.min(connectionDistance, 250) : connectionDistance,
        maxConnections: safeMode ? Math.min(maxConnections, 18) : maxConnections,
      };
      for (let i = 0; i < effectiveRef.current.particleCount; i++) {
        particlesRef.current.push(new Particle(canvas));
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 15, 35, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // slight global hue shift for a subtle animated palette
      if (dynamicHue) {
        hueShiftRef.current = (hueShiftRef.current + 0.3) % 360;
      }

      particlesRef.current.forEach(p => {
        p.update(mouseRef.current, cursorRange, cursorInteraction);
        p.draw(ctx, particlesRef.current, effectiveRef.current.maxConnections, effectiveRef.current.connectionDistance);
      });

      if (Math.random() < 0.01 && particlesRef.current.length > 0) {
        const randomIndex = Math.floor(Math.random() * particlesRef.current.length);
        particlesRef.current[randomIndex].reset();
      }

      // FPS measurement and auto-tune
      const now = performance.now();
      const delta = now - fpsRef.current.last;
      fpsRef.current.last = now;
      const fps = 1000 / Math.max(1, delta);
      fpsRef.current.acc += fps;
      fpsRef.current.frames += 1;
      if (fpsRef.current.frames >= 30) {
        fpsRef.current.avg = fpsRef.current.acc / fpsRef.current.frames;
        fpsRef.current.acc = 0;
        fpsRef.current.frames = 0;

        if (safeMode && fpsRef.current.avg < 45) {
          // Reduce load progressively
          effectiveRef.current.particleCount = Math.max(20, Math.floor(effectiveRef.current.particleCount * 0.85));
          effectiveRef.current.connectionDistance = Math.max(100, Math.floor(effectiveRef.current.connectionDistance * 0.9));
          effectiveRef.current.maxConnections = Math.max(8, Math.floor(effectiveRef.current.maxConnections * 0.9));

          // Trim particles if needed
          if (particlesRef.current.length > effectiveRef.current.particleCount) {
            particlesRef.current.length = effectiveRef.current.particleCount;
          }

          if (onAutoTuned) {
            onAutoTuned({
              particleCount: effectiveRef.current.particleCount,
              connectionDistance: effectiveRef.current.connectionDistance,
              maxConnections: effectiveRef.current.maxConnections,
              avgFps: Math.round(fpsRef.current.avg)
            });
          }
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    // Initial setup
    resizeCanvas();
    init();
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [particleCount, connectionDistance, maxConnections, cursorRange, cursorInteraction, minSize, maxSize, speed, particleColor, lineColor, dynamicHue, safeMode, onAutoTuned]);

  return <canvas ref={canvasRef} className="particle-background" aria-hidden="true" />;
});

ParticleBackground.displayName = 'ParticleBackground';

// Optimized Floating Elements with performance improvements
const FloatingElements = React.memo(() => {
  const emojis = ['🎮', '👾', '🕹️', '🎯', '🎲'];
  const elements = useMemo(() =>
    [...Array(8)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${15 + Math.random() * 15}s`,
      size: `${Math.random() * 15 + 10}px`,
      emoji: emojis[i % 5]
    })),
    []);

  return (
    <div className="floating-elements" aria-hidden="true">
      {elements.map(({ id, left, delay, duration, size, emoji }) => (
        <div
          key={id}
          className="floating-element"
          style={{
            left,
            animationDelay: delay,
            animationDuration: duration,
            fontSize: size,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
});

FloatingElements.displayName = 'FloatingElements';

// Improved Animated Text component
const AnimatedText = React.memo(({ text, delay = 0, className = "", effect = "typing", onAnimationComplete }) => {
  const [animatedText, setAnimatedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (effect === "typing" && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setAnimatedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);

        // Call completion callback when done
        if (currentIndex + 1 === text.length && onAnimationComplete) {
          onAnimationComplete();
        }
      }, 50 + delay);

      return () => clearTimeout(timeout);
    } else if (effect === "fadeIn") {
      setAnimatedText(text);
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, delay);
      }
    }
  }, [currentIndex, text, delay, effect, onAnimationComplete]);

  return <span className={`${className} ${effect}-effect`}>{animatedText}</span>;
});

AnimatedText.displayName = 'AnimatedText';

// GameCard Component with performance improvements
const GameCard = React.memo(({ game, onSelect, isSelected, index, isFavorite, onToggleFavorite, user }) => {
  const cardRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Staggered animation for cards
    cardRef.current.style.animationDelay = `${index * 0.07}s`;

    // Only add parallax effect on larger screens
    if (window.innerWidth > 768) {
      const handleMouseMove = (e) => {
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }

        rafId.current = requestAnimationFrame(() => {
          const card = cardRef.current;
          if (!card) return;

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
        });
      };

      const handleMouseLeave = () => {
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }

        if (cardRef.current) {
          cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        }
      };

      const cardElement = cardRef.current;
      cardElement.addEventListener('mousemove', handleMouseMove);
      cardElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }

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

  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation();
    onToggleFavorite(game);
  }, [onToggleFavorite, game]);

  const handleImageError = useCallback((e) => {
    e.target.src = `https://placehold.co/300x200/5e3cb5/white?text=${encodeURIComponent(game.name)}`;
  }, [game.name]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
      e.preventDefault();
    }
  }, [handleClick]);

  return (
    <div
      ref={cardRef}
      className={`game-card ${isSelected ? "selected" : ""} ${isFavorite ? "favorite" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Play ${game.name}, ${game.genre} game`}
      onKeyPress={handleKeyPress}
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
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? `Remove ${game.name} from favorites` : `Add ${game.name} to favorites`}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}
    </div>
  );
});

GameCard.displayName = 'GameCard';

// GenreFilter Component with performance improvements
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

// GameView Component with improved accessibility
const GameView = React.memo(({ game, onClose, isOpen, trackGamePlay, endCurrentSession }) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [frameKey, setFrameKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

      // Focus the iframe for keyboard accessibility
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.focus();
        }
      }, 100);
    }

    return () => {
      endCurrentSession && endCurrentSession();
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, game, onClose, trackGamePlay, endCurrentSession]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      endCurrentSession && endCurrentSession();
      onClose();
    }
  }, [onClose, endCurrentSession]);

  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
    };
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fsEl) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exit) exit.call(document);
      return;
    }
    const el = containerRef.current || iframeRef.current;
    if (!el) return;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (request) request.call(el);
  }, []);

  const handleReload = useCallback(() => {
    setFrameKey(k => k + 1);
  }, []);

  // open-in-new-tab and copy-link removed per request

  if (!isOpen) return null;

  return (
    <div className="game-view-overlay" onClick={handleOverlayClick}>
      <div className="game-view-backdrop"></div>
      <div className="game-view-container" ref={containerRef}>
        <div className="game-view-header">
          <h2 id="game-view-title">{game.name}</h2>
          <div className="game-actions">
            <button className="icon-btn" title="Reload" onClick={handleReload} type="button">⟳</button>
            <button className="icon-btn" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={handleFullscreenToggle} type="button">{isFullscreen ? '⤡' : '⤢'}</button>
          </div>
          <button
            className="close-game-btn"
            onClick={() => { endCurrentSession && endCurrentSession(); onClose(); }}
            aria-label="Close game"
            type="button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="game-frame-container">
          <iframe
            ref={iframeRef}
            key={frameKey}
            src={game.url}
            title={game.name}
            allowFullScreen
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"
            loading="eager"
            aria-labelledby="game-view-title"
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

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
      e.preventDefault();
    }
  }, [handleClick]);

  return (
    <div
      className="theme-toggle"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onKeyPress={handleKeyPress}
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


// Update the StatsPanel component to show correct data
const StatsPanel = React.memo(({ gameStats, gameHistory, favorites, achievements }) => {
  // Calculate total play time in seconds
  const totalPlayTime = useMemo(() => {
    return gameHistory.reduce((total, record) => total + (record.duration || 0), 0);
  }, [gameHistory]);

  // Format time function
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

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
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <span className="stat-value">{formatTime(totalPlayTime)}</span>
            <span className="stat-label">Play Time</span>
          </div>
        </div>
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';

// PlayerProfile Component with improved data handling
const PlayerProfile = React.memo(({ user, gameHistory, favorites, achievements }) => {
  const [activeTab, setActiveTab] = useState('history');

  const recentHistory = useMemo(() =>
    gameHistory.slice(0, 10),
    [gameHistory]);

  const recentFavorites = useMemo(() =>
    favorites.slice(0, 12),
    [favorites]);

  return (
    <div className="player-profile">
      <div className="profile-tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          role="tab"
          aria-selected={activeTab === 'history'}
        >
          History
        </button>
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
          role="tab"
          aria-selected={activeTab === 'favorites'}
        >
          Favorites
        </button>
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
          role="tab"
          aria-selected={activeTab === 'achievements'}
        >
          Achievements
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'history' && (
          <div className="history-list">
            {recentHistory.length > 0 ? (
              recentHistory.map((record, index) => {
                const game = GAMES.find(g => g.name === record.game);
                return (
                  <div key={`${record.game}-${index}`} className="history-item">
                    <img
                      src={game?.img}
                      alt={record.game}
                      onError={(e) => {
                        e.target.src = `https://placehold.co/40x40/5e3cb5/white?text=${encodeURIComponent(record.game.charAt(0))}`;
                      }}
                    />
                    <div className="history-info">
                      <h4>{record.game}</h4>
                      <span>{new Date(record.playedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="play-duration">
                      {Math.floor((record.duration || 0) / 60)}m
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No games played yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="favorites-grid">
            {recentFavorites.length > 0 ? (
              recentFavorites.map((game, index) => (
                <div key={`${game.name}-${index}`} className="favorite-item">
                  <img
                    src={game.img}
                    alt={game.name}
                    onError={(e) => {
                      e.target.src = `https://placehold.co/60x60/5e3cb5/white?text=${encodeURIComponent(game.name.charAt(0))}`;
                    }}
                  />
                  <h4>{game.name}</h4>
                  <span>{new Date(game.addedAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No favorites yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-grid">
            {Object.entries(achievements).length > 0 ? (
              Object.entries(achievements).map(([id, achievement]) => (
                <div key={id} className="achievement-item">
                  <span className="achievement-icon">{achievement.icon}</span>
                  <div className="achievement-info">
                    <h4>{achievement.title}</h4>
                    <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No achievements yet</p>
              </div>
            )}
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
          <AnimatedText text="Initializing AvesOL..." delay={0} />
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

// Particle Settings Modal
const ParticleSettingsModal = React.memo(function ParticleSettingsModal({
  isOpen,
  onClose,
  particleCount,
  setParticleCount,
  connectionDistance,
  setConnectionDistance,
  maxConnections,
  setMaxConnections,
  cursorRange,
  setCursorRange,
  cursorInteraction,
  setCursorInteraction,
  minSize,
  setMinSize,
  maxSize,
  setMaxSize,
  speed,
  setSpeed,
  particleColor,
  setParticleColor,
  lineColor,
  setLineColor,
  dynamicHue,
  setDynamicHue,
  safeMode,
  setSafeMode,
  particlesEnabled,
  setParticlesEnabled,
  resetToDefaults,
}) {
  const modalRef = useRef(null);
  const [local, setLocal] = useState({
    particleCount,
    connectionDistance,
    maxConnections,
    cursorRange,
    cursorInteraction,
    minSize,
    maxSize,
    speed,
  });
  const [previewKey, setPreviewKey] = useState(0);

  // Particle presets for quick selection
  const presets = [
    {
      name: "Minimal",
      icon: "⚪",
      description: "Clean and simple",
      settings: { particleCount: 20, connectionDistance: 120, maxConnections: 8, speed: 0.8, minSize: 1, maxSize: 3 }
    },
    {
      name: "Balanced",
      icon: "🔵",
      description: "Perfect harmony",
      settings: { particleCount: 45, connectionDistance: 170, maxConnections: 20, speed: 1.0, minSize: 2, maxSize: 5 }
    },
    {
      name: "Intense",
      icon: "🔴",
      description: "High energy",
      settings: { particleCount: 80, connectionDistance: 250, maxConnections: 25, speed: 1.5, minSize: 3, maxSize: 7 }
    },
    {
      name: "Cosmic",
      icon: "⭐",
      description: "Out of this world",
      settings: { particleCount: 100, connectionDistance: 300, maxConnections: 30, speed: 2.0, minSize: 4, maxSize: 8 }
    }
  ];

  useEffect(() => {
    setLocal({
      particleCount,
      connectionDistance,
      maxConnections,
      cursorRange,
      cursorInteraction,
      minSize,
      maxSize,
      speed,
    });
  }, [particleCount, connectionDistance, maxConnections, cursorRange, cursorInteraction, minSize, maxSize, speed]);

  // Update preview when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, [particleCount, maxConnections, dynamicHue, particleColor, lineColor, minSize, maxSize]);

  const debounceRef = useRef(null);
  const commit = (updates) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLocal(prev => ({ ...prev, ...updates }));
    debounceRef.current = setTimeout(() => {
      const v = { ...local, ...updates };
      setParticleCount(v.particleCount);
      setConnectionDistance(v.connectionDistance);
      setMaxConnections(v.maxConnections);
      setCursorRange(v.cursorRange);
      setCursorInteraction(v.cursorInteraction);
      setMinSize(v.minSize);
      setMaxSize(v.maxSize);
      setSpeed(v.speed);
    }, 80);
  };

  const applyPreset = (preset) => {
    const { settings } = preset;
    setLocal(settings);
    setParticleCount(settings.particleCount);
    setConnectionDistance(settings.connectionDistance);
    setMaxConnections(settings.maxConnections);
    setSpeed(settings.speed);
    setMinSize(settings.minSize);
    setMaxSize(settings.maxSize);
    setPreviewKey(prev => prev + 1);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };


    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the modal when opened
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-backdrop"></div>
      <div
        ref={modalRef}
        className="modal-content particle-settings-modal"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="particle-settings-title"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div className="modal-header">
          <h3 id="particle-settings-title" style={{ fontWeight: 800, fontSize: 22, marginBottom: 12, textAlign: "center", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ✨ Particle Studio
          </h3>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
            Customize your particle experience
          </p>
        </div>

        {/* Preset Selection */}
        <div className="preset-section">
          <h4 className="section-title">Quick Presets</h4>
          <div className="preset-grid">
            {presets.map((preset, index) => (
              <button
                key={preset.name}
                className="preset-card"
                onClick={() => applyPreset(preset)}
                type="button"
              >
                <div className="preset-icon">{preset.icon}</div>
                <div className="preset-info">
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-desc">{preset.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="preview-section">
          <h4 className="section-title">Live Preview</h4>
          <div className="particle-preview">
            <div className="preview-canvas" key={previewKey}>
              <div className="preview-particles">
                {Array.from({ length: Math.min(particleCount, 20) }, (_, i) => (
                  <div
                    key={`particle-${i}-${previewKey}`}
                    className="preview-particle"
                    style={{
                      left: `${20 + (i * 15) % 60}%`,
                      top: `${20 + (i * 12) % 60}%`,
                      width: `${Math.max(2, Math.random() * (maxSize - minSize) + minSize)}px`,
                      height: `${Math.max(2, Math.random() * (maxSize - minSize) + minSize)}px`,
                      backgroundColor: dynamicHue ? `hsl(${(i * 18 + previewKey * 0.1) % 360}, 80%, 60%)` : particleColor,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: `${1.5 + Math.random() * 1.5}s`,
                      boxShadow: `0 0 ${Math.max(4, (Math.random() * (maxSize - minSize) + minSize) * 2)}px currentColor`
                    }}
                  />
                ))}
              </div>
              <div className="preview-connections">
                {Array.from({ length: Math.min(Math.floor(maxConnections / 2), 12) }, (_, i) => {
                  const startX = 15 + (i * 8) % 70;
                  const startY = 15 + (i * 10) % 70;
                  const endX = startX + 20 + Math.random() * 30;
                  const endY = startY + 15 + Math.random() * 25;
                  const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

                  return (
                    <div
                      key={`connection-${i}-${previewKey}`}
                      className="preview-connection"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                        width: `${distance}%`,
                        height: '1px',
                        backgroundColor: dynamicHue ? `hsl(${(i * 25 + previewKey * 0.05) % 360}, 80%, 60%)` : lineColor,
                        opacity: Math.max(0.3, 1 - (distance / 50)),
                        transform: `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`,
                        transformOrigin: '0 0',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="preview-info">
              <span className="preview-label">Current Settings</span>
              <div className="preview-stats">
                <span>{particleCount} particles</span>
                <span>•</span>
                <span>{maxConnections} max connections</span>
                <span>•</span>
                <span>{dynamicHue ? 'Rainbow' : 'Static'} colors</span>
                <span>•</span>
                <span>Speed: {speed.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        </div>

        <form className="modal-form particle-settings-form">
          {/* Main Controls */}
          <div className="settings-section">
            <h4 className="section-title">Core Settings</h4>
            {[
              { label: "Particle Count", id: "particle-count", min: 10, max: 120, key: 'particleCount', icon: "🔢" },
              { label: "Connection Distance", id: "connection-distance", min: 60, max: 350, key: 'connectionDistance', icon: "📏" },
              { label: "Max Connections", id: "max-connections", min: 1, max: 30, key: 'maxConnections', icon: "🔗" },
              { label: "Cursor Range", id: "cursor-range", min: 30, max: 200, key: 'cursorRange', icon: "🎯" },
              { label: "Cursor Interaction", id: "cursor-interaction", min: -3, max: 3, key: 'cursorInteraction', icon: "🧲" },
            ].map(({ label, id, min, max, key, icon }) => (
              <div className="particle-setting-row" key={id}>
                <label htmlFor={id}>
                  <span className="setting-icon">{icon}</span>
                  {label}
                  {key === 'cursorInteraction' && (
                    <div className="setting-description">
                      <span className="interaction-label">
                        {local[key] < 0 ? "🧲 Attracts" : local[key] > 0 ? "⚡ Repels" : "🚫 Neutral"}
                      </span>
                    </div>
                  )}
                </label>
                <div className="particle-setting-slider">
                  <input
                    id={id}
                    type="range"
                    min={min}
                    max={max}
                    step={1}
                    value={Number(local[key])}
                    onChange={e => commit({ [key]: Number(e.target.value) })}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  <span className="particle-setting-value">{Number(local[key])}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Settings */}
          <div className="settings-section">
            <h4 className="section-title">Visual Style</h4>
            {[
              { label: "Minimum Size", id: "min-size", min: 1, max: 6, key: 'minSize', icon: "🔸" },
              { label: "Maximum Size", id: "max-size", min: 3, max: 10, key: 'maxSize', icon: "🔹" },
              { label: "Speed", id: "speed", min: 0.2, max: 2.5, step: 0.1, key: 'speed', icon: "⚡" },
            ].map(({ label, id, min, max, key, step, icon }) => (
              <div className="particle-setting-row" key={id}>
                <label htmlFor={id}>
                  <span className="setting-icon">{icon}</span>
                  {label}
                </label>
                <div className="particle-setting-slider">
                  <input
                    id={id}
                    type="range"
                    min={min}
                    max={max}
                    step={step || 1}
                    value={Number(local[key])}
                    onChange={e => commit({ [key]: Number(e.target.value) })}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  <span className="particle-setting-value">{Number(local[key])}</span>
                </div>
              </div>
            ))}

            <div className="particle-setting-row color-row">
              <label htmlFor="particle-color">
                <span className="setting-icon">🎨</span>
                Particle Color
              </label>
              <div className="color-control">
                <input id="particle-color" type="color" value={particleColor} onChange={e => setParticleColor(e.target.value)} />
                <span className="color-value">{particleColor.toUpperCase()}</span>
              </div>
            </div>

            <div className="particle-setting-row color-row">
              <label htmlFor="line-color">
                <span className="setting-icon">📐</span>
                Connection Color
              </label>
              <div className="color-control">
                <input id="line-color" type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} />
                <span className="color-value">{lineColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="settings-section">
            <h4 className="section-title">Advanced Options</h4>

            <div className="toggle-group">
              <div className="modern-toggle">
                <input
                  id="dynamic-hue"
                  type="checkbox"
                  checked={dynamicHue}
                  onChange={e => setDynamicHue(e.target.checked)}
                />
                <label htmlFor="dynamic-hue" className="toggle-label">
                  <div className="toggle-content">
                    <span className="toggle-icon">🌈</span>
                    <div className="toggle-text">
                      <div className="toggle-title">Dynamic Rainbow Colors</div>
                      <div className="toggle-subtitle">Animated color transitions</div>
                    </div>
                  </div>
                  <div className="toggle-switch">
                    <div className="toggle-thumb"></div>
                  </div>
                </label>
              </div>

              <div className="modern-toggle">
                <input
                  id="safe-mode"
                  type="checkbox"
                  checked={safeMode}
                  onChange={e => setSafeMode(e.target.checked)}
                />
                <label htmlFor="safe-mode" className="toggle-label">
                  <div className="toggle-content">
                    <span className="toggle-icon">🛡️</span>
                    <div className="toggle-text">
                      <div className="toggle-title">Performance Safe Mode</div>
                      <div className="toggle-subtitle">Optimized for smooth performance</div>
                    </div>
                  </div>
                  <div className="toggle-switch">
                    <div className="toggle-thumb"></div>
                  </div>
                </label>
              </div>

              <div className="modern-toggle">
                <input
                  id="particles-enabled"
                  type="checkbox"
                  checked={particlesEnabled}
                  onChange={e => setParticlesEnabled(e.target.checked)}
                />
                <label htmlFor="particles-enabled" className="toggle-label">
                  <div className="toggle-content">
                    <span className="toggle-icon">✨</span>
                    <div className="toggle-text">
                      <div className="toggle-title">Particles Enabled</div>
                      <div className="toggle-subtitle">Show particle background</div>
                    </div>
                  </div>
                  <div className="toggle-switch">
                    <div className="toggle-thumb"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>
        <div className="modal-footer">
          <button onClick={resetToDefaults} className="submit-btn ghost" type="button">Reset to Defaults</button>
          <button onClick={onClose} className="submit-btn" type="button">Done</button>
        </div>
      </div>
    </div>
  );
});

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedGame, setSelectedGame] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [showParticleSettings, setShowParticleSettings] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [logoSpinning, setLogoSpinning] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { selectedGenre, setSelectedGenre, searchText, setSearchText, genres, filteredGames } = useGameFilter(GAMES);
  const {
    user,
    loginUser,
    logoutUser,
    favorites,
    gameHistory,
    achievements,
    gameStats,
    notifications,
    showNotification,
    toggleFavorite,
    trackGamePlay,
    endCurrentSession,
    resetAllStats
  } = useUserData();

  // Particle settings hook
  const {
    particleCount, setParticleCount,
    connectionDistance, setConnectionDistance,
    maxConnections, setMaxConnections,
    cursorRange, setCursorRange,
    cursorInteraction, setCursorInteraction,
    minSize, setMinSize,
    maxSize, setMaxSize,
    speed, setSpeed,
    particleColor, setParticleColor,
    lineColor, setLineColor,
    dynamicHue, setDynamicHue,
    safeMode, setSafeMode,
    particlesEnabled, setParticlesEnabled,
    resetToDefaults,
  } = useParticleSettings();

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
    loginUser(userData);
    showNotification(`Welcome back, ${userData.username}!`, 'success');
  }, [loginUser, showNotification]);

  const handleLogout = useCallback(() => {
    logoutUser();
    showNotification('Logged out successfully', 'info');
  }, [logoutUser, showNotification]);

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

  const handleParticleSettingsClose = useCallback(() => {
    setShowParticleSettings(false);
  }, []);

  const handleLogoSecret = useCallback(() => {
    setSecretClicks(prev => {
      const next = Math.min(prev + 1, 10);
      return next;
    });
    setLogoSpinning(true);
    setTimeout(() => setLogoSpinning(false), 600);
  }, []);

  const handleSecretDownload = useCallback(() => {
    if (secretClicks < 10) return;
    const fileId = '1FmjwR0HYO3ECSbPhEWFFjwB5XuLOEeg0';
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  }, [secretClicks]);

  return (
    <div className="container">
      {/* Particle Settings Modal */}
      <ParticleSettingsModal
        isOpen={showParticleSettings}
        onClose={handleParticleSettingsClose}
        particleCount={particleCount}
        setParticleCount={setParticleCount}
        connectionDistance={connectionDistance}
        setConnectionDistance={setConnectionDistance}
        maxConnections={maxConnections}
        setMaxConnections={setMaxConnections}
        cursorRange={cursorRange}
        setCursorRange={setCursorRange}
        cursorInteraction={cursorInteraction}
        setCursorInteraction={setCursorInteraction}
        minSize={minSize}
        setMinSize={setMinSize}
        maxSize={maxSize}
        setMaxSize={setMaxSize}
        speed={speed}
        setSpeed={setSpeed}
        particleColor={particleColor}
        setParticleColor={setParticleColor}
        lineColor={lineColor}
        setLineColor={setLineColor}
        dynamicHue={dynamicHue}
        setDynamicHue={setDynamicHue}
        safeMode={safeMode}
        setSafeMode={setSafeMode}
        particlesEnabled={particlesEnabled}
        setParticlesEnabled={setParticlesEnabled}
        resetToDefaults={resetToDefaults}
      />

      {/* Enhanced Animated Background */}
      {!selectedGame && particlesEnabled && (
        <ParticleBackground
          particleCount={particleCount}
          connectionDistance={connectionDistance}
          maxConnections={maxConnections}
          cursorRange={cursorRange}
          cursorInteraction={cursorInteraction}
          minSize={minSize}
          maxSize={maxSize}
          speed={speed}
          particleColor={particleColor}
          lineColor={lineColor}
          dynamicHue={dynamicHue}
          safeMode={safeMode}
          onAutoTuned={(eff) => {
            if (eff && eff.avgFps) {
              if (Math.random() < 0.1) {
                showNotification(`Optimized particles for smoothness (~${eff.avgFps} FPS)`, 'info');
              }
            }
          }}
        />
      )}

      {/* Loading Screen */}
      <LoadingScreen isLoading={isLoading} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className={`logo ${logoSpinning ? 'spin' : ''}`} onClick={handleLogoSecret} title="Click 10 times to unlock a download">
            <div className="logo-icon">🎮</div>
          </div>
          <h1 className="portal-title">
            <AnimatedText text="Aves" delay={0} />
            <AnimatedText text="OL" delay={400} className="title-part" />
          </h1>
        </div>

        <div className="nav-actions">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {user ? (
            <div className="user-info">
              <div
                className="user-avatar"
                onClick={() => setShowParticleSettings(true)}
                title="Edit Particle Settings"
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') setShowParticleSettings(true);
                }}
                aria-label="Open particle settings"
              >
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
          <label htmlFor="sort-select" className="sort-label">
            <span className="sort-icon">⇅</span> Sort by:
          </label>
          <div className="sort-select-wrapper">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort games by"
              className="sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">A-Z</option>
              <option value="favorites">Favorites</option>
              <option value="trending">Trending</option>
            </select>
            <span className="sort-dropdown-arrow">▼</span>
          </div>
        </div>

        {/* Games Grid */}
        <section className="games-section">
          <div className="section-header">
            <h3>{selectedGenre === "All" ? "All Games" : selectedGenre + " Games"}</h3>
            <span className="games-count">{sortedGames.length} games</span>
          </div>

          {sortedGames.length > 0 ? (
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
          ) : (
            <div className="empty-state">
              <p>No games found matching your criteria</p>
            </div>
          )}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button className="logout-btn" onClick={resetAllStats} title="Clear your local play history and stats">Reset Stats</button>
            </div>
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
        endCurrentSession={endCurrentSession}
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
          <p>AvesOL © {new Date().getFullYear()} | Play Free Online Games</p>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Support</a>
          </div>
          <button
            className="download-secret-btn"
            style={{
              opacity: Math.min(secretClicks / 10, 1),
              transform: `scale(${0.9 + Math.min(secretClicks / 10, 1) * 0.1})`,
              pointerEvents: secretClicks >= 10 ? 'auto' : 'none'
            }}
            aria-disabled={secretClicks < 10}
            title={secretClicks < 10 ? `${10 - secretClicks} more click(s) on the logo to unlock` : 'Download'}
            onClick={handleSecretDownload}
          >
            ⬇ Download
          </button>
        </div>
      </footer>

      {/* Notifications */}
      <NotificationContainer notifications={notifications} />
    </div>
  );
}

export default App;