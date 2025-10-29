"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

type Position = { x: number; y: number }
type Enemy = Position & { row: number; col: number }
type Bullet = Position & { isPlayerBullet: boolean }

export default function SpaceInvadersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [playerData, setPlayerData] = useState<{ username: string } | null>(null)

  const gameRef = useRef({
    player: { x: 0, y: 0, width: 40, height: 30 },
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    enemyDirection: 1,
    enemySpeed: 1,
    lastEnemyShot: 0,
    keys: { left: false, right: false, space: false },
    touchStartX: 0,
    isTouching: false,
    lastShot: 0,
  })

  useEffect(() => {
    const savedHighScore = localStorage.getItem("spaceInvadersHighScore")
    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore))

    const savedPlayer = localStorage.getItem("spaceInvadersPlayer")
    if (savedPlayer) {
      setPlayerData(JSON.parse(savedPlayer))
    }
  }, [])

  const initGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const game = gameRef.current
    game.player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 60,
      width: 40,
      height: 30,
    }

    game.enemies = []
    const rows = canvas.width < 500 ? 4 : 5
    const cols = canvas.width < 500 ? 6 : 8
    const enemyWidth = 35
    const enemyHeight = 25
    const spacing = canvas.width < 500 ? 40 : 50
    const startX = canvas.width < 500 ? 30 : 60

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        game.enemies.push({
          x: col * spacing + startX,
          y: row * spacing + 50,
          row,
          col,
        })
      }
    }

    game.bullets = []
    game.enemyDirection = 1
    game.enemySpeed = 1
    game.lastEnemyShot = 0
    game.lastShot = 0
    setScore(0)
    setLives(3)
    setGameState("playing")
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const isMobile = window.innerWidth < 640
      const maxWidth = isMobile ? window.innerWidth - 32 : 800
      const maxHeight = isMobile ? window.innerHeight - 300 : 600
      const width = Math.min(window.innerWidth - 32, maxWidth)
      const height = Math.min(window.innerHeight - (isMobile ? 300 : 200), maxHeight)
      canvas.width = width
      canvas.height = height

      if (gameState === "menu") {
        gameRef.current.player.x = width / 2 - 20
        gameRef.current.player.y = height - 60
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") gameRef.current.keys.left = true
      if (e.key === "ArrowRight") gameRef.current.keys.right = true
      if (e.key === " ") {
        e.preventDefault()
        gameRef.current.keys.space = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") gameRef.current.keys.left = false
      if (e.key === "ArrowRight") gameRef.current.keys.right = false
      if (e.key === " ") gameRef.current.keys.space = false
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      gameRef.current.touchStartX = touch.clientX
      gameRef.current.isTouching = true
      gameRef.current.keys.space = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!gameRef.current.isTouching) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - gameRef.current.touchStartX

      if (Math.abs(deltaX) > 5) {
        gameRef.current.keys.left = deltaX < 0
        gameRef.current.keys.right = deltaX > 0
        gameRef.current.touchStartX = touch.clientX
      }
    }

    const handleTouchEnd = () => {
      gameRef.current.isTouching = false
      gameRef.current.keys.left = false
      gameRef.current.keys.right = false
      gameRef.current.keys.space = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    let animationId: number

    const gameLoop = () => {
      if (gameState !== "playing") {
        animationId = requestAnimationFrame(gameLoop)
        return
      }

      const game = gameRef.current

      // Clear canvas
      ctx.fillStyle = "oklch(0.08 0 0)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars background
      ctx.fillStyle = "oklch(0.60 0 0)"
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % canvas.width
        const y = (i * 73.3) % canvas.height
        ctx.fillRect(x, y, 1, 1)
      }

      // Update player
      if (game.keys.left && game.player.x > 0) {
        game.player.x -= 5
      }
      if (game.keys.right && game.player.x < canvas.width - game.player.width) {
        game.player.x += 5
      }

      // Shoot player bullet
      const now = Date.now()
      if (game.keys.space && now - game.lastShot > 300) {
        game.bullets.push({
          x: game.player.x + game.player.width / 2 - 2,
          y: game.player.y,
          isPlayerBullet: true,
        })
        game.lastShot = now
      }

      // Draw player
      ctx.fillStyle = "oklch(0.75 0.20 160)"
      ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height)
      ctx.fillStyle = "oklch(0.65 0.25 265)"
      ctx.fillRect(game.player.x + 5, game.player.y - 10, 30, 10)

      // Update and draw enemies
      let shouldMoveDown = false
      game.enemies.forEach((enemy) => {
        enemy.x += game.enemyDirection * game.enemySpeed
        if (enemy.x <= 0 || enemy.x >= canvas.width - 35) {
          shouldMoveDown = true
        }
      })

      if (shouldMoveDown) {
        game.enemyDirection *= -1
        game.enemies.forEach((enemy) => {
          enemy.y += 20
          if (enemy.y > canvas.height - 100) {
            setGameState("gameOver")
          }
        })
      }

      game.enemies.forEach((enemy) => {
        ctx.fillStyle = "oklch(0.70 0.22 340)"
        ctx.fillRect(enemy.x, enemy.y, 35, 25)
        ctx.fillStyle = "oklch(0.65 0.25 265)"
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 25, 15)
      })

      // Enemy shooting
      if (now - game.lastEnemyShot > 1000 && game.enemies.length > 0) {
        const randomEnemy = game.enemies[Math.floor(Math.random() * game.enemies.length)]
        game.bullets.push({
          x: randomEnemy.x + 17,
          y: randomEnemy.y + 25,
          isPlayerBullet: false,
        })
        game.lastEnemyShot = now
      }

      // Update and draw bullets
      game.bullets = game.bullets.filter((bullet) => {
        if (bullet.isPlayerBullet) {
          bullet.y -= 8
          ctx.fillStyle = "oklch(0.75 0.20 160)"
        } else {
          bullet.y += 5
          ctx.fillStyle = "oklch(0.60 0.25 25)"
        }
        ctx.fillRect(bullet.x, bullet.y, 4, 12)
        return bullet.y > 0 && bullet.y < canvas.height
      })

      // Collision detection
      game.bullets.forEach((bullet, bulletIndex) => {
        if (bullet.isPlayerBullet) {
          game.enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x > enemy.x && bullet.x < enemy.x + 35 && bullet.y > enemy.y && bullet.y < enemy.y + 25) {
              game.enemies.splice(enemyIndex, 1)
              game.bullets.splice(bulletIndex, 1)
              setScore((prev) => {
                const newScore = prev + 100
                if (newScore > highScore) {
                  setHighScore(newScore)
                  localStorage.setItem("spaceInvadersHighScore", newScore.toString())
                }
                return newScore
              })
            }
          })
        } else {
          if (
            bullet.x > game.player.x &&
            bullet.x < game.player.x + game.player.width &&
            bullet.y > game.player.y &&
            bullet.y < game.player.y + game.player.height
          ) {
            game.bullets.splice(bulletIndex, 1)
            setLives((prev) => {
              const newLives = prev - 1
              if (newLives <= 0) {
                setGameState("gameOver")
              }
              return newLives
            })
          }
        }
      })

      // Check win condition
      if (game.enemies.length === 0) {
        setGameState("gameOver")
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [gameState, highScore])

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-4xl px-4">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary font-mono text-balance">
          SPACE INVADERS
        </h1>
        {playerData && (
          <p className="text-secondary text-base sm:text-lg md:text-xl font-mono">Player: {playerData.username}</p>
        )}
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base text-pretty">
          Defend Earth from the alien invasion
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-8 text-center w-full">
        <div className="space-y-1 min-w-[80px]">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary font-mono">{score}</p>
        </div>
        <div className="space-y-1 min-w-[80px]">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">High Score</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-accent font-mono">{highScore}</p>
        </div>
        <div className="space-y-1 min-w-[80px]">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Lives</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-destructive font-mono">{lives}</p>
        </div>
      </div>

      <div className="relative w-full flex justify-center touch-none">
        <canvas
          ref={canvasRef}
          className="border-2 border-primary rounded-lg shadow-2xl shadow-primary/20 max-w-full"
        />

        {gameState === "menu" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
            <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-mono text-balance">
                READY TO PLAY?
              </h2>
              <div className="space-y-2 text-xs sm:text-sm md:text-base text-muted-foreground">
                <p className="font-mono hidden sm:block">Desktop: Arrow keys to move, Space to shoot</p>
                <p className="font-mono sm:hidden">Swipe to move, tap to shoot</p>
                <p className="font-mono hidden sm:block">Mobile: Swipe to move, tap to shoot</p>
              </div>
              <Button
                onClick={initGame}
                size="lg"
                className="text-base sm:text-lg font-mono bg-primary hover:bg-primary/90"
              >
                START GAME
              </Button>
            </div>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
            <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent font-mono text-balance">
                {gameRef.current.enemies.length === 0 ? "VICTORY!" : "GAME OVER"}
              </h2>
              <div className="space-y-2">
                <p className="text-lg sm:text-xl md:text-2xl text-foreground font-mono">Final Score: {score}</p>
                {score === highScore && score > 0 && (
                  <p className="text-base sm:text-lg text-secondary font-mono">New High Score!</p>
                )}
              </div>
              <Button
                onClick={initGame}
                size="lg"
                className="text-base sm:text-lg font-mono bg-primary hover:bg-primary/90"
              >
                PLAY AGAIN
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs sm:text-sm text-muted-foreground max-w-md px-4">
        <p className="font-mono text-pretty">
          Eliminate all invaders before they reach Earth. Each enemy destroyed earns 100 points!
        </p>
      </div>
    </div>
  )
}
