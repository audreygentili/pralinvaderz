"use client";

import { Button } from "@/components/ui/button";

interface GameStartProps {
  onStart: () => void;
}

export default function GameStart({ onStart }: GameStartProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
      <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-mono text-balance">
          C'EST PARTI ?
        </h2>
        <div className="space-y-2 text-xs sm:text-sm md:text-base text-muted-foreground">
          <p className="font-mono sm:hidden">
            Slide pour te déplacer et appuie pour tirer
          </p>
        </div>
        <Button
          onClick={onStart}
          size="lg"
          className="text-base sm:text-lg font-mono bg-primary hover:bg-primary/90"
        >
          JOUER
        </Button>
      </div>
    </div>
  );
}
