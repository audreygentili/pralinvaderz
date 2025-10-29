"use client"

import { useState, useEffect } from "react"
import SpaceInvadersGame from "@/components/space-invaders-game"
import PlayerForm from "@/components/player-form"

export default function Page() {
  const [playerData, setPlayerData] = useState<{ email: string; username: string } | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem("spaceInvadersPlayer")
    if (savedData) {
      setPlayerData(JSON.parse(savedData))
    }
  }, [])

  const handlePlayerSubmit = (email: string, username: string) => {
    const data = { email, username }
    localStorage.setItem("spaceInvadersPlayer", JSON.stringify(data))
    setPlayerData(data)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      {!playerData ? <PlayerForm onSubmit={handlePlayerSubmit} /> : <SpaceInvadersGame />}
    </main>
  )
}
