"use client";

import {useEffect, useState, useRef} from "react";
import {getScores} from "@/lib/appwrite";
import {QRCodeSVG} from "qrcode.react";

interface ScoreWithPlayer {
    $id: string;
    firstName: string;
    lastName: string;
    maxScore: number;
}

interface ScoreWithHighlight extends ScoreWithPlayer {
    isNew?: boolean;
    scoreChanged?: boolean;
    positionChanged?: boolean;
    movedUp?: boolean;
}

export default function ScoreboardPage() {
    const [scores, setScores] = useState<ScoreWithHighlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [homeUrl, setHomeUrl] = useState<string>("");
    const previousScoresRef = useRef<Map<string, {score: number; position: number}>>(new Map());
    const isInitialLoadRef = useRef<boolean>(true);

    useEffect(() => {
        // Set home URL
        if (typeof window !== "undefined") {
            setHomeUrl(window.location.origin);
        }

        const fetchScores = async (showLoading = false) => {
            try {
                if (showLoading) {
                    setLoading(true);
                }
                const topScores = await getScores();
                const newScores = topScores as unknown as ScoreWithPlayer[];

                // Compare with previous scores to detect changes (skip on initial load)
                const scoresWithHighlight: ScoreWithHighlight[] = newScores.map((score, index) => {
                    if (isInitialLoadRef.current) {
                        return {
                            ...score,
                            isNew: false,
                            scoreChanged: false,
                            positionChanged: false,
                            movedUp: false,
                        };
                    }

                    const previous = previousScoresRef.current.get(score.$id);
                    const isNew = !previous;
                    const scoreChanged = previous && previous.score !== score.maxScore;
                    const positionChanged = previous && previous.position !== index;
                    const movedUp = previous && previous.position > index; // Lower index = better position

                    return {
                        ...score,
                        isNew,
                        scoreChanged,
                        positionChanged,
                        movedUp,
                    };
                });

                // Mark initial load as complete after first fetch
                if (isInitialLoadRef.current) {
                    isInitialLoadRef.current = false;
                }

                // Update previous scores reference
                previousScoresRef.current.clear();
                newScores.forEach((score, index) => {
                    previousScoresRef.current.set(score.$id, {
                        score: score.maxScore,
                        position: index,
                    });
                });

                setScores(scoresWithHighlight);
                setError(null);
            } catch (err) {
                console.error("Error fetching scores:", err);
                setError("Impossible de charger les scores. Vérifiez votre configuration Appwrite.");
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        };

        // Initial fetch with loading indicator
        fetchScores(true);

        // Poll for updates every 5 seconds (without loading indicator)
        const intervalId = setInterval(() => {
            fetchScores(false);
        }, 5000);

        // Cleanup interval on unmount
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-6 py-8 sm:py-12 md:py-12">
            <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-6xl">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary font-mono text-balance">
                        SCOREBOARD
                    </h1>
                </div>

                {loading && (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"/>
                        <p className="text-muted-foreground font-mono">Chargement...</p>
                    </div>
                )}

                {error && (
                    <div
                        className="bg-destructive/10 border border-destructive rounded-lg p-4 sm:p-6 text-center max-w-md">
                        <p className="text-destructive font-mono">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 w-full">
                        <div className="w-full lg:flex-1 bg-card rounded-lg border-2 border-primary/20 shadow-xl overflow-hidden">
                            {scores.length === 0 ? (
                                <div className="p-8 sm:p-12 text-center">
                                    <p className="text-muted-foreground font-mono text-lg">
                                        Aucun score enregistré pour le moment.
                                    </p>
                                    <p className="text-muted-foreground font-mono text-sm mt-2">
                                        Soyez le premier à jouer !
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="border-b border-primary/20 bg-primary/5">
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-mono font-bold text-primary uppercase tracking-wider">
                                                Rang
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-mono font-bold text-primary uppercase tracking-wider">
                                                Joueur
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-mono font-bold text-primary uppercase tracking-wider">
                                                Score max
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/10">
                                        {scores.map((scoreItem, index) => {
                                            const hasChange = scoreItem.isNew || scoreItem.scoreChanged || scoreItem.positionChanged;
                                            const highlightClass = scoreItem.movedUp || scoreItem.isNew
                                                ? "animate-highlight-up"
                                                : hasChange
                                                    ? "animate-highlight-down"
                                                    : "";
                                            return (
                                            <tr
                                                key={scoreItem.$id}
                                                className={`hover:bg-primary/5 transition-all duration-300 ${highlightClass}`}
                                            >
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                              className={`text-base sm:text-lg md:text-xl font-mono font-bold ${
                                  index === 0
                                      ? "text-[#F4D06F]"
                                      : index === 1
                                          ? "text-[#A8E6CF]"
                                          : index === 2
                                              ? "text-[#AECBFA]"
                                              : "text-foreground"
                              }`}
                          >
                            #{index + 1}
                          </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-sm sm:text-base font-mono text-foreground">
                            {`${scoreItem.firstName} ${scoreItem.lastName}`}
                          </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <span className={`text-base sm:text-lg md:text-xl font-mono font-bold text-primary transition-all duration-300 ${
                              scoreItem.scoreChanged ? "scale-110 text-secondary" : ""
                          }`}>
                            {scoreItem.maxScore.toLocaleString()}
                          </span>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {homeUrl && (
                            <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-lg border-2 border-primary/20 shadow-lg lg:flex-shrink-0">
                                <p className="text-sm font-mono text-muted-foreground text-center">
                                    Jouez sur votre téléphone !
                                </p>
                                <div className="p-3 bg-white rounded-lg">
                                    <QRCodeSVG
                                        value={homeUrl}
                                        size={200}
                                        level="H"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

