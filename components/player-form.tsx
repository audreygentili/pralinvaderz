"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PlayerFormProps {
  onSubmit: (email: string, username: string) => void
}

export default function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [errors, setErrors] = useState({ email: "", username: "" })

  const validateForm = () => {
    const newErrors = { email: "", username: "" }
    let isValid = true

    if (!email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
      isValid = false
    }

    if (!username.trim()) {
      newErrors.username = "Username is required"
      isValid = false
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(email.trim(), username.trim())
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary font-mono text-balance">
          SPACE INVADERS
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg text-pretty">
          Enter your details to start playing
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-card p-6 sm:p-8 rounded-lg border-2 border-primary/20 shadow-xl"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="SpaceAce"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={errors.username ? "border-destructive" : ""}
          />
          {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full text-base sm:text-lg font-mono bg-primary hover:bg-primary/90"
        >
          START MISSION
        </Button>
      </form>

      <div className="text-center text-xs sm:text-sm text-muted-foreground">
        <p className="font-mono">Defend Earth from the alien invasion</p>
      </div>
    </div>
  )
}
