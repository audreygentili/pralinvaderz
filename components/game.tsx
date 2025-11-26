"use client";

import { useEffect, useRef, useState } from "react";
import duckImage from "@/assets/duck.png";
import pralinesImage from "@/assets/pralines.png";
import GameStart from "@/components/game-start";
import GameOver from "@/components/game-over";
import {
  spawnEnemies,
  getDifficultyForLevel,
  drawBullet,
  checkBulletEnemyCollision,
  checkBulletPlayerCollision,
  type Bullet,
  type PowerUp,
  drawPowerUp,
  checkPowerUpPlayerCollision,
} from "@/lib/game-utils";
import { saveScore } from "@/lib/appwrite";

type Position = { x: number; y: number };
type Enemy = Position & { row: number; col: number };

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">(
    "menu"
  );
  const [level, setLevel] = useState(1);
  const [isPlayerImageLoaded, setIsPlayerImageLoaded] = useState(false);
  const [isEnemyImageLoaded, setIsEnemyImageLoaded] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerData, setPlayerData] = useState<{ firstName: string } | null>(
    null
  );

  const gameRef = useRef({
    player: { x: 0, y: 0, width: 64, height: 48 },
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    powerUps: [] as PowerUp[],
    enemyDirection: 1,
    enemySpeed: 1,
    enemyShotIntervalMs: 1000,
    playerShotIntervalMs: 450,
    lastEnemyShot: 0,
    keys: { left: false, right: false, space: false },
    isTouching: false,
    lastShot: 0,
  });

  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const playerImgLoadedRef = useRef(false);
  const enemyImgRef = useRef<HTMLImageElement | null>(null);
  const enemyImgLoadedRef = useRef(false);

  // Load player image once
  useEffect(() => {
    const img = new Image();
    const src = (duckImage as any)?.src ?? (duckImage as unknown as string);
    img.src = src;
    img.onload = () => {
      playerImgRef.current = img;
      playerImgLoadedRef.current = true;
      setIsPlayerImageLoaded(true);
    };
  }, []);

  // Load enemy image once
  useEffect(() => {
    const img = new Image();
    const src =
      (pralinesImage as any)?.src ?? (pralinesImage as unknown as string);
    img.src = src;
    img.onload = () => {
      enemyImgRef.current = img;
      enemyImgLoadedRef.current = true;
      setIsEnemyImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("playerHighScore");
    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore));

    const savedPlayer = localStorage.getItem("playerInfos");
    if (savedPlayer) {
      setPlayerData(JSON.parse(savedPlayer));
    }
  }, []);

  // Save score to Appwrite when game ends
  useEffect(() => {
    if (gameState === "gameOver" && score > 0) {
      const savedPlayer = localStorage.getItem("playerInfos");
      if (savedPlayer) {
        try {
          const playerInfo = JSON.parse(savedPlayer);
          if (playerInfo.$id) {
            saveScore(playerInfo.$id, highScore).catch((error) => {
              console.error("Failed to save score to Appwrite:", error);
            });
          }
        } catch (error) {
          console.error("Failed to parse player info:", error);
        }
      }
    }
  }, [gameState, score, highScore]);

  const applyDifficultyForLevel = (currentLevel: number) => {
    const game = gameRef.current;
    const { enemySpeed, enemyShotIntervalMs } =
      getDifficultyForLevel(currentLevel);
    game.enemySpeed = enemySpeed;
    game.enemyShotIntervalMs = enemyShotIntervalMs;
  };

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = gameRef.current;
    setLevel(1);
    game.player = {
      x: canvas.width / 2 - 32,
      y: canvas.height - 60,
      width: 64,
      height: 48,
    };
    applyDifficultyForLevel(1);
    game.enemies = spawnEnemies(canvas, 1);

    game.bullets = [];
    game.powerUps = [];
    game.enemyDirection = 1;
    game.lastEnemyShot = 0;
    game.lastShot = 0;
    game.playerShotIntervalMs = 450;
    setScore(0);
    setLives(3);
    setGameState("playing");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const isMobile = window.innerWidth < 640;
      const maxWidth = isMobile ? window.innerWidth - 32 : 800;
      const maxHeight = isMobile ? window.innerHeight - 240 : 600;
      const width = Math.min(window.innerWidth - 32, maxWidth);
      const height = Math.min(window.innerHeight - 240, maxHeight);
      canvas.width = width;
      canvas.height = height;

      if (gameState === "menu") {
        gameRef.current.player.x = width / 2 - 32;
        gameRef.current.player.y = height - 60;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") gameRef.current.keys.left = true;
      if (e.key === "ArrowRight") gameRef.current.keys.right = true;
      if (e.key === " ") {
        e.preventDefault();
        gameRef.current.keys.space = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") gameRef.current.keys.left = false;
      if (e.key === "ArrowRight") gameRef.current.keys.right = false;
      if (e.key === " ") gameRef.current.keys.space = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const xOnCanvas = (touch.clientX - rect.left) * scaleX;
      gameRef.current.isTouching = true;
      gameRef.current.keys.space = true;
      // center the player on touch x, clamp inside canvas
      const newX = Math.max(
        0,
        Math.min(
          xOnCanvas - gameRef.current.player.width / 2,
          canvas.width - gameRef.current.player.width
        )
      );
      gameRef.current.player.x = newX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!gameRef.current.isTouching) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const xOnCanvas = (touch.clientX - rect.left) * scaleX;
      const newX = Math.max(
        0,
        Math.min(
          xOnCanvas - gameRef.current.player.width / 2,
          canvas.width - gameRef.current.player.width
        )
      );
      gameRef.current.player.x = newX;
    };

    const handleTouchEnd = () => {
      gameRef.current.isTouching = false;
      gameRef.current.keys.left = false;
      gameRef.current.keys.right = false;
      gameRef.current.keys.space = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    let animationId: number;

    const gameLoop = () => {
      if (gameState !== "playing") {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      const game = gameRef.current;

      // Clear canvas
      ctx.fillStyle = "oklch(0.08 0 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars background
      ctx.fillStyle = "oklch(0.60 0 0)";
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % canvas.width;
        const y = (i * 73.3) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
      }

      // Update player
      if (game.keys.left && game.player.x > 0) {
        game.player.x -= 5;
      }
      if (game.keys.right && game.player.x < canvas.width - game.player.width) {
        game.player.x += 5;
      }

      // Shoot player bullet
      const now = Date.now();
      if (game.keys.space && now - game.lastShot > game.playerShotIntervalMs) {
        game.bullets.push({
          x: game.player.x + game.player.width / 2,
          y: game.player.y,
          isPlayerBullet: true,
        });
        game.lastShot = now;
      }

      // Draw player (duck image)
      const playerImg = playerImgRef.current;
      if (playerImg && playerImgLoadedRef.current) {
        const iw = playerImg.width;
        const ih = playerImg.height;
        const tw = game.player.width;
        const th = game.player.height;
        const s = Math.min(tw / iw, th / ih);
        const dw = iw * s;
        const dh = ih * s;
        const dx = game.player.x + (tw - dw) / 2;
        const dy = game.player.y + (th - dh) / 2;
        ctx.drawImage(playerImg, dx, dy, dw, dh);
      }

      // Update and draw enemies
      let shouldMoveDown = false;
      game.enemies.forEach((enemy) => {
        enemy.x += game.enemyDirection * game.enemySpeed;
        if (enemy.x <= 0 || enemy.x >= canvas.width - 35) {
          shouldMoveDown = true;
        }
      });

      if (shouldMoveDown) {
        game.enemyDirection *= -1;
        game.enemies.forEach((enemy) => {
          enemy.y += 20;
          if (enemy.y > canvas.height - 40) {
            setGameState("gameOver");
          }
        });
      }

      game.enemies.forEach((enemy) => {
        const img = enemyImgRef.current;
        const boxW = 35;
        const boxH = 25;
        if (img && enemyImgLoadedRef.current) {
          const naturalW = img.naturalWidth || img.width;
          const naturalH = img.naturalHeight || img.height;
          const scale = Math.min(boxW / naturalW, boxH / naturalH);
          const drawW = naturalW * scale;
          const drawH = naturalH * scale;
          const drawX = enemy.x + (boxW - drawW) / 2;
          const drawY = enemy.y + (boxH - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }
      });

      // Enemy shooting
      if (
        now - game.lastEnemyShot > game.enemyShotIntervalMs &&
        game.enemies.length > 0 &&
        isPlayerImageLoaded &&
        isEnemyImageLoaded
      ) {
        const randomEnemy =
          game.enemies[Math.floor(Math.random() * game.enemies.length)];
        game.bullets.push({
          x: randomEnemy.x + 17,
          y: randomEnemy.y + 25,
          isPlayerBullet: false,
        });
        game.lastEnemyShot = now;
      }

      // Update and draw bullets (as circles)
      game.bullets = game.bullets.filter((bullet) =>
        drawBullet(ctx, bullet, canvas.height)
      );

      // Update and draw power-ups
      game.powerUps = game.powerUps
        .filter((p) => drawPowerUp(ctx, p, canvas.height))
        .filter((p) => {
          if (checkPowerUpPlayerCollision(p, game.player)) {
            // Increase fire rate: reduce interval, min cap
            game.playerShotIntervalMs = Math.max(
              100,
              game.playerShotIntervalMs - 50
            );
            return false; // consumed
          }
          return true;
        });

      // Collision detection
      game.bullets.forEach((bullet, bulletIndex) => {
        if (bullet.isPlayerBullet) {
          game.enemies.forEach((enemy, enemyIndex) => {
            if (checkBulletEnemyCollision(bullet, enemy)) {
              // Enemy destroyed
              const enemyCenterX = enemy.x + 17;
              const enemyBottomY = enemy.y + 25;
              // Chance to drop a power-up from level 2+
              if (level >= 2 && Math.random() < 0.1) {
                game.powerUps.push({
                  x: enemyCenterX,
                  y: enemyBottomY,
                  vy: 2.5,
                });
              }

              game.enemies.splice(enemyIndex, 1);
              game.bullets.splice(bulletIndex, 1);
              setScore((prev) => {
                const newScore = prev + 100;
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem("playerHighScore", newScore.toString());
                }
                return newScore;
              });
            }
          });
        } else {
          if (checkBulletPlayerCollision(bullet, game.player)) {
            game.bullets.splice(bulletIndex, 1);
            setLives((prev) => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState("gameOver");
              }
              return newLives;
            });
          }
        }
      });

      // Check wave cleared -> next level
      if (game.enemies.length === 0) {
        const canvas = canvasRef.current;
        if (canvas) {
          setLevel((prev) => {
            const next = prev + 1;
            applyDifficultyForLevel(next);
            game.enemies = spawnEnemies(canvas, next);
            game.bullets = [];
            game.powerUps = [];
            game.enemyDirection = 1;
            game.lastEnemyShot = Date.now();
            return next;
          });
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameState, highScore, level, isPlayerImageLoaded, isEnemyImageLoaded]);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-4xl">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary font-mono text-balance">
          PRALINVADERZ
        </h1>
        {playerData && (
          <p className="text-secondary text-base sm:text-lg md:text-xl font-mono">
            {playerData.firstName}, à toi de jouer !
          </p>
        )}
      </div>

      <div className="flex justify-center gap-3 sm:gap-4 md:gap-8 text-center w-full">
        <div className="space-y-1 min-w-[80px]">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
            Score
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary font-mono">
            {score}
          </p>
        </div>
        <div className="space-y-1 min-w-[80px]">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
            Niveau
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-accent font-mono">
            {level}
          </p>
        </div>
        <div className="space-y-1 min-w-[80px]">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
            Score max.
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-tertiary font-mono">
            {highScore}
          </p>
        </div>
        <div className="space-y-1 min-w-[80px]">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
            {lives > 1 ? "Vies" : "Vie"}
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-destructive font-mono">
            {lives}
          </p>
        </div>
      </div>

      <div className="relative w-full flex justify-center touch-none">
        <canvas
          ref={canvasRef}
          className="border-2 border-primary rounded-lg shadow-2xl shadow-primary/20 max-w-full"
        />

        {!(isPlayerImageLoaded && isEnemyImageLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          </div>
        )}

        {gameState === "menu" && <GameStart onStart={initGame} />}

        {gameState === "gameOver" && (
          <GameOver
            score={score}
            highScore={highScore}
            isNewHighScore={score === highScore && score > 0}
            onPlayAgain={initGame}
          />
        )}
      </div>

      <div className="text-center text-xs sm:text-sm text-muted-foreground max-w-md py-2">
        <p className="font-mono text-pretty">
          {level == 1
            ? "Tire sur les pralines tout en évitant leurs projectiles"
            : "Attrape les boosts jaunes pour tirer plus vite"}
        </p>
      </div>
    </div>
  );
}
