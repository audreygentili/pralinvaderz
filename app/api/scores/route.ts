import { NextRequest, NextResponse } from "next/server";
import { Client, TablesDB, Query } from "node-appwrite";

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

// GET - Fetch top scores
export async function GET() {
    try {
        const scores = await tablesDB.listRows({
            tableId,
            databaseId,
            queries: [
                Query.orderDesc("maxScore"),
                Query.select(["firstName", "lastName", "maxScore"]),
                Query.limit(10),
            ],
        });
        return NextResponse.json(scores.rows);
    } catch (error) {
        console.error("Error fetching scores:", error);
        return NextResponse.json(
            { error: "Failed to fetch scores" },
            { status: 500 }
        );
    }
}

// PUT - Update player score
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { $id, maxScore } = body;

        if (!$id || typeof maxScore !== "number") {
            return NextResponse.json(
                { error: "Missing required fields: $id and maxScore" },
                { status: 400 }
            );
        }

        await tablesDB.updateRow({
            tableId,
            databaseId,
            rowId: $id,
            data: {
                maxScore,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating score:", error);
        return NextResponse.json(
            { error: "Failed to update score" },
            { status: 500 }
        );
    }
}

