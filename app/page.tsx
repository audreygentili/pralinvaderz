"use client";

import { useState, useEffect } from "react";
import Game from "@/components/game";
import PlayerForm from "@/components/player-form";

export default function Page() {
  const [playerData, setPlayerData] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    remember: boolean;
  } | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("playerInfos");
    if (savedData) {
      setPlayerData(JSON.parse(savedData));
    }
  }, []);

  const handlePlayerSubmit = (
    email: string,
    firstName: string,
    lastName: string,
    remember: boolean
  ) => {
    const data = { email, firstName, lastName, remember };
    localStorage.setItem("playerInfos", JSON.stringify(data));
    setPlayerData(data);
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-6 py-8 sm:py-12 md:py-12">
      {!playerData ? <PlayerForm onSubmit={handlePlayerSubmit} /> : <Game />}
    </main>
  );
}
