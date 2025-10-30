"use client";

import { Button } from "@/components/ui/button";

interface GameOverProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
}

export default function GameOver({
  score,
  highScore,
  isNewHighScore,
  onPlayAgain,
}: GameOverProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
      <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent font-mono text-balance">
          GAME OVER
        </h2>
        <div className="space-y-2">
          <p className="text-lg sm:text-xl md:text-2xl text-foreground font-mono">
            Score final : {score}
          </p>
          {isNewHighScore && score > 0 && (
            <p className="text-base sm:text-lg text-secondary font-mono">
              Nouveau record !
            </p>
          )}
          {!isNewHighScore && (
            <p className="text-sm text-muted-foreground font-mono">
              Meilleur score : {highScore}
            </p>
          )}
        </div>
        <Button
          onClick={onPlayAgain}
          size="lg"
          className="text-base sm:text-lg font-mono bg-primary hover:bg-primary/90"
        >
          REJOUER
        </Button>
      </div>
    </div>
  );
}
