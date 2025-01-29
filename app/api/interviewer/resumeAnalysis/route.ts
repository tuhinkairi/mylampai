import { AnalysisDataType, analysisResume } from "@/actions/resumeAnalysis";
import transformKeys from "@/lib/converter";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
    const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT?.trim();
    const jwtSecret = process.env.JWT_SECRET;

    if (!baseUrl) {
        return NextResponse.json(
            { message: "NEXT_PUBLIC_RESUME_API_ENDPOINT environment variable is not set" },
            { status: 500 }
        );
    }

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

    // Declare the body variable with a more specific type, assuming it will hold the parsed JSON data from the request
    let body: { id: string; structuredData: Record<string, unknown> };
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
        console.log("args in body for summary: ",body)
        const response = await fetch(baseUrl.concat("/summary"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Capture error details
            console.error(`Failed to fetch summary: ${response.status} - ${errorText}`);
            return NextResponse.json(
                { message: `Failed to fetch summary: ${response.statusText}`, status: response.status },
                { status: response.status }
            );
        }

        const result = await response.json();

        if (result?.message) {
            const summary = transformKeys(result.message) as AnalysisDataType;
            summary.cvId = body.id as string;


            console.log("debug summary :",summary)

            // Send the POST request to the external API with the response of the summary
            const endpoint = ["responsibility_checker", "personal_info", "total_bullet_points", "bullet_points_improver", "bullet_point_length", "resume_length", "resume_score"]

            // console.log("body content",body.structuredData)
            endpoint.forEach(async (element) => {
                const response = await fetch(baseUrl.concat(`/${element}`), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ extracted_data: body.structuredData }),
                });
                const data = await response.json();

                console.log("element & data:: ",element, data)

                switch (element) {
                    case "responsibility_checker":
                        summary.responsibility = {}
                        break;
                    case "personal_info":
                            summary.personal_info = 
                             body.structuredData["Personal Information"] as object;
                        break;
                    case "total_bullet_points":
                        summary.total_bullet_points = [""]
                        break;
                    case "bullet_points_improver":
                        summary.bullet_point_improver =data.message [""]
                        break;
                    case "bullet_point_length":
                        summary.bullet_point_length = [""]
                    case "resume_length":
                        summary.resume_length = [""]
                    case "resume_score":
                        summary.resume_score = {}
                    default:
                        break;
                }
            })
            // Save the analysis result
            console.log("summary in /resumeAnalysis route: ",summary)
            const summaryResponse = await analysisResume(summary);
            console.log(summaryResponse)
            return NextResponse.json(summaryResponse, { status: 200 });
        }

        return NextResponse.json(
            { message: "No summary found in response", status: 400 },
            { status: 400 }
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
