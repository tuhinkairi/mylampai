import { fetchAnalysis } from "@/actions/resumeAnalysis";
import transformKeys from "@/lib/converter";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return NextResponse.json(
            { error: "Server misconfiguration: JWT_SECRET is not set" },
            { status: 500 }
        );
    }

    let decodedToken: { id: string } | null = null;

    try {
        // Validate Authorization Header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
        }

        // Extract and verify JWT token
        const token = authHeader.substring(7); // Remove "Bearer "
        decodedToken = jwt.verify(token, jwtSecret) as { id: string };

        if (!decodedToken?.id) {
            return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
        }
    } catch (error) {
        console.error("JWT verification error:", error);
        return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        // Parse the request body
        body = await req.json();
        if (!body || typeof body !== "object") {
            throw new Error("Invalid or empty request body");
        }
    } catch (error) {
        console.error("Error parsing request body:", error);
        return NextResponse.json(
            { message: "Invalid request body", status: 400 },
            { status: 400 }
        );
    }

    try {
        // Send the POST request to the external API
        const response = await fetchAnalysis(body.id as string);

        if (!response) {
            return NextResponse.json(
                {  response}
            );
        }

       

        return NextResponse.json(
            response
        );
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            {
                message: "Failed to process request",
                status: 500,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
};
