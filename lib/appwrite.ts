import {Client, Account, Storage, TablesDB, ID, Query} from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const tableId = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID;

if (!endpoint || !projectId || !databaseId || !tableId) {
    throw new Error(
        "Missing required Appwrite environment variables. Please check your .env file."
    );
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

const tablesDB = new TablesDB(client);

export interface Player {
    email: string;
    firstName: string;
    lastName: string;
    contact: boolean;
    maxScore?: number;
    createdAt?: string;
}

export async function createOrUpdatePlayer(player: Player): Promise<string> {
    try {
        const existingPlayers = await tablesDB.listRows({
            tableId: tableId!,
            databaseId: databaseId!,
            queries: [Query.equal("email", player.email)]
        })

        if (existingPlayers.rows.length > 0) {
            const existingPlayer = existingPlayers.rows[0];
            return await tablesDB.updateRow({
                tableId: tableId!,
                databaseId: databaseId!,
                rowId: existingPlayer.$id,
                data: {
                    firstName: player.firstName,
                    lastName: player.lastName,
                    contact: player.contact,
                }
            }).then((doc) => doc.$id);
        } else {
            return await tablesDB.createRow({
                    tableId: tableId!,
                    databaseId: databaseId!,
                    rowId: ID.unique(),
                    data: {
                        email: player.email,
                        firstName: player.firstName,
                        lastName: player.lastName,
                        contact: player.contact,
                    }
                }
            ).then((doc) => doc.$id);
        }
    } catch (error) {
        console.error("Error creating/updating player:", error);
        throw error;
    }
}

export async function saveScore($id: string, maxScore: number) {
    try {
        await tablesDB.updateRow({
            tableId: tableId!,
            databaseId: databaseId!,
            rowId: $id,
            data: {
                maxScore
            }
        });
    } catch (e) {
        console.log("User doesn't exist on database 🥲");
    }
}

export async function getScores() {
    const scores = await tablesDB.listRows({
        tableId: tableId!,
        databaseId: databaseId!,
        queries: [
            Query.orderDesc("maxScore"),
            Query.select(["firstName", "lastName", "maxScore"]),
            Query.limit(10)
        ]
    });
    return scores.rows;
}

