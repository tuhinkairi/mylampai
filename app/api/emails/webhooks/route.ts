// /app/api/emails/webhooks/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const eventData = await req.json();
    console.log("Received webhook:", eventData);
    // Do something with the eventData

    return NextResponse.json(eventData, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
