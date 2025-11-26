import { NextRequest, NextResponse } from "next/server";
import { Client, TablesDB, ID, Query } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;
const tableId = process.env.APPWRITE_TABLE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId || !tableId) {
    throw new Error(
        "Missing required Appwrite environment variables. Please check your .env file."
    );
}

// Create server-side client with API key
const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey); // Use API key for server-side authentication

const tablesDB = new TablesDB(client);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, firstName, lastName, contact } = body;

        if (!email || !firstName || !lastName || typeof contact !== "boolean") {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if player exists
        const existingPlayers = await tablesDB.listRows({
            tableId,
            databaseId,
            queries: [Query.equal("email", email)],
        });

        if (existingPlayers.rows.length > 0) {
            const existingPlayer = existingPlayers.rows[0];
            const updated = await tablesDB.updateRow({
                tableId,
                databaseId,
                rowId: existingPlayer.$id,
                data: {
                    firstName,
                    lastName,
                    contact,
                },
            });
            return NextResponse.json({ $id: updated.$id });
        } else {
            const created = await tablesDB.createRow({
                tableId,
                databaseId,
                rowId: ID.unique(),
                data: {
                    email,
                    firstName,
                    lastName,
                    contact,
                },
            });
            return NextResponse.json({ $id: created.$id });
        }
    } catch (error) {
        console.error("Error creating/updating player:", error);
        return NextResponse.json(
            { error: "Failed to create/update player" },
            { status: 500 }
        );
    }
}

