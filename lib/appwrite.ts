export interface Player {
    email: string;
    firstName: string;
    lastName: string;
    contact: boolean;
    maxScore?: number;
    createdAt?: string;
}

// Client-side functions that call our secure API routes
export async function createOrUpdatePlayer(player: Player): Promise<string> {
    try {
        const response = await fetch("/api/players", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: player.email,
                firstName: player.firstName,
                lastName: player.lastName,
                contact: player.contact,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create/update player");
        }

        const data = await response.json();
        return data.$id;
    } catch (error) {
        console.error("Error creating/updating player:", error);
        throw error;
    }
}

export async function saveScore($id: string, maxScore: number) {
    try {
        const response = await fetch("/api/scores", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                $id,
                maxScore,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to save score");
        }
    } catch (e) {
        console.log("User doesn't exist on database 🥲");
    }
}

export async function getScores() {
    try {
        const response = await fetch("/api/scores", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch scores");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching scores:", error);
        throw error;
    }
}

