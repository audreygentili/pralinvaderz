export type Enemy = { x: number; y: number; row: number; col: number };

export function spawnEnemies(
  canvas: HTMLCanvasElement,
  currentLevel: number
): Enemy[] {
  const enemies: Enemy[] = [];
  const isSmall = canvas.width < 500;
  const baseRows = isSmall ? 4 : 5;
  const baseCols = isSmall ? 6 : 8;
  const extra = Math.floor((currentLevel - 1) / 2);
  const rows = Math.min(baseRows + extra, baseRows + 3);
  const cols = Math.min(baseCols + extra, baseCols + 4);
  const marginX = isSmall ? 20 : 40;
  const marginTop = 50;
  const availableWidth = Math.max(100, canvas.width - marginX * 2);
  const spacingX = Math.max(30, Math.min(60, Math.floor(availableWidth / Math.max(cols, 1))));
  const spacingY = isSmall ? 40 : 50;
  const startX = Math.max(marginX, Math.floor((canvas.width - spacingX * (cols - 1)) / 2));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      enemies.push({
        x: col * spacingX + startX,
        y: row * spacingY + marginTop,
        row,
        col,
      });
    }
  }
  return enemies;
}

export function getDifficultyForLevel(currentLevel: number): {
  enemySpeed: number;
  enemyShotIntervalMs: number;
} {
  const enemySpeed = 0.3 + 0.3 * (currentLevel - 1);
  const enemyShotIntervalMs = Math.max(300, 1000 - 100 * (currentLevel - 1));
  return { enemySpeed, enemyShotIntervalMs };
}

export type Bullet = { x: number; y: number; isPlayerBullet: boolean };
export type Player = { x: number; y: number; width: number; height: number };

export function drawBullet(
  ctx: CanvasRenderingContext2D,
  bullet: Bullet,
  canvasHeight: number
): boolean {
  const playerRadius = 5;
  const enemyRadius = 4;

  if (bullet.isPlayerBullet) {
    bullet.y -= 2;
    ctx.fillStyle = "oklch(0.75 0.20 160)";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, playerRadius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    bullet.y += 2;
    ctx.fillStyle = "oklch(0.60 0.25 25)";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, enemyRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  return bullet.y > -10 && bullet.y < canvasHeight + 10;
}

export function checkBulletEnemyCollision(
  bullet: Bullet,
  enemy: Enemy
): boolean {
  const enemyWidth = 35;
  const enemyHeight = 25;
  return (
    bullet.x > enemy.x &&
    bullet.x < enemy.x + enemyWidth &&
    bullet.y > enemy.y &&
    bullet.y < enemy.y + enemyHeight
  );
}

export function checkBulletPlayerCollision(
  bullet: Bullet,
  player: Player
): boolean {
  const insetX = player.width * 0.15;
  const insetY = player.height * 0.15;
  const hitX = player.x + insetX;
  const hitY = player.y + insetY;
  const hitW = player.width - insetX * 2;
  const hitH = player.height - insetY * 2;
  return (
    bullet.x > hitX &&
    bullet.x < hitX + hitW &&
    bullet.y > hitY &&
    bullet.y < hitY + hitH
  );
}

// Power-ups
export type PowerUp = { x: number; y: number; vy: number };

export function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  powerUp: PowerUp,
  canvasHeight: number
): boolean {
  powerUp.y += powerUp.vy;
  ctx.fillStyle = "oklch(0.9 0.2 100)"; // bright yellow-ish
  ctx.beginPath();
  ctx.arc(powerUp.x, powerUp.y, 3, 0, Math.PI * 2);
  ctx.fill();
  return powerUp.y < canvasHeight + 10;
}

export function checkPowerUpPlayerCollision(
  powerUp: PowerUp,
  player: Player
): boolean {
  const insetX = player.width * 0.15;
  const insetY = player.height * 0.15;
  const hitX = player.x + insetX;
  const hitY = player.y + insetY;
  const hitW = player.width - insetX * 2;
  const hitH = player.height - insetY * 2;
  return (
    powerUp.x > hitX &&
    powerUp.x < hitX + hitW &&
    powerUp.y > hitY &&
    powerUp.y < hitY + hitH
  );
}

