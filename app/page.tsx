"use client";

import { useState, useEffect } from "react";
import Game from "@/components/game";
import PlayerForm from "@/components/player-form";
import { createOrUpdatePlayer } from "@/lib/appwrite";

export default function Page() {
  const [playerData, setPlayerData] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    contact: boolean;
    $id: string;
  } | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("playerInfos");
    if (savedData) {
      setPlayerData(JSON.parse(savedData));
    }
  }, []);

  const handlePlayerSubmit = async (
    email: string,
    firstName: string,
    lastName: string,
    contact: boolean
  ) => {
    const $id = await createOrUpdatePlayer({
      email,
      firstName,
      lastName,
      contact,
    });

    const data = { email, firstName, lastName, contact, $id };

    localStorage.setItem("playerInfos", JSON.stringify(data));

    setPlayerData(data);
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-6 py-8 sm:py-12 md:py-12">
      <div className="flex flex-col items-center gap-4">
        {!playerData ? <PlayerForm onSubmit={handlePlayerSubmit} /> : <Game />}
      </div>
    </main>
  );
}
