"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import duckImage from "@/assets/duck.png";

interface PlayerFormProps {
  onSubmit: (
    email: string,
    firstName: string,
    lastName: string,
    remember: boolean
  ) => void;
}

export default function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  const [isImageLoading, setIsImageLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgLoadedRef = useRef(false);

  // Load duck image once
  useEffect(() => {
    const img = new Image();
    const src = (duckImage as any)?.src ?? (duckImage as unknown as string);
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      imgLoadedRef.current = true;
      setIsImageLoading(true);
    };
  }, []);

  const validateForm = () => {
    const newErrors = { email: "", firstName: "", lastName: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Entrez un email valide";
      isValid = false;
    }

    if (!firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email.trim(), firstName.trim(), lastName.trim(), remember);
    }
  };

  if (!isImageLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto gap-4">
      <div className="text-center">
        <div className="flex justify-center">
          <img
            src={imgRef.current?.src}
            alt="Zenikanard"
            className="h-40 w-auto"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary font-mono text-balance">
          PRALINVADERZ
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg text-pretty">
          Entre tes informations pour commencer à jouer
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card px-6 sm:px-8 py-4 sm:py-6 rounded-lg border-2 border-primary/20 shadow-xl"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="canard@praline.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            Prénom
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Canard"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Nom
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Praline"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <Label htmlFor="remember" className="text-sm font-medium select-none">
            J'autorise Zenika à me recontacter à des fins informatives ou de
            recrutement.
          </Label>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!email.trim() || !firstName.trim() || !lastName.trim()}
          className="w-full text-base sm:text-lg font-mono bg-primary hover:bg-primary/90"
        >
          COMMENCER
        </Button>
      </form>

      <div className="text-center text-xs sm:text-sm text-muted-foreground">
        <p className="font-mono text-pretty">
          Aide le Zenikanard à attraper toutes les pralines
        </p>
      </div>
    </div>
  );
}
